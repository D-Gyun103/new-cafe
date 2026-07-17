import { SIZE_OPTIONS, SHOT_OPTIONS, WATER_OPTIONS, ICE_OPTIONS } from "../js/data.js";
import {
  getMenuById,
  formatPrice,
  getCategoryName,
  getQueryParam,
  addToCart,
  resolveImageSrc,
  showToast,
  updateCartBadge,
  renderAuthNav,
  getMenuUnitPrice,
  getBeanOrigins,
  initMobileNav,
} from "../js/utils.js";

const root = document.getElementById("menu-detail-root");
const id = getQueryParam("id");

let menu = null;
let isCoffee = false;
let isDrink = false;
let beanOrigins = [];

let selectedTemp = null;
let selectedSize = null;
let selectedOrigin = null;
let selectedShot = null;
let selectedWater = null;
let selectedIce = null;
let requestText = "";
let quantity = 1;

function renderBadges() {
  const badges = [];
  if (menu.badge) {
    const cls = menu.badge === "BEST" ? "badge-best" : "badge-new";
    badges.push(`<span class="badge ${cls}">${menu.badge}</span>`);
  }
  badges.push(`<span class="badge badge-category">${getCategoryName(menu.category)}</span>`);
  return badges.join("");
}

function renderTempOptions() {
  if (!menu.temperatures.length) return "";
  return `
    <div class="menu-detail__section">
      <h3>온도 선택</h3>
      <div class="temp-options" id="temp-options">
        ${menu.temperatures
          .map(
            (t) =>
              `<button type="button" class="temp-option${
                t === selectedTemp ? " is-active" : ""
              }" data-temp="${t}">${t}</button>`
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderSizeOptions() {
  if (!isDrink) return "";
  return `
    <div class="menu-detail__section">
      <h3>사이즈</h3>
      <div class="choice-options" id="size-options">
        ${SIZE_OPTIONS.map(
          (opt) => `
            <button type="button" class="choice-option${
              opt.id === selectedSize ? " is-active" : ""
            }" data-size="${opt.id}">${opt.name}${opt.priceDiff ? ` (+${formatPrice(opt.priceDiff)})` : ""}</button>
          `
        ).join("")}
      </div>
    </div>
  `;
}

