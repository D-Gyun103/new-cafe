// ===== 카페 앱 - 공통 유틸리티 (스토리지, 카트, 포맷 등) =====

import { CATEGORIES, INITIAL_MENUS, ORDER_STATUSES, FEEDBACK_CATEGORIES } from "./data.js";

const MENUS_KEY = "cafe_menus";
const MENUS_VERSION_KEY = "cafe_menus_version";
// INITIAL_MENUS의 기본값(특히 image 필드 형식)을 바꿀 때마다 올린다.
// 버전이 다르면 캐시된 localStorage 값을 버리고 시드로 다시 초기화한다.
const MENUS_VERSION = "2";
const CART_KEY = "cafe_cart";
const ORDERS_KEY = "cafe_orders";
const PROFILE_KEY = "cafe_profile";
const FEEDBACKS_KEY = "cafe_feedbacks";

const DEFAULT_PROFILE = {
  name: "이서연",
  email: "seoyeon@example.com",
  joinedAt: "2026.02.14",
};

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

export function addToCart({ menuId, temperature = null, quantity = 1 }) {
  const cart = readCart();
  const existing = cart.find(
    (item) => item.menuId === menuId && item.temperature === temperature
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      cartItemId: generateId("cart"),
      menuId,
      temperature,
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
    return menu ? sum + menu.price * item.quantity : sum;
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
      return {
        menuId: menu.id,
        name: menu.name,
        image: menu.image,
        price: menu.price,
        temperature: cartItem.temperature,
        quantity: cartItem.quantity,
        subtotal: menu.price * cartItem.quantity,
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

/* ---------- 프로필 (마이페이지) ---------- */

export function getProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
    return { ...DEFAULT_PROFILE };
  }
  try {
    const profile = JSON.parse(raw);
    if (!profile?.name || !profile?.email) throw new Error("invalid profile");
    return profile;
  } catch {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(data) {
  const profile = { ...getProfile(), ...data };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * 프로필/장바구니/주문 내역을 모두 삭제한다. (회원 탈퇴)
 * 메뉴 데이터(cafe_menus)는 앱 자체 데이터이므로 건드리지 않는다.
 */
export function resetCustomerData() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(ORDERS_KEY);
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
  const profile = getProfile();
  const feedback = {
    id: generateId("feedback"),
    category,
    title,
    content,
    authorName: profile.name,
    authorEmail: profile.email,
    reply: null,
    repliedAt: null,
    createdAt: new Date().toISOString(),
  };
  writeFeedbacks([...readFeedbacks(), feedback]);
  return feedback;
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
