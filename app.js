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
  },
  {
    id: 'premium-cheese',
    title: 'Premium Cheese',
    subtitle: 'Imported & specialty cheese.',
    cta: 'View Items',
    icon: 'PC',
    tone: 'green'
  },
  {
    id: 'party-function-supplies',
    title: 'Party & Function Supplies',
    subtitle: 'Fries, snacks, syrups & sauces.',
    cta: 'View Items',
    icon: 'PF',
    tone: 'blue'
  }
];
const OFFER_CATEGORY_IDS = new Set(['buy-one-get-one', 'forty-to-seventy-percent-off']);
const HIDDEN_FROM_CATEGORY_GRID_IDS = new Set(QUICK_ORDER_PICK_CATEGORIES.map(category => category.id));
// Resolve these existing IDs only within their original full-price catalogue category.
const POPULAR_PRODUCT_CATEGORY_ID = 'frozen-foods-and-instant-food';
const POPULAR_PRODUCT_IDS = [
  'just-crave-french-fries-9-mm-2-5-kg',
  'just-crave-veg-burger-patty-1-2-kg',
  'nutrich-chicken-burger-patty-1-kg',
  'nutrich-chicken-pops-1-kg'
];

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
let catalogueReady = false;
let productKeyIndex = new Map();
let cartStorageSafe = true;
let restoringBrowsing = false;
const CART_STORAGE_KEY = 'shivneriFresh.cart.v1';

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
const promoBannerTrack = document.getElementById('promo-banner-track');
const SEARCH_PLACEHOLDER_LINES = [
  'Search mozzarella, mayo, sliced cheese...',
  'Search nori sheets, sushi vinegar, wasabi...',
  'Search nuggets, popcorn, cheese balls, fries...',
  'Search Wingreen, Nutrich, Golden Crown...',
  'Search sauces, salami, sausage, chicken ham...',
  'Search by product, brand or kitchen item...'
];
const SEARCH_PLACEHOLDER_INTERVAL = 3500;
let searchPlaceholderIndex = 0;
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
const backToCategoryTopBtn = document.getElementById('back-to-category-top-btn');
const imageModal = document.getElementById('image-modal');
const imageModalBackdrop = document.getElementById('image-modal-backdrop');
const imageModalCloseBtn = document.getElementById('image-modal-close');
const imageModalPreview = document.getElementById('image-modal-preview');

const heroSlider = document.getElementById('hero-slider');
const heroDotsContainer = document.getElementById('hero-dots');
const heroSlides = heroSlider ? Array.from(heroSlider.querySelectorAll('.hero-slide')) : [];
let heroSlideIndex = 0;
let heroSlideTimer = null;
const HERO_SLIDE_INTERVAL = 5000;
const heroMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let promoBannerTimer = null;
let promoBannerResumeTimer = null;
const PROMO_BANNER_INTERVAL = 3600;
let currentView = 'categoryGridView';
let activeCategoryId = '';

const headerCartButton = document.getElementById('header-cart-button');
const headerCartBadge = document.getElementById('header-cart-badge');
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
const cartReviewStep = document.getElementById('cart-review-step');
const cartCheckoutStep = document.getElementById('cart-checkout-step');
const cartScrollArea = document.getElementById('cart-scroll-area');
const cartTitle = document.getElementById('cart-title');
const cartHeaderCount = document.getElementById('cart-header-count');
const continueCheckoutBtn = document.getElementById('continue-checkout-btn');
const backToCartBtn = document.getElementById('back-to-cart-btn');
const checkoutDetailsTitle = document.getElementById('checkout-details-title');
const checkoutOrderTotal = document.getElementById('checkout-order-total');
const checkoutUnitCount = document.getElementById('checkout-unit-count');
const checkoutOrderType = document.getElementById('checkout-order-type');
const cartAddressField = document.getElementById('cart-address-field');
let cartStep = 'cart';
let cartReturnFocus = null;
let cartPreviousOverflow = '';

/* =========================
HELPERS
========================= */
function formatPrice(value) {
  return `Rs ${Number(value).toFixed(2).replace(/\.00$/, '')}`;
}

function formatCartPrice(value) {
  return formatPrice(value).replace(/^Rs /, '\u20b9');
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

function getProductEntryKey(categoryId, productId) {
  const encode = value => encodeURIComponent(String(value)).replace(/'/g, '%27');
  return `${encode(categoryId)}::${encode(productId)}`;
}

function findProductByKey(entryKey) {
  // Only explicit master/legacy keys are accepted; an original ID is not unique.
  return productKeyIndex.get(entryKey) || null;
}

function indexProductKeys() {
  const nextIndex = new Map();
  for (const product of [...products, ...offerProducts]) {
    for (const key of new Set([product.entryKey, ...(product.legacyKeys || [])])) {
      if (typeof key !== 'string' || !key || (nextIndex.has(key) && nextIndex.get(key) !== product)) {
        throw new Error('Invalid or ambiguous catalogue product key');
      }
      nextIndex.set(key, product);
    }
  }
  productKeyIndex = nextIndex;
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
    return product.slabs.find(slab => Number(slab.minQty) === 1)?.price ?? 0;
  }

  return 0;
}

function getItemPrice(item) {
  // Catalogue entries always use their single selling rate, regardless of quantity.
  if (Array.isArray(item.slabs) && item.slabs.length) return getProductPrice(item);
  if (item.pricingMode === 'offer' && typeof item.offerPrice === 'number') {
    return item.offerPrice;
  }
  return getProductPrice(item);
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
    entryKey: product.key || getProductEntryKey(product.categoryId, product.id),
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
    items: Array.isArray(category.productKeys) ? category.productKeys.map(key => {
      const product = findProductByKey(key);
      if (!product || product.entryKey !== key) throw new Error('Unknown category product reference');
      return product;
    }) : categoryItems.map(item =>
      normalizeProduct({
        ...item,
        category: categoryName,
        categoryId
      })
    )
  };
}

