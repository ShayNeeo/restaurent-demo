-- ============================================================================
-- Restaurant Demo - Initial Schema (Consolidated)
-- ============================================================================
-- This migration creates the complete, final database schema
-- Includes all product metadata fields from the start
-- ============================================================================

-- USERS TABLE
-- Stores customer and admin user accounts
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- PRODUCTS TABLE
-- Menu items available for purchase
-- Includes all metadata fields: image_url, description, category, allergens, additives, spice_level, serving_size, dietary_tags, ingredients
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit_amount INTEGER NOT NULL,    -- Price in cents
  currency TEXT NOT NULL DEFAULT 'EUR',
  image_url TEXT,
  description TEXT,
  category TEXT,
  allergens TEXT,                  -- Comma-separated allergen codes (a, b, c, d, e, f, g, h, i, k, l, m, n, o, p, q, r, s, t, u)
  additives TEXT,                  -- Comma-separated additive codes (1-15)
  spice_level TEXT,                -- e.g., "nicht scharf", "leicht scharf", "mittel scharf"
  serving_size TEXT,               -- e.g., "Vorspeise", "Hauptspeise", "klein", "große", "pro st"
  dietary_tags TEXT,               -- Comma-separated: "vegetarian", "vegan", etc.
  ingredients TEXT                 -- Detailed ingredients list
);

-- COUPONS TABLE
-- Regular discount coupons (percentage or fixed amount)
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  percent_off INTEGER,              -- Percentage discount (0..100)
  amount_off INTEGER,               -- Fixed discount in cents
  remaining_uses INTEGER NOT NULL DEFAULT 0
);

-- GIFT CODES TABLE
-- Gift codes purchased and used as payment method
-- Note: Separate from coupons table to support both discount and payment use cases
CREATE TABLE IF NOT EXISTS gift_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  value_cents INTEGER NOT NULL,
  remaining_cents INTEGER NOT NULL,
  purchaser_email TEXT,
  customer_email TEXT,                 -- Customer who received/using the gift code
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ORDERS TABLE
-- Completed customer orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  coupon_code TEXT,                 -- Can reference coupons or gift_codes (no FK for flexibility)
  items_json TEXT,                  -- JSON: {cart: [...], coupon_code: "...", discount_cents: ...}
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, cancelled
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
  -- NOTE: coupon_code has NO FOREIGN KEY constraint
  -- Reason: Supports both coupons and gift_codes (different tables)
  -- Validation is handled at application level
);

-- ORDER ITEMS TABLE
-- Individual line items for each order
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_amount INTEGER NOT NULL,    -- Price in cents (denormalized for historical accuracy)
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

