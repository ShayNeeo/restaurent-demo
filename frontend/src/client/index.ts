type CartItem = {
  productId: string;
  name: string;
  unitAmount: number; // in smallest currency unit
  quantity: number;
  currency: string;
};

type CouponApplyResponse = {
  valid: boolean;
  code?: string;
  amountOff?: number; // cents
  percentOff?: number; // 0-100
};

const API_BASE = '/api';

const storageKey = 'restaurant_cart_v1';
const tokenKey = 'restaurant_jwt_v1';
const emailKey = 'restaurant_email_v1';

function getToken(): string | null { return localStorage.getItem(tokenKey); }
function setToken(token: string) { localStorage.setItem(tokenKey, token); }
function setEmail(email: string) { localStorage.setItem(emailKey, email); }
function getEmail(): string | null { return localStorage.getItem(emailKey); }

function decodeJwtEmail(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload?.email || null;
  } catch { return null; }
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function addToCart(item: CartItem) {
  const cart = loadCart();
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  renderBadge();
}

function subtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitAmount * i.quantity, 0);
}

function formatCents(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
}

function ensureUI() {
  if (document.getElementById('cart-fab')) return;
  const style = document.createElement('style');
  style.textContent = `
  #cart-fab{position:fixed;right:16px;bottom:16px;background:#ef4444;color:#fff;border-radius:9999px;padding:12px 16px;font-weight:700;cursor:pointer;z-index:1000;box-shadow:0 4px 10px rgba(0,0,0,.2)}
  #cart-fab .badge{background:#111827;color:#fff;border-radius:9999px;padding:2px 6px;margin-left:8px;font-size:12px}
  #cart-panel{position:fixed;right:16px;bottom:72px;max-width:420px;width:92vw;background:#111827;color:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);padding:16px;display:none;z-index:1000}
  #cart-panel.open{display:block}
  #cart-panel input, #cart-panel button{border-radius:8px}
  #cart-items{max-height:280px;overflow:auto;margin:8px 0}
  .qty-btn{background:#374151;border:none;color:#fff;width:28px;height:28px;border-radius:6px;cursor:pointer}
  .del-btn{background:#ef4444;border:none;color:#fff;width:28px;height:28px;border-radius:6px;cursor:pointer}
  .auth-link{cursor:pointer;color:#60a5fa}
  `;
  document.head.appendChild(style);

  const fab = document.createElement('button');
  fab.id = 'cart-fab';
  fab.innerHTML = `Cart <span class="badge">0</span>`;
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    refreshPanel();
  });

  const panel = document.createElement('div');
  panel.id = 'cart-panel';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <div style="font-weight:700;font-size:16px">Your Cart</div>
      <div>
        <span id="account-link" class="auth-link" style="margin-right:8px"></span>
        <button id="cart-close" style="background:#374151;color:#fff;border:none;padding:6px 10px">Close</button>
      </div>
    </div>
    <div id="cart-items"></div>
    <div style="display:flex;gap:8px;margin:8px 0">
      <input id="coupon-input" placeholder="Coupon code" style="flex:1;padding:8px;border:1px solid #374151;background:#1f2937;color:#fff" />
      <button id="coupon-apply" style="background:#10b981;border:none;color:#fff;padding:8px 12px">Apply</button>
    </div>
    <div id="cart-summary" style="display:flex;justify-content:space-between;margin:8px 0"></div>
    <div style="display:flex;gap:8px;margin:8px 0">
      <input id="gift-amount" type="number" min="10" step="5" placeholder="Buy gift coupon (EUR)" style="flex:1;padding:8px;border:1px solid #374151;background:#1f2937;color:#fff" />
      <button id="gift-buy" style="background:#6366f1;border:none;color:#fff;padding:8px 12px">Buy</button>
    </div>
    <button id="checkout" style="width:100%;background:#ef4444;border:none;color:#fff;padding:10px 12px;font-weight:700">Checkout</button>
  `;
  document.body.appendChild(fab);
  document.body.appendChild(panel);

  document.getElementById('cart-close')?.addEventListener('click', () => panel.classList.remove('open'));
  document.getElementById('coupon-apply')?.addEventListener('click', applyCoupon);
  document.getElementById('checkout')?.addEventListener('click', checkout);
  document.getElementById('gift-buy')?.addEventListener('click', buyGiftCoupon);
}

function renderBadge() {
  const cart = loadCart();
  const qty = cart.reduce((n, i) => n + i.quantity, 0);
  const badge = document.querySelector('#cart-fab .badge');
  if (badge) badge.textContent = String(qty);
}

function refreshPanel(discountCents = 0) {
  const cart = loadCart();
  const itemsEl = document.getElementById('cart-items')!;
  if (cart.length === 0) {
    itemsEl.innerHTML = '<div style="color:#9ca3af">Cart is empty</div>';
  } else {
    itemsEl.innerHTML = cart
      .map(
        (i) => `
        <div data-pid="${i.productId}" style="display:flex;justify-content:space-between;gap:8px;align-items:center;border-bottom:1px solid #374151;padding:6px 0">
          <div>
            <div style="font-weight:600">${i.name}</div>
            <div style="font-size:12px;color:#9ca3af">${formatCents(i.unitAmount, i.currency)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <button class="qty-btn" data-act="dec">-</button>
            <div>${i.quantity}</div>
            <button class="qty-btn" data-act="inc">+</button>
            <div style="width:16px"></div>
            <div>${formatCents(i.unitAmount * i.quantity, i.currency)}</div>
            <button class="del-btn" data-act="del">×</button>
          </div>
        </div>`
      )
      .join('');
    // delegate quantity & delete
    itemsEl.onclick = (e) => {
      const t = e.target as HTMLElement;
      const act = t.getAttribute('data-act');
      if (!act) return;
      const row = (t.closest('[data-pid]') as HTMLElement) || null;
      if (!row) return;
      const pid = row.getAttribute('data-pid')!;
      const cart = loadCart();
      const it = cart.find(x => x.productId === pid);
      if (!it) return;
      if (act === 'inc') it.quantity += 1;
      if (act === 'dec') it.quantity = Math.max(1, it.quantity - 1);
      if (act === 'del') { const idx = cart.findIndex(x => x.productId === pid); if (idx >= 0) cart.splice(idx, 1); }
      saveCart(cart);
      renderBadge();
      refreshPanel(discountCents);
    };
  }
  const sub = subtotal(cart);
  const total = Math.max(0, sub - discountCents);
  const summary = document.getElementById('cart-summary')!;
  summary.innerHTML = `<div>Subtotal: ${formatCents(sub)}</div><div>Total: <strong>${formatCents(total)}</strong></div>`;
}

async function fetchProduct() {
  const res = await fetch(`${API_BASE}/products`);
  const data = await res.json();
  return data?.products?.[0] as { id: string; name: string; unit_amount: number; currency: string };
}

async function injectAddToCart() {
  const product = await fetchProduct();
  if (!product) return;
  const targets = document.querySelectorAll('.special-dish .btn.btn-primary, .menu .menu-card .btn, .menu .menu-card a.card-title');
  if (targets.length === 0) return;
  targets.forEach((el) => {
    (el as HTMLAnchorElement).addEventListener('click', (e) => {
      e.preventDefault();
      addToCart({
        productId: product.id,
        name: product.name,
        unitAmount: product.unit_amount,
        quantity: 1,
        currency: product.currency || 'EUR'
      });
    });
  });
}

async function applyCoupon() {
  const input = document.getElementById('coupon-input') as HTMLInputElement | null;
  if (!input || !input.value) return;
  const code = input.value.trim();
  const res = await fetch(`${API_BASE}/coupons/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, cart: loadCart() })
  });
  const data: CouponApplyResponse = await res.json();
  let discount = 0;
  const cartTotal = subtotal(loadCart());
  if (data.valid) {
    if (data.amountOff) discount = data.amountOff;
    else if (data.percentOff) discount = Math.round((data.percentOff / 100) * cartTotal);
  }
  refreshPanel(discount);
}

