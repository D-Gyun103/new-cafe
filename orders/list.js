import {
  getOrders,
  formatPrice,
  formatDateTime,
  resolveImageSrc,
  updateCartBadge,
  getOrderStatusName,
  getOrderStatusBadgeClass,
  renderAuthNav,
  initMobileNav,
} from "../js/utils.js";

const root = document.getElementById("orders-root");
const emptyState = document.getElementById("empty-state");

function orderCardHTML(order) {
  const firstItem = order.items[0];
  const itemsPreview = order.items.map((item) => item.name).join(", ");
  const status = order.status ?? "received";

  return `
    <a class="order-card glass-card" href="detail.html?id=${order.id}">
      <div class="order-card__photo">
        <img src="${resolveImageSrc(firstItem?.image)}" alt="${firstItem?.name ?? ""}" loading="lazy" />
      </div>
      <div class="order-card__body">
        <div class="order-card__top">
          <span class="order-card__date">${formatDateTime(order.createdAt)}</span>
          <span class="badge ${getOrderStatusBadgeClass(status)}">${getOrderStatusName(status)}</span>
        </div>
        <p class="order-card__items">${itemsPreview}</p>
        <div class="order-card__bottom">
          <span class="order-card__count">${order.totalCount}개</span>
          <span class="order-card__price">${formatPrice(order.totalPrice)}</span>
        </div>
      </div>
    </a>
  `;
}

function render() {
  const orders = getOrders();

  if (orders.length === 0) {
    root.innerHTML = "";
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  root.innerHTML = orders.map(orderCardHTML).join("");
}

render();
updateCartBadge();
renderAuthNav("../login.html", "../index.html");
initMobileNav();