-- PENDING ORDERS TABLE
-- Orders awaiting PayPal payment capture
CREATE TABLE IF NOT EXISTS pending_orders (
  order_id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  amount_cents INTEGER NOT NULL,
  items_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- PENDING GIFTS TABLE
-- Gift codes awaiting PayPal payment capture
CREATE TABLE IF NOT EXISTS pending_gifts (
  order_id TEXT PRIMARY KEY,
  email TEXT,
  amount_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_gift_codes_purchaser ON gift_codes(purchaser_email);
CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at ON pending_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_gifts_created_at ON pending_gifts(created_at);

-- ============================================================================
-- SEED DATA - Menu Items from Restaurant Menu
-- ============================================================================

-- Aperitif
INSERT INTO products (id, name, unit_amount, currency, category) VALUES
('yuzu-spritz', 'Yuzu Spritz', 890, 'EUR', 'Aperitif'),
('lavabelle-spritz', 'Lavabelle Spritz', 890, 'EUR', 'Aperitif');

-- Vorspeisen Frittieren
INSERT INTO products (id, name, unit_amount, currency, category, allergens, description) VALUES
('cha-gio-viet-nam', '4st Vietnamesische Frühlingsrollen', 950, 'EUR', 'Vorspeisen', 'a,c,d', 'Schweinehackfleisch, Morcheln, Karotten, Glasnudeln (Salat dazu)'),
('cha-gio-re', '4st Cha Gio Re', 750, 'EUR', 'Vorspeisen', 'a,c,d', 'Knusprige Meeresfrüchte Frühlingsrollen - Garnelen, Krabbe, Taro, Zwiebeln, Knoblauch (Salat dazu)'),
('cha-gio-chay', '6st Vegetarische Frühlingsrollen', 570, 'EUR', 'Vorspeisen', 'a,p,r,s,t,2,8', 'Vegetarische Frühlingsrollen'),
('cha-gio-mix', 'Frühlingsrollen Mix 6st', 950, 'EUR', 'Vorspeisen', 'a,c,d', '3 verschiede Frühlingsrollen (Salat dazu)'),
('gyoza-kimchi', '5st Gyoza KimChi Gemüse', 850, 'EUR', 'Vorspeisen', 'a,c,f,l,8', 'Gyoza KimChi Gemüse (leicht scharf)'),
('gyoza-huhn', '5st Gyoza Hühnerfleisch Gemüse', 850, 'EUR', 'Vorspeisen', 'a,c,f,l,8', 'Gyoza Hühnerfleisch Gemüse'),
('gyoza-gemuse', '5st Gyoza Gemüse', 750, 'EUR', 'Vorspeisen', 'a,c,f,l,8', 'Gyoza Gemüse'),
('gyoza-mix', 'Gyoza Mix', 950, 'EUR', 'Vorspeisen', 'a,c,f,l,8', '3st Gyoza Hühnerfleisch, 3st Gyoza Gemüse'),
('tom-khoai-tay-soi', '4st Tom Khoai Tay Soi', 750, 'EUR', 'Vorspeisen', 'a,c', 'Knusprig Kartoffelstreifen um Garnelen'),
('edamame', 'Edamame, Meersalz', 650, 'EUR', 'Vorspeisen', NULL, 'Edamame, Meersalz');

-- Vorspeisen gedämpfte
INSERT INTO products (id, name, unit_amount, currency, category, allergens, description) VALUES
('gyoza-huhn-hap', '4st gedämpfte Gyoza Hühnerfleisch', 750, 'EUR', 'Vorspeisen', 'a,c,f,l,p,8', 'Gedämpfte Gyoza Hühnerfleisch'),
('gyoza-gemuse-hap', '4st gedämpfte Gyoza Gemüse', 650, 'EUR', 'Vorspeisen', 'a,c,f,l,p,8', 'Gedämpfte Gyoza Gemüse'),
('gyoza-spinat-hap', '4st gedämpfte Gyoza Spinat Gemüse', 850, 'EUR', 'Vorspeisen', 'a,c,f,l,p,8', 'Gedämpfte Gyoza Spinat Gemüse'),
('gyoza-kimchi-hap', '4st gedämpfte Gyoza KimChi Gemüse', 850, 'EUR', 'Vorspeisen', 'a,c,f,l,p,8', 'Gedämpfte Gyoza KimChi Gemüse (leicht scharf)'),
('hakao', '3st gedämpfte Hakao', 700, 'EUR', 'Vorspeisen', 'a,i,p,8', 'Garnelenfleisch, Tapioka Mantel'),
('sui-mai', '3st gedämpfte Sui Mai', 700, 'EUR', 'Vorspeisen', 'a,i,p,8', 'Garnelenfleisch, Blätterteig Mantel'),
('hakao-sui-mai', '2st Hakao & 2st Suimai', 800, 'EUR', 'Vorspeisen', 'a,i,p,8', 'Garnelenfleisch, Tapioka Mantel, Blätterteig'),
('gyoza-mix-gross', '14st gedämpfte Große Mix Gyoza Dumplings für 2 Pers', 2290, 'EUR', 'Vorspeisen', 'a,b,d,f,l,p,7,8', 'Große Mix Gyoza Dumplings für 2 Pers (jeweils 2st)'),
('gyoza-mix-klein', '7st gedämpfte Kleine Mix Gyoza Dumplings für 1 Pers', 1250, 'EUR', 'Vorspeisen', 'a,b,d,f,l,p,7,8', 'Kleine Mix Gyoza Dumplings für 1 Pers (jeweils 1st)');

-- Goi Cuon (Sommerrollen)
INSERT INTO products (id, name, unit_amount, currency, category, allergens, serving_size, description) VALUES
('goi-cuon-tofu', 'Goi Cuon mit Tofu', 470, 'EUR', 'Vorspeisen', 'a,e,f,l', 'pro st', 'Sommerrolle, Reispapier, Reisnudeln, Salat, Kräutern, Sojasprossen, dazu Hoisin Sauce mit Erdnuss & Sesam'),
('goi-cuon-huhn', 'Goi Cuon mit Huhn Filet', 500, 'EUR', 'Vorspeisen', 'a,e,f,l', 'pro st', 'Sommerrolle, Reispapier, Reisnudeln, Salat, Kräutern, Sojasprossen, dazu Hoisin Sauce mit Erdnuss & Sesam'),
('goi-cuon-garnelen', 'Goi Cuon mit Garnelen', 550, 'EUR', 'Vorspeisen', 'a,e,f,l', 'pro st', 'Sommerrolle, Reispapier, Reisnudeln, Salat, Kräutern, Sojasprossen, dazu Hoisin Sauce mit Erdnuss & Sesam'),
('goi-cuon-ente', 'Goi Cuon mit Ente', 550, 'EUR', 'Vorspeisen', 'a,e,f,l', 'pro st', 'Sommerrolle, Reispapier, Reisnudeln, Salat, Kräutern, Sojasprossen, dazu Hoisin Sauce mit Erdnuss & Sesam');

-- Bao Burger
INSERT INTO products (id, name, unit_amount, currency, category, allergens, description) VALUES
('bao-burger-tofu', 'Bao Burger mit Tofu', 600, 'EUR', 'Vorspeisen', 'f,p,r,s,t', 'Bao Burger, Gurke, Salat, Eingelegte Karotten, Hoisin Sauce, Sesam'),
('bao-burger-huhn', 'Bao Burger mit Frittieren Huhn', 700, 'EUR', 'Vorspeisen', 'f,p,r,s,t', 'Bao Burger, Gurke, Salat, Eingelegte Karotten, Hoisin Sauce, Sesam'),
('bao-burger-ente', 'Bao Burger mit Frittieren Ente', 800, 'EUR', 'Vorspeisen', 'f,p,r,s,t', 'Bao Burger, Gurke, Salat, Eingelegte Karotten, Hoisin Sauce, Sesam'),
('bao-burger-char-siu', 'Bao Burger Char Siu', 700, 'EUR', 'Vorspeisen', 'f,p,r,s,t', 'Bao Burger, Gurke, Salat, Eingelegte Karotten, Hoisin Sauce, Sesam - Char Siu, eine Art kantonesisches Barbecue-Schweinefleisch');

-- Salate
INSERT INTO products (id, name, unit_amount, currency, category, allergens, spice_level, description) VALUES
('mango-salat-tofu', 'Mango Salat mit Tofu', 1250, 'EUR', 'Vorspeisen', 'a,d,f', 'mittel scharf', 'Dressing aus Fisch, Zwiebeln, Basilikum, Peperoni'),
('mango-salat-ente', 'Mango Salat mit Ente', 1600, 'EUR', 'Vorspeisen', 'a,d,f', 'mittel scharf', 'Dressing aus Fisch, Zwiebeln, Basilikum, Peperoni'),
('papaya-salat', 'Grüner Papaya Salat', 990, 'EUR', 'Vorspeisen', 'b,d,e,l', 'mittel scharf', 'Grüner Papaya Salat, Minze, Basilikum, Peperoni, Erdnuss, Dressing aus Fisch'),
('papaya-salat-tofu', 'Grüner Papaya Salat mit Tofu', 1200, 'EUR', 'Vorspeisen', 'b,d,e,l', 'mittel scharf', 'Grüner Papaya Salat, Minze, Basilikum, Peperoni, Erdnuss, Dressing aus Fisch'),
('papaya-salat-garnelen', 'Grüner Papaya Salat mit Garnelen', 1550, 'EUR', 'Vorspeisen', 'b,d,e,l', 'mittel scharf', 'Grüner Papaya Salat, Minze, Basilikum, Peperoni, Erdnuss, Dressing aus Fisch'),
('tintenfisch-salat', 'Tintenfisch Salat', 1650, 'EUR', 'Vorspeisen', 'd,e', 'mittel scharf', 'Tintenfisch Salat, Zwiebeln, Basilikum, Koriander, Peperoni'),
('glasnudeln-salat', 'Glasnudeln Salat, Garnelen', 1650, 'EUR', 'Vorspeisen', 'd,e', NULL, 'Glasnudeln Salat, Garnelen, Koriander, Zwiebeln, Sellerie, Tomaten, Peperoni'),
('rindfleisch-salat', 'Rindfleisch Salat', 1850, 'EUR', 'Vorspeisen', NULL, NULL, 'Rindfleisch Salat, Basilikum, Koriander, Peperoni, Zwiebeln'),
('papaya-mango-salat', 'Grüner Papaya & Mango Salat, Garnelen, Tintenfisch', 1850, 'EUR', 'Vorspeisen', NULL, NULL, 'Grüner Papaya & Mango Salat, Garnelen, Tintenfisch, Zwiebeln, Basilikum, Peperoni');

-- Vorspeise Platte
INSERT INTO products (id, name, unit_amount, currency, category, description) VALUES
('vorspeise-platte-2pers', 'Vorspeise Platte für 2 pers.', 2550, 'EUR', 'Vorspeisen', 'Wildbetelblätter gerillt, Wantan gebacken, Sommerrollen mit Tofu, Verschieden Gemüse Gyoza frittier, Mango Tofu Salat, Grüner Papaya Salat Tofu');

-- Hauptspeisen - Zum Selberrollen
INSERT INTO products (id, name, unit_amount, currency, category, dietary_tags, description) VALUES
('selberrollen-vegetarisch', 'Zum Selberrollen Vegetarisch', 1950, 'EUR', 'Hauptspeisen', 'vegetarian', 'Kräuter-Sailing Pilz, Skin Tofu, Frühlingszwiebeln, Peperoni, Gurken streifen, Mango streifen, Blätterteig, dazu Hoisin Sauce'),
('selberrollen-peking-ente', 'Zum Selberrollen Peking Ente', 2150, 'EUR', 'Hauptspeisen', NULL, 'Peking Ente Fleisch mit haut, Frühlingszwiebeln, Peperoni, Gurken streifen, Mango streifen, Blätterteig, dazu Hoisin Sauce'),
('selberrollen-mix', 'Zum Selberrollen Mix', 2300, 'EUR', 'Hauptspeisen', NULL, 'von Kräuter-Seitling Pilz, Skin Tofu & Ente Fleisch mit haut, Frühlingszwiebeln, Gurken streifen, Mango streifen, Peperoni, Blätterteig, dazu Hoisin Sauce');

-- Bún Lá Lôt
INSERT INTO products (id, name, unit_amount, currency, category, allergens, serving_size, dietary_tags, description) VALUES
('bun-la-lot-tofu-vorspeise', 'Bún Lá Lôt Tofu als Vorspeise', 1300, 'EUR', 'Vorspeisen', 'a,e,l', 'Vorspeise', 'vegetarian', 'Reisnudelnschale, Wildbetelblätter gefüllt mit Tofu, Glasnudeln, Morcheln, Zitronengras Karotten, Pfeffer, Serviert mit Salat, Kräuter, Gurke, Sojasprossen, Erdnuss, Sesam, Geröstete Zwiebeln'),
('bun-la-lot-tofu-hauptspeise', 'Bún Lá Lôt Tofu als Hauptspeise', 1850, 'EUR', 'Hauptspeisen', 'a,e,l', 'Hauptspeise', 'vegetarian', 'Reisnudelnschale, Wildbetelblätter gefüllt mit Tofu, Glasnudeln, Morcheln, Zitronengras Karotten, Pfeffer, Serviert mit Salat, Kräuter, Gurke, Sojasprossen, Erdnuss, Sesam, Geröstete Zwiebeln');

-- Suppen
INSERT INTO products (id, name, unit_amount, currency, category, allergens, serving_size, description) VALUES
('pho-ga-vorspeise', 'Pho gà als Vorspeise', 1250, 'EUR', 'Suppen', 'a,d', 'Vorspeise', 'Pho gà ist ein beliebtes Gericht in Vietnam. Wir Kochen Brühe mit Suppen Huhn, Ingwer, Zim, Sternanis, Zwiebeln. Serviert mit Breitbandnudeln, Hühnerfilet, Frühlingszwiebeln, Sojasprossen, Basilikum, Lange Koriander & Koriander. Kann auch mit Glasnudeln oder Udon'),
('pho-ga-hauptspeise', 'Pho gà als Hauptspeise', 1890, 'EUR', 'Suppen', 'a,d', 'Hauptspeise', 'Pho gà ist ein beliebtes Gericht in Vietnam. Wir Kochen Brühe mit Suppen Huhn, Ingwer, Zim, Sternanis, Zwiebeln. Serviert mit Breitbandnudeln, Hühnerfilet, Frühlingszwiebeln, Sojasprossen, Basilikum, Lange Koriander & Koriander. Kann auch mit Glasnudeln oder Udon'),
('cho-lon-suppe-vorspeise', 'Cho Lon Suppe als Vorspeise', 1250, 'EUR', 'Suppen', NULL, 'Vorspeise', 'Mì Cho Lon ist eine beliebte vietnamesische Nudelsuppe aus Südvietnam. Klare, geschmacksintensive Brühe aus Schweineknochen und Fleisch. Einlagen wie Schweinefleisch, Schweinehackfleisch, Garnelen, Tintenfisch, Schnittlauch, Frühlingszwiebeln, Sojasprossen. Mit Eiernudeln oder Glasnudeln - Breitbandnudeln - Udon'),
('cho-lon-suppe-hauptspeise', 'Cho Lon Suppe als Hauptspeise', 1890, 'EUR', 'Suppen', NULL, 'Hauptspeise', 'Mì Cho Lon ist eine beliebte vietnamesische Nudelsuppe aus Südvietnam. Klare, geschmacksintensive Brühe aus Schweineknochen und Fleisch. Einlagen wie Schweinefleisch, Schweinehackfleisch, Garnelen, Tintenfisch, Schnittlauch, Frühlingszwiebeln, Sojasprossen. Mit Eiernudeln oder Glasnudeln - Breitbandnudeln - Udon'),
('sate-suppe-klein-huhn', 'Saté Suppe klein mit Huhn Filet', 1250, 'EUR', 'Suppen', 'a,c,e', 'klein', 'Kräftig Hühner Brühe Suppe, Ingwer, Zitronengras, Saté Gewürz, Erdnuss, Pakchoi. Wählen Sie zwischen: Eiernudeln / Udon oder Glasnudeln'),
('sate-suppe-gross-huhn', 'Saté Suppe große mit Huhn Filet', 1890, 'EUR', 'Suppen', 'a,c,e', 'große', 'Kräftig Hühner Brühe Suppe, Ingwer, Zitronengras, Saté Gewürz, Erdnuss, Pakchoi. Wählen Sie zwischen: Eiernudeln / Udon oder Glasnudeln'),
('sate-suppe-klein-ente', 'Saté Suppe klein mit Ente', 1490, 'EUR', 'Suppen', 'a,c,e', 'klein', 'Kräftig Hühner Brühe Suppe, Ingwer, Zitronengras, Saté Gewürz, Erdnuss, Pakchoi. Wählen Sie zwischen: Eiernudeln / Udon oder Glasnudeln'),
('sate-suppe-gross-ente', 'Saté Suppe große mit Ente', 2190, 'EUR', 'Suppen', 'a,c,e', 'große', 'Kräftig Hühner Brühe Suppe, Ingwer, Zitronengras, Saté Gewürz, Erdnuss, Pakchoi. Wählen Sie zwischen: Eiernudeln / Udon oder Glasnudeln'),
('vegetarische-suppe-klein', 'Vegetarische Suppe klein', 1150, 'EUR', 'Suppen', NULL, 'klein', 'Klare Brühe, Tofu, Karotten, Mais, Kräuter Pilz, Shiitake Pilz, Morcheln, Pfeffer. Wählen Sie zwischen: Eiernudeln / Udon oder Glasnudeln'),
('vegetarische-suppe-gross', 'Vegetarische Suppe große', 1750, 'EUR', 'Suppen', NULL, 'große', 'Klare Brühe, Tofu, Karotten, Mais, Kräuter Pilz, Shiitake Pilz, Morcheln, Pfeffer. Wählen Sie zwischen: Eiernudeln / Udon oder Glasnudeln');

-- Pho Xào
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, description) VALUES
('pho-xao-tofu', 'Pho Xào Cho Lon art mit Tofu', 1750, 'EUR', 'Hauptspeisen', 'a,c,e,f,l,s', '8', 'Breitbandnudeln angebraten mit Pakchoi, Broccoli, Grün Spargel in Austern Sauce'),
('pho-xao-huhn', 'Pho Xào Cho Lon art mit Hühnerfilet', 1950, 'EUR', 'Hauptspeisen', 'a,c,e,f,l,s', '8', 'Breitbandnudeln angebraten mit Pakchoi, Broccoli, Grün Spargel in Austern Sauce'),
('pho-xao-garnelen', 'Pho Xào Cho Lon art mit Garnelen', 2250, 'EUR', 'Hauptspeisen', 'a,c,e,f,l,s', '8', 'Breitbandnudeln angebraten mit Pakchoi, Broccoli, Grün Spargel in Austern Sauce'),
('pho-xao-rindfleisch', 'Pho Xào Cho Lon art mit Rindfleisch', 2250, 'EUR', 'Hauptspeisen', 'a,c,e,f,l,s', '8', 'Breitbandnudeln angebraten mit Pakchoi, Broccoli, Grün Spargel in Austern Sauce');

-- Muc Xao Xa Ot
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, spice_level, description) VALUES
('muc-xao-xa-ot', 'Muc Xao Xa Ot', 1890, 'EUR', 'Hauptspeisen', 'd,e', '8', 'mittel scharf', 'Tintenfisch angebraten mit Wok Gemüse / Zitronengras / Limetten Blätter / Chili / Austernsauce. Gemüse: Broccoli / Zucker Erbsen / Paprika / Zucchini / Karotten / Zwiebel / Grün Spargel / Aubergine. Serviert mit Reis');