function initializeCatalogue(data) {
  if (data.schemaVersion === 2) {
    if (!Array.isArray(data.products) || !Array.isArray(data.categories)) {
      throw new Error('Invalid master catalogue');
    }
    const categoryNames = new Map(data.categories.map(category => [category.id, category.name]));
    products = data.products.map(product => {
      if (!product.key || !categoryNames.has(product.categoryId)) {
        throw new Error('Invalid master product identity');
      }
      return normalizeProduct({ ...product, category: categoryNames.get(product.categoryId) });
    });
    offerProducts = Array.isArray(data.specialOffers) ? data.specialOffers.map(normalizeSpecialOffer) : [];
    indexProductKeys();
    categories = data.categories.map(normalizeCategory);
    // Membership comes from the ordered references, not the primary cart category.
    products.forEach(product => {
      product.categoryIds = categories.filter(category => category.items.includes(product)).map(category => category.id);
      if (!product.categoryIds.includes(product.categoryId)) throw new Error('Missing primary category membership');
    });
  } else {
    // Support the previous catalogue while a cached document is being refreshed.
    categories = (data.categories || []).map(normalizeCategory);
    products = categories.flatMap(category => category.items);
    offerProducts = Array.isArray(data.specialOffers) ? data.specialOffers.map(normalizeSpecialOffer) : [];
    indexProductKeys();
  }
}

