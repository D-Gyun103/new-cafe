import {
  getMenus,
  getOrders,
  getFeedbacks,
  formatPrice,
  formatDateTime,
  resolveImageSrc,
  getOrderStatusName,
  getOrderStatusBadgeClass,
} from "../js/utils.js";

const statsEl = document.getElementById("dashboard-stats");
const recentOrdersEl = document.getElementById("recent-orders");
const emptyState = document.getElementById("empty-state");

function statCardHTML(label, value) {
  return `
    <article class="stat-card">
      <span class="stat-card__label">${label}</span>
      <strong class="stat-card__value">${value}</strong>
    </article>
  `;
}

function renderStats() {
  const menus = getMenus();
  const orders = getOrders();
  const feedbacks = getFeedbacks();
  const soldOutCount = menus.filter((menu) => menu.soldOut).length;
  const pendingFeedbackCount = feedbacks.filter((feedback) => !feedback.reply).length;
  const revenue = orders
    .filter((order) => (order.status ?? "received") !== "canceled")
    .reduce((sum, order) => sum + order.totalPrice, 0);

  statsEl.innerHTML = [
    statCardHTML("전체 메뉴", `${menus.length}개`),
    statCardHTML("품절 메뉴", `${soldOutCount}개`),
    statCardHTML("전체 주문", `${orders.length}건`),
    statCardHTML("총 매출", formatPrice(revenue)),
    statCardHTML("미답변 건의", `${pendingFeedbackCount}건`),
  ].join("");
}

function recentOrderHTML(order) {
  const status = order.status ?? "received";
  const firstItem = order.items[0];
  const itemsPreview = order.items.map((item) => item.name).join(", ");

  return `
    <a class="dashboard-order glass-card" href="orders/detail.html?id=${order.id}">
      <img class="dashboard-order__photo" src="${resolveImageSrc(firstItem?.image)}" alt="${firstItem?.name ?? ""}" />
      <div class="dashboard-order__body">
        <div class="dashboard-order__top">
          <span class="dashboard-order__date">${formatDateTime(order.createdAt)}</span>
          <span class="badge ${getOrderStatusBadgeClass(status)}">${getOrderStatusName(status)}</span>
        </div>
        <p class="dashboard-order__items">${itemsPreview}</p>
      </div>
      <span class="dashboard-order__price">${formatPrice(order.totalPrice)}</span>
    </a>
  `;
}

function renderRecentOrders() {
  const orders = getOrders().slice(0, 5);

  if (orders.length === 0) {
    recentOrdersEl.innerHTML = "";
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  recentOrdersEl.innerHTML = orders.map(recentOrderHTML).join("");
}

renderStats();
renderRecentOrders();
