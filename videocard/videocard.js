const tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Telegram-ның өз "Артқа" батырмасын қосамыз
  if (tg.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      window.location.href = './index.html';
    });
  }
}

// ---------- Өнімдер тізімі ----------
const PRODUCTS = [
  { id: 1, brand: 'nvidia', name: 'GeForce RTX 4090 24GB', vram: 24, memType: 'GDDR6X', bus: '384-bit', price: 1150000, oldPrice: null, stock: 3, badge: 'hit', popular: 98, img: './images/gpu-nvidia.png' },
  { id: 2, brand: 'nvidia', name: 'GeForce RTX 4080 Super 16GB', vram: 16, memType: 'GDDR6X', bus: '256-bit', price: 620000, oldPrice: 680000, stock: 5, badge: 'sale', popular: 92, img: './images/gpu-nvidia.png' },
  { id: 3, brand: 'nvidia', name: 'GeForce RTX 4070 Ti Super 16GB', vram: 16, memType: 'GDDR6X', bus: '256-bit', price: 470000, oldPrice: null, stock: 8, badge: null, popular: 90, img: './images/gpu-nvidia.png' },
  { id: 4, brand: 'nvidia', name: 'GeForce RTX 4070 12GB', vram: 12, memType: 'GDDR6X', bus: '192-bit', price: 335000, oldPrice: null, stock: 12, badge: 'hit', popular: 95, img: './images/gpu-nvidia.png' },
  { id: 5, brand: 'nvidia', name: 'GeForce RTX 4060 Ti 8GB', vram: 8, memType: 'GDDR6', bus: '128-bit', price: 225000, oldPrice: 245000, stock: 10, badge: 'sale', popular: 85, img: './images/gpu-compact.png' },
  { id: 6, brand: 'nvidia', name: 'GeForce RTX 4060 8GB', vram: 8, memType: 'GDDR6', bus: '128-bit', price: 175000, oldPrice: null, stock: 15, badge: null, popular: 88, img: './images/gpu-compact.png' },
  { id: 7, brand: 'nvidia', name: 'GeForce RTX 3060 12GB', vram: 12, memType: 'GDDR6', bus: '192-bit', price: 145000, oldPrice: null, stock: 0, badge: null, popular: 80, img: './images/gpu-compact.png' },
  { id: 8, brand: 'amd', name: 'Radeon RX 7900 XTX 24GB', vram: 24, memType: 'GDDR6', bus: '384-bit', price: 560000, oldPrice: null, stock: 4, badge: null, popular: 87, img: './images/gpu-amd.png' },
  { id: 9, brand: 'amd', name: 'Radeon RX 7900 XT 20GB', vram: 20, memType: 'GDDR6', bus: '320-bit', price: 430000, oldPrice: 465000, stock: 6, badge: 'sale', popular: 83, img: './images/gpu-amd.png' },
  { id: 10, brand: 'amd', name: 'Radeon RX 7800 XT 16GB', vram: 16, memType: 'GDDR6', bus: '256-bit', price: 285000, oldPrice: null, stock: 9, badge: 'hit', popular: 91, img: './images/gpu-amd.png' },
  { id: 11, brand: 'amd', name: 'Radeon RX 7700 XT 12GB', vram: 12, memType: 'GDDR6', bus: '192-bit', price: 235000, oldPrice: null, stock: 7, badge: null, popular: 79, img: './images/gpu-amd.png' },
  { id: 12, brand: 'amd', name: 'Radeon RX 7600 8GB', vram: 8, memType: 'GDDR6', bus: '128-bit', price: 145000, oldPrice: null, stock: 0, badge: null, popular: 76, img: './images/gpu-compact.png' },
  { id: 13, brand: 'intel', name: 'Arc B580 12GB', vram: 12, memType: 'GDDR6', bus: '192-bit', price: 155000, oldPrice: null, stock: 11, badge: 'new', popular: 84, img: './images/gpu-compact.png' },
  { id: 14, brand: 'intel', name: 'Arc A770 16GB', vram: 16, memType: 'GDDR6', bus: '256-bit', price: 165000, oldPrice: 185000, stock: 5, badge: 'sale', popular: 72, img: './images/gpu-compact.png' },
];