-- Tô Bún
INSERT INTO products (id, name, unit_amount, currency, category, allergens, description) VALUES
('to-bun-tofu', 'Tô Bún mit Tofu', 1750, 'EUR', 'Hauptspeisen', 'a,c,d,p', 'Reisnudelnschale, Salat, Kräuter, Gurke, Sojasprossen, Erdnuss, Sesam, Geröstete Zwiebeln (dip Soja Sauce)'),
('to-bun-fruhlingsrollen', 'Tô Bún mit Vietnamesische Frühlingsrollen', 1750, 'EUR', 'Hauptspeisen', 'a,c,d', 'Reisnudelnschale, Salat, Kräuter, Gurke, Sojasprossen, Erdnuss, Sesam, Geröstete Zwiebeln. Schweinehackfleisch, Morcheln, Karotten, Glasnudeln (dip Fisch Sauce)'),
('to-bun-cha-gio-re', 'Tô Bún mit Cha Giò Rê', 1750, 'EUR', 'Hauptspeisen', 'a,c,d', 'Reisnudelnschale, Salat, Kräuter, Gurke, Sojasprossen, Erdnuss, Sesam, Geröstete Zwiebeln. Knusprige Meeresfrüchte Frühlingsrollen, Garnelen, Krabbe, Taro, Zwiebeln, Knoblauch (dip Fisch Sauce)'),
('to-bun-huhn', 'Tô Bún mit Knusprig Huhn', 1890, 'EUR', 'Hauptspeisen', 'a,p', 'Reisnudelnschale, Salat, Kräuter, Gurke, Sojasprossen, Erdnuss, Sesam, Geröstete Zwiebeln (dip Fisch Sauce)'),
('to-bun-ente', 'Tô Bún mit Knusprig Ente', 2290, 'EUR', 'Hauptspeisen', 'a,p', 'Reisnudelnschale, Salat, Kräuter, Gurke, Sojasprossen, Erdnuss, Sesam, Geröstete Zwiebeln (dip Fisch Sauce)'),
('to-bun-rindfleisch', 'Tô Bún mit Rindfleisch Zitronengras', 2190, 'EUR', 'Hauptspeisen', 'a,p', 'Reisnudelnschale, Salat, Kräuter, Gurke, Sojasprossen, Erdnuss, Sesam, Geröstete Zwiebeln (dip Fisch Sauce)');

