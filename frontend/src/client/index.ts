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
  #cart-panel{position:fixed;right:16px;bottom:72px;max-width:360px;width:92vw;background:#111827;color:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);padding:16px;display:none;z-index:1000}
  #cart-panel.open{display:block}
  #cart-panel input, #cart-panel button{border-radius:8px}
  #cart-items{max-height:240px;overflow:auto;margin:8px 0}
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
      <button id="cart-close" style="background:#374151;color:#fff;border:none;padding:6px 10px">Close</button>
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
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;border-bottom:1px solid #374151;padding:6px 0">
          <div>
            <div style="font-weight:600">${i.name}</div>
            <div style="font-size:12px;color:#9ca3af">${i.quantity} × ${formatCents(i.unitAmount, i.currency)}</div>
          </div>
          <div>${formatCents(i.unitAmount * i.quantity, i.currency)}</div>
        </div>`
      )
      .join('');
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

// Boot
ensureUI();
renderBadge();
refreshPanel();
injectAddToCart();

async function buyGiftCoupon() {
  const input = document.getElementById('gift-amount') as HTMLInputElement | null;
  if (!input) return;
  const eur = Number(input.value);
  if (!eur || eur < 10) return;
  const res = await fetch(`${API_BASE}/gift-coupons/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount_eur: eur })
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
}