const BRAND_LABEL = { nvidia: 'NVIDIA', amd: 'AMD', intel: 'Intel' };
const BADGE_LABEL = { hit: 'Хит', new: 'Жаңа', sale: 'Акция' };

// ---------- Күй (state) ----------
const state = {
  brand: 'all',
  query: '',
  sort: 'popular',
  stockOnly: false,
  cart: {}, // { [id]: qty }
};

// ---------- DOM ----------
const $ = (sel) => document.querySelector(sel);
const productsEl = $('#products');
const emptyEl = $('#emptyState');
const countEl = $('#productCount');
const searchInput = $('#searchInput');
const sortSelect = $('#sortSelect');
const stockOnly = $('#stockOnly');
const brandChips = $('#brandChips');
const resetBtn = $('#resetBtn');
const cartBtn = $('#cartBtn');
const cartBadge = $('#cartBadge');
const cartSheet = $('#cartSheet');
const sheetBackdrop = $('#sheetBackdrop');
const sheetClose = $('#sheetClose');
const cartItems = $('#cartItems');
const cartTotal = $('#cartTotal');
const checkoutBtn = $('#checkoutBtn');
const toastEl = $('#toast');

// ---------- Көмекші функциялар ----------
const formatPrice = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₸';

function haptic(type = 'light') {
  if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
}

let toastTimer;
function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 1800);
}