-- Reis
INSERT INTO products (id, name, unit_amount, currency, category, allergens, description) VALUES
('gebratene-reis-gemuse', 'Gebratene Reis, Gemüse, Eier', 1590, 'EUR', 'Hauptspeisen', 'c', 'Gebratene Reis, Gemüse, Eier'),
('gebratene-reis-huhn', 'Gebratene Reis, Gemüse, Eier, Hühnerfilet', 1890, 'EUR', 'Hauptspeisen', 'c,l', 'Gebratene Reis, Gemüse, Eier, Hühnerfilet'),
('gebratene-reis-garnelen', 'Gebratene Reis, Gemüse, Eier, Riesen Garnelen', 2090, 'EUR', 'Hauptspeisen', 'c,d,l', 'Gebratene Reis, Gemüse, Eier, Riesen Garnelen'),
('gebratene-reis-ente', 'Gebratene Reis, Gemüse, Eier, Ente knusprig', 2290, 'EUR', 'Hauptspeisen', 'a,c,l', 'Gebratene Reis, Gemüse, Eier, Ente knusprig');

-- Bò oder Tofu Luc Lac
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, description) VALUES
('bo-luc-lac-tofu', 'Bò oder Tofu Luc Lac mit Tofu', 1850, 'EUR', 'Hauptspeisen', NULL, '8', 'Tofu Würfel geschnitten, auf dem Wok angebraten mit Austern Sauce. Paprika, Zwiebeln, Tomaten, Pfeffer, Salat, dazu Pommes'),
('bo-luc-lac-rindfleisch', 'Bò oder Tofu Luc Lac mit Rindfleisch', 2350, 'EUR', 'Hauptspeisen', NULL, '8', 'Rindfleisch Würfel geschnitten, auf dem Wok angebraten mit Austern Sauce. Paprika, Zwiebeln, Tomaten, Pfeffer, Salat, dazu Pommes');

