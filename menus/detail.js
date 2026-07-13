import {
  getMenuById,
  formatPrice,
  getCategoryName,
  getQueryParam,
  addToCart,
  resolveImageSrc,
  showToast,
  updateCartBadge,
} from "../js/utils.js";

const root = document.getElementById("menu-detail-root");
const id = getQueryParam("id");
const menu = id ? getMenuById(id) : null;

let selectedTemp = menu?.temperatures?.[0] ?? null;
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

      <div class="menu-detail__section">
        <h3>수량</h3>
        <div class="quantity-stepper">
          <button type="button" id="qty-minus">−</button>
          <span id="qty-value">${quantity}</span>
          <button type="button" id="qty-plus">+</button>
        </div>
      </div>

      <div class="menu-detail__footer">
        <span class="menu-detail__total" id="total-price">${formatPrice(menu.price * quantity)}</span>
        <button class="btn btn-primary" id="add-cart-btn" type="button">장바구니 담기</button>
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

  document.getElementById("qty-minus").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    updateQuantityUI();
  });

  document.getElementById("qty-plus").addEventListener("click", () => {
    quantity += 1;
    updateQuantityUI();
  });

  document.getElementById("add-cart-btn").addEventListener("click", () => {
    addToCart({ menuId: menu.id, temperature: selectedTemp, quantity });
    showToast(`${menu.name}${quantity}개를 장바구니에 담았습니다.`);
    updateCartBadge();
    setTimeout(() => {
      window.location.href = "list.html";
    }, 700);
  });
}

function updateQuantityUI() {
  document.getElementById("qty-value").textContent = quantity;
  document.getElementById("total-price").textContent = formatPrice(menu.price * quantity);
}

render();
updateCartBadge();