// ---------- Сүзгі + сұрыптау ----------
function getVisibleProducts() {
  let list = PRODUCTS.filter((p) => {
    if (state.brand !== 'all' && p.brand !== state.brand) return false;
    if (state.stockOnly && p.stock === 0) return false;
    if (state.query) {
      const q = state.query.toLowerCase();
      const haystack = `${BRAND_LABEL[p.brand]} ${p.name}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  switch (state.sort) {
    case 'price-asc': list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'vram': list.sort((a, b) => b.vram - a.vram); break;
    default: list.sort((a, b) => b.popular - a.popular);
  }
  return list;
}

// ---------- Өнімдерді салу ----------
function renderProducts() {
  const list = getVisibleProducts();
  countEl.textContent = `${list.length} өнім`;

  if (list.length === 0) {
    productsEl.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  productsEl.innerHTML = list
    .map((p, i) => {
      const out = p.stock === 0;
      const inCart = state.cart[p.id] > 0;
      return `
      <article class="card ${out ? 'is-out' : ''}" style="animation-delay:${i * 40}ms">
        <div class="card-media">
          ${p.badge ? `<span class="card-badge card-badge--${p.badge}">${BADGE_LABEL[p.badge]}</span>` : ''}
          <img src="${p.img}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="card-body">
          <span class="card-brand card-brand--${p.brand}">${BRAND_LABEL[p.brand]}</span>
          <h3 class="card-title">${p.name}</h3>
          <div class="card-specs">
            <span class="spec">${p.vram} GB</span>
            <span class="spec">${p.memType}</span>
            <span class="spec">${p.bus}</span>
          </div>
          <div class="card-footer">
            <div class="card-price">
              ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
              <span class="price">${formatPrice(p.price)}</span>
              <span class="stock ${out ? 'stock--out' : ''}">${out ? 'Қоймада жоқ' : `Қоймада: ${p.stock} дана`}</span>
            </div>
            <button class="add-btn ${inCart ? 'is-added' : ''}" data-id="${p.id}" type="button" ${out ? 'disabled' : ''}>
              ${out ? 'Жоқ' : inCart ? '✓ Себетте' : '+ Себетке'}
            </button>
          </div>
        </div>
      </article>`;
    })
    .join('');
}

// ---------- Себет ----------
function cartCount() {
  return Object.values(state.cart).reduce((s, q) => s + q, 0);
}

function cartSum() {
  return Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function updateCartBadge() {
  const n = cartCount();
  cartBadge.textContent = n;
  cartBadge.hidden = n === 0;
}

function addToCart(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p || p.stock === 0) return;
  const current = state.cart[id] || 0;
  if (current >= p.stock) {
    showToast('Қоймадағы максимум саны');
    haptic('heavy');
    return;
  }
  state.cart[id] = current + 1;
  haptic('light');
  showToast(`${p.name} себетке қосылды`);
  updateCartBadge();
  renderProducts();
  renderCart();
}

function changeQty(id, delta) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  const next = (state.cart[id] || 0) + delta;
  if (next <= 0) delete state.cart[id];
  else if (next > p.stock) { showToast('Қоймадағы максимум саны'); return; }
  else state.cart[id] = next;
  haptic('light');
  updateCartBadge();
  renderProducts();
  renderCart();
}

function renderCart() {
  const entries = Object.entries(state.cart);
  if (entries.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Себет бос. Өнімдерді қосыңыз.</p>';
    checkoutBtn.disabled = true;
  } else {
    cartItems.innerHTML = entries
      .map(([id, qty]) => {
        const p = PRODUCTS.find((x) => x.id === Number(id));
        return `
        <div class="cart-item">
          <img src="${p.img}" alt="" />
          <div class="cart-item-info">
            <span class="cart-item-name">${p.name}</span>
            <span class="cart-item-price">${formatPrice(p.price)}</span>
          </div>
          <div class="qty">
            <button type="button" data-qty="-1" data-id="${p.id}" aria-label="Азайту">−</button>
            <span>${qty}</span>
            <button type="button" data-qty="1" data-id="${p.id}" aria-label="Көбейту">+</button>
          </div>
        </div>`;
      })
      .join('');
    checkoutBtn.disabled = false;
  }
  cartTotal.textContent = formatPrice(cartSum());
}

function openCart() {
  renderCart();
  sheetBackdrop.hidden = false;
  cartSheet.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => cartSheet.classList.add('is-open'));
  haptic('light');
}

function closeCart() {
  cartSheet.classList.remove('is-open');
  cartSheet.setAttribute('aria-hidden', 'true');
  setTimeout(() => { sheetBackdrop.hidden = true; }, 300);
}

function checkout() {
  const items = Object.entries(state.cart).map(([id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === Number(id));
    return { id: p.id, name: p.name, qty, price: p.price };
  });
  const payload = { type: 'order', category: 'videocard', items, total: cartSum() };

  haptic('medium');
  if (tg && tg.sendData) {
    // Ботқа тапсырыс деректерін жіберу
    tg.sendData(JSON.stringify(payload));
  } else if (tg && tg.showAlert) {
    tg.showAlert(`Тапсырыс қабылданды! Жиыны: ${formatPrice(payload.total)}`);
  } else {
    alert(`Тапсырыс қабылданды!\nЖиыны: ${formatPrice(payload.total)}`);
  }
  state.cart = {};
  updateCartBadge();
  renderProducts();
  closeCart();
}

// ---------- Оқиғалар ----------
brandChips.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  brandChips.querySelectorAll('.chip').forEach((c) => {
    c.classList.remove('is-active');
    c.setAttribute('aria-selected', 'false');
  });
  chip.classList.add('is-active');
  chip.setAttribute('aria-selected', 'true');
  state.brand = chip.dataset.brand;
  haptic('light');
  renderProducts();
});

searchInput.addEventListener('input', (e) => {
  state.query = e.target.value.trim();
  renderProducts();
});

sortSelect.addEventListener('change', (e) => {
  state.sort = e.target.value;
  renderProducts();
});

stockOnly.addEventListener('change', (e) => {
  state.stockOnly = e.target.checked;
  renderProducts();
});

resetBtn.addEventListener('click', () => {
  state.brand = 'all';
  state.query = '';
  state.stockOnly = false;
  searchInput.value = '';
  stockOnly.checked = false;
  brandChips.querySelectorAll('.chip').forEach((c) => {
    const active = c.dataset.brand === 'all';
    c.classList.toggle('is-active', active);
    c.setAttribute('aria-selected', String(active));
  });
  renderProducts();
});

productsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-btn');
  if (!btn || btn.disabled) return;
  addToCart(Number(btn.dataset.id));
});

cartItems.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-qty]');
  if (!btn) return;
  changeQty(Number(btn.dataset.id), Number(btn.dataset.qty));
});

cartBtn.addEventListener('click', openCart);
sheetClose.addEventListener('click', closeCart);
sheetBackdrop.addEventListener('click', closeCart);
checkoutBtn.addEventListener('click', checkout);

// ---------- Бастапқы салу ----------
renderProducts();
updateCartBadge();
