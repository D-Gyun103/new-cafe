// ===== 카페 앱 - 공통 유틸리티 (스토리지, 카트, 포맷 등) =====

import {
  CATEGORIES,
  INITIAL_MENUS,
  ORDER_STATUSES,
  FEEDBACK_CATEGORIES,
  BEAN_ORIGINS,
  SIZE_OPTIONS,
  SHOT_OPTIONS,
  WATER_OPTIONS,
  ICE_OPTIONS,
} from "./data.js";

const MENUS_KEY = "cafe_menus";
const MENUS_VERSION_KEY = "cafe_menus_version";
// INITIAL_MENUS의 기본값(특히 image 필드 형식)을 바꿀 때마다 올린다.
// 버전이 다르면 캐시된 localStorage 값을 버리고 시드로 다시 초기화한다.
const MENUS_VERSION = "5";
const BEAN_ORIGINS_KEY = "cafe_bean_origins";
const BEAN_ORIGINS_VERSION_KEY = "cafe_bean_origins_version";
const BEAN_ORIGINS_VERSION = "1";
const CART_KEY = "cafe_cart";
const ORDERS_KEY = "cafe_orders";
const FEEDBACKS_KEY = "cafe_feedbacks";
const ADMIN_AUTH_KEY = "cafe_admin_authed";
const CUSTOMERS_KEY = "cafe_customers";
// 로그인한 고객의 id만 저장한다(비밀번호 등은 담지 않음). 세션이 끝나면 자동 로그아웃된다.
const CUSTOMER_SESSION_KEY = "cafe_customer_session";

// 데모용 간단 로그인이라 자격 증명을 클라이언트 코드에 그대로 둔다.
// 실제 서비스라면 서버 인증으로 대체해야 한다.
const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

/* ---------- 포맷 ---------- */

export function formatPrice(price) {
  return `${Number(price).toLocaleString("ko-KR")}원`;
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getCategoryName(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}

export function getBeanOriginName(originId) {
  return readBeanOrigins().find((o) => o.id === originId)?.name ?? originId;
}

export function getSizeOptionName(sizeId) {
  return SIZE_OPTIONS.find((s) => s.id === sizeId)?.name ?? sizeId;
}

export function getSizeExtraPrice(sizeId) {
  return SIZE_OPTIONS.find((s) => s.id === sizeId)?.priceDiff ?? 0;
}

/** 사이즈업 등으로 추가되는 금액까지 반영한, 실제로 결제되는 메뉴 1개당 가격이다. */
export function getMenuUnitPrice(menu, sizeId) {
  return menu.price + getSizeExtraPrice(sizeId);
}

// 옵션이 "기본"이면 굳이 뱃지로 보여줄 필요가 없어서, 그 경우엔 null을 반환한다.
export function getShotOptionName(shotId) {
  if (!shotId || shotId === "normal") return null;
  return SHOT_OPTIONS.find((o) => o.id === shotId)?.name ?? null;
}

export function getWaterOptionName(waterId) {
  if (!waterId || waterId === "normal") return null;
  return WATER_OPTIONS.find((o) => o.id === waterId)?.name ?? null;
}

export function getIceOptionName(iceId) {
  if (!iceId || iceId === "normal") return null;
  return ICE_OPTIONS.find((o) => o.id === iceId)?.name ?? null;
}

export function getOrderStatusName(statusId) {
  return ORDER_STATUSES.find((s) => s.id === statusId)?.name ?? statusId;
}

export function getFeedbackCategoryName(categoryId) {
  return FEEDBACK_CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}

const ORDER_STATUS_BADGE_CLASS = {
  received: "badge-category",
  preparing: "badge-best",
  done: "badge-new",
  canceled: "badge-soldout",
};

export function getOrderStatusBadgeClass(statusId) {
  return ORDER_STATUS_BADGE_CLASS[statusId] ?? "badge-category";
}

// utils.js 자신의 위치(import.meta.url) 기준으로 images/menu/를 가리킨다.
// 어떤 깊이의 페이지에서 import하든 항상 올바른 경로로 계산되므로,
// 페이지마다 상대 경로를 따로 계산할 필요가 없다.
const IMAGES_BASE_URL = new URL("../images/menu/", import.meta.url);

/**
 * 메뉴 이미지의 실제 src를 계산한다.
 * - 절대 URL(http...)이면 그대로 사용
 * - 값이 없으면 기본 이미지로 대체
 * - 그 외에는 images/menu/ 폴더의 로컬 파일명으로 간주한다
 */
export function resolveImageSrc(image) {
  if (!image) return new URL("placeholder.jpg", IMAGES_BASE_URL).href;
  if (/^https?:\/\//.test(image)) return image;
  return new URL(image, IMAGES_BASE_URL).href;
}

/* ---------- 공통 ---------- */

export function generateId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function showToast(message, duration = 2200) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, duration);
}

