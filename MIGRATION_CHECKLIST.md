# Frontend Migration Checklist: Old Restaurent → New Next.js Frontend

## ✅ COMPLETED FEATURES

### Pages & Routes
- [x] **Homepage** (`/`) - Full layout with hero, sections, footer
- [x] **Admin Dashboard** (`/admin`) - Complete with 9 tabs
- [x] **Admin Login** (`/admin/login`) - JWT authentication

### Homepage Sections
- [x] **Hero Section** - Background image, headline, CTA buttons
- [x] **About Section** - Restaurant story and philosophy
- [x] **Experience Section** - Features/highlights
- [x] **Menu Preview** - 3 categories with sample dishes
- [x] **Gallery Section** - Image grid (8 restaurant photos)
- [x] **Visit Section** - Hours, address, contact info, map
- [x] **Footer** - Links, social media, contact

### Navigation
- [x] **Header/Nav** - Fixed navbar with links and phone button
- [x] **Responsive Design** - Mobile menu (hamburger), tablet/desktop layouts
- [x] **Smooth Scrolling** - Anchor links for sections

### Admin Features
- [x] **Authentication** - Login page with JWT tokens
- [x] **Dashboard Overview** - Statistics cards
- [x] **Orders Tab** - List completed orders
- [x] **Users Tab** - List registered users
- [x] **Coupons Tab** - List discount codes
- [x] **Products Tab** - List menu items
- [x] **Pending Orders Tab** - Track unpaid orders
- [x] **Gift Coupons Tab** - Gift code tracking
- [x] **Health Check** - System status (auto-refresh)
- [x] **Settings** - Account info display

### Design & Styling
- [x] **Tailwind CSS** - Modern utility framework
- [x] **Dark Theme** - Consistent dark background
- [x] **Color Scheme** - Yellow accents (#fbbf24), white text
- [x] **Responsive Grid** - Works on mobile, tablet, desktop
- [x] **Images** - All Nguyen restaurant photos integrated

---

## ✅ MIGRATED FUNKTIONEN (ehemals offen)

### Shopping & Checkout
- [x] **Menu Page** (`/menu`) - Echtzeit-Produktliste + „In den Warenkorb“
- [x] **Cart Functionality** - Globales Cart, LocalStorage, Mengensteuerung
- [x] **Cart UI/Drawer** - Slide-in Drawer, Summen, Coupon-Anzeige
- [x] **Checkout Page** (`/checkout`) - E-Mail, Gutschein, Review
- [x] **Payment Integration** - PayPal Flow via `/api/checkout`
- [x] **Order Confirmation** - Dynamisch `/thank-you/:id`
- [x] **Coupon/Discount** - Validierung & Anwendung (Coupons + Gift Codes)

### Gift Coupons
- [x] **Gift Coupon Page** (`/coupon`) - Kauf mit 10 % Bonus
- [x] **Gift Coupon Purchase** - PayPal Redirect + Pending Gift
- [x] **Gift Code Application** - Prüfung gegen Warenkorb & Checkout

### JavaScript & UX
- [x] **Hero Slider** - Automatischer Bildwechsel + Buttons
- [x] **Parallax Effects** - Mausgesteuerte Lichteffekte
- [x] **Navbar Toggle** - Mobile Menü inkl. Overlay
- [x] **Scroll Effects** - Auto-hide Header beim Scrollen
- [x] **Preloader** - sanfte Ladeanimation

### Noch offen (nicht benötigt laut Vorgabe)
- [ ] **Test Email Page** (`/test-email`)
- [ ] **Test PayPal Page** (`/test-paypal`)
- [ ] **Dekorative Alt-Assets** (SVG-Pattern, Font Awesome)

---

## 📋 DETAILED BREAKDOWN

### What's Being Used From Old Site
✓ Restaurant information (name, address, phone, hours)
✓ German copy from old-site.txt
✓ Color scheme (gold/yellow, dark backgrounds)
✓ Restaurant images from Nguyen-Restaurent/
✓ Overall layout inspiration
✓ Menu item descriptions and prices

### What's Not Used
✗ Old HTML structure (completely rewritten in React/Next.js)
✗ Old CSS file (replaced with Tailwind CSS)
✗ Old JavaScript (Bootstrap/jQuery - replaced with modern React)
✗ Ionicons library (can add back if needed)
✗ Bootstrap grid system (Tailwind CSS used instead)

---

## 🎯 RESTAUFTRÄGE (optional)

1. Testseiten (`/test-email`, `/test-paypal`) falls wieder benötigt
2. Optionale dekorative SVG-/Font-Assets nachrüsten

---

## 🔌 Backend API Endpoints Needed

Already available (should be used):
- `POST /api/auth/login` - Admin login
- `GET /api/admin/*` - Admin data endpoints
- `GET /api/health` - Health check

For e-commerce (likely exist):
- `GET /api/products` - List menu items
- `POST /api/checkout` - Create order
- `POST /api/paypal/create-order` - PayPal integration
- `GET /api/orders/:id` - Order details
- `POST /api/coupons/validate` - Check coupon validity

---

## 🚀 Files Ready to Extend

```
frontend/
├── app/
│   ├── menu/              ← NEW: Add /menu/page.tsx
│   ├── coupon/            ← NEW: Add /coupon/page.tsx
│   ├── checkout/          ← NEW: Add /checkout/page.tsx
│   └── thank-you/         ← NEW: Add /thank-you/[id]/page.tsx
├── components/
│   ├── Cart.tsx           ← NEW: Cart modal/sidebar
│   ├── CartButton.tsx     ← NEW: Cart icon in navbar
│   ├── MenuCard.tsx       ← NEW: Individual menu item card
│   └── ...existing...
└── lib/
    └── cartUtils.ts       ← NEW: localStorage cart logic
```

---

## 📝 Summary

**Current State:** Komplettes Next.js-Frontend inkl. Warenkorb, Checkout & Admin
**Next Steps:** Optional Test-/Deko-Seiten, sonst bereit für Deployment
**Hinweis:** PayPal- und Gutschein-Flows greifen auf bestehende Backend-APIs zu

