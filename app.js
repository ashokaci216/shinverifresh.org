/* =========================
SHIVNERI FRESH - DEMO WEBSITE
Uses menu.json as the single product source for filters, search, cart, and WhatsApp checkout
========================= */

const DELIVERY_FEE = 40;
const DELIVERY_FREE_MINIMUM = 300;
const MENU_DATA_VERSION = '20260422';
const STORE_DISPLAY_NAME = 'Shivneri Fresh';
const CHECKOUT_WHATSAPP_NUMBER = '919867378209';
const DEFAULT_OFFER_PRODUCT_IDS = [
  'one-dream-tortilla',
  'wg-premium-veg-mayo',
  'malas-green-apple-crush'
];
const DEFAULT_OFFER_PRICE_MAP = {
  'one-dream-tortilla': { offerPrice: 69, oldPrice: 79.83 },
  'wg-premium-veg-mayo': { offerPrice: 59, oldPrice: 65.26 },
  'malas-green-apple-crush': { offerPrice: 179, oldPrice: 195 }
};
const DEFAULT_OFFER_IMAGE_MAP = {
  'one-dream-tortilla': 'images/offers/one-dream-tortilla.jpg',
  'malas-green-apple-crush': 'images/offers/malas-green-apple-crush.jpg',
  'wg-premium-veg-mayo': 'images/offers/wg-premium-veg-mayo.jpg'
};
const QUICK_ORDER_PICK_CATEGORIES = [
  {
    id: 'buy-one-get-one',
    title: 'Buy 1 Get 1',
    subtitle: 'Double the value, same great quality.',
    cta: 'View Items',
    icon: 'B1G1',
    tone: 'green'
  },
  {
    id: 'forty-to-seventy-percent-off',
    title: '40% to 70% Off on MRP',
    subtitle: 'Hot deals on selected products.',
    cta: 'View Items',
    icon: '%',
    tone: 'orange'
  },
  {
    id: 'japanese-section',
    title: 'Japanese Section',
    subtitle: 'Sushi & Japanese essentials.',
    cta: 'View Items',
    icon: 'JP',
    tone: 'coral'
  },
  {
    id: 'quick-order',
    title: 'Quick Order',
    subtitle: 'Cafe regular fast-moving items.',
    cta: 'View Items',
    icon: 'Q',
    tone: 'blue'
  }
];
const OFFER_CATEGORY_IDS = new Set(['buy-one-get-one', 'forty-to-seventy-percent-off']);
const HIDDEN_FROM_CATEGORY_GRID_IDS = new Set(QUICK_ORDER_PICK_CATEGORIES.map(category => category.id));

/* =========================
STATE
========================= */
let storeData = null;
let products = [];
let categories = [];
let cart = {};
let filteredProducts = [];
let currentFilter = 'all';
let offerProducts = [];

/* =========================
DOM ELEMENTS
========================= */
const storeName = document.getElementById('store-name');
const headerCallBtn = document.getElementById('header-call-btn');
const headerWhatsappBtn = document.getElementById('header-whatsapp-btn');
const heroWhatsappBtn = document.getElementById('hero-whatsapp-btn');
const footerPhone = document.getElementById('footer-phone');

const quickPicksSection = document.getElementById('quick-picks-section');
const quickPicksList = document.getElementById('quick-picks-list');
const shortcutProductsSection = document.getElementById('shortcut-products-section');
const shortcutBackBtn = document.getElementById('shortcut-back-btn');
const shortcutViewTitle = document.getElementById('shortcut-view-title');
const shortcutProductList = document.getElementById('shortcut-product-list');
const searchInput = document.getElementById('searchInput');
const searchSection = document.querySelector('.search-section');
const categoryShowcaseSection = document.getElementById('products-section');
const categoryGrid = document.getElementById('category-grid');
const filterSection = document.querySelector('.filter-section');
const categoryFilters = document.getElementById('category-filters');
const categoryScroll = document.getElementById('category-scroll');
const scrollLeftBtn = document.getElementById('scroll-left');
const scrollRightBtn = document.getElementById('scroll-right');
const productList = document.getElementById('product-list');
const categoryItemsSection = document.getElementById('category-items-section');
const categoryBackBtn = document.getElementById('category-back-btn');
const categoryViewTitle = document.getElementById('category-view-title');
const imageModal = document.getElementById('image-modal');
const imageModalBackdrop = document.getElementById('image-modal-backdrop');
const imageModalCloseBtn = document.getElementById('image-modal-close');
const imageModalPreview = document.getElementById('image-modal-preview');

const heroSlider = document.getElementById('hero-slider');
const heroDotsContainer = document.getElementById('hero-dots');
const heroSlides = heroSlider ? Array.from(heroSlider.querySelectorAll('.hero-slide')) : [];
let heroSlideIndex = 0;
let heroSlideTimer = null;
const HERO_SLIDE_INTERVAL = 3000;
let currentView = 'categoryGridView';
let activeCategoryId = '';

const cartBar = document.getElementById('cart-bar');
const cartBarCount = document.getElementById('cart-bar-count');
const cartBarTotal = document.getElementById('cart-bar-total');

const cartDrawer = document.getElementById('cart-drawer');
const cartBackdrop = document.getElementById('cart-backdrop');
const closeCartBtn = document.getElementById('close-cart-btn');

const cartItems = document.getElementById('cart-items');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartDelivery = document.getElementById('cart-delivery');
const cartTotal = document.getElementById('cart-total');

const cartName = document.getElementById('cart-name');
const cartPhone = document.getElementById('cart-phone');
const cartAddress = document.getElementById('cart-address');
const cartNote = document.getElementById('cart-note');
const checkoutBtn = document.getElementById('checkout-btn');

/* =========================
HELPERS
========================= */
function formatPrice(value) {
  return `Rs ${Number(value).toFixed(2).replace(/\.00$/, '')}`;
}

function formatCardPrice(value) {
  return `₹${Number(value).toFixed(2).replace(/\.00$/, '')}`;
}

