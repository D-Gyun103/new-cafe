// ===== 카페 앱 - 공통 유틸리티 (스토리지, 카트, 포맷 등) =====

import { CATEGORIES, INITIAL_MENUS } from "./data.js";

const MENUS_KEY = "cafe_menus";
const MENUS_VERSION_KEY = "cafe_menus_version";
// INITIAL_MENUS의 기본값(특히 image 필드 형식)을 바꿀 때마다 올린다.
// 버전이 다르면 캐시된 localStorage 값을 버리고 시드로 다시 초기화한다.
const MENUS_VERSION = "2";
const CART_KEY = "cafe_cart";

/* ---------- 포맷 ---------- */

export function formatPrice(price) {
  return `${Number(price).toLocaleString("ko-KR")}원`;
}

export function getCategoryName(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
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