-- Mien Trôn
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, description) VALUES
('mien-tron-tofu', 'Mien Trôn mit Tofu', 1750, 'EUR', 'Hauptspeisen', 'f', '8', 'Lauwarm Glasnudeln Pfanne, Pilze, Eier, Broccoli, Edamame Bohnen, Mais, Karotten, Pakchoi, Sesam, Teriyaki Sauce'),
('mien-tron-huhn', 'Mien Trôn mit Huhn Filet', 1890, 'EUR', 'Hauptspeisen', NULL, '8', 'Lauwarm Glasnudeln Pfanne, Pilze, Eier, Broccoli, Edamame Bohnen, Mais, Karotten, Pakchoi, Sesam, Teriyaki Sauce'),
('mien-tron-huhn-knusprig', 'Mien Trôn mit knusprig Huhn', 1890, 'EUR', 'Hauptspeisen', 'a', '8', 'Lauwarm Glasnudeln Pfanne, Pilze, Eier, Broccoli, Edamame Bohnen, Mais, Karotten, Pakchoi, Sesam, Teriyaki Sauce'),
('mien-tron-ente', 'Mien Trôn mit knusprig Ente', 2290, 'EUR', 'Hauptspeisen', 'a', '8', 'Lauwarm Glasnudeln Pfanne, Pilze, Eier, Broccoli, Edamame Bohnen, Mais, Karotten, Pakchoi, Sesam, Teriyaki Sauce'),
('mien-tron-rindfleisch', 'Mien Trôn mit Rindfleisch Ingwer', 2190, 'EUR', 'Hauptspeisen', NULL, '8', 'Lauwarm Glasnudeln Pfanne, Pilze, Eier, Broccoli, Edamame Bohnen, Mais, Karotten, Pakchoi, Sesam, Teriyaki Sauce');