function formatOfferPackText(packText = '') {
  const normalized = String(packText).trim();
  if (!normalized) return '';

  const parts = normalized.split('=');
  if (parts.length > 1) {
    return `Case pack: ${parts.slice(1).join('=').trim()}`;
  }

  return normalized;
}

function formatOfferValidityText(offerText = '', qtyLabel = '') {
  const normalizedOffer = String(offerText).trim();
  const normalizedQty = String(qtyLabel).trim();

  if (normalizedOffer) {
    return normalizedOffer.replace(/^Offer\s+for\s+/i, '').trim();
  }

  return normalizedQty;
}

function getOrderType() {
  const selected = document.querySelector('input[name="orderType"]:checked');
  return selected ? selected.value : 'Delivery';
}

function findProductById(productId) {
  return (
    products.find(product => product.id === productId) ||
    offerProducts.find(offer => offer.id === productId)
  );
}

function getCartArray() {
  return Object.values(cart);
}

function getCartItemCount() {
  return getCartArray().reduce((sum, item) => sum + item.qty, 0);
}

function getProductUnit(product) {
  if (typeof product.unit === 'string' && product.unit.trim()) {
    return product.unit.trim();
  }

  if (typeof product.price === 'number') {
    return null;
  }

  if (Array.isArray(product.options) && product.options.length) {
    return product.options[0].label;
  }

  if (Array.isArray(product.slabs) && product.slabs.length) {
    return product.slabs[0].label;
  }

  return null;
}

function getProductPrice(product) {
  if (typeof product.price === 'number') {
    return product.price;
  }

  if (Array.isArray(product.options) && product.options.length) {
    return product.options[0].price;
  }

  if (Array.isArray(product.slabs) && product.slabs.length) {
    return product.slabs[0].price;
  }

  return 0;
}

function getItemPrice(item, qty) {
  const slabs = Array.isArray(item?.slabs) ? item.slabs : [];

  if (!slabs.length) {
    if (typeof item?.offerPrice === 'number' && item?.pricingMode === 'offer') {
      return item.offerPrice;
    }

    return typeof item?.selectedPrice === 'number' ? item.selectedPrice : getProductPrice(item);
  }

  if (qty >= 12) {
    return (
      slabs.find(slab => Number(slab.minQty) === 12)?.price ??
      slabs.find(slab => Number(slab.minQty) === 6)?.price ??
      slabs.find(slab => Number(slab.minQty) === 1)?.price ??
      getProductPrice(item)
    );
  }

  if (qty >= 6) {
    return (
      slabs.find(slab => Number(slab.minQty) === 6)?.price ??
      slabs.find(slab => Number(slab.minQty) === 1)?.price ??
      getProductPrice(item)
    );
  }

  return slabs.find(slab => Number(slab.minQty) === 1)?.price ?? getProductPrice(item);
}

function getOfferPrice(product) {
  if (typeof product.offerPrice === 'number') {
    return product.offerPrice;
  }

  return getProductPrice(product);
}

function normalizeProduct(product) {
  const fallbackOffer = DEFAULT_OFFER_PRICE_MAP[product.id];
  const fallbackOfferImage = DEFAULT_OFFER_IMAGE_MAP[product.id];

  return {
    ...product,
    available: product.available !== false,
    isOffer: product.isOffer === true || Boolean(fallbackOffer),
    offerPrice:
      typeof product.offerPrice === 'number'
        ? product.offerPrice
        : fallbackOffer?.offerPrice,
    oldPrice:
      typeof product.oldPrice === 'number'
        ? product.oldPrice
        : fallbackOffer?.oldPrice,
    offerImage: product.offerImage || fallbackOfferImage || '',
    selectedUnit: getProductUnit(product),
    selectedPrice: getProductPrice(product)
  };
}