function normalizeSpecialOffer(offer) {
  const offerPrice = typeof offer?.offerPrice === 'number' ? offer.offerPrice : 0;

  return {
    ...offer,
    categoryId: 'special-offers',
    entryKey: getProductEntryKey('special-offers', offer.id),
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

function getModalProductData(entryKey, mode = 'regular') {
  const product = findProductByKey(entryKey);
  if (!product) return null;

  const imageSrc = mode === 'offer'
    ? product.offerImage || product.image || ''
    : product.image || product.offerImage || '';

  return {
    product,
    imageSrc
  };
}

function openImageModal(entryKey, mode = 'regular') {
  if (!imageModal || !imageModalPreview) return;

  const modalData = getModalProductData(entryKey, mode);
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
              data-product-id="${product.entryKey}"
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
  const activeQty = qty > 0 ? qty : 1;
  const activePrice = getItemPrice(product, activeQty);

  return `
    <div class="product-main">
      ${getProductCardMediaHTML(product)}

      <div class="product-card-body">
        ${productBrand ? `<p class="product-brand">${productBrand}</p>` : ''}
        <h3 class="product-name">${product.name}</h3>
        ${productUnit ? `<p class="product-unit">${productUnit}</p>` : ''}

        <div class="product-footer">
          <div class="product-base-price" data-product-price="${product.entryKey}">
            <strong data-price-value>${formatCardPrice(activePrice)}</strong>
            <span data-price-label>Per pack</span>
          </div>

          <div data-product-controls="${product.entryKey}">
            ${
              qty > 0
                ? getQtyControlHTML(product.entryKey, qty)
                : product.available === false
                  ? '<button class="add-btn" type="button" disabled>Unavailable</button>'
                  : `<button class="add-btn" onclick="addToCart('${product.entryKey}', 'regular')">Add</button>`
            }
          </div>
        </div>
      </div>
    </div>

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
                data-product-id="${product.entryKey}"
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
          <div class="offer-product-price-panel" data-product-price="${product.entryKey}">
            <span class="offer-product-badge">${offerLabel}</span>
            <span data-price-label>Offer Price</span>
            <strong data-price-value>${formatCardPrice(basePrice)}/pkt</strong>
          </div>
        </div>
      </div>

      <div class="offer-product-actions">
        <div data-product-controls="${product.entryKey}">
          ${
            qty > 0
              ? getQtyControlHTML(product.entryKey, qty)
              : product.available === false
                ? '<button class="add-btn" type="button" disabled>Unavailable</button>'
                : `<button class="add-btn" onclick="addToCart('${product.entryKey}', 'regular')">Add</button>`
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

function updateSingleProductPrice(entryKey) {
  const product = findProductByKey(entryKey);
  if (!product) return;

  const qty = cart[entryKey]?.qty || 1;
  const activePrice = getItemPrice(cart[entryKey] || product, qty);
  const priceNodes = document.querySelectorAll(`[data-product-price="${entryKey}"]`);

  priceNodes.forEach(priceNode => {
    const label = priceNode.querySelector('[data-price-label]') || priceNode.querySelector('span');
    const value = priceNode.querySelector('[data-price-value]') || priceNode.querySelector('strong');
    const isOfferCategoryCard = Boolean(priceNode.closest('.offer-product-card'));

    if (label) label.textContent = isOfferCategoryCard ? 'Offer Price' : 'Per pack';
    if (value) value.textContent = `${formatCardPrice(activePrice)}${isOfferCategoryCard ? '/pkt' : ''}`;
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
    .map(productId => {
      const matches = products.filter(product => product.id === productId);
      return matches.length === 1 ? matches[0] : null;
    })
    .filter(Boolean)
    .slice(0, 3);
}

function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const isHomepageSearch = currentView === 'categoryGridView';

  // Global Homepage Search
  if (isHomepageSearch && !searchTerm) {
    filteredProducts = [...products];

    if (categoryItemsSection) {
      categoryItemsSection.classList.add('hidden');
    }

    if (productList) {
      productList.innerHTML = '';
    }

    if (quickPicksSection) {
      quickPicksSection.classList.remove('hidden');
    }

    if (categoryShowcaseSection) {
      categoryShowcaseSection.classList.remove('hidden');
    }

    return;
  }


  const matchedProducts = products.filter(product => {
    const matchesCategory =
      isHomepageSearch || currentFilter === 'all' ||
      (product.categoryIds || [product.categoryId]).includes(currentFilter);
    const productDescription = product.description || product.brand || '';

    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      productDescription.toLowerCase().includes(searchTerm) ||
      categories.some(category => category.items.includes(product) && category.name.toLowerCase().includes(searchTerm));

    return matchesCategory && matchesSearch;
  });

  filteredProducts = isHomepageSearch ? getUniqueProductsByEntryKey(matchedProducts) : matchedProducts;

  if (isHomepageSearch) {
    if (categoryItemsSection) {
      categoryItemsSection.classList.remove('hidden');

      if (searchSection?.nextElementSibling !== categoryItemsSection) {
        searchSection?.after(categoryItemsSection);
      }
    }

    if (categoryBackBtn) {
      categoryBackBtn.style.display = 'none';
    }

    if (categoryViewTitle) {
      categoryViewTitle.textContent = 'Search results';
    }

    if (quickPicksSection) {
      quickPicksSection.classList.add('hidden');
    }

    if (categoryShowcaseSection) {
      categoryShowcaseSection.classList.add('hidden');
    }
  }

  renderProducts(filteredProducts);
}

// Search keeps each catalogue entry distinct, even when original IDs repeat.
function getUniqueProductsByEntryKey(productArray) {
  return Array.from(new Map(productArray.map(product => [product.entryKey, product])).values());
}

// Back To Category Top Button
function getOpenCategorySection() {
  if (currentView === 'categoryItemsView' && categoryItemsSection && !categoryItemsSection.classList.contains('hidden')) {
    return categoryItemsSection;
  }

  if (currentView === 'quickPickView' && shortcutProductsSection && !shortcutProductsSection.classList.contains('hidden')) {
    return shortcutProductsSection;
  }

  return null;
}

// Back To Category Top Button
function updateBackToCategoryTopButton() {
  if (!backToCategoryTopBtn) return;

  const openCategorySection = getOpenCategorySection();
  const shouldShow = Boolean(openCategorySection && openCategorySection.getBoundingClientRect().top < -160);

  backToCategoryTopBtn.classList.toggle('hidden', !shouldShow);
}

// Back To Category Top Button
function scrollToOpenCategoryTop() {
  const openCategorySection = getOpenCategorySection();
  if (!openCategorySection) return;

  openCategorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  if (updateHistory) saveBrowsingState();
  currentView = 'categoryGridView';
  activeCategoryId = '';
  currentFilter = 'all';

  clearActiveCategorySelection();

  // Category View Visibility Fix
  if (quickPicksSection) {
    quickPicksSection.classList.remove('hidden');
  }

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

  if (categoryBackBtn) {
    categoryBackBtn.style.display = '';
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

  updateBackToCategoryTopButton();
}

function showCategoryItemsView(categoryId, { updateHistory = true } = {}) {
  if (updateHistory) saveBrowsingState();
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

  // Category View Visibility Fix
  if (quickPicksSection) {
    quickPicksSection.classList.add('hidden');
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

  if (categoryBackBtn) {
    categoryBackBtn.style.display = '';
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

  requestAnimationFrame(updateBackToCategoryTopButton);
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

    const qty = cart[product.entryKey]?.qty || 0;
    card.innerHTML = useOfferCard
      ? getOfferCategoryProductCardHTML(product, qty)
      : getProductCardHTML(product, qty);

    grid.appendChild(card);
  });

  shortcutProductList.appendChild(grid);
}

function openQuickPickCategory(categoryId, { updateHistory = true } = {}) {
  if (updateHistory) saveBrowsingState();
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
  if (!restoringBrowsing) shortcutProductsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  requestAnimationFrame(updateBackToCategoryTopButton);

  if (updateHistory) {
    history.pushState(
      { view: 'quickPickView', categoryId: category.id },
      '',
      getShortcutUrl(category.id)
    );
  }
}

function closeQuickPickView({ updateHistory = true } = {}) {
  if (updateHistory) saveBrowsingState();
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

  heroDotsContainer.replaceChildren();
  heroSlides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-dot';
    dot.setAttribute('aria-label', `Show hero image ${index + 1} of ${heroSlides.length}`);
    dot.addEventListener('click', () => {
      showHeroSlide(index);
      resetHeroSlider();
    });
    heroDotsContainer.appendChild(dot);
  });

  document.getElementById('hero-prev')?.addEventListener('click', () => {
    showHeroSlide(heroSlideIndex - 1);
    resetHeroSlider();
  });
  document.getElementById('hero-next')?.addEventListener('click', () => {
    nextHeroSlide();
    resetHeroSlider();
  });
  heroSlider.addEventListener('touchstart', handleHeroTouchStart, { passive: true });
  heroSlider.addEventListener('touchend', handleHeroTouchEnd, { passive: true });
  heroSlider.addEventListener('touchcancel', () => {
    heroTouchStart = null;
    startHeroSlider();
  }, { passive: true });
  document.addEventListener('visibilitychange', resetHeroSlider);
  heroMotionPreference.addEventListener('change', resetHeroSlider);
  showHeroSlide(0);
  startHeroSlider();
}

let heroTouchStart = null;

function handleHeroTouchStart(event) {
  if (event.touches.length !== 1) {
    heroTouchStart = null;
    return;
  }
  heroTouchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  pauseHeroSlider();
}

function handleHeroTouchEnd(event) {
  if (!heroTouchStart || !event.changedTouches.length) return;
  const deltaX = event.changedTouches[0].clientX - heroTouchStart.x;
  const deltaY = event.changedTouches[0].clientY - heroTouchStart.y;
  heroTouchStart = null;
  // Preserve normal vertical page scrolling and taps on the hero buttons.
  if (Math.abs(deltaX) >= 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
    showHeroSlide(heroSlideIndex + (deltaX > 0 ? -1 : 1));
  }
  resetHeroSlider();
}

function showHeroSlide(index) {
  if (!heroSlides.length) return;
  heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => {
    const active = slideIndex === heroSlideIndex;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  updateHeroDots();
}

function updateHeroDots() {
  heroDotsContainer.querySelectorAll('.hero-dot').forEach((dot, index) => {
    const active = index === heroSlideIndex;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-current', String(active));
  });
}

function nextHeroSlide() {
  showHeroSlide(heroSlideIndex + 1);
}

function startHeroSlider() {
  pauseHeroSlider();
  // Manual selection starts a fresh five-second cycle, even while controls retain focus.
  if (document.hidden || heroMotionPreference.matches || heroTouchStart || heroSlides.length < 2) return;
  heroSlideTimer = setInterval(nextHeroSlide, HERO_SLIDE_INTERVAL);
}

function pauseHeroSlider() {
  if (heroSlideTimer !== null) clearInterval(heroSlideTimer);
  heroSlideTimer = null;
}

function resetHeroSlider() {
  startHeroSlider();
}

/* =========================
PROMO BANNER STRIP
========================= */
function getPromoBannerStep() {
  if (!promoBannerTrack) return 0;

  const firstBanner = promoBannerTrack.querySelector('.promo-banner');
  if (!firstBanner) return 0;

  const trackStyles = window.getComputedStyle(promoBannerTrack);
  const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
  return firstBanner.getBoundingClientRect().width + gap;
}

function scrollPromoBanners() {
  if (!promoBannerTrack) return;

  const step = getPromoBannerStep();
  if (!step) return;

  const maxScrollLeft = promoBannerTrack.scrollWidth - promoBannerTrack.clientWidth;

  if (promoBannerTrack.scrollLeft >= maxScrollLeft - 4) {
    promoBannerTrack.scrollTo({ left: 0, behavior: 'smooth' });
    return;
  }

  promoBannerTrack.scrollBy({ left: step, behavior: 'smooth' });
}

function startPromoBannerAutoScroll() {
  if (!promoBannerTrack || promoBannerTimer) return;

  promoBannerTimer = setInterval(scrollPromoBanners, PROMO_BANNER_INTERVAL);
}

function pausePromoBannerAutoScroll() {
  if (promoBannerTimer) {
    clearInterval(promoBannerTimer);
    promoBannerTimer = null;
  }
}

function resumePromoBannerAutoScroll() {
  if (promoBannerResumeTimer) clearTimeout(promoBannerResumeTimer);

  promoBannerResumeTimer = setTimeout(startPromoBannerAutoScroll, PROMO_BANNER_INTERVAL);
}

function handlePromoBannerManualScroll() {
  pausePromoBannerAutoScroll();
  resumePromoBannerAutoScroll();
}

function initPromoBannerAutoScroll() {
  if (!promoBannerTrack) return;

  ['pointerdown', 'touchstart', 'wheel'].forEach(eventName => {
    promoBannerTrack.addEventListener(eventName, handlePromoBannerManualScroll, { passive: true });
  });

  startPromoBannerAutoScroll();
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
    initializeCatalogue(storeData);
    filteredProducts = [...products];
    catalogueReady = true;
    restoreSavedCart();

    updateStoreInfo();
    renderQuickOrderPicks();
    renderCategoryFilters();
    renderPopularProducts();
    restoreBrowsingState({ initial: true });
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

    if (categoryGrid && !HIDDEN_FROM_CATEGORY_GRID_IDS.has(category.id) && category.id !== 'japanese-sauces') {
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
function getQuickPickMediaHTML(pick, category) {
  const imageSrc = getCategoryImageSrc(category);

  if (!imageSrc) {
    return `
      <span class="quick-pick-media is-fallback" aria-hidden="true">
        <span class="quick-pick-icon">${pick.icon}</span>
      </span>
    `;
  }

  return `
    <span class="quick-pick-media has-image" aria-hidden="true">
      <img
        class="quick-pick-image"
        src="${imageSrc}"
        alt=""
        loading="lazy"
        onerror="this.parentElement.classList.add('is-fallback'); this.remove();"
      />
      <span class="quick-pick-icon">${pick.icon}</span>
    </span>
  `;
}

function renderQuickOrderPicks() {
  if (!quickPicksSection || !quickPicksList) return;

  const availablePicks = QUICK_ORDER_PICK_CATEGORIES.filter(pick =>
    pick.id !== 'forty-to-seventy-percent-off' && getCategoryById(pick.id)
  );

  if (!availablePicks.length) {
    quickPicksSection.classList.add('hidden');
    quickPicksList.innerHTML = '';
    return;
  }

  quickPicksSection.classList.remove('hidden');
  quickPicksList.innerHTML = '';

  availablePicks.forEach(pick => {
    const category = getCategoryById(pick.id);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `quick-pick-card quick-pick-card-${pick.tone}`;
    card.dataset.filter = pick.id;
    card.setAttribute('aria-label', `View ${pick.title}`);
    card.innerHTML = `
      ${getQuickPickMediaHTML(pick, category)}
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
function getPopularProducts() {
  if (storeData?.schemaVersion === 2) {
    return products.filter(product => product.tags?.includes('popular'))
      .sort((a, b) => (a.popularOrder ?? Number.MAX_SAFE_INTEGER) - (b.popularOrder ?? Number.MAX_SAFE_INTEGER));
  }
  const category = getCategoryById(POPULAR_PRODUCT_CATEGORY_ID);
  return POPULAR_PRODUCT_IDS.map(id => {
    const matches = (category?.items || []).filter(product => product.id === id);
    // Fail closed if the selected category ever contains an ambiguous identity.
    return matches.length === 1 ? matches[0] : null;
  }).filter(Boolean);
}

function renderPopularProducts() {
  const section = document.getElementById('popular-products-section');
  const list = document.getElementById('popular-product-list');
  if (!section || !list) return;
  const featured = getPopularProducts();
  section.classList.toggle('hidden', featured.length === 0);
  const category = getCategoryById(POPULAR_PRODUCT_CATEGORY_ID);
  const fallbackImage = getCategoryImageSrc(category);
  list.innerHTML = featured.map(product => {
    const qty = cart[product.entryKey]?.qty || 0;
    const price = getItemPrice(cart[product.entryKey] || product, qty || 1);
    const image = product.image || fallbackImage;
    return `
      <article class="popular-product-card">
        <div class="popular-product-media">
          <img src="${image}" alt="${product.image ? product.name : 'Frozen foods category illustration'}" loading="lazy"
            data-fallback-image="${fallbackImage}"
            onerror="this.onerror=null; this.src=this.dataset.fallbackImage; this.alt='Frozen foods category illustration'; this.parentElement.classList.add('popular-image-fallback');" />
          <span class="popular-image-caption">Category illustration</span>
        </div>
        <div class="popular-product-copy">
          ${product.brand ? `<p class="popular-product-brand">${product.brand}</p>` : ''}
          <h3>${product.name}</h3>
          <p class="popular-product-unit">${getProductUnit(product) || ''}</p>
          <div class="popular-product-price" data-product-price="${product.entryKey}" aria-live="polite" aria-atomic="true">
            <strong data-price-value>${formatCardPrice(price)}</strong><span data-price-label>Per pack</span>
          </div>
          <div class="popular-product-controls" data-product-controls="${product.entryKey}">
            ${qty > 0 ? getQtyControlHTML(product.entryKey, qty) : product.available === false
              ? '<button class="add-btn" type="button" disabled>Unavailable</button>'
              : `<button class="add-btn" type="button" onclick="addToCart('${product.entryKey}', 'regular')">Add</button>`}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function getQtyControlHTML(entryKey, qty) {
  return `
    <div class="qty-box">
      <button class="qty-btn" type="button" data-quantity-action="decrease" aria-label="Decrease quantity" onclick="decreaseQty('${entryKey}')">&minus;</button>
      <span class="qty-number">${qty}</span>
      <button class="qty-btn" type="button" data-quantity-action="increase" aria-label="Increase quantity" onclick="increaseQty('${entryKey}')">+</button>
    </div>
  `;
}

function renderProducts(productArray) {
  productList.innerHTML = '';

  // Global Homepage Search
  if (currentView === 'categoryGridView' && searchInput.value.trim()) {
    if (!productArray.length) {
      productList.innerHTML = '<div class="no-results">No products found. Try another product name.</div>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'product-grid category-products-grid';

    productArray.forEach(product => {
      const card = document.createElement('article');
      const useOfferCard = OFFER_CATEGORY_IDS.has(product.categoryId);
      const qty = cart[product.entryKey]?.qty || 0;

      card.className = useOfferCard ? 'offer-product-card' : 'product-card';
      card.innerHTML = useOfferCard
        ? getOfferCategoryProductCardHTML(product, qty)
        : getProductCardHTML(product, qty);

      grid.appendChild(card);
    });

    productList.appendChild(grid);
    return;
  }

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
      productArray.some(filteredProduct => filteredProduct.entryKey === product.entryKey)
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

      const qty = cart[product.entryKey]?.qty || 0;
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
      productArray.some(filteredProduct => filteredProduct.entryKey === product.entryKey)
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

      const qty = cart[product.entryKey]?.qty || 0;
      card.innerHTML = useOfferCard
        ? getOfferCategoryProductCardHTML(product, qty)
        : getProductCardHTML(product, qty);

      grid.appendChild(card);
    });

    section.appendChild(grid);
    productList.appendChild(section);
  });
}

function updateSingleProductControl(entryKey) {
  const qty = cart[entryKey]?.qty || 0;
  const product = findProductByKey(entryKey);
  const controls = document.querySelectorAll(`[data-product-controls="${entryKey}"]`);

  controls.forEach(control => {
    const isOfferCard = control.closest('.offer-card');
    const addMode = isOfferCard ? 'offer' : 'regular';
    const addLabel = isOfferCard ? 'Add to Cart' : 'Add';

    control.innerHTML =
      qty > 0
        ? getQtyControlHTML(entryKey, qty)
        : product?.available === false
          ? '<button class="add-btn" type="button" disabled>Unavailable</button>'
          : `<button class="add-btn" onclick="addToCart('${entryKey}', '${addMode}')">${addLabel}</button>`;
  });

  updateSingleProductPrice(entryKey);
}

function syncCartItemPricing(entryKey) {
  const cartItem = cart[entryKey];
  if (!cartItem) return;

  cartItem.selectedPrice = getItemPrice(cartItem, cartItem.qty);
}


/* Store catalogue identity and quantity only; prices always come from menu.json. */
function saveCart() {
  if (!catalogueReady || !cartStorageSafe) return;
  try {
    const saved = getCartArray().map(item => ({ key: item.entryKey, qty: item.qty }));
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage may be disabled or full. The in-memory cart remains usable.
  }
}

function restoreSavedCart() {
  let saved;
  try {
    saved = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
  } catch {
    return;
  }
  if (!Array.isArray(saved) || saved.length > productKeyIndex.size) {
    saveCart();
    return;
  }
  const seenKeys = new Set();
  const restoredCart = {};
  for (const record of saved) {
    if (!record || typeof record.key !== 'string' || !Number.isSafeInteger(record.qty) || record.qty <= 0) continue;
    // Repeated identical storage records are corrupt, not additional order lines.
    if (seenKeys.has(record.key)) continue;
    seenKeys.add(record.key);
    const product = findProductByKey(record.key);
    if (!product || product.available === false) continue;
    const existing = restoredCart[product.entryKey];
    if (existing) {
      const combinedQty = existing.qty + record.qty;
      if (!Number.isSafeInteger(combinedQty)) {
        // Leave storage untouched rather than save a partially migrated quantity.
        cartStorageSafe = false;
        console.warn('Saved cart quantity exceeds the supported range; original storage retained.');
        return;
      }
      existing.qty = combinedQty;
      continue;
    }
    restoredCart[product.entryKey] = {
      ...product,
      qty: record.qty,
      selectedPrice: getItemPrice(product, record.qty),
      pricingMode: product.pricingMode || 'regular'
    };
  }
  cart = restoredCart;
  // Discard stale/invalid records without substituting another catalogue entry.
  saveCart();
}

function saveBrowsingState() {
  if (!catalogueReady || restoringBrowsing || document.body.classList.contains('welcome-screen-open')) return;
  try {
    history.replaceState({
      ...history.state,
      browsing: { search: searchInput.value, scrollY: Math.max(0, window.scrollY) }
    }, '');
  } catch {
    // Cart use and navigation must still work if history state is unavailable.
  }
}

function restoreBrowsingState({ initial = false } = {}) {
  const resume = !initial || ['reload', 'back_forward'].includes(window.shivneriNavigationType);
  const saved = resume ? history.state?.browsing : null;
  restoringBrowsing = resume;
  searchInput.value = typeof saved?.search === 'string' ? saved.search : '';
  syncViewWithLocation({ bootstrap: initial && !resume });
  if (currentView === 'categoryGridView' && searchInput.value.trim()) applyFilters();
  restoringBrowsing = false;
  if (resume) {
    const scrollY = Number.isFinite(saved?.scrollY) && saved.scrollY >= 0 ? saved.scrollY : 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
      updateBackToCategoryTopButton();
    }));
  }
}

let browsingSaveTimer = null;
function scheduleBrowsingSave() {
  if (browsingSaveTimer !== null) return;
  browsingSaveTimer = setTimeout(() => {
    browsingSaveTimer = null;
    saveBrowsingState();
  }, 500);
}

/* =========================
CART ACTIONS
========================= */
function addToCart(entryKey, mode = 'regular') {
  const product = findProductByKey(entryKey);
  if (!product || product.available === false) return;
  entryKey = product.entryKey;

  if (!cart[entryKey]) {
    const useOfferPrice = mode === 'offer' && typeof product.offerPrice === 'number';

    cart[entryKey] = {
      ...product,
      selectedPrice: useOfferPrice ? product.offerPrice : product.selectedPrice,
      selectedUnit: product.selectedUnit,
      pricingMode: mode,
      qty: 1
    };
  } else {
    cart[entryKey].qty += 1;
  }

  syncCartItemPricing(entryKey);

  updateSingleProductControl(entryKey);
  updateCartUI();
}

function increaseQty(entryKey) {
  if (!cart[entryKey]) return;

  cart[entryKey].qty += 1;
  syncCartItemPricing(entryKey);
  updateSingleProductControl(entryKey);
  updateCartUI();
}

function decreaseQty(entryKey) {
  if (!cart[entryKey]) return;

  cart[entryKey].qty -= 1;

  if (cart[entryKey].qty <= 0) {
    delete cart[entryKey];
  } else {
    syncCartItemPricing(entryKey);
  }

  updateSingleProductControl(entryKey);
  updateCartUI();
}

function removeFromCart(entryKey) {
  delete cart[entryKey];
  updateSingleProductControl(entryKey);
  updateCartUI();
}

/* =========================
CART UI
========================= */
function updateCartUI() {
  saveCart();
  const cartArray = getCartArray();
  const itemCount = getCartItemCount();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();
  const focusedItem = document.activeElement?.closest?.('[data-cart-product-id]');
  const focusedId = focusedItem?.dataset.cartProductId;
  const focusedAction = document.activeElement?.dataset?.quantityAction;

  document.body.classList.toggle('has-cart-items', cartArray.length > 0);
  if (cartArray.length === 0) {
    cartBar.classList.add('hidden');
    cartItems.innerHTML = '<div class="cart-empty"><strong>Your cart is empty</strong><span>Add your kitchen essentials to get started.</span></div>';
  } else {
    cartBar.classList.remove('hidden');
    cartItems.innerHTML = cartArray.map(item => {
      const itemPrice = getItemPrice(item, item.qty);
      return `
        <article class="cart-item" data-cart-product-id="${item.entryKey}">
          <div class="cart-item-top">
            <div class="cart-item-copy">
              <h3 class="cart-item-name">${item.name}</h3>
              ${item.selectedUnit ? `<p class="cart-item-pack">Pack: ${item.selectedUnit}</p>` : ''}
              <div class="cart-item-meta">Unit price: ${formatCartPrice(itemPrice)} &middot; Qty: ${item.qty}</div>
            </div>
            <div class="cart-item-total"><span>Line total</span><strong>${formatCartPrice(itemPrice * item.qty)}</strong></div>
          </div>
          <div class="cart-item-bottom">
            ${getQtyControlHTML(item.entryKey, item.qty)}
            <button class="remove-btn" type="button" data-quantity-action="remove" onclick="removeFromCart('${item.entryKey}')">Remove</button>
          </div>
        </article>
      `;
    }).join('');
  }
  headerCartBadge.textContent = String(itemCount);
  headerCartBadge.hidden = itemCount === 0;
  headerCartButton.setAttribute('aria-label', `Open shopping cart, ${itemCount} unit${itemCount === 1 ? '' : 's'}`);
  cartBarCount.textContent = `${itemCount} unit${itemCount === 1 ? '' : 's'}`;
  cartBarTotal.textContent = formatCartPrice(grandTotal);
  cartBar.setAttribute('aria-label', `${itemCount} units, order total ${formatCartPrice(grandTotal)}. View cart`);
  cartSubtotal.textContent = formatCartPrice(subtotal);
  cartDelivery.textContent = formatCartPrice(deliveryFee);
  cartTotal.textContent = formatCartPrice(grandTotal);
  cartHeaderCount.textContent = `${itemCount} unit${itemCount === 1 ? '' : 's'}`;
  checkoutUnitCount.textContent = cartHeaderCount.textContent;
  checkoutOrderTotal.textContent = formatCartPrice(grandTotal);
  continueCheckoutBtn.disabled = cartArray.length === 0;
  checkoutBtn.disabled = cartArray.length === 0;
  syncCheckoutOrderType();
  if (cartArray.length === 0 && cartStep === 'checkout') {
    showCartStep('cart', { focus: cartDrawer.classList.contains('open') });
  }

  // Re-rendering cart rows must not lose the keyboard user's place.
  if (focusedId && focusedAction) {
    const nextFocus = cartItems.querySelector(`[data-cart-product-id="${focusedId}"] [data-quantity-action="${focusedAction}"]`)
      || cartItems.querySelector('button') || closeCartBtn;
    nextFocus.focus({ preventScroll: true });
  }
}

/* =========================
DRAWER CONTROLS
========================= */
function syncCheckoutOrderType() {
  const delivery = getOrderType() === 'Delivery';
  checkoutOrderType.textContent = delivery ? 'Delivery' : 'Pickup';
  cartAddressField.hidden = !delivery;
  cartAddressField.inert = !delivery;
  cartAddress.required = delivery;
  cartAddress.setAttribute('aria-required', String(delivery));
}

function showCartStep(step, { focus = true } = {}) {
  const checkout = step === 'checkout' && getCartItemCount() > 0;
  cartStep = checkout ? 'checkout' : 'cart';
  cartReviewStep.hidden = checkout;
  cartReviewStep.inert = checkout;
  cartCheckoutStep.hidden = !checkout;
  cartCheckoutStep.inert = !checkout;
  cartTitle.textContent = checkout ? 'Checkout' : 'Your Cart';
  const reviewProgress = document.getElementById('cart-progress-cart');
  const checkoutProgress = document.getElementById('cart-progress-checkout');
  (checkout ? checkoutProgress : reviewProgress).setAttribute('aria-current', 'step');
  (checkout ? reviewProgress : checkoutProgress).removeAttribute('aria-current');
  syncCheckoutOrderType();
  cartScrollArea.scrollTop = 0;
  if (focus) {
    const target = checkout ? checkoutDetailsTitle : continueCheckoutBtn.disabled ? closeCartBtn : continueCheckoutBtn;
    target.focus({ preventScroll: true });
  }
}

function continueToCheckout() {
  if (!getCartItemCount()) return;
  showCartStep('checkout');
}

function openCart() {
  if (cartDrawer.classList.contains('open')) return;
  cartReturnFocus = document.activeElement;
  cartPreviousOverflow = document.body.style.overflow;
  cartDrawer.inert = false;
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartBar.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('cart-is-open');
  cartBar.inert = true;
  cartBar.setAttribute('aria-hidden', 'true');
  showCartStep('cart', { focus: false });
  closeCartBtn.focus({ preventScroll: true });
}

function closeCart() {
  if (!cartDrawer.classList.contains('open')) return;
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartBar.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = cartPreviousOverflow;
  document.body.classList.remove('cart-is-open');
  cartBar.inert = false;
  cartBar.removeAttribute('aria-hidden');
  const returnTarget = cartReturnFocus?.isConnected && !cartReturnFocus.classList.contains('hidden')
    ? cartReturnFocus : headerCartButton;
  returnTarget?.focus({ preventScroll: true });
  cartDrawer.inert = true;
}

function handleCartKeydown(event) {
  if (!cartDrawer.classList.contains('open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeCart();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = Array.from(cartDrawer.querySelectorAll('button, input, textarea, [tabindex="0"]'))
    .filter(element => !element.disabled && !element.closest('[hidden], [inert]') && element.getClientRects().length > 0);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

/* =========================
SEARCH
========================= */
function rotateSearchPlaceholder() {
  if (!searchInput || searchInput.value) return;

  searchPlaceholderIndex = (searchPlaceholderIndex + 1) % SEARCH_PLACEHOLDER_LINES.length;
  searchInput.setAttribute('placeholder', SEARCH_PLACEHOLDER_LINES[searchPlaceholderIndex]);
}

function initSearchPlaceholderRotation() {
  if (!searchInput) return;

  searchInput.setAttribute('placeholder', SEARCH_PLACEHOLDER_LINES[searchPlaceholderIndex]);
  setInterval(rotateSearchPlaceholder, SEARCH_PLACEHOLDER_INTERVAL);
}

function handleSearch() {
  applyFilters();
  saveBrowsingState();
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
  const paymentPreference = document.querySelector('input[name="paymentPreference"]:checked')?.value;
  const note = cartNote.value.trim();

  let message = `*${checkoutStoreName}*\n`;
  message += `*New Order*\n\n`;

  getCartArray().forEach(item => {
    const unitText = item.selectedUnit ? ` (${item.selectedUnit})` : '';
    const itemPrice = getItemPrice(item, item.qty);
    const categoryText = item.category ? ` [${item.category}]` : '';
    message += `${item.qty} x ${item.name}${unitText}${categoryText} - ${formatPrice(itemPrice * item.qty)}\n`;
  });

  message += `\n*Subtotal:* ${formatPrice(subtotal)}\n`;
  message += `*Delivery Fee:* ${formatPrice(deliveryFee)}\n`;
  message += `*Total:* ${formatPrice(grandTotal)}\n\n`;

  message += `*Order Type:* ${orderType}\n`;
  message += `*Name:* ${name || '-'}\n`;
  message += `*Phone:* ${phone || '-'}\n`;
  message += `*Address:* ${address || '-'}\n`;
  message += `Payment Preference: ${paymentPreference}\n`;
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

function logOrderToGoogleSheets(cartItems) {
  try {
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const orderData = {
      customerName: cartName.value.trim(),
      phone: cartPhone.value.trim(),
      orderType: getOrderType(),
      address: cartAddress.value.trim(),
      paymentPreference: document.querySelector('input[name="paymentPreference"]:checked')?.value || '',
      subtotal,
      deliveryFee,
      totalAmount: subtotal + deliveryFee,
      totalQty: getCartItemCount(),
      notes: cartNote.value.trim(),
      items: cartItems.map(item => {
        const rate = getItemPrice(item, item.qty);
        return {
          name: item.name,
          category: typeof item.category === 'string' ? item.category : '',
          qty: item.qty,
          rate,
          total: rate * item.qty
        };
      })
    };

    // Send JSON as plain text to avoid a CORS preflight. The response is opaque.
    fetch('https://script.google.com/macros/s/AKfycbwr7RxYmWLv75CNKLhyZjkOCxyue2qdvKVke6ZrZI7u94SDWl1VHqfO0era7UWdPCSK/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(orderData),
      keepalive: true
    }).catch(error => {
      console.warn('Order logging request failed:', error);
    });
  } catch (error) {
    console.warn('Order logging could not be started:', error);
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

  if (!document.querySelector('input[name="paymentPreference"]:checked')) {
    alert('Please select a payment preference.');
    focusField(document.getElementById('cart-payment-cash'));
    return;
  }

  const whatsappURL = buildWhatsAppMessage();
  logOrderToGoogleSheets(cartItems);
  openWhatsAppCheckout(whatsappURL);
}

/* =========================
EVENT LISTENERS
========================= */
cartBar.addEventListener('click', openCart);
cartBackdrop.addEventListener('click', closeCart);
closeCartBtn.addEventListener('click', closeCart);
continueCheckoutBtn.addEventListener('click', continueToCheckout);
backToCartBtn.addEventListener('click', () => showCartStep('cart'));
cartDrawer.addEventListener('keydown', handleCartKeydown);
initSearchPlaceholderRotation();
searchInput.addEventListener('input', handleSearch);
function browseCategories(event) {
  if (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const isProductView = currentView !== 'categoryGridView';
  showCategoryHome({ updateHistory: isProductView });
  searchInput.value = '';
  requestAnimationFrame(() => {
    categoryShowcaseSection?.scrollIntoView({
      behavior: heroMotionPreference.matches ? 'instant' : 'smooth',
      block: 'start'
    });
  });
}
document.getElementById('hero-view-products')?.addEventListener('click', browseCategories);
document.querySelector('.header-browse')?.addEventListener('click', browseCategories);
document.querySelector('.brand-block')?.addEventListener('click', event => {
  if (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const isProductView = currentView !== 'categoryGridView';
  showCategoryHome({ updateHistory: isProductView });
  searchInput.value = '';
  window.scrollTo({ top: 0, behavior: heroMotionPreference.matches ? 'instant' : 'smooth' });
});
document.querySelector('.header-icon[href="#searchInput"]')?.addEventListener('click', event => {
  if (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (searchSection?.classList.contains('hidden')) {
    showCategoryHome();
    if (searchInput.value.trim()) applyFilters();
  }
  searchInput.focus({ preventScroll: true });
  searchInput.scrollIntoView({ behavior: heroMotionPreference.matches ? 'instant' : 'smooth', block: 'center' });
});
window.addEventListener('scroll', scheduleBrowsingSave, { passive: true });
window.addEventListener('pagehide', () => { saveBrowsingState(); saveCart(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { saveBrowsingState(); saveCart(); }
});
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('scroll', updateBackToCategoryTopButton, { passive: true });

if (backToCategoryTopBtn) {
  backToCategoryTopBtn.addEventListener('click', scrollToOpenCategoryTop);
}

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
  restoreBrowsingState();
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
initPromoBannerAutoScroll();
loadMenuData();
