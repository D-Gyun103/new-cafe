import { getOrders, formatPrice, formatDateTime, resolveImageSrc } from "../js/utils.js";

const root = document.getElementById("orders-root");
const emptyState = document.getElementById("empty-state");

function orderCardHTML(order) {
  const firstItem = order.items[0];
  const itemsPreview = order.items.map((item) => item.name).join(", ");

  return `
    <a class="order-card glass-card" href="detail.html?id=${order.id}">
      <div class="order-card__photo">
        <img src="${resolveImageSrc(firstItem?.image)}" alt="${firstItem?.name ?? ""}" loading="lazy" />
      </div>
      <div class="order-card__body">
        <div class="order-card__top">
          <span class="order-card__date">${formatDateTime(order.createdAt)}</span>
          <span class="badge badge-new">주문완료</span>
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