-- Com Trôn
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, description) VALUES
('com-tron-tofu', 'Com Trôn mit Tofu', 1750, 'EUR', 'Hauptspeisen', 'f', '8', 'Lauwarm Reis Bowl mit Eier, Broccoli, Pilze, Mais, Pakchoi, Edamame Bohnen, Zucchini, Sesam, Teriyaki Sauce'),
('com-tron-huhn', 'Com Trôn mit Huhn Filet', 1890, 'EUR', 'Hauptspeisen', NULL, '8', 'Lauwarm Reis Bowl mit Eier, Broccoli, Pilze, Mais, Pakchoi, Edamame Bohnen, Zucchini, Sesam, Teriyaki Sauce'),
('com-tron-huhn-knusprig', 'Com Trôn mit knusprig Huhn', 1890, 'EUR', 'Hauptspeisen', 'a', '8', 'Lauwarm Reis Bowl mit Eier, Broccoli, Pilze, Mais, Pakchoi, Edamame Bohnen, Zucchini, Sesam, Teriyaki Sauce'),
('com-tron-ente', 'Com Trôn mit knusprig Ente', 2290, 'EUR', 'Hauptspeisen', 'a', '8', 'Lauwarm Reis Bowl mit Eier, Broccoli, Pilze, Mais, Pakchoi, Edamame Bohnen, Zucchini, Sesam, Teriyaki Sauce'),
('com-tron-rindfleisch', 'Com Trôn mit Rindfleisch Ingwer', 2190, 'EUR', 'Hauptspeisen', NULL, '8', 'Lauwarm Reis Bowl mit Eier, Broccoli, Pilze, Mais, Pakchoi, Edamame Bohnen, Zucchini, Sesam, Teriyaki Sauce');

-- Mì Trôn
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, description) VALUES
('mi-tron-tofu', 'Mì Trôn mit Tofu', 1750, 'EUR', 'Hauptspeisen', 'f', '8', 'Lauwarm Eiernudel, Pilze, Eier, Broccoli, Edamame Bohnen, Karotten, Pakchoi, Zucchini, Sesam, Teriyaki Sauce'),
('mi-tron-huhn', 'Mì Trôn mit Huhn Filet', 1890, 'EUR', 'Hauptspeisen', NULL, '8', 'Lauwarm Eiernudel, Pilze, Eier, Broccoli, Edamame Bohnen, Karotten, Pakchoi, Zucchini, Sesam, Teriyaki Sauce'),
('mi-tron-huhn-knusprig', 'Mì Trôn mit knusprig Huhn', 1890, 'EUR', 'Hauptspeisen', 'a', '8', 'Lauwarm Eiernudel, Pilze, Eier, Broccoli, Edamame Bohnen, Karotten, Pakchoi, Zucchini, Sesam, Teriyaki Sauce'),
('mi-tron-ente', 'Mì Trôn mit knusprig Ente', 2290, 'EUR', 'Hauptspeisen', 'a', '8', 'Lauwarm Eiernudel, Pilze, Eier, Broccoli, Edamame Bohnen, Karotten, Pakchoi, Zucchini, Sesam, Teriyaki Sauce'),
('mi-tron-rindfleisch', 'Mì Trôn mit Rindfleisch Ingwer', 2190, 'EUR', 'Hauptspeisen', NULL, '8', 'Lauwarm Eiernudel, Pilze, Eier, Broccoli, Edamame Bohnen, Karotten, Pakchoi, Zucchini, Sesam, Teriyaki Sauce');

-- Shanghai Pakchoi
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, description) VALUES
('shanghai-pakchoi-huhn', 'Shanghai Pakchoi mit knusprig Huhn', 1890, 'EUR', 'Hauptspeisen', 'a', '8', 'Shanghai Pakchoi angebraten mit Ingwer und Austern Sauce. Serviert mit Reis'),
('shanghai-pakchoi-ente', 'Shanghai Pakchoi mit knusprig Ente', 2290, 'EUR', 'Hauptspeisen', 'a', '8', 'Shanghai Pakchoi angebraten mit Ingwer und Austern Sauce. Serviert mit Reis'),
('shanghai-pakchoi-rindfleisch', 'Shanghai Pakchoi mit Rindfleisch', 2190, 'EUR', 'Hauptspeisen', NULL, '8', 'Shanghai Pakchoi angebraten mit Ingwer und Austern Sauce. Serviert mit Reis');

