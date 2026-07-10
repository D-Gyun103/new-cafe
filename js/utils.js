// ===== 카페 앱 - 공통 유틸리티 (스토리지, 카트, 포맷 등) =====

import { CATEGORIES, INITIAL_MENUS } from "./data.js";

const MENUS_KEY = "cafe_menus";
const CART_KEY = "cafe_cart";

/* ---------- 포맷 ---------- */

export function formatPrice(price) {
  return `${Number(price).toLocaleString("ko-KR")}원`;
}

export function getCategoryName(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}

const PLACEHOLDER_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Caffe_Latte_cup.jpg/960px-Caffe_Latte_cup.jpg";

/**
 * 메뉴 이미지의 실제 src를 계산한다.
 * 메뉴의 image 필드는 항상 외부 이미지 URL이며, 값이 없으면 기본 이미지로 대체한다.
 */
export function resolveImageSrc(image) {
  return image || PLACEHOLDER_IMAGE;
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

// image 값이 외부 URL이 아니면(이전 버전의 이모지/로컬 파일명 캐시) 최신 시드 이미지로 교체한다
function migrateImages(menus) {
  let changed = false;
  const migrated = menus.map((menu) => {
    if (typeof menu.image === "string" && menu.image.startsWith("http")) return menu;
    const seed = INITIAL_MENUS.find((seedMenu) => seedMenu.id === menu.id);
    changed = true;
    return { ...menu, image: seed ? seed.image : menu.image };
  });
  return { migrated, changed };
}

function readMenus() {
  const raw = localStorage.getItem(MENUS_KEY);
  if (!raw) {
    localStorage.setItem(MENUS_KEY, JSON.stringify(INITIAL_MENUS));
    return structuredClone(INITIAL_MENUS);
  }
  try {
    const parsed = JSON.parse(raw);
    const { migrated, changed } = migrateImages(parsed);
    if (changed) localStorage.setItem(MENUS_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    localStorage.setItem(MENUS_KEY, JSON.stringify(INITIAL_MENUS));
    return structuredClone(INITIAL_MENUS);
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