/* ---------- 메뉴 스토리지 ---------- */

function seedMenus() {
  localStorage.setItem(MENUS_KEY, JSON.stringify(INITIAL_MENUS));
  localStorage.setItem(MENUS_VERSION_KEY, MENUS_VERSION);
  return structuredClone(INITIAL_MENUS);
}

function readMenus() {
  const raw = localStorage.getItem(MENUS_KEY);
  const version = localStorage.getItem(MENUS_VERSION_KEY);
  if (!raw || version !== MENUS_VERSION) {
    return seedMenus();
  }
  try {
    return JSON.parse(raw);
  } catch {
    return seedMenus();
  }
}

function writeMenus(menus) {
  localStorage.setItem(MENUS_KEY, JSON.stringify(menus));
}

export function getMenus() {
  return readMenus();
}

export function getMenuById(id) {
  return readMenus().find((menu) => menu.id === id) ?? null;
}

export function createMenu(data) {
  const menus = readMenus();
  const menu = {
    id: generateId("menu"),
    name: data.name,
    category: data.category,
    price: Number(data.price),
    description: data.description,
    image: data.image || "",
    temperatures: data.temperatures ?? [],
    badge: data.badge || null,
    soldOut: Boolean(data.soldOut),
    signature: Boolean(data.signature),
  };
  menus.push(menu);
  writeMenus(menus);
  return menu;
}

export function updateMenu(id, data) {
  const menus = readMenus();
  const index = menus.findIndex((menu) => menu.id === id);
  if (index === -1) return null;
  menus[index] = {
    ...menus[index],
    ...data,
    price: Number(data.price ?? menus[index].price),
  };
  writeMenus(menus);
  return menus[index];
}

export function deleteMenu(id) {
  const menus = readMenus().filter((menu) => menu.id !== id);
  writeMenus(menus);
}

/* ---------- 원두 (관리자 품절 관리) ---------- */

function seedBeanOrigins() {
  const seeded = BEAN_ORIGINS.map((origin) => ({ ...origin, soldOut: false }));
  localStorage.setItem(BEAN_ORIGINS_KEY, JSON.stringify(seeded));
  localStorage.setItem(BEAN_ORIGINS_VERSION_KEY, BEAN_ORIGINS_VERSION);
  return seeded;
}

function readBeanOrigins() {
  const raw = localStorage.getItem(BEAN_ORIGINS_KEY);
  const version = localStorage.getItem(BEAN_ORIGINS_VERSION_KEY);
  if (!raw || version !== BEAN_ORIGINS_VERSION) {
    return seedBeanOrigins();
  }
  try {
    return JSON.parse(raw);
  } catch {
    return seedBeanOrigins();
  }
}

function writeBeanOrigins(origins) {
  localStorage.setItem(BEAN_ORIGINS_KEY, JSON.stringify(origins));
}

export function getBeanOrigins() {
  return readBeanOrigins();
}

export function setBeanOriginSoldOut(id, soldOut) {
  const origins = readBeanOrigins();
  const origin = origins.find((o) => o.id === id);
  if (!origin) return null;
  origin.soldOut = soldOut;
  writeBeanOrigins(origins);
  return origin;
}

/* ---------- 장바구니 ---------- */

function readCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function getCart() {
  return readCart();
}

export function addToCart({
  menuId,
  temperature = null,
  size = null,
  origin = null,
  shotOption = null,
  waterAmount = null,
  iceAmount = null,
  request = "",
  quantity = 1,
}) {
  const cart = readCart();
  const existing = cart.find(
    (item) =>
      item.menuId === menuId &&
      item.temperature === temperature &&
      item.size === size &&
      item.origin === origin &&
      item.shotOption === shotOption &&
      item.waterAmount === waterAmount &&
      item.iceAmount === iceAmount &&
      item.request === request
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      cartItemId: generateId("cart"),
      menuId,
      temperature,
      size,
      origin,
      shotOption,
      waterAmount,
      iceAmount,
      request,
      quantity,
    });
  }
  writeCart(cart);
  return cart;
}

export function updateCartItemQty(cartItemId, quantity) {
  const cart = readCart();
  const item = cart.find((i) => i.cartItemId === cartItemId);
  if (!item) return cart;
  item.quantity = Math.max(1, quantity);
  writeCart(cart);
  return cart;
}

