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

function showAuthModal() {
  if (document.getElementById('auth-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'auth-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.background = 'rgba(0,0,0,.6)';
  overlay.style.zIndex = '1400';
  overlay.innerHTML = `
    <div style="max-width:480px;margin:8% auto;background:var(--smoky-black-2,#111827);color:var(--white,#fff);border-radius:12px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.35)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="font-weight:700;font-size:18px">Sign in</div>
        <button id="auth-close" style="background:transparent;color:var(--white,#fff);border:1px solid var(--white-alpha-20,#374151);padding:6px 10px;border-radius:8px">Close</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button id="auth-tab-login" style="flex:1;background:var(--gold-crayola,#ef4444);color:var(--smoky-black-1,#000);border:none;padding:8px 12px;border-radius:8px;font-weight:700">Login</button>
        <button id="auth-tab-signup" style="flex:1;background:transparent;color:var(--white,#fff);border:1px solid var(--white-alpha-20,#374151);padding:8px 12px;border-radius:8px">Sign up</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <input id="auth-email" type="email" placeholder="Email" style="padding:10px;border:1px solid var(--white-alpha-20,#374151);background:var(--eerie-black-2,#1f2937);color:var(--white,#fff);border-radius:8px" />
        <input id="auth-password" type="password" placeholder="Password" style="padding:10px;border:1px solid var(--white-alpha-20,#374151);background:var(--eerie-black-2,#1f2937);color:var(--white,#fff);border-radius:8px" />
        <button id="auth-submit" style="background:var(--gold-crayola,#ef4444);color:var(--smoky-black-1,#000);border:none;padding:10px;border-radius:8px;font-weight:800">Continue</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('#auth-close')?.addEventListener('click', close);
  const tabLogin = overlay.querySelector('#auth-tab-login') as HTMLButtonElement;
  const tabSignup = overlay.querySelector('#auth-tab-signup') as HTMLButtonElement;
  let mode: 'login' | 'signup' = 'login';
  const setMode = (m: 'login' | 'signup') => {
    mode = m;
    if (m === 'login') {
      tabLogin.style.background = 'var(--gold-crayola,#ef4444)';
      tabLogin.style.color = 'var(--smoky-black-1,#000)';
      tabSignup.style.background = 'transparent';
      tabSignup.style.color = 'var(--white,#fff)';
      tabSignup.style.border = '1px solid var(--white-alpha-20,#374151)';
    } else {
      tabSignup.style.background = 'var(--gold-crayola,#ef4444)';
      tabSignup.style.color = 'var(--smoky-black-1,#000)';
      tabLogin.style.background = 'transparent';
      tabLogin.style.color = 'var(--white,#fff)';
      tabLogin.style.border = '1px solid var(--white-alpha-20,#374151)';
    }
  };
  tabLogin.addEventListener('click', () => setMode('login'));
  tabSignup.addEventListener('click', () => setMode('signup'));
  overlay.querySelector('#auth-submit')?.addEventListener('click', async () => {
    const email = (overlay.querySelector('#auth-email') as HTMLInputElement).value.trim();
    const password = (overlay.querySelector('#auth-password') as HTMLInputElement).value;
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    const path = mode === 'login' ? '/auth/login' : '/auth/signup';
    const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (res.ok) {
      const data = await res.json();
      if (data?.token) {
        setToken(data.token);
        setEmail(email);
        close();
        if (location.pathname === '/admin') { initAdmin(); }
        // resume action after auth
        const action = localStorage.getItem('post_auth_action');
        if (action === 'checkout') {
          localStorage.removeItem('post_auth_action');
          setTimeout(() => checkout(), 0);
        } else if (action === 'buy_gift') {
          const amt = localStorage.getItem('post_auth_gift_amount');
          localStorage.removeItem('post_auth_action');
          localStorage.removeItem('post_auth_gift_amount');
          const input = (document.getElementById('panel-gift-amount') as HTMLInputElement | null) || (document.getElementById('gift-amount') as HTMLInputElement | null);
          if (input && amt) input.value = amt;
          setTimeout(() => buyGiftCoupon(), 0);
        }
      }
    } else {
      if (res.status === 409) {
        alert('An account with this email already exists. Please use a different email or try logging in instead.');
      } else if (res.status === 401) {
        alert('Invalid email or password. Please check your credentials and try again.');
      } else {
        alert('Authentication failed. Please try again later.');
      }
    }
  });
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
  #cart-fab{position:fixed;right:16px;bottom:16px;background:var(--gold-crayola);color:var(--smoky-black-1);border-radius:9999px;padding:12px 16px;font-weight:700;cursor:pointer;z-index:1000;box-shadow:0 4px 10px rgba(0,0,0,.2)}
  #cart-fab .badge{background:var(--eerie-black-3);color:var(--white);border-radius:9999px;padding:2px 6px;margin-left:8px;font-size:12px}
  #cart-panel{position:fixed;right:16px;bottom:72px;max-width:420px;width:92vw;background:var(--smoky-black-2);color:var(--white);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);padding:16px;display:none;z-index:1000;border:1px solid var(--white-alpha-10)}
  #cart-panel.open{display:block}
  #cart-panel input, #cart-panel button{border-radius:8px}
  #cart-items{max-height:280px;overflow:auto;margin:8px 0}
  .qty-btn{background:var(--eerie-black-3);border:1px solid var(--white-alpha-10);color:var(--white);width:28px;height:28px;border-radius:6px;cursor:pointer}
  .del-btn{background:#b91c1c;border:none;color:#fff;width:28px;height:28px;border-radius:6px;cursor:pointer}
  .auth-link{cursor:pointer;color:var(--gold-crayola)}
  `;
  document.head.appendChild(style);

  // Top bar auth button
  const header = document.querySelector('.header .container');
  if (header) {
    const authBtn = document.createElement('a');
    authBtn.id = 'topbar-auth';
    authBtn.className = 'btn btn-secondary';
    const email = decodeJwtEmail(getToken());
    if (email) {
      authBtn.innerHTML = '<span class="text text-1">Sign out</span><span class="text text-2" aria-hidden="true">Sign out</span>';
      authBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem(tokenKey); localStorage.removeItem(emailKey); location.reload(); });
    } else {
      authBtn.innerHTML = '<span class="text text-1">Sign in</span><span class="text text-2" aria-hidden="true">Sign in</span>';
      authBtn.addEventListener('click', (e) => { e.preventDefault(); showAuthModal(); });
    }
    header.appendChild(authBtn);
  }

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
        <button id="cart-close" style="background:transparent;color:var(--white);border:1px solid var(--white-alpha-20);padding:6px 10px;border-radius:8px">Close</button>
      </div>
    </div>
    <div id="cart-items"></div>
    <div style="display:flex;gap:8px;margin:8px 0">
      <input id="coupon-input" placeholder="Coupon code" style="flex:1;padding:8px;border:1px solid var(--white-alpha-20);background:var(--eerie-black-2);color:var(--white)" />
      <button id="coupon-apply" style="background:var(--gold-crayola);border:none;color:var(--smoky-black-1);padding:8px 12px">Apply</button>
    </div>
    <div id="cart-summary" style="display:flex;justify-content:space-between;margin:8px 0"></div>
    <div style="display:flex;gap:8px;margin:8px 0">
      <input id="panel-gift-amount" type="number" min="10" step="5" placeholder="Buy gift coupon (EUR)" style="flex:1;padding:8px;border:1px solid var(--white-alpha-20);background:var(--eerie-black-2);color:var(--white)" />
      <button id="panel-gift-buy" style="background:var(--gold-crayola);border:none;color:var(--smoky-black-1);padding:8px 12px">Buy</button>
    </div>
    <button id="checkout" style="width:100%;background:var(--gold-crayola);border:none;color:var(--smoky-black-1);padding:10px 12px;font-weight:700">Checkout</button>
  `;
  document.body.appendChild(fab);
  document.body.appendChild(panel);

  document.getElementById('cart-close')?.addEventListener('click', () => panel.classList.remove('open'));
  document.getElementById('coupon-apply')?.addEventListener('click', applyCoupon);
  document.getElementById('checkout')?.addEventListener('click', checkout);
  document.getElementById('panel-gift-buy')?.addEventListener('click', buyGiftCoupon);
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
  const targets = document.querySelectorAll('.special-dish .btn.btn-primary, .menu .menu-card .btn, .menu .menu-card a.card-title, .menu-card .card-title');
  if (targets.length === 0) return;

  console.log('Found add to cart targets:', targets.length);

  targets.forEach((el) => {
    (el as HTMLAnchorElement).addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Adding to cart:', product);
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
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }
  const code = (document.getElementById('coupon-input') as HTMLInputElement | null)?.value?.trim();
  if (!getToken()) {
    localStorage.setItem('post_auth_action','checkout');
    showAuthModal();
    return;
  }
  const email = getEmail() || decodeJwtEmail(getToken());
  if (!email) {
    alert('Email address is required. Please sign in again.');
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(emailKey);
    showAuthModal();
    return;
  }

  console.log('Checking out:', { cart, coupon: code, email });

  const res = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: JSON.stringify({ cart, coupon: code || undefined, email })
  });
  const data = await res.json();
  if (data?.url) {
    window.location.href = data.url;
  } else {
    alert('Failed to create PayPal order. Please try again.');
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

async function initAdmin() {
  if (location.pathname !== '/admin') return;
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/tables`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    showAuthModal();
    return;
  }
  const data = await res.json();
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed'; overlay.style.top = '0'; overlay.style.left = '0'; overlay.style.right = '0'; overlay.style.bottom = '0'; overlay.style.background = 'rgba(0,0,0,.6)'; overlay.style.zIndex = '1300';
  overlay.innerHTML = `
    <div style="max-width:840px;margin:5% auto;background:#111827;color:#fff;border-radius:12px;padding:20px;">
      <div style="display:flex;gap:8px;align-items:center">
        <select id="admin-table" style="flex:1;padding:8px;border-radius:8px;background:#1f2937;color:#fff;border:1px solid #374151"></select>
        <input id="admin-limit" type="number" value="50" min="1" max="500" style="width:100px;padding:8px;border-radius:8px;background:#1f2937;color:#fff;border:1px solid #374151" />
        <button id="admin-load" style="background:#10b981;border:none;color:#fff;padding:8px 12px;border-radius:8px">Load</button>
        <button id="admin-close" style="background:#374151;border:none;color:#fff;padding:8px 12px;border-radius:8px">Close</button>
      </div>
      <div style="margin-top:12px; padding:12px; border:1px solid #374151; border-radius:8px;">
        <div style="font-weight:700;margin-bottom:8px">Coupons Manager</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">
          <input id="cp-code" placeholder="CODE" style="flex:1;min-width:120px;padding:8px;border:1px solid #374151;background:#1f2937;color:#fff;border-radius:8px" />
          <input id="cp-amount" type="number" placeholder="amount_off (cents)" style="width:180px;padding:8px;border:1px solid #374151;background:#1f2937;color:#fff;border-radius:8px" />
          <input id="cp-percent" type="number" placeholder="percent_off" style="width:140px;padding:8px;border:1px solid #374151;background:#1f2937;color:#fff;border-radius:8px" />
          <input id="cp-uses" type="number" placeholder="remaining_uses" style="width:160px;padding:8px;border:1px solid #374151;background:#1f2937;color:#fff;border-radius:8px" />
          <button id="cp-add" style="background:#10b981;border:none;color:#fff;padding:8px 12px;border-radius:8px">Add/Update</button>
        </div>
        <div id="cp-list" style="margin-top:10px"></div>
      </div>
      <div style="margin-top:12px; padding:12px; border:1px solid #374151; border-radius:8px;">
        <div style="font-weight:700;margin-bottom:8px">Users Manager</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">
          <input id="us-email" placeholder="email" style="flex:1;min-width:200px;padding:8px;border:1px solid #374151;background:#1f2937;color:#fff;border-radius:8px" />
          <select id="us-role" style="width:150px;padding:8px;border:1px solid #374151;background:#1f2937;color:#fff;border-radius:8px">
            <option value="customer">customer</option>
            <option value="admin">admin</option>
          </select>
          <button id="us-set" style="background:#10b981;border:none;color:#fff;padding:8px 12px;border-radius:8px">Set Role</button>
          <button id="us-del" style="background:#b91c1c;border:none;color:#fff;padding:8px 12px;border-radius:8px">Delete User</button>
        </div>
        <div id="us-list" style="margin-top:10px"></div>
      </div>
      <div id="admin-data" style="margin-top:12px;max-height:480px;overflow:auto"></div>
    </div>`;
  document.body.appendChild(overlay);
  const sel = overlay.querySelector('#admin-table') as HTMLSelectElement;
  (data.tables || []).forEach((t: string) => { const o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o); });
  overlay.querySelector('#admin-close')?.addEventListener('click', () => overlay.remove());
  overlay.querySelector('#admin-load')?.addEventListener('click', async () => {
    const tbl = sel.value; const limit = Number((overlay.querySelector('#admin-limit') as HTMLInputElement).value) || 50;
    const res2 = await fetch(`${API_BASE}/admin/query?table=${encodeURIComponent(tbl)}&limit=${limit}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const rows = await res2.json();
    const c = overlay.querySelector('#admin-data') as HTMLElement;
    if (!Array.isArray(rows) || rows.length === 0) { c.innerHTML = '<div style="color:#9ca3af">No rows</div>'; return; }
    const cols = Object.keys(rows[0]);
    c.innerHTML = `<table style="width:100%;border-collapse:collapse"><thead><tr>${cols.map(h=>`<th style=\"text-align:left;border-bottom:1px solid #374151;padding:6px\">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r:any)=>`<tr>${cols.map(k=>`<td style=\"border-bottom:1px solid #374151;padding:6px\">${String(r[k]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  });

  // Coupons manager logic
  const renderCoupons = async () => {
    const res3 = await fetch(`${API_BASE}/admin/query?table=coupons&limit=200`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const rows = await res3.json();
    const host = overlay.querySelector('#cp-list') as HTMLElement;
    if (!Array.isArray(rows) || rows.length === 0) { host.innerHTML = '<div style="color:#9ca3af">No coupons</div>'; return; }
    host.innerHTML = rows.map((r:any) => `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;border-bottom:1px solid #374151;padding:6px 0"><div><strong>${r.code}</strong> — ${r.amount_off??0}c, ${r.percent_off??0}% (uses: ${r.remaining_uses??0})</div><button data-del="${r.code}" style="background:#b91c1c;color:#fff;border:none;padding:6px 10px;border-radius:8px">Delete</button></div>`).join('');
    host.querySelectorAll('button[data-del]')?.forEach((b)=>{
      b.addEventListener('click', async (e:any)=>{
        const code = e.currentTarget.getAttribute('data-del');
        if (!code) return;
        await fetch(`${API_BASE}/admin/coupons/${encodeURIComponent(code)}`, { method:'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
        renderCoupons();
      });
    });
  };
  (overlay.querySelector('#cp-add') as HTMLButtonElement)?.addEventListener('click', async () => {
    const code = (overlay.querySelector('#cp-code') as HTMLInputElement).value.trim();
    const amount = Number((overlay.querySelector('#cp-amount') as HTMLInputElement).value||'0');
    const percent = Number((overlay.querySelector('#cp-percent') as HTMLInputElement).value||'0');
    const uses = Number((overlay.querySelector('#cp-uses') as HTMLInputElement).value||'0');
    if (!code) return;
    await fetch(`${API_BASE}/admin/coupons`, { method:'POST', headers: { 'Content-Type':'application/json', ...(token?{ Authorization:`Bearer ${token}`}:{}) }, body: JSON.stringify({ code, amount_off: amount||undefined, percent_off: percent||undefined, remaining_uses: uses||0 }) });
    renderCoupons();
  });
  renderCoupons();

  // Users manager
  const renderUsers = async () => {
    const res4 = await fetch(`${API_BASE}/admin/query?table=users&limit=200`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const rows = await res4.json();
    const host = overlay.querySelector('#us-list') as HTMLElement;
    if (!Array.isArray(rows) || rows.length === 0) { host.innerHTML = '<div style="color:#9ca3af">No users</div>'; return; }
    host.innerHTML = rows.map((r:any) => `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;border-bottom:1px solid #374151;padding:6px 0"><div><strong>${r.email}</strong> — role: ${r.role||'customer'}</div></div>`).join('');
  };
  (overlay.querySelector('#us-set') as HTMLButtonElement)?.addEventListener('click', async () => {
    const email = (overlay.querySelector('#us-email') as HTMLInputElement).value.trim();
    const role = (overlay.querySelector('#us-role') as HTMLSelectElement).value;
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      // Update user role using a more efficient approach
      const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ role })
      });

      if (res.ok) {
        alert('User role updated successfully');
        renderUsers();
      } else {
        alert('Failed to update user role. Please try again.');
      }
    } catch (error) {
      alert('Error updating user role. Please try again.');
    }
  });
  (overlay.querySelector('#us-del') as HTMLButtonElement)?.addEventListener('click', async () => {
    const email = (overlay.querySelector('#us-email') as HTMLInputElement).value.trim();
    if (!email) return;
    await fetch(`${API_BASE}/admin/delete`, { method:'POST', headers: { 'Content-Type':'application/json', ...(token?{ Authorization:`Bearer ${token}`}:{}) }, body: JSON.stringify({ table:'users', key:'email', value: email }) });
    renderUsers();
  });
  renderUsers();
}

// Handle thank-you page
async function initThankYou() {
  const pathParts = location.pathname.split('/');
  if (pathParts[1] !== 'thank-you') return;

  const orderId = pathParts[2];
  const thankYouContent = document.getElementById('thank-you-content');
  if (!thankYouContent) return;

  if (!orderId) {
    // Generic thank you (no order ID)
    if (giftCode) return; // Gift code overlay will handle it
    thankYouContent.innerHTML = `
      <h2 class="headline-1 section-title text-center">Thank you!</h2>
      <p class="text-center">Your purchase was successful. If you bought a gift coupon, your code has been sent to your email.</p>
      <div style="text-align:center;margin-top:16px">
        <a href="/" class="btn btn-primary"><span class="text text-1">Back to Home</span><span class="text text-2" aria-hidden="true">Back to Home</span></a>
      </div>
    `;
    return;
  }

  // Show loading state
  thankYouContent.innerHTML = `
    <h2 class="headline-1 section-title text-center">Loading your order...</h2>
    <div style="text-align:center;margin-top:16px">
      <div style="display:inline-block;width:20px;height:20px;border:2px solid var(--gold-crayola);border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite;"></div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;

  // Fetch order details
  try {
    console.log('Fetching order details for:', orderId);
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error(`Failed to fetch order: ${res.status}`);
    }
    const order = await res.json();
    console.log('Order details received:', order);
    
    let itemsHtml = '';
    let subtotal = 0;
    for (const item of order.items) {
      const lineTotal = item.unit_amount * item.quantity;
      subtotal += lineTotal;
      itemsHtml += `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--white-alpha-10)">
          <div>
            <div style="font-weight:600">${item.name}</div>
            <div style="font-size:14px;color:var(--quick-silver)">Qty: ${item.quantity} × ${formatCents(item.unit_amount)}</div>
          </div>
          <div style="font-weight:600">${formatCents(lineTotal)}</div>
        </div>
      `;
    }
    
    const discount = subtotal - order.total_cents;
    
    thankYouContent.innerHTML = `
      <h2 class="headline-1 section-title text-center">Thank You!</h2>
      <p class="text-center">Your order has been confirmed.</p>
      
      <div style="background:var(--smoky-black-2);padding:20px;border-radius:12px;margin-top:20px;border:1px solid var(--white-alpha-10)">
        <h3 style="margin:0 0 12px;font-size:18px">Order Invoice</h3>
        <div style="margin-bottom:12px">
          <div style="font-size:14px;color:var(--quick-silver)">Order ID:</div>
          <div style="font-weight:600">${order.id}</div>
        </div>
        <div style="margin-bottom:12px">
          <div style="font-size:14px;color:var(--quick-silver)">Email:</div>
          <div>${order.email}</div>
        </div>
        <div style="margin-bottom:12px">
          <div style="font-size:14px;color:var(--quick-silver)">Date:</div>
          <div>${new Date(order.created_at).toLocaleString()}</div>
        </div>
        
        <div style="margin-top:16px">
          <div style="font-weight:700;margin-bottom:8px">Items:</div>
          ${itemsHtml}
        </div>
        
        <div style="margin-top:16px;padding-top:12px;border-top:2px solid var(--white-alpha-20)">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <div>Subtotal:</div>
            <div>${formatCents(subtotal)}</div>
          </div>
          ${discount > 0 ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--gold-crayola)">
              <div>Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}:</div>
              <div>-${formatCents(discount)}</div>
            </div>
          ` : ''}
          <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:700;margin-top:8px">
            <div>Total:</div>
            <div>${formatCents(order.total_cents)}</div>
          </div>
        </div>
      </div>
      
      <div style="text-align:center;margin-top:20px">
        <p style="color:var(--quick-silver)">A confirmation email has been sent to <strong>${order.email}</strong></p>
        <a href="/" class="btn btn-primary" style="margin-top:12px"><span class="text text-1">Back to Home</span><span class="text text-2" aria-hidden="true">Back to Home</span></a>
      </div>
    `;
  } catch (err) {
    console.error('Error loading order details:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    thankYouContent.innerHTML = `
      <h2 class="headline-1 section-title text-center">Unable to Load Order</h2>
      <p class="text-center">We couldn't load your order details. This might be because:</p>
      <ul style="text-align:left;margin:16px auto;max-width:400px;color:var(--quick-silver)">
        <li>The order doesn't exist</li>
        <li>The order is still being processed</li>
        <li>There was a temporary connection issue</li>
      </ul>
      <p class="text-center">If you just completed a purchase, please wait a few minutes and try refreshing the page.</p>
      <div style="text-align:center;margin-top:16px">
        <button onclick="location.reload()" class="btn btn-secondary" style="margin-right:8px">Try Again</button>
        <a href="/" class="btn btn-primary"><span class="text text-1">Back to Home</span><span class="text text-2" aria-hidden="true">Back to Home</span></a>
      </div>
    `;
  }
}

initThankYou();

async function buyGiftCoupon() {
  const input = (document.getElementById('panel-gift-amount') as HTMLInputElement | null) || (document.getElementById('gift-amount') as HTMLInputElement | null);
  if (!input) return;
  const eur = Number(input.value);
  if (!eur || eur < 10) {
    alert('Please enter a valid amount (minimum €10)');
    return;
  }
  if (!getToken()) {
    localStorage.setItem('post_auth_action','buy_gift');
    localStorage.setItem('post_auth_gift_amount', String(eur));
    showAuthModal();
    return;
  }
  const email = getEmail() || decodeJwtEmail(getToken());
  if (!email) {
    alert('Email address is required. Please sign in again.');
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(emailKey);
    showAuthModal();
    return;
  }

  console.log('Buying gift coupon:', { amount_eur: eur, email });

  const res = await fetch(`${API_BASE}/gift-coupons/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount_eur: eur, email })
  });
  const data = await res.json();
  if (data?.url) {
    window.location.href = data.url;
  } else {
    alert('Failed to create PayPal order. Please try again.');
  }
}

// Bind page-level gift buy button if present (on /coupon)
function bindGiftBuyButton() {
  document.getElementById('gift-buy')?.addEventListener('click', buyGiftCoupon);
}

// Call this in ensureUI to ensure it's bound
bindGiftBuyButton();