function renderOriginOptions() {
  if (!isCoffee) return "";
  return `
    <div class="menu-detail__section">
      <h3>원두 선택</h3>
      <div class="origin-options" id="origin-options">
        ${beanOrigins
          .map(
            (origin) => `
            <button type="button" class="origin-option${
              origin.id === selectedOrigin ? " is-active" : ""
            }${origin.soldOut ? " is-soldout" : ""}" data-origin="${origin.id}" ${
              origin.soldOut ? "disabled" : ""
            }>
              <strong>${origin.name}${origin.soldOut ? " (품절)" : ""}</strong>
              <span>${origin.desc}</span>
            </button>
          `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderShotOptions() {
  if (!isCoffee) return "";
  return `
    <div class="menu-detail__section">
      <h3>샷 추가</h3>
      <div class="choice-options" id="shot-options">
        ${SHOT_OPTIONS.map(
          (opt) => `
            <button type="button" class="choice-option${
              opt.id === selectedShot ? " is-active" : ""
            }" data-shot="${opt.id}">${opt.name}</button>
          `
        ).join("")}
      </div>
    </div>
  `;
}

function renderWaterIceOptions() {
  if (!isDrink) return "";
  return `
    <div class="menu-detail__section">
      <h3>물 양</h3>
      <div class="choice-options" id="water-options">
        ${WATER_OPTIONS.map(
          (opt) => `
            <button type="button" class="choice-option${
              opt.id === selectedWater ? " is-active" : ""
            }" data-water="${opt.id}">${opt.name}</button>
          `
        ).join("")}
      </div>
      <h3>얼음 양</h3>
      <div class="choice-options" id="ice-options">
        ${ICE_OPTIONS.map(
          (opt) => `
            <button type="button" class="choice-option${
              opt.id === selectedIce ? " is-active" : ""
            }" data-ice="${opt.id}">${opt.name}</button>
          `
        ).join("")}
      </div>
    </div>
  `;
}

function renderRequestField() {
  return `
    <div class="menu-detail__section">
      <h3>요청사항</h3>
      <textarea
        id="request-input"
        class="menu-detail__request"
        placeholder="예: 빨대는 빼주세요, 시럽은 적게 넣어주세요"
        maxlength="200"
      >${requestText}</textarea>
    </div>
  `;
}

function render() {
  if (!menu) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">😕</div>
        <p>메뉴를 찾을 수 없습니다.</p>
        <a class="btn btn-primary btn-sm" href="list.html">메뉴 목록으로</a>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="menu-detail__card glass-card">
      <div class="menu-detail__photo">
        <img src="${resolveImageSrc(menu.image)}" alt="${menu.name}" />
        <div class="menu-detail__badges">${renderBadges()}</div>
      </div>
      <div class="menu-detail__content">
      <div>
        <h1 class="menu-detail__name">${menu.name}</h1>
        <p class="menu-detail__desc">${menu.description}</p>
      </div>
      <span class="menu-detail__price">${formatPrice(menu.price)}</span>

      ${
        menu.soldOut
          ? `<div class="menu-detail__soldout-banner">현재 품절된 메뉴입니다.</div>`
          : `
      ${renderTempOptions()}
      ${renderSizeOptions()}
      ${renderOriginOptions()}
      ${renderShotOptions()}
      ${renderWaterIceOptions()}

      ${renderRequestField()}

      <div class="menu-detail__footer">
        <span class="menu-detail__total" id="total-price">${formatPrice(getMenuUnitPrice(menu, selectedSize) * quantity)}</span>
        <div class="menu-detail__footer-actions">
          <div class="quantity-stepper">
            <button type="button" id="qty-minus">−</button>
            <span id="qty-value">${quantity}</span>
            <button type="button" id="qty-plus">+</button>
          </div>
          <button class="btn btn-primary" id="add-cart-btn" type="button">장바구니 담기</button>
        </div>
      </div>
      `
      }
      </div>
    </div>
  `;

  if (menu.soldOut) return;

  const tempOptions = document.getElementById("temp-options");
  if (tempOptions) {
    tempOptions.addEventListener("click", (e) => {
      const btn = e.target.closest(".temp-option");
      if (!btn) return;
      selectedTemp = btn.dataset.temp;
      tempOptions.querySelectorAll(".temp-option").forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  }

  const sizeOptions = document.getElementById("size-options");
  if (sizeOptions) {
    sizeOptions.addEventListener("click", (e) => {
      const btn = e.target.closest(".choice-option");
      if (!btn) return;
      selectedSize = btn.dataset.size;
      sizeOptions.querySelectorAll(".choice-option").forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");
      updateQuantityUI();
    });
  }

  const originOptions = document.getElementById("origin-options");
  if (originOptions) {
    originOptions.addEventListener("click", (e) => {
      const btn = e.target.closest(".origin-option");
      if (!btn) return;
      selectedOrigin = btn.dataset.origin;
      originOptions.querySelectorAll(".origin-option").forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  }

  const shotOptions = document.getElementById("shot-options");
  if (shotOptions) {
    shotOptions.addEventListener("click", (e) => {
      const btn = e.target.closest(".choice-option");
      if (!btn) return;
      selectedShot = btn.dataset.shot;
      shotOptions.querySelectorAll(".choice-option").forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  }

  const waterOptions = document.getElementById("water-options");
  if (waterOptions) {
    waterOptions.addEventListener("click", (e) => {
      const btn = e.target.closest(".choice-option");
      if (!btn) return;
      selectedWater = btn.dataset.water;
      waterOptions.querySelectorAll(".choice-option").forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  }

  const iceOptions = document.getElementById("ice-options");
  if (iceOptions) {
    iceOptions.addEventListener("click", (e) => {
      const btn = e.target.closest(".choice-option");
      if (!btn) return;
      selectedIce = btn.dataset.ice;
      iceOptions.querySelectorAll(".choice-option").forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  }

  document.getElementById("request-input").addEventListener("input", (e) => {
    requestText = e.target.value;
  });

  document.getElementById("qty-minus").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    updateQuantityUI();
  });

  document.getElementById("qty-plus").addEventListener("click", () => {
    quantity += 1;
    updateQuantityUI();
  });

  document.getElementById("add-cart-btn").addEventListener("click", () => {
    addToCart({
      menuId: menu.id,
      temperature: selectedTemp,
      size: selectedSize,
      origin: selectedOrigin,
      shotOption: selectedShot,
      waterAmount: selectedWater,
      iceAmount: selectedIce,
      request: requestText.trim(),
      quantity,
    });
    showToast(`${menu.name}${quantity}개를 장바구니에 담았습니다.`);
    updateCartBadge();
    setTimeout(() => {
      window.location.href = "list.html";
    }, 700);
  });
}

function updateQuantityUI() {
  document.getElementById("qty-value").textContent = quantity;
  document.getElementById("total-price").textContent = formatPrice(
    getMenuUnitPrice(menu, selectedSize) * quantity
  );
}

async function init() {
  menu = id ? await getMenuById(id) : null;
  isCoffee = menu?.category === "coffee";
  isDrink = Boolean(menu?.temperatures?.length);
  beanOrigins = isCoffee ? await getBeanOrigins() : [];
  const firstAvailableOrigin = beanOrigins.find((o) => !o.soldOut) ?? beanOrigins[0] ?? null;

  selectedTemp = menu?.temperatures?.[0] ?? null;
  selectedSize = isDrink ? SIZE_OPTIONS[0].id : null;
  selectedOrigin = isCoffee ? firstAvailableOrigin?.id ?? null : null;
  selectedShot = isCoffee ? SHOT_OPTIONS[0].id : null;
  selectedWater = isDrink ? WATER_OPTIONS[0].id : null;
  selectedIce = isDrink ? ICE_OPTIONS[0].id : null;

  render();
}

init();
updateCartBadge();
renderAuthNav("../login.html", "../index.html");
initMobileNav();