export function removeFromCart(cartItemId) {
  const cart = readCart().filter((item) => item.cartItemId !== cartItemId);
  writeCart(cart);
  return cart;
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal() {
  return readCart().reduce((sum, item) => {
    const menu = getMenuById(item.menuId);
    return menu ? sum + getMenuUnitPrice(menu, item.size) * item.quantity : sum;
  }, 0);
}

/**
 * id="cart-count" 뱃지가 있는 페이지에서 호출하면
 * 장바구니 담긴 수량으로 갱신해준다. 뱃지가 없으면 아무 동작 안 함.
 */
export function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.hidden = count === 0;
}

/* ---------- 주문 ---------- */

function readOrders() {
  const raw = localStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrders() {
  return readOrders().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrderById(id) {
  return readOrders().find((order) => order.id === id) ?? null;
}

/**
 * 현재 장바구니 내용을 그대로 주문으로 확정하고 장바구니는 비운다.
 * 장바구니가 비어 있으면 아무 것도 하지 않고 null을 반환한다.
 */
export function createOrder() {
  const cart = readCart();
  const items = cart
    .map((cartItem) => {
      const menu = getMenuById(cartItem.menuId);
      if (!menu) return null;
      const unitPrice = getMenuUnitPrice(menu, cartItem.size);
      return {
        menuId: menu.id,
        name: menu.name,
        image: menu.image,
        price: unitPrice,
        temperature: cartItem.temperature,
        size: cartItem.size,
        origin: cartItem.origin,
        shotOption: cartItem.shotOption,
        waterAmount: cartItem.waterAmount,
        iceAmount: cartItem.iceAmount,
        request: cartItem.request,
        quantity: cartItem.quantity,
        subtotal: unitPrice * cartItem.quantity,
      };
    })
    .filter(Boolean);

  if (items.length === 0) return null;

  const order = {
    id: generateId("order"),
    items,
    totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.subtotal, 0),
    status: "received",
    createdAt: new Date().toISOString(),
  };

  writeOrders([...readOrders(), order]);
  writeCart([]);
  return order;
}

export function updateOrderStatus(id, status) {
  const orders = readOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  writeOrders(orders);
  return order;
}

export function deleteOrder(id) {
  writeOrders(readOrders().filter((order) => order.id !== id));
}

/* ---------- 고객 회원가입/로그인 ----------
 * 메뉴 조회·장바구니·주문·주문내역은 비회원도 이용할 수 있다.
 * 건의함과 마이페이지만 로그인한 회원에게 제한한다.
 * 데모용 로그인이라 비밀번호를 평문으로 localStorage에 저장한다.
 * 실제 서비스라면 서버 인증으로 대체해야 한다.
 */

function readCustomers() {
  const raw = localStorage.getItem(CUSTOMERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCustomers(customers) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function formatJoinedDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/**
 * 아이디 중복이면 실패하고, 성공하면 즉시 로그인 상태로 만든다.
 */
export function registerCustomer({ username, password, name, email }) {
  const customers = readCustomers();
  if (customers.some((customer) => customer.username === username)) {
    return { ok: false, error: "이미 사용 중인 아이디입니다." };
  }
  const customer = {
    id: generateId("customer"),
    username,
    password,
    name,
    email,
    joinedAt: formatJoinedDate(),
  };
  writeCustomers([...customers, customer]);
  sessionStorage.setItem(CUSTOMER_SESSION_KEY, customer.id);
  return { ok: true, customer };
}

export function loginCustomer(username, password) {
  const customer = readCustomers().find(
    (c) => c.username === username && c.password === password
  );
  if (!customer) return false;
  sessionStorage.setItem(CUSTOMER_SESSION_KEY, customer.id);
  return true;
}

export function logoutCustomer() {
  sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
}

export function getCurrentCustomer() {
  const id = sessionStorage.getItem(CUSTOMER_SESSION_KEY);
  if (!id) return null;
  return readCustomers().find((customer) => customer.id === id) ?? null;
}

export function isCustomerAuthed() {
  return Boolean(getCurrentCustomer());
}

export function updateCurrentCustomer(data) {
  const id = sessionStorage.getItem(CUSTOMER_SESSION_KEY);
  if (!id) return null;
  const customers = readCustomers();
  const customer = customers.find((c) => c.id === id);
  if (!customer) return null;
  Object.assign(customer, data);
  writeCustomers(customers);
  return customer;
}

/**
 * 로그인이 안 되어 있으면 로그인 페이지로 즉시 이동시키고,
 * 로그인 후 원래 페이지로 돌아올 수 있도록 redirect 쿼리를 함께 붙인다.
 * loginPath는 호출하는 페이지 기준 로그인 페이지 상대 경로다 (예: "../login.html").
 */
export function requireCustomerAuth(loginPath) {
  if (isCustomerAuthed()) return true;
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `${loginPath}?redirect=${redirect}`;
  return false;
}

/**
 * 계정을 삭제하고 로그아웃한다. (회원 탈퇴)
 * 장바구니·주문 내역은 비회원도 함께 쓰는 공용 데이터이므로 건드리지 않는다.
 */
export function withdrawCurrentCustomer() {
  const id = sessionStorage.getItem(CUSTOMER_SESSION_KEY);
  if (!id) return;
  writeCustomers(readCustomers().filter((customer) => customer.id !== id));
  logoutCustomer();
}

/**
 * id="auth-nav-btn" 버튼이 있는 페이지에서 호출하면 로그인 여부에 따라
 * "로그인"/"로그아웃" 버튼으로 동작하게 만든다. 어느 페이지에서든 동일하게 쓸 수 있다.
 * loginPath/homePath는 호출하는 페이지 기준 상대 경로다 (예: "../login.html", "../index.html").
 */
export function renderAuthNav(loginPath, homePath) {
  const btn = document.getElementById("auth-nav-btn");
  const myLink = document.getElementById("nav-my-link");
  const authed = isCustomerAuthed();

  if (myLink) myLink.hidden = !authed;

  if (!btn) return;

  if (authed) {
    btn.textContent = "로그아웃";
    btn.addEventListener("click", () => {
      logoutCustomer();
      window.location.href = homePath;
    });
  } else {
    btn.textContent = "로그인";
    btn.addEventListener("click", () => {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${loginPath}?redirect=${redirect}`;
    });
  }
}

/* ---------- 반응형 내비게이션 (모바일 햄버거 메뉴) ----------
 * id="nav-toggle" 버튼과 id="nav-menu" 내비게이션이 있는 페이지에서 호출하면
 * 좁은 화면에서 햄버거 버튼으로 메뉴를 열고 닫을 수 있게 해준다.
 * 데스크톱 폭에서는 CSS가 항상 펼쳐진 상태로 보여주므로 이 함수와 무관하다.
 */
export function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!menu.classList.contains("is-open")) return;
    if (menu.contains(event.target) || toggle.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize", closeMenu);
}

/* ---------- 건의함 (불편/건의사항) ----------
 * 접수된 내용은 관리자만 열람·삭제·답변·수정할 수 있다.
 * 고객 화면에는 제출 폼만 제공하고, 접수된 목록/답변을 보여주는 화면은 두지 않는다.
 */

function readFeedbacks() {
  const raw = localStorage.getItem(FEEDBACKS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeFeedbacks(feedbacks) {
  localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));
}

export function getFeedbacks() {
  return readFeedbacks().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getFeedbackById(id) {
  return readFeedbacks().find((feedback) => feedback.id === id) ?? null;
}

export function createFeedback({ category, title, content }) {
  const customer = getCurrentCustomer();
  const feedback = {
    id: generateId("feedback"),
    category,
    title,
    content,
    authorName: customer?.name ?? "회원",
    authorEmail: customer?.email ?? "-",
    customerId: customer?.id ?? null,
    reply: null,
    repliedAt: null,
    createdAt: new Date().toISOString(),
  };
  writeFeedbacks([...readFeedbacks(), feedback]);
  return feedback;
}

/** 마이페이지의 "건의·불편 내역" 탭에서, 로그인한 고객 본인이 작성한 건의만 모아 보여줄 때 쓴다. */
export function getFeedbacksByCustomer(customerId) {
  return getFeedbacks().filter((feedback) => feedback.customerId === customerId);
}

export function replyToFeedback(id, reply) {
  const feedbacks = readFeedbacks();
  const feedback = feedbacks.find((f) => f.id === id);
  if (!feedback) return null;
  feedback.reply = reply;
  feedback.repliedAt = new Date().toISOString();
  writeFeedbacks(feedbacks);
  return feedback;
}

export function deleteFeedback(id) {
  writeFeedbacks(readFeedbacks().filter((feedback) => feedback.id !== id));
}

/* ---------- 관리자 로그인 (간단 세션 인증) ---------- */

export function loginAdmin(username, password) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function isAdminAuthed() {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
}

/**
 * 로그인이 안 되어 있으면 관리자 로그인 페이지로 즉시 이동시킨다.
 * 각 관리자 페이지 스크립트 최상단에서 호출한다.
 */
export function requireAdminAuth() {
  if (isAdminAuthed()) return true;
  const adminRoot = window.location.pathname.split("/admin/")[0] + "/admin/";
  window.location.href = `${adminRoot}login.html`;
  return false;
}