async function checkout() {
  const cart = loadCart();
  if (cart.length === 0) return;
  const code = (document.getElementById('coupon-input') as HTMLInputElement | null)?.value?.trim();
  if (!getToken()) { showAuthModal(); return; }
  const res = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart, coupon: code || undefined })
  });
  const data = await res.json();
  if (data?.url) {
    window.location.href = data.url;
  }
}

// Initialize admin if on admin page
initAdmin();

// Boot
ensureUI();
renderBadge();
refreshPanel();
injectAddToCart();

// Show coupon code if returned from PayPal gift purchase
const params = new URLSearchParams(location.search);
const giftCode = params.get('code');
if (giftCode) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.right = '0';
  container.style.bottom = '0';
  container.style.background = 'rgba(0,0,0,.6)';
  container.style.zIndex = '1100';
  container.innerHTML = `
    <div style="max-width:520px;margin:10% auto;background:#111827;color:#fff;border-radius:12px;padding:20px;text-align:center;">
      <h2 style="margin:0 0 10px">Thank you!</h2>
      <p>Your gift coupon code:</p>
      <div style="font-size:22px;font-weight:800;letter-spacing:1px;background:#1f2937;padding:10px;border-radius:8px;display:inline-block;">${giftCode}</div>
      <div style="margin-top:12px">
        <button id="copy-gift-code" style="background:#10b981;border:none;color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer">Copy</button>
        <button id="close-gift-overlay" style="background:#374151;border:none;color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer;margin-left:8px">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  document.getElementById('copy-gift-code')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(giftCode); } catch {}
  });
  document.getElementById('close-gift-overlay')?.addEventListener('click', () => container.remove());
}

// Show generic thank-you if on /thank-you without a code
if (location.pathname === '/thank-you' && !giftCode) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.right = '0';
  container.style.bottom = '0';
  container.style.background = 'rgba(0,0,0,.6)';
  container.style.zIndex = '1100';
  container.innerHTML = `
    <div style="max-width:520px;margin:10% auto;background:#111827;color:#fff;border-radius:12px;padding:20px;text-align:center;">
      <h2 style="margin:0 0 10px">Thank you!</h2>
      <p>Your purchase was successful. If you bought a gift coupon, your code has been sent to your email.</p>
      <div style="margin-top:12px">
        <button id="close-thankyou-overlay" style="background:#374151;border:none;color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  document.getElementById('close-thankyou-overlay')?.addEventListener('click', () => container.remove());
}

async function buyGiftCoupon() {
  const input = document.getElementById('gift-amount') as HTMLInputElement | null;
  if (!input) return;
  const eur = Number(input.value);
  if (!eur || eur < 10) return;
  if (!getToken()) { showAuthModal(); return; }
  const email = getEmail() || decodeJwtEmail(getToken());
  const res = await fetch(`${API_BASE}/gift-coupons/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount_eur: eur, email })
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
}


