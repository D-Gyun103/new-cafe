// ===== 카페 앱 - 공통 유틸리티 (Supabase 연동 + 카트/포맷 등) =====

import {
  CATEGORIES,
  ORDER_STATUSES,
  FEEDBACK_CATEGORIES,
  SIZE_OPTIONS,
  SHOT_OPTIONS,
  WATER_OPTIONS,
  ICE_OPTIONS,
} from "./data.js";
import { supabase } from "./supabaseClient.js";

// 장바구니는 로그인 여부와 무관하게 이 브라우저에만 남는 임시 상태라서 그대로 localStorage를 쓴다.
const CART_KEY = "cafe_cart";
// 비회원 주문은 계정이 없으므로 서버에 저장할 수 없다. 예전과 동일하게 이 브라우저에만 남는다.
const GUEST_ORDERS_KEY = "cafe_guest_orders";

/* ---------- 포맷 ---------- */

export function formatPrice(price) {
  return `${Number(price).toLocaleString("ko-KR")}원`;
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatJoinDate(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export function getCategoryName(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}

/** origins는 미리 getBeanOrigins()로 받아온 배열을 넘긴다 (렌더링 루프마다 다시 조회하지 않도록). */
export function getBeanOriginName(origins, originId) {
  return origins.find((o) => o.id === originId)?.name ?? originId;
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

/* ---------- 메뉴 (Supabase: 누구나 조회, 관리자만 쓰기) ---------- */

function mapMenuRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    description: row.description,
    image: row.image,
    temperatures: row.temperatures ?? [],
    badge: row.badge,
    soldOut: row.sold_out,
    signature: row.signature,
  };
}

export async function getMenus() {
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("getMenus", error);
    return [];
  }
  return data.map(mapMenuRow);
}

export async function getMenuById(id) {
  if (!id) return null;
  const { data, error } = await supabase.from("menus").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapMenuRow(data);
}

export async function createMenu(data) {
  const row = {
    id: generateId("menu"),
    name: data.name,
    category: data.category,
    price: Number(data.price),
    description: data.description,
    image: data.image || null,
    temperatures: data.temperatures ?? [],
    badge: data.badge || null,
    sold_out: Boolean(data.soldOut),
    signature: Boolean(data.signature),
  };
  const { data: inserted, error } = await supabase.from("menus").insert(row).select().single();
  if (error) {
    console.error("createMenu", error);
    return null;
  }
  return mapMenuRow(inserted);
}

export async function updateMenu(id, data) {
  const patch = {
    name: data.name,
    category: data.category,
    price: Number(data.price),
    description: data.description,
    image: data.image || null,
    temperatures: data.temperatures ?? [],
    badge: data.badge || null,
    sold_out: Boolean(data.soldOut),
    signature: Boolean(data.signature),
  };
  const { data: updated, error } = await supabase
    .from("menus")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error || !updated) {
    console.error("updateMenu", error);
    return null;
  }
  return mapMenuRow(updated);
}

export async function deleteMenu(id) {
  const { error } = await supabase.from("menus").delete().eq("id", id);
  if (error) console.error("deleteMenu", error);
}

/* ---------- 원두 (Supabase: 누구나 조회, 관리자만 품절 토글) ---------- */

function mapOriginRow(row) {
  return { id: row.id, name: row.name, desc: row.description, soldOut: row.sold_out };
}

export async function getBeanOrigins() {
  const { data, error } = await supabase.from("bean_origins").select("*");
  if (error) {
    console.error("getBeanOrigins", error);
    return [];
  }
  return data.map(mapOriginRow);
}

export async function setBeanOriginSoldOut(id, soldOut) {
  const { data, error } = await supabase
    .from("bean_origins")
    .update({ sold_out: soldOut })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error || !data) return null;
  return mapOriginRow(data);
}

/* ---------- 장바구니 (로그인 여부와 무관하게 이 브라우저에만 저장) ---------- */

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