-- Rotes Curry
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, spice_level, dietary_tags, description) VALUES
('rotes-curry-tofu', 'Tofu / Curry Gemüse', 1590, 'EUR', 'Hauptspeisen', 'f', '8', 'mittel scharf', 'vegetarian', 'Rotes Curry mit Kokossnußmilch, Zitronengras, Limettenblätten, Palm Zucker, Fischsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis'),
('rotes-curry-huhn-knusprig', 'Knusprig Huhn / Curry Gemüse', 1890, 'EUR', 'Hauptspeisen', 'a', '8', 'mittel scharf', NULL, 'Rotes Curry mit Kokossnußmilch, Zitronengras, Limettenblätten, Palm Zucker, Fischsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis'),
('rotes-curry-huhn-filet', 'Huhn Filet / Curry Gemüse', 1890, 'EUR', 'Hauptspeisen', NULL, '8', 'mittel scharf', NULL, 'Rotes Curry mit Kokossnußmilch, Zitronengras, Limettenblätten, Palm Zucker, Fischsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis'),
('rotes-curry-rindfleisch', 'Rindfleisch / Curry Gemüse', 2190, 'EUR', 'Hauptspeisen', NULL, '8', 'mittel scharf', NULL, 'Rotes Curry mit Kokossnußmilch, Zitronengras, Limettenblätten, Palm Zucker, Fischsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis'),
('rotes-curry-garnelen', 'Riesen Garnelen / Curry Gemüse', 2090, 'EUR', 'Hauptspeisen', NULL, '8', 'mittel scharf', NULL, 'Rotes Curry mit Kokossnußmilch, Zitronengras, Limettenblätten, Palm Zucker, Fischsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis'),
('rotes-curry-ente', 'Knusprig Ente / Curry Gemüse', 2290, 'EUR', 'Hauptspeisen', 'a', '8', 'mittel scharf', NULL, 'Rotes Curry mit Kokossnußmilch, Zitronengras, Limettenblätten, Palm Zucker, Fischsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis');

-- Erdnuss
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, dietary_tags, description) VALUES
('erdnuss-tofu', 'Tofu / Erdnuss Gemüse', 1590, 'EUR', 'Hauptspeisen', 'f', '8', 'vegetarian', 'Erdnusssauce mit Kokosnußmilch, Sate Gewürz. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis'),
('erdnuss-huhn-knusprig', 'Knusprig Huhn / Erdnuss Gemüse', 1890, 'EUR', 'Hauptspeisen', 'a', '8', NULL, 'Erdnusssauce mit Kokosnußmilch, Sate Gewürz. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis'),
('erdnuss-huhn-filet', 'Huhn Filet / Erdnuss Gemüse', 1890, 'EUR', 'Hauptspeisen', NULL, '8', NULL, 'Erdnusssauce mit Kokosnußmilch, Sate Gewürz. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis'),
('erdnuss-ente', 'Knusprig Ente / Erdnuss Gemüse', 2290, 'EUR', 'Hauptspeisen', 'a', '8', NULL, 'Erdnusssauce mit Kokosnußmilch, Sate Gewürz. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz. Serviert mit Reis');

-- Xa Ot
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, spice_level, description) VALUES
('xa-ot-tofu', 'Xa Ot Tofu / Gemüse', 1590, 'EUR', 'Hauptspeisen', 'f', '8', 'mittel scharf', 'Wok Gemüse, Zitronengras, Limetten Blätter, Chili, Austernsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz, Japanische Aubergine. Serviert mit Reis'),
('xa-ot-huhn-knusprig', 'Xa Ot knusprig Huhn / Gemüse', 1890, 'EUR', 'Hauptspeisen', 'a', '8', 'mittel scharf', 'Wok Gemüse, Zitronengras, Limetten Blätter, Chili, Austernsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz, Japanische Aubergine. Serviert mit Reis'),
('xa-ot-huhn-filet', 'Xa Ot Huhn Filet / Gemüse', 1890, 'EUR', 'Hauptspeisen', NULL, '8', 'mittel scharf', 'Wok Gemüse, Zitronengras, Limetten Blätter, Chili, Austernsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz, Japanische Aubergine. Serviert mit Reis'),
('xa-ot-ente', 'Xa Ot knusprig Ente / Gemüse', 2290, 'EUR', 'Hauptspeisen', 'a', '8', 'mittel scharf', 'Wok Gemüse, Zitronengras, Limetten Blätter, Chili, Austernsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz, Japanische Aubergine. Serviert mit Reis'),
('xa-ot-garnelen', 'Xa Ot Riesen Garnelen / Gemüse', 2090, 'EUR', 'Hauptspeisen', NULL, '8', 'mittel scharf', 'Wok Gemüse, Zitronengras, Limetten Blätter, Chili, Austernsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz, Japanische Aubergine. Serviert mit Reis'),
('xa-ot-rindfleisch', 'Xa Ot Rindfleisch / Gemüse', 2190, 'EUR', 'Hauptspeisen', NULL, '8', 'mittel scharf', 'Wok Gemüse, Zitronengras, Limetten Blätter, Chili, Austernsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz, Japanische Aubergine. Serviert mit Reis'),
('xa-ot-tintenfisch', 'Xa Ot Tintenfisch / Gemüse', 1890, 'EUR', 'Hauptspeisen', 'd', '8', 'mittel scharf', 'Wok Gemüse, Zitronengras, Limetten Blätter, Chili, Austernsauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Grüner Spargel, Zuckererbsen, Shimeji Pilz, Japanische Aubergine. Serviert mit Reis');