function slugifyCategoryName(name = '') {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCategory(category, index) {
  const categoryName = category?.name || `Category ${index + 1}`;
  const categoryId = category?.id || slugifyCategoryName(categoryName) || `category-${index + 1}`;
  const categoryItems = Array.isArray(category?.items) ? category.items : [];

  return {
    ...category,
    id: categoryId,
    name: categoryName,
    items: categoryItems.map(item =>
      normalizeProduct({
        ...item,
        category: categoryName,
        categoryId
      })
    )
  };
}

function normalizeSpecialOffer(offer) {
  const offerPrice = typeof offer?.offerPrice === 'number' ? offer.offerPrice : 0;

  return {
    ...offer,
    available: offer?.available !== false,
    selectedUnit: offer?.qtyLabel || '',
    selectedPrice: offerPrice,
    price: offerPrice,
    oldPrice: typeof offer?.actualPrice === 'number' ? offer.actualPrice : undefined,
    offerImage: offer?.image || '',
    description: [offer?.packText, offer?.offerText].filter(Boolean).join(' | '),
    category: 'Special Offers',
    pricingMode: 'offer'
  };
}

function getSubtotal() {
  return getCartArray().reduce((sum, item) => sum + getItemPrice(item, item.qty) * item.qty, 0);
}

function getDeliveryFee() {
  const orderType = getOrderType();
  const subtotal = getSubtotal();

  if (orderType === 'Pickup') return 0;
  if (subtotal === 0) return 0;
  if (subtotal >= DELIVERY_FREE_MINIMUM) return 0;

  return DELIVERY_FEE;
}

function getGrandTotal() {
  return getSubtotal() + getDeliveryFee();
}

function lockPageScroll() {
  document.body.classList.add('modal-open');
}

function unlockPageScroll() {
  document.body.classList.remove('modal-open');
}

function getModalProductData(productId, mode = 'regular') {
  const product = findProductById(productId);
  if (!product) return null;

  const imageSrc = mode === 'offer'
    ? product.offerImage || product.image || ''
    : product.image || product.offerImage || '';

  return {
    product,
    imageSrc
  };
}

function openImageModal(productId, mode = 'regular') {
  if (!imageModal || !imageModalPreview) return;

  const modalData = getModalProductData(productId, mode);
  if (!modalData || !modalData.imageSrc) return;

  imageModalPreview.src = modalData.imageSrc;
  imageModalPreview.alt = modalData.product.name;

  imageModal.classList.add('open');
  imageModal.setAttribute('aria-hidden', 'false');
  lockPageScroll();
}

function closeImageModal() {
  if (!imageModal || !imageModalPreview) return;

  imageModal.classList.remove('open');
  imageModal.setAttribute('aria-hidden', 'true');
  imageModalPreview.src = '';
  imageModalPreview.alt = '';
  unlockPageScroll();
}

function getProductSlabRowsHTML(product) {
  const slabMap = new Map(
    (Array.isArray(product.slabs) ? product.slabs : []).map(slab => [Number(slab.minQty), slab.price])
  );

  return [1, 6, 12]
    .map(minQty => {
      const price = slabMap.get(minQty);
      if (typeof price !== 'number') return '';

      return `
        <div class="product-slab-row">
          <span class="product-slab-qty">${minQty === 1 ? '1 pc' : `${minQty} pcs`}</span>
          <span class="product-slab-price">${formatCardPrice(price)}/item</span>
        </div>
      `;
    })
    .filter(Boolean)
    .join('');
}

function getProductCardMediaHTML(product) {
  const imageSrc = typeof product?.image === 'string' ? product.image.trim() : '';
  const fallbackLabel = getCategoryPlaceholderLabel(product?.name);

  return `
    <div class="product-media${imageSrc ? ' has-image' : ' is-fallback'}" aria-hidden="${imageSrc ? 'false' : 'true'}">
      ${
        imageSrc
          ? `<img
              class="product-image"
              src="${imageSrc}"
              alt="${product.name}"
              loading="lazy"
              tabindex="0"
              role="button"
              data-product-image-modal
              data-product-id="${product.id}"
              data-product-mode="regular"
              onerror="this.parentElement.classList.add('is-fallback'); this.remove();"
            />`
          : ''
      }
      <span class="product-image-placeholder">${fallbackLabel}</span>
    </div>
  `;
}

function getProductCardHTML(product, qty) {
  const productUnit = product.unit || getProductUnit(product) || '';
  const productBrand = product.brand || '';
  const slabRows = getProductSlabRowsHTML(product);
  const activeQty = qty > 0 ? qty : 1;
  const activePrice = getItemPrice(product, activeQty);

  return `
    <div class="product-main">
      ${getProductCardMediaHTML(product)}

      <div class="product-card-body">
        ${productBrand ? `<p class="product-brand">${productBrand}</p>` : ''}
        <h3 class="product-name">${product.name}</h3>
        ${productUnit ? `<p class="product-unit">${productUnit}</p>` : ''}
      </div>
    </div>

    <div class="product-footer">
      <div class="product-base-price" data-product-price="${product.id}">
        <span>Current rate</span>
        <strong>${formatCardPrice(activePrice)}/item</strong>
      </div>

      <div data-product-controls="${product.id}">
        ${
          qty > 0
            ? getQtyControlHTML(product.id, qty)
            : product.available === false
              ? '<button class="add-btn" type="button" disabled>Unavailable</button>'
              : `<button class="add-btn" onclick="addToCart('${product.id}', 'regular')">Add</button>`
        }
      </div>
    </div>

    ${slabRows ? `<div class="product-slabs"><span class="product-slabs-label">Bulk savings</span>${slabRows}</div>` : ''}
  `;
}

function getOfferCategoryProductCardHTML(product, qty) {
  const productUnit = product.unit || getProductUnit(product) || '';
  const productBrand = product.brand || '';
  const basePrice = getProductPrice(product);
  const mrp = typeof product.mrp === 'number' ? product.mrp : null;
  const isBogo = product.categoryId === 'buy-one-get-one';
  const offerLabel = product.offerText || (isBogo ? 'Buy 1 Get 1' : 'Offer');
  const displayName = isBogo ? product.name.replace(/\s+-\s+Buy 1 Get 1$/i, '') : product.name;
  const displayMrp = mrp || (isBogo ? basePrice : null);
  const saving = mrp && basePrice ? Math.max(mrp - basePrice, 0) : isBogo ? basePrice : 0;
  const savingsTitle = isBogo ? 'Buy 1 Get 1 Offer' : offerLabel;
  const savingsCopy = isBogo
    ? `Add 1 to cart and pay ${formatCardPrice(basePrice)}. You will receive 2 packets.`
    : 'Great savings on your favourite products.';
  const imageSrc = typeof product?.image === 'string' ? product.image.trim() : '';
  const fallbackLabel = getCategoryPlaceholderLabel(product?.name);

  return `
    <div class="offer-product-main">
      <div class="offer-product-media${imageSrc ? ' has-image' : ' is-fallback'}" aria-hidden="${imageSrc ? 'false' : 'true'}">
        ${
          imageSrc
            ? `<img
                class="offer-product-image"
                src="${imageSrc}"
                alt="${product.name}"
                loading="lazy"
                tabindex="0"
                role="button"
                data-product-image-modal
                data-product-id="${product.id}"
                data-product-mode="regular"
                onerror="this.parentElement.classList.add('is-fallback'); this.remove();"
              />`
            : ''
        }
        <span class="offer-product-placeholder">${fallbackLabel}</span>
      </div>

      <div class="offer-product-body">
        <div class="offer-product-topline">
          <span class="offer-product-brand">${productBrand}</span>
        </div>

        <h3 class="offer-product-name">${displayName}</h3>
        ${productUnit ? `<p class="offer-product-unit">${productUnit}</p>` : ''}

        <div class="offer-product-price-row">
          ${
            displayMrp
              ? `<div class="offer-product-mrp${mrp ? ' is-struck' : ''}">
                  <span>MRP</span>
                  <strong>${formatCardPrice(displayMrp)}<small>/pkt</small></strong>
                </div>`
              : ''
          }
          <div class="offer-product-price-panel" data-product-price="${product.id}">
            <span class="offer-product-badge">${offerLabel}</span>
            <span data-price-label>Offer Price</span>
            <strong data-price-value>${formatCardPrice(basePrice)}/pkt</strong>
          </div>
        </div>
      </div>

      <div class="offer-product-actions">
        <div data-product-controls="${product.id}">
          ${
            qty > 0
              ? getQtyControlHTML(product.id, qty)
              : product.available === false
                ? '<button class="add-btn" type="button" disabled>Unavailable</button>'
                : `<button class="add-btn" onclick="addToCart('${product.id}', 'regular')">Add</button>`
          }
        </div>
      </div>
    </div>

    <div class="offer-product-savings">
      <div class="offer-product-savings-copy">
        <span class="offer-product-savings-icon" aria-hidden="true">${isBogo ? '+' : '%'}</span>
        <div>
          <strong>${savingsTitle}</strong>
          <span>${savingsCopy}</span>
        </div>
      </div>
      ${
        saving
          ? `<div class="offer-product-save-amount">
              <span>You Save</span>
              <strong>${formatCardPrice(saving)}</strong>
            </div>`
          : ''
      }
    </div>

    <div class="offer-product-validity">
      <span aria-hidden="true"></span>
      <strong>Offer valid till stock lasts</strong>
    </div>
  `;
}

function updateSingleProductPrice(productId) {
  const product = findProductById(productId);
  if (!product) return;

  const qty = cart[productId]?.qty || 1;
  const activePrice = getItemPrice(cart[productId] || product, qty);
  const priceNodes = document.querySelectorAll(`[data-product-price="${productId}"]`);

  priceNodes.forEach(priceNode => {
    const label = priceNode.querySelector('[data-price-label]') || priceNode.querySelector('span');
    const value = priceNode.querySelector('[data-price-value]') || priceNode.querySelector('strong');
    const isOfferCategoryCard = Boolean(priceNode.closest('.offer-product-card'));

    if (label) label.textContent = isOfferCategoryCard ? 'Offer Price' : 'Current rate';
    if (value) value.textContent = `${formatCardPrice(activePrice)}${isOfferCategoryCard ? '/pkt' : '/item'}`;
  });
}

function getCategoryNameById(categoryId) {
  if (categoryId === 'all') return 'all';
  return categories.find(category => category.id === categoryId)?.name || '';
}

function getCategoryById(categoryId) {
  return categories.find(category => category.id === categoryId) || null;
}

function getCategoryUrl(categoryId = '') {
  const url = new URL(window.location.href);

  url.searchParams.delete('shortcut');

  if (categoryId) {
    url.searchParams.set('category', categoryId);
  } else {
    url.searchParams.delete('category');
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function getShortcutUrl(categoryId = '') {
  const url = new URL(window.location.href);

  url.searchParams.delete('category');

  if (categoryId) {
    url.searchParams.set('shortcut', categoryId);
  } else {
    url.searchParams.delete('shortcut');
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function getCategoryImageSrc(category) {
  if (!category || typeof category !== 'object') return '';

  const imageFields = [
    category.image,
    category.imageUrl,
    category.image_url,
    category.icon,
    category.thumbnail
  ];

  return imageFields.find(value => typeof value === 'string' && value.trim()) || '';
}

function getCategoryPlaceholderLabel(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'SF';
}

function getCategoryCardMediaHTML(category) {
  const imageSrc = getCategoryImageSrc(category);
  const placeholderLabel = getCategoryPlaceholderLabel(category?.name);

  if (!imageSrc) {
    return `
      <div class="category-card-media is-fallback" aria-hidden="true">
        <span class="category-card-placeholder">${placeholderLabel}</span>
      </div>
    `;
  }

  return `
    <div class="category-card-media has-image">
      <img
        class="category-card-image"
        src="${imageSrc}"
        alt="${category.name}"
        loading="lazy"
        onerror="this.parentElement.classList.add('is-fallback'); this.remove();"
      />
      <span class="category-card-placeholder" aria-hidden="true">${placeholderLabel}</span>
    </div>
  `;
}

function getOfferProducts() {
  const flaggedOffers = products.filter(product => product.isOffer === true);

  if (flaggedOffers.length) {
    return flaggedOffers.slice(0, 3);
  }

  return DEFAULT_OFFER_PRODUCT_IDS
    .map(productId => products.find(product => product.id === productId))
    .filter(Boolean)
    .slice(0, 3);
}

function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategoryName = getCategoryNameById(currentFilter);

  filteredProducts = products.filter(product => {
    const matchesCategory =
      currentFilter === 'all' || product.category === selectedCategoryName;
    const productDescription = product.description || product.brand || '';

    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      productDescription.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  renderProducts(filteredProducts);
}

function clearActiveCategorySelection() {
  document.querySelectorAll('.filter-btn').forEach(filterButton => {
    filterButton.classList.remove('active');
  });

  document.querySelectorAll('.category-card').forEach(categoryCard => {
    categoryCard.classList.remove('active');
  });

  document.querySelectorAll('.quick-pick-card').forEach(pickCard => {
    pickCard.classList.remove('active');
  });
}

function showCategoryHome({ updateHistory = true } = {}) {
  currentView = 'categoryGridView';
  activeCategoryId = '';
  currentFilter = 'all';

  clearActiveCategorySelection();

  if (categoryShowcaseSection) {
    categoryShowcaseSection.classList.remove('hidden');
  }

  if (searchSection) {
    searchSection.classList.remove('hidden');
  }

  if (filterSection) {
    filterSection.classList.add('hidden');
  }

  if (categoryItemsSection) {
    categoryItemsSection.classList.add('hidden');
  }

  if (shortcutProductsSection) {
    shortcutProductsSection.classList.add('hidden');
  }

  if (productList) {
    productList.innerHTML = '';
  }

  if (shortcutProductList) {
    shortcutProductList.innerHTML = '';
  }

  if (updateHistory) {
    history.pushState({ view: 'categoryGridView' }, '', getCategoryUrl());
  }
}

function showCategoryItemsView(categoryId, { updateHistory = true } = {}) {
  const category = getCategoryById(categoryId);
  if (!category) {
    showCategoryHome({ updateHistory });
    return;
  }

  currentView = 'categoryItemsView';
  activeCategoryId = category.id;
  currentFilter = category.id;

  setActiveFilterButton(category.id);

  if (categoryShowcaseSection) {
    categoryShowcaseSection.classList.add('hidden');
  }

  if (searchSection) {
    searchSection.classList.remove('hidden');
  }

  if (filterSection) {
    filterSection.classList.add('hidden');
  }

  if (categoryItemsSection) {
    categoryItemsSection.classList.remove('hidden');
  }

  if (shortcutProductsSection) {
    shortcutProductsSection.classList.add('hidden');
  }

  if (categoryViewTitle) {
    categoryViewTitle.textContent = category.name;
  }

  applyFilters();

  if (updateHistory) {
    history.pushState(
      { view: 'categoryItemsView', categoryId: category.id },
      '',
      getCategoryUrl(category.id)
    );
  }
}

function renderShortcutProducts(category) {
  if (!shortcutProductList) return;

  shortcutProductList.innerHTML = '';

  if (!category?.items?.length) {
    shortcutProductList.innerHTML = '<div class="no-results">No products found.</div>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'product-grid category-products-grid shortcut-products-grid';

  category.items.forEach(product => {
    const card = document.createElement('article');
    const useOfferCard = OFFER_CATEGORY_IDS.has(category.id);
    card.className = useOfferCard ? 'offer-product-card' : 'product-card';

    const qty = cart[product.id]?.qty || 0;
    card.innerHTML = useOfferCard
      ? getOfferCategoryProductCardHTML(product, qty)
      : getProductCardHTML(product, qty);

    grid.appendChild(card);
  });

  shortcutProductList.appendChild(grid);
}

function openQuickPickCategory(categoryId, { updateHistory = true } = {}) {
  const category = getCategoryById(categoryId);
  if (!category) {
    showCategoryHome({ updateHistory });
    return;
  }

  currentView = 'quickPickView';
  activeCategoryId = '';
  currentFilter = 'all';

  clearActiveCategorySelection();
  setActiveFilterButton(category.id);

  if (searchSection) {
    searchSection.classList.add('hidden');
  }

  if (categoryShowcaseSection) {
    categoryShowcaseSection.classList.add('hidden');
  }

  if (filterSection) {
    filterSection.classList.add('hidden');
  }

  if (categoryItemsSection) {
    categoryItemsSection.classList.add('hidden');
  }

  if (productList) {
    productList.innerHTML = '';
  }

  if (shortcutProductsSection) {
    shortcutProductsSection.classList.remove('hidden');
  }

  if (shortcutViewTitle) {
    shortcutViewTitle.textContent = category.name;
  }

  renderShortcutProducts(category);
  shortcutProductsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (updateHistory) {
    history.pushState(
      { view: 'quickPickView', categoryId: category.id },
      '',
      getShortcutUrl(category.id)
    );
  }
}

function closeQuickPickView({ updateHistory = true } = {}) {
  showCategoryHome({ updateHistory: false });

  if (updateHistory) {
    history.replaceState({ view: 'categoryGridView' }, '', getCategoryUrl());
  }

  requestAnimationFrame(() => {
    quickPicksSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function syncViewWithLocation({ bootstrap = false } = {}) {
  const categoryIdFromUrl = new URLSearchParams(window.location.search).get('category');
  const shortcutIdFromUrl = new URLSearchParams(window.location.search).get('shortcut');
  const category = getCategoryById(categoryIdFromUrl);
  const shortcutCategory = getCategoryById(shortcutIdFromUrl);

  if (bootstrap) {
    if (shortcutCategory && HIDDEN_FROM_CATEGORY_GRID_IDS.has(shortcutCategory.id)) {
      history.replaceState({ view: 'categoryGridView' }, '', getCategoryUrl());
      history.pushState(
        { view: 'quickPickView', categoryId: shortcutCategory.id },
        '',
        getShortcutUrl(shortcutCategory.id)
      );
      openQuickPickCategory(shortcutCategory.id, { updateHistory: false });
      return;
    }

    if (category) {
      history.replaceState({ view: 'categoryGridView' }, '', getCategoryUrl());
      history.pushState(
        { view: 'categoryItemsView', categoryId: category.id },
        '',
        getCategoryUrl(category.id)
      );
      showCategoryItemsView(category.id, { updateHistory: false });
      return;
    }

    history.replaceState({ view: 'categoryGridView' }, '', getCategoryUrl());
    showCategoryHome({ updateHistory: false });
    return;
  }

  if (shortcutCategory && HIDDEN_FROM_CATEGORY_GRID_IDS.has(shortcutCategory.id)) {
    openQuickPickCategory(shortcutCategory.id, { updateHistory: false });
    return;
  }

  if (category) {
    showCategoryItemsView(category.id, { updateHistory: false });
    return;
  }

  showCategoryHome({ updateHistory: false });
}

/* =========================
HERO SLIDER AUTO-PLAY
========================= */
function initHeroSlider() {
  if (!heroSlider || !heroDotsContainer || !heroSlides.length) return;

  heroSlides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `hero-dot${index === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Show slide ${index + 1}`);
    dot.dataset.index = index;
    dot.addEventListener('click', () => {
      showHeroSlide(index);
      resetHeroSlider();
    });
    heroDotsContainer.appendChild(dot);
  });

  heroSlider.addEventListener('touchstart', handleHeroTouchStart, { passive: true });
  heroSlider.addEventListener('touchend', handleHeroTouchEnd, { passive: true });
  heroSlider.addEventListener('mouseenter', pauseHeroSlider);
  heroSlider.addEventListener('mouseleave', startHeroSlider);

  startHeroSlider();
}

let heroTouchStartX = 0;

function handleHeroTouchStart(event) {
  heroTouchStartX = event.touches[0].clientX;
}

function handleHeroTouchEnd(event) {
  const endX = event.changedTouches[0].clientX;
  const deltaX = endX - heroTouchStartX;

  if (Math.abs(deltaX) < 40) return;

  if (deltaX > 0) {
    showHeroSlide((heroSlideIndex - 1 + heroSlides.length) % heroSlides.length);
  } else {
    showHeroSlide((heroSlideIndex + 1) % heroSlides.length);
  }

  resetHeroSlider();
}

function showHeroSlide(index) {
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === index);
  });

  heroSlideIndex = index;
  updateHeroDots();
}

function updateHeroDots() {
  heroDotsContainer.querySelectorAll('.hero-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === heroSlideIndex);
  });
}

function nextHeroSlide() {
  showHeroSlide((heroSlideIndex + 1) % heroSlides.length);
}

function startHeroSlider() {
  if (heroSlideTimer) clearInterval(heroSlideTimer);
  heroSlideTimer = setInterval(nextHeroSlide, HERO_SLIDE_INTERVAL);
}

function pauseHeroSlider() {
  if (heroSlideTimer) clearInterval(heroSlideTimer);
}

function resetHeroSlider() {
  pauseHeroSlider();
  startHeroSlider();
}

/* =========================
FETCH DATA
========================= */
async function loadMenuData() {
  try {
    const menuUrl = new URL('menu.json', window.location.href);
    menuUrl.searchParams.set('v', MENU_DATA_VERSION);

    const response = await fetch(menuUrl.toString(), {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Menu request failed with status ${response.status}`);
    }

    storeData = await response.json();
    categories = (storeData.categories || []).map(normalizeCategory);
    products = categories.flatMap(category => category.items);
    offerProducts = Array.isArray(storeData.specialOffers)
      ? storeData.specialOffers.map(normalizeSpecialOffer)
      : [];
    filteredProducts = [...products];

    updateStoreInfo();
    renderQuickOrderPicks();
    renderCategoryFilters();
    syncViewWithLocation({ bootstrap: true });
    updateCartUI();

    console.log('Shivneri Fresh menu loaded from menu.json', {
      productCount: products.length,
      categoryCount: categories.length
    });
  } catch (error) {
    console.error('Error loading menu data:', error);
    productList.innerHTML = '<div class="no-results">Failed to load products. Please refresh.</div>';
  }
}

function updateStoreInfo() {
  const store = storeData?.store || {};
  const whatsappNumber = String(store.whatsapp || CHECKOUT_WHATSAPP_NUMBER).replace(/\D/g, '');
  const phoneNumber = store.phone || '+919867378209';
  const whatsappUrl = `https://wa.me/${whatsappNumber || CHECKOUT_WHATSAPP_NUMBER}`;
  const phoneUrl = `tel:${phoneNumber}`;

  if (storeName) storeName.alt = store.name || STORE_DISPLAY_NAME;
  if (headerCallBtn) headerCallBtn.href = phoneUrl;
  if (headerWhatsappBtn) headerWhatsappBtn.href = whatsappUrl;
  if (heroWhatsappBtn) heroWhatsappBtn.href = whatsappUrl;
  if (footerPhone) footerPhone.href = phoneUrl;
}

/* =========================
CATEGORY FILTERS
========================= */
function renderCategoryFilters() {
  if (categoryFilters) {
    categoryFilters.innerHTML = '';
  }

  if (categoryGrid) {
    categoryGrid.innerHTML = '';
  }

  categories.forEach(category => {
    if (categoryFilters) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-btn';
      button.textContent = category.name;
      button.dataset.filter = category.id;
      button.addEventListener('click', () => handleCategoryFilter(category.id));
      categoryFilters.appendChild(button);
    }

    if (categoryGrid && !HIDDEN_FROM_CATEGORY_GRID_IDS.has(category.id)) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'category-card';
      card.dataset.filter = category.id;
      card.setAttribute('aria-label', `Show ${category.name}`);
      card.innerHTML = `
        ${getCategoryCardMediaHTML(category)}
        <span class="category-card-name">${category.name}</span>
      `;
      card.addEventListener('click', () => handleCategoryFilter(category.id));
      categoryGrid.appendChild(card);
    }
  });
}

function setActiveFilterButton(categoryId) {
  document.querySelectorAll('.filter-btn').forEach(filterButton => {
    filterButton.classList.toggle('active', filterButton.dataset.filter === categoryId);
  });

  document.querySelectorAll('.category-card').forEach(categoryCard => {
    categoryCard.classList.toggle('active', categoryCard.dataset.filter === categoryId);
  });

  document.querySelectorAll('.quick-pick-card').forEach(pickCard => {
    pickCard.classList.toggle('active', pickCard.dataset.filter === categoryId);
  });

  const activeFilterButton = document.querySelector(`.filter-btn[data-filter="${categoryId}"]`);
  if (activeFilterButton && filterSection && !filterSection.classList.contains('hidden')) {
    activeFilterButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function handleCategoryFilter(categoryId) {
  showCategoryItemsView(categoryId);
}

/* =========================
QUICK ORDER PICKS
========================= */
function renderQuickOrderPicks() {
  if (!quickPicksSection || !quickPicksList) return;

  const availablePicks = QUICK_ORDER_PICK_CATEGORIES.filter(pick => getCategoryById(pick.id));

  if (!availablePicks.length) {
    quickPicksSection.classList.add('hidden');
    quickPicksList.innerHTML = '';
    return;
  }

  quickPicksSection.classList.remove('hidden');
  quickPicksList.innerHTML = '';

  availablePicks.forEach(pick => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `quick-pick-card quick-pick-card-${pick.tone}`;
    card.dataset.filter = pick.id;
    card.setAttribute('aria-label', `View ${pick.title}`);
    card.innerHTML = `
      <span class="quick-pick-media" aria-hidden="true">
        <span class="quick-pick-icon">${pick.icon}</span>
      </span>
      <span class="quick-pick-copy">
        <strong>${pick.title}</strong>
        <span>${pick.subtitle}</span>
      </span>
      <span class="quick-pick-cta">${pick.cta}<span aria-hidden="true">&#8250;</span></span>
    `;
    card.addEventListener('click', () => openQuickPickCategory(pick.id));
    quickPicksList.appendChild(card);
  });
}

/* =========================
RENDER PRODUCTS
========================= */
function getQtyControlHTML(productId, qty) {
  return `
    <div class="qty-box">
      <button class="qty-btn" onclick="decreaseQty('${productId}')">-</button>
      <span class="qty-number">${qty}</span>
      <button class="qty-btn" onclick="increaseQty('${productId}')">+</button>
    </div>
  `;
}

function renderProducts(productArray) {
  productList.innerHTML = '';

  if (!productArray.length) {
    productList.innerHTML = '<div class="no-results">No products found.</div>';
    return;
  }

  if (currentView === 'categoryItemsView' && activeCategoryId) {
    const activeCategory = getCategoryById(activeCategoryId);

    if (!activeCategory) {
      productList.innerHTML = '<div class="no-results">Category not found.</div>';
      return;
    }

    const visibleItems = activeCategory.items.filter(product =>
      productArray.some(filteredProduct => filteredProduct.id === product.id)
    );

    if (!visibleItems.length) {
      productList.innerHTML = '<div class="no-results">No products found.</div>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'product-grid category-products-grid';

    visibleItems.forEach(product => {
      const card = document.createElement('article');
      const useOfferCard = OFFER_CATEGORY_IDS.has(activeCategory.id);
      card.className = useOfferCard ? 'offer-product-card' : 'product-card';

      const qty = cart[product.id]?.qty || 0;
      card.innerHTML = useOfferCard
        ? getOfferCategoryProductCardHTML(product, qty)
        : getProductCardHTML(product, qty);

      grid.appendChild(card);
    });

    productList.appendChild(grid);
    return;
  }

  categories.forEach(category => {
    const visibleItems = category.items.filter(product =>
      productArray.some(filteredProduct => filteredProduct.id === product.id)
    );

    if (!visibleItems.length) return;

    const section = document.createElement('section');
    section.className = 'category-section';
    section.dataset.category = category.id;

    const heading = document.createElement('div');
    heading.className = 'section-head';
    heading.innerHTML = `<h3>${category.name}</h3>`;
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'product-grid';

    visibleItems.forEach(product => {
      const card = document.createElement('article');
      const useOfferCard = OFFER_CATEGORY_IDS.has(product.categoryId);
      card.className = useOfferCard ? 'offer-product-card' : 'product-card';

      const qty = cart[product.id]?.qty || 0;
      card.innerHTML = useOfferCard
        ? getOfferCategoryProductCardHTML(product, qty)
        : getProductCardHTML(product, qty);

      grid.appendChild(card);
    });

    section.appendChild(grid);
    productList.appendChild(section);
  });
}

function updateSingleProductControl(productId) {
  const qty = cart[productId]?.qty || 0;
  const product = findProductById(productId);
  const controls = document.querySelectorAll(`[data-product-controls="${productId}"]`);

  controls.forEach(control => {
    const isOfferCard = control.closest('.offer-card');
    const addMode = isOfferCard ? 'offer' : 'regular';
    const addLabel = isOfferCard ? 'Add to Cart' : 'Add';

    control.innerHTML =
      qty > 0
        ? getQtyControlHTML(productId, qty)
        : product?.available === false
          ? '<button class="add-btn" type="button" disabled>Unavailable</button>'
          : `<button class="add-btn" onclick="addToCart('${productId}', '${addMode}')">${addLabel}</button>`;
  });

  updateSingleProductPrice(productId);
}

function syncCartItemPricing(productId) {
  const cartItem = cart[productId];
  if (!cartItem) return;

  if (cartItem.pricingMode === 'offer' && typeof cartItem.offerPrice === 'number') {
    cartItem.selectedPrice = cartItem.offerPrice;
    return;
  }

  cartItem.selectedPrice = getItemPrice(cartItem, cartItem.qty);
}

/* =========================
CART ACTIONS
========================= */
function addToCart(productId, mode = 'regular') {
  const product = findProductById(productId);
  if (!product || product.available === false) return;

  if (!cart[productId]) {
    const useOfferPrice = mode === 'offer' && typeof product.offerPrice === 'number';

    cart[productId] = {
      ...product,
      selectedPrice: useOfferPrice ? product.offerPrice : product.selectedPrice,
      selectedUnit: product.selectedUnit,
      pricingMode: mode,
      qty: 1
    };
  } else {
    cart[productId].qty += 1;
  }

  syncCartItemPricing(productId);

  updateSingleProductControl(productId);
  updateCartUI();
}

function increaseQty(productId) {
  if (!cart[productId]) return;

  cart[productId].qty += 1;
  syncCartItemPricing(productId);
  updateSingleProductControl(productId);
  updateCartUI();
}

function decreaseQty(productId) {
  if (!cart[productId]) return;

  cart[productId].qty -= 1;

  if (cart[productId].qty <= 0) {
    delete cart[productId];
  } else {
    syncCartItemPricing(productId);
  }

  updateSingleProductControl(productId);
  updateCartUI();
}

function removeFromCart(productId) {
  delete cart[productId];
  updateSingleProductControl(productId);
  updateCartUI();
}

/* =========================
CART UI
========================= */
function updateCartUI() {
  const cartArray = getCartArray();
  const itemCount = getCartItemCount();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();

  if (cartArray.length === 0) {
    cartBar.classList.add('hidden');
    cartItems.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
  } else {
    cartBar.classList.remove('hidden');

    cartItems.innerHTML = cartArray
      .map(item => {
        const unitText = item.selectedUnit ? ` (${item.selectedUnit})` : '';
        const itemPrice = getItemPrice(item, item.qty);

        return `
          <div class="cart-item">
            <div class="cart-item-top">
              <div>
                <h4 class="cart-item-name">${item.name}${unitText}</h4>
                <div class="cart-item-meta">${formatPrice(itemPrice)} x ${item.qty}</div>
              </div>
              <div class="cart-item-total">${formatPrice(itemPrice * item.qty)}</div>
            </div>

            <div class="cart-item-bottom">
              <div class="qty-box">
                <button class="qty-btn" onclick="decreaseQty('${item.id}')">-</button>
                <span class="qty-number">${item.qty}</span>
                <button class="qty-btn" onclick="increaseQty('${item.id}')">+</button>
              </div>

              <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  cartBarCount.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
  cartBarTotal.textContent = formatPrice(grandTotal);

  cartSubtotal.textContent = formatPrice(subtotal);
  cartDelivery.textContent = formatPrice(deliveryFee);
  cartTotal.textContent = formatPrice(grandTotal);
}

/* =========================
DRAWER CONTROLS
========================= */
function openCart() {
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* =========================
SEARCH
========================= */
function handleSearch() {
  applyFilters();
}

/* =========================
WHATSAPP CHECKOUT
========================= */
function buildWhatsAppMessage() {
  const orderType = getOrderType();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();
  const checkoutStoreName = storeData?.store?.name || STORE_DISPLAY_NAME;

  const name = cartName.value.trim();
  const phone = cartPhone.value.trim();
  const address = cartAddress.value.trim();
  const note = cartNote.value.trim();

  let message = `*${checkoutStoreName}*\n`;
  message += `*New Order*\n\n`;

  getCartArray().forEach(item => {
    const unitText = item.selectedUnit ? ` (${item.selectedUnit})` : '';
    const itemPrice = getItemPrice(item, item.qty);
    message += `${item.qty} x ${item.name}${unitText} - ${formatPrice(itemPrice * item.qty)}\n`;
  });

  message += `\n*Subtotal:* ${formatPrice(subtotal)}\n`;
  message += `*Delivery Fee:* ${formatPrice(deliveryFee)}\n`;
  message += `*Total:* ${formatPrice(grandTotal)}\n\n`;

  message += `*Order Type:* ${orderType}\n`;
  message += `*Name:* ${name || '-'}\n`;
  message += `*Phone:* ${phone || '-'}\n`;
  message += `*Address:* ${address || '-'}\n`;
  message += `*Notes:* ${note || '-'}\n`;

  return `https://wa.me/${CHECKOUT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function focusField(field) {
  if (!field) return;

  field.focus({ preventScroll: true });
  field.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function openWhatsAppCheckout(whatsappURL) {
  try {
    window.location.assign(whatsappURL);
  } catch (error) {
    window.location.href = whatsappURL;
  }
}

function handleCheckout(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const cartItems = getCartArray();

  if (cartItems.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  if (!cartName.value.trim()) {
    alert('Please enter your name.');
    focusField(cartName);
    return;
  }

  if (!cartPhone.value.trim()) {
    alert('Please enter your phone number.');
    focusField(cartPhone);
    return;
  }

  if (getOrderType() === 'Delivery' && !cartAddress.value.trim()) {
    alert('Please enter delivery address.');
    focusField(cartAddress);
    return;
  }

  const whatsappURL = buildWhatsAppMessage();
  openWhatsAppCheckout(whatsappURL);
}

/* =========================
EVENT LISTENERS
========================= */
cartBar.addEventListener('click', openCart);
cartBackdrop.addEventListener('click', closeCart);
closeCartBtn.addEventListener('click', closeCart);
searchInput.addEventListener('input', handleSearch);
if (checkoutBtn) {
  checkoutBtn.onclick = null;
  checkoutBtn.addEventListener('click', handleCheckout);
}

document.querySelectorAll('input[name="orderType"]').forEach(radio => {
  radio.addEventListener('change', updateCartUI);
});

if (categoryScroll && scrollLeftBtn && scrollRightBtn) {
  const categoryScrollAmount = 240;

  scrollLeftBtn.addEventListener('click', () => {
    categoryScroll.scrollBy({ left: -categoryScrollAmount, behavior: 'smooth' });
  });

  scrollRightBtn.addEventListener('click', () => {
    categoryScroll.scrollBy({ left: categoryScrollAmount, behavior: 'smooth' });
  });
}

/* =========================
PRODUCT IMAGE PREVIEW
========================= */
document.addEventListener('click', event => {
  const previewImage = event.target.closest('[data-product-image-modal]');
  if (previewImage) {
    openImageModal(
      previewImage.getAttribute('data-product-id'),
      previewImage.getAttribute('data-product-mode') || 'regular'
    );
    return;
  }

  if (event.target === imageModalBackdrop || event.target === imageModalCloseBtn) {
    closeImageModal();
  }
});

document.addEventListener('keydown', event => {
  const activePreviewImage = document.activeElement?.closest?.('[data-product-image-modal]');

  if ((event.key === 'Enter' || event.key === ' ') && activePreviewImage) {
    event.preventDefault();
    openImageModal(
      activePreviewImage.getAttribute('data-product-id'),
      activePreviewImage.getAttribute('data-product-mode') || 'regular'
    );
  }

  if (event.key === 'Escape' && imageModal?.classList.contains('open')) {
    closeImageModal();
  }
});

const allFilterBtn = document.querySelector('[data-filter="all"]');
if (allFilterBtn) {
  allFilterBtn.addEventListener('click', () => {
    showCategoryHome();
  });
}

if (categoryBackBtn) {
  categoryBackBtn.addEventListener('click', () => {
    if (window.history.state?.view === 'categoryItemsView') {
      window.history.back();
      return;
    }

    showCategoryHome();
  });
}

if (shortcutBackBtn) {
  shortcutBackBtn.addEventListener('click', () => {
    closeQuickPickView();
  });
}

window.addEventListener('popstate', () => {
  syncViewWithLocation();
});

/* =========================
GLOBAL FUNCTIONS
========================= */
window.addToCart = addToCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.removeFromCart = removeFromCart;

/* =========================
INIT
========================= */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  });
}

initHeroSlider();
loadMenuData();