export async function getCartTotal() {
  const cart = readCart();
  if (cart.length === 0) return 0;
  const menus = await getMenus();
  const menuMap = new Map(menus.map((m) => [m.id, m]));
  return cart.reduce((sum, item) => {
    const menu = menuMap.get(item.menuId);
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

/* ---------- 비회원 주문 (이 브라우저에만 저장) ---------- */

function readGuestOrders() {
  const raw = localStorage.getItem(GUEST_ORDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeGuestOrders(orders) {
  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(orders));
}

/* ---------- 주문 (로그인 고객은 Supabase, 비회원은 이 브라우저에만) ---------- */

function mapOrderItemRow(row) {
  return {
    menuId: row.menu_id,
    name: row.name,
    image: row.image,
    price: row.price,
    temperature: row.temperature,
    size: row.size,
    origin: row.origin,
    shotOption: row.shot_option,
    waterAmount: row.water_amount,
    iceAmount: row.ice_amount,
    request: row.request,
    quantity: row.quantity,
    subtotal: row.subtotal,
  };
}

function mapOrderRow(row) {
  return {
    id: row.id,
    items: (row.order_items ?? []).map(mapOrderItemRow),
    totalCount: row.total_count,
    totalPrice: row.total_price,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getOrders() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return readGuestOrders().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getOrders", error);
    return [];
  }
  return data.map(mapOrderRow);
}

export async function getOrderById(id) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .maybeSingle();
    if (data) return mapOrderRow(data);
  }

  return readGuestOrders().find((order) => order.id === id) ?? null;
}

/**
 * 현재 장바구니 내용을 그대로 주문으로 확정하고 장바구니는 비운다.
 * 장바구니가 비어 있으면 아무 것도 하지 않고 null을 반환한다.
 * 로그인한 고객이면 Supabase에 저장돼 기기 간에도 이어지고,
 * 비회원이면 계정이 없으므로 예전처럼 이 브라우저에만 남는다.
 */
export async function createOrder() {
  const cart = readCart();
  if (cart.length === 0) return null;

  const menus = await getMenus();
  const menuMap = new Map(menus.map((m) => [m.id, m]));

  const items = cart
    .map((cartItem) => {
      const menu = menuMap.get(cartItem.menuId);
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

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const order = {
      id: generateId("order"),
      items,
      totalCount,
      totalPrice,
      status: "received",
      createdAt: new Date().toISOString(),
    };
    writeGuestOrders([...readGuestOrders(), order]);
    writeCart([]);
    return order;
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({ customer_id: user.id, status: "received", total_count: totalCount, total_price: totalPrice })
    .select()
    .single();

  if (orderError) {
    console.error("createOrder", orderError);
    return null;
  }

  const itemRows = items.map((item) => ({
    order_id: orderRow.id,
    menu_id: item.menuId,
    name: item.name,
    image: item.image,
    price: item.price,
    temperature: item.temperature,
    size: item.size,
    origin: item.origin,
    shot_option: item.shotOption,
    water_amount: item.waterAmount,
    ice_amount: item.iceAmount,
    request: item.request,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
  if (itemsError) console.error("createOrder items", itemsError);

  writeCart([]);

  return {
    id: orderRow.id,
    items,
    totalCount,
    totalPrice,
    status: orderRow.status,
    createdAt: orderRow.created_at,
  };
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*, order_items(*)")
    .maybeSingle();
  if (error || !data) return null;
  return mapOrderRow(data);
}

export async function deleteOrder(id) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) console.error("deleteOrder", error);
}

/* ---------- 고객 회원가입/로그인 (Supabase Auth) ----------
 * 메뉴 조회·장바구니·주문·주문내역은 비회원도 이용할 수 있다.
 * 건의함과 마이페이지만 로그인한 회원에게 제한한다.
 */

export async function registerCustomer({ email, password, name }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    const isDuplicate = /already registered|already exists/i.test(error.message);
    return { ok: false, error: isDuplicate ? "이미 사용 중인 이메일입니다." : error.message };
  }
  if (!data.user) {
    return { ok: false, error: "가입 처리 중 문제가 발생했습니다." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, name, email });
  if (profileError) {
    return { ok: false, error: "프로필 저장에 실패했습니다." };
  }

  // Supabase 프로젝트에서 "Confirm email"이 켜져 있으면 가입 직후에는 세션이 없다.
  if (!data.session) {
    return { ok: false, error: "가입 확인 이메일을 보냈습니다. 메일함을 확인한 뒤 로그인해주세요." };
  }

  return { ok: true, customer: { id: data.user.id, name, email } };
}

export async function loginCustomer(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}

export async function logoutCustomer() {
  await supabase.auth.signOut();
}

export async function getCurrentCustomer() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;

  return { id: user.id, name: profile.name, email: profile.email, joinedAt: formatJoinDate(profile.created_at) };
}

export async function isCustomerAuthed() {
  return Boolean(await getCurrentCustomer());
}

export async function updateCurrentCustomer(data) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ name: data.name, email: data.email })
    .eq("id", user.id)
    .select()
    .maybeSingle();
  if (error || !updated) return null;

  return { id: user.id, name: updated.name, email: updated.email, joinedAt: formatJoinDate(updated.created_at) };
}