-- Soja Sauce
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, description) VALUES
('soja-tofu', 'Soja Tofu / Gemüse', 1590, 'EUR', 'Hauptspeisen', 'f', '8', 'Wok Gemüse, Soja und Austern Sauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Chinakohl, Zwiebeln, Zuckererbsen, Shimeji Pilz, Glasnudeln, Sojasprossen. Serviert mit Reis'),
('soja-huhn-knusprig', 'Knusprig Huhn Soja / Gemüse', 1890, 'EUR', 'Hauptspeisen', 'a', '8', 'Wok Gemüse, Soja und Austern Sauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Chinakohl, Zwiebeln, Zuckererbsen, Shimeji Pilz, Glasnudeln, Sojasprossen. Serviert mit Reis'),
('soja-huhn-filet', 'Huhn Filet Soja / Gemüse', 1890, 'EUR', 'Hauptspeisen', NULL, '8', 'Wok Gemüse, Soja und Austern Sauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Chinakohl, Zwiebeln, Zuckererbsen, Shimeji Pilz, Glasnudeln, Sojasprossen. Serviert mit Reis'),
('soja-rindfleisch', 'Rindfleisch Soja / Gemüse', 2190, 'EUR', 'Hauptspeisen', NULL, '8', 'Wok Gemüse, Soja und Austern Sauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Chinakohl, Zwiebeln, Zuckererbsen, Shimeji Pilz, Glasnudeln, Sojasprossen. Serviert mit Reis'),
('soja-ente', 'Ente knusprig Soja / Gemüse', 2290, 'EUR', 'Hauptspeisen', 'a', '8', 'Wok Gemüse, Soja und Austern Sauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Chinakohl, Zwiebeln, Zuckererbsen, Shimeji Pilz, Glasnudeln, Sojasprossen. Serviert mit Reis'),
('soja-garnelen', 'Riesen Garnelen Soja / Gemüse', 2090, 'EUR', 'Hauptspeisen', 'd', '8', 'Wok Gemüse, Soja und Austern Sauce. Gemüse: Broccoli, Paprika, Zucchini, Karotten, Chinakohl, Zwiebeln, Zuckererbsen, Shimeji Pilz, Glasnudeln, Sojasprossen. Serviert mit Reis');

-- Süß Sauer Scharfe Sauce
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, spice_level, description) VALUES
('suss-sauer-tofu', 'Tofu Chua Ngọt', 1200, 'EUR', 'Hauptspeisen', 'a,c', '8', 'mittel scharf', 'Frittieren Tofu, Süß Sauer Scharf Sauce, Gemüse. Gemüse: Broccoli, Zucker Erbsen, Paprika, Zucchini, Karotten, Grüner Spargel, Aubergine. Reis dazu'),
('suss-sauer-huhn', 'Gà Chua Ngot', 1450, 'EUR', 'Hauptspeisen', 'a,c', '8', 'mittel scharf', 'Hühnchen knusprig, Süß Sauer Scharfe Sauce, Gemüse. Gemüse: Broccoli, Zucker Erbsen, Paprika, Zucchini, Karotten, Grüner Spargel, Aubergine. Reis dazu'),
('suss-sauer-garnelen', 'Tôm Chua Ngot', 1450, 'EUR', 'Hauptspeisen', 'a,c', '8', 'mittel scharf', 'Knusprig Kartoffelstreifen um Garnelen, Süß Sauer Scharfe Sauce, Gemüse. Gemüse: Broccoli, Zucker Erbsen, Paprika, Zucchini, Karotten, Grüner Spargel, Aubergine. Reis dazu'),
('suss-sauer-ente', 'Vit Chua Ngot', 1650, 'EUR', 'Hauptspeisen', 'a,c', '8', 'mittel scharf', 'Ente knusprig, Süß Sauer Scharfe Sauce, Gemüse. Gemüse: Broccoli, Zucker Erbsen, Paprika, Zucchini, Karotten, Grüner Spargel, Aubergine. Reis dazu');

-- Udon & Soja Sauce
INSERT INTO products (id, name, unit_amount, currency, category, allergens, additives, description) VALUES
('udon-soja-tofu', 'Angebraten Udon, Gemüse mit Tofu', 1200, 'EUR', 'Hauptspeisen', 'a,f,8,16', NULL, 'Angebraten Udon, Gemüse mit Tofu'),
('udon-soja-huhn', 'Angebraten Udon, Gemüse mit Huhn Filet', 1450, 'EUR', 'Hauptspeisen', 'a,8,16', NULL, 'Angebraten Udon, Gemüse mit Huhn Filet'),
('udon-soja-rindfleisch', 'Angebraten Udon, Gemüse mit Rindfleisch', 1650, 'EUR', 'Hauptspeisen', 'a,8,16', NULL, 'Angebraten Udon, Gemüse mit Rindfleisch'),
('udon-soja-garnelen', 'Angebraten Udon, Gemüse mit Garnelen', 1550, 'EUR', 'Hauptspeisen', 'a,8,16', NULL, 'Angebraten Udon, Gemüse mit Garnelen');

-- Dessert
INSERT INTO products (id, name, unit_amount, currency, category, allergens, description) VALUES
('affogato', 'Affogato', 470, 'EUR', 'Dessert', '1,g', 'Espresso, Vanille Eis'),
('vanille-eis-baileys', 'Vanille Eis mit Baileys', 550, 'EUR', 'Dessert', 'g', 'Vanille Eis mit Baileys (mit Alkohol)'),
('affogato-baileys', 'Affogato Baileys', 650, 'EUR', 'Dessert', '1,g', 'Espresso, Vanille Eis, Baileys (mit Alkohol)'),
('mochi-eis', 'Mochi Eis (pro st)', 290, 'EUR', 'Dessert', '3,a,g', 'Mochi Eis pro Stück. Sorte: Mango, Matcha, Kokos, Ananas, Yuzu, Salz karamel'),
('mochi-eis-variation', 'Mochi Eis Variation, 3 Sorten nach Wahl', 800, 'EUR', 'Dessert', '3,a,g', 'Mochi Eis Variation, 3 Sorten nach Wahl'),
('chuoi-chien', 'Chuô´i Chiên', 650, 'EUR', 'Dessert', 'a,g,p', 'Banane gebacken, Honig, Vanille Eis');

-- Extra
INSERT INTO products (id, name, unit_amount, currency, category, description) VALUES
('extra-sauce', 'Extra Sauce', 300, 'EUR', 'Extra', 'Extra Sauce'),
('extra-reis', 'Extra gekocht Reis', 280, 'EUR', 'Extra', 'Extra gekocht Reis'),
('extra-reis-gebraten', 'Extra klein gebratene Reis als Beilage', 500, 'EUR', 'Extra', 'Extra klein gebratene Reis als Beilage');