/**
 * 로그인이 안 되어 있으면 로그인 페이지로 즉시 이동시키고,
 * 로그인 후 원래 페이지로 돌아올 수 있도록 redirect 쿼리를 함께 붙인다.
 * loginPath는 호출하는 페이지 기준 로그인 페이지 상대 경로다 (예: "../login.html").
 */
export async function requireCustomerAuth(loginPath) {
  const customer = await getCurrentCustomer();
  if (customer) return true;
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `${loginPath}?redirect=${redirect}`;
  return false;
}

/**
 * 프로필(이름/이메일 등 앱에서 쓰는 정보)을 삭제하고 로그아웃한다. (회원 탈퇴)
 * 장바구니·주문 내역은 비회원도 함께 쓰는 공용 데이터이므로 건드리지 않는다.
 * 주의: anon 키만으로는 Supabase Auth의 로그인 계정 자체(auth.users)는 삭제할 수 없어
 * 프로필만 지운다 — 이후 getCurrentCustomer()는 항상 null을 반환해 로그아웃과 동일하게 동작한다.
 */
export async function withdrawCurrentCustomer() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").delete().eq("id", user.id);
  await supabase.auth.signOut();
}

/**
 * id="auth-nav-btn" 버튼이 있는 페이지에서 호출하면 로그인 여부에 따라
 * "로그인"/"로그아웃" 버튼으로 동작하게 만든다. 어느 페이지에서든 동일하게 쓸 수 있다.
 * loginPath/homePath는 호출하는 페이지 기준 상대 경로다 (예: "../login.html", "../index.html").
 */
export async function renderAuthNav(loginPath, homePath) {
  const btn = document.getElementById("auth-nav-btn");
  const myLink = document.getElementById("nav-my-link");
  const customer = await getCurrentCustomer();

  if (myLink) myLink.hidden = !customer;
  if (!btn) return;

  if (customer) {
    btn.textContent = "로그아웃";
    btn.addEventListener("click", async () => {
      await logoutCustomer();
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

/* ---------- 건의함 (불편/건의사항, Supabase) ----------
 * 접수된 내용은 관리자만 열람·삭제·답변할 수 있다.
 * 고객 화면에는 제출 폼과 "내 건의 내역"만 제공한다.
 */

function mapFeedbackRow(row) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    content: row.content,
    authorName: row.author_name,
    authorEmail: row.author_email,
    customerId: row.customer_id,
    reply: row.reply,
    repliedAt: row.replied_at,
    createdAt: row.created_at,
  };
}

export async function getFeedbacks() {
  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getFeedbacks", error);
    return [];
  }
  return data.map(mapFeedbackRow);
}

export async function getFeedbackById(id) {
  const { data, error } = await supabase.from("feedbacks").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapFeedbackRow(data);
}

/** 마이페이지의 "건의·불편 내역" 탭에서, 로그인한 고객 본인이 작성한 건의만 모아 보여줄 때 쓴다. */
export async function getFeedbacksByCustomer(customerId) {
  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getFeedbacksByCustomer", error);
    return [];
  }
  return data.map(mapFeedbackRow);
}

export async function createFeedback({ category, title, content }) {
  const customer = await getCurrentCustomer();
  const row = {
    category,
    title,
    content,
    author_name: customer?.name ?? "회원",
    author_email: customer?.email ?? "-",
    customer_id: customer?.id ?? null,
  };
  const { data, error } = await supabase.from("feedbacks").insert(row).select().single();
  if (error) {
    console.error("createFeedback", error);
    return null;
  }
  return mapFeedbackRow(data);
}

export async function replyToFeedback(id, reply) {
  const { data, error } = await supabase
    .from("feedbacks")
    .update({ reply, replied_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error || !data) return null;
  return mapFeedbackRow(data);
}

export async function deleteFeedback(id) {
  const { error } = await supabase.from("feedbacks").delete().eq("id", id);
  if (error) console.error("deleteFeedback", error);
}

/* ---------- 관리자 로그인 (Supabase Auth + admins 테이블) ----------
 * admins 테이블에 user_id가 등록된 계정만 관리자로 인정한다.
 * (등록은 Supabase SQL Editor에서 수동으로만 가능 — supabase/schema.sql 참고)
 */

export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return false;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return false;
  }
  return true;
}

export async function isAdminAuthed() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  return Boolean(isAdmin);
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
}

/**
 * 로그인이 안 되어 있으면 관리자 로그인 페이지로 즉시 이동시킨다.
 * 각 관리자 페이지 스크립트 최상단에서 호출한다.
 */
export async function requireAdminAuth() {
  if (await isAdminAuthed()) return true;
  const adminRoot = window.location.pathname.split("/admin/")[0] + "/admin/";
  window.location.href = `${adminRoot}login.html`;
  return false;
}
