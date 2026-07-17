import {
  getMenus,
  getOrders,
  getFeedbacks,
  formatPrice,
  formatDateTime,
  resolveImageSrc,
  getOrderStatusName,
  getOrderStatusBadgeClass,
  requireAdminAuth,
  logoutAdmin,
} from "../js/utils.js";

const authed = await requireAdminAuth();

const statsEl = document.getElementById("dashboard-stats");
const revenueEl = document.getElementById("dashboard-revenue");
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

function renderRevenue(orders) {
  const validOrders = orders.filter((order) => (order.status ?? "received") !== "canceled");
  const revenue = validOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  revenueEl.innerHTML = `
    <article class="revenue-banner">
      <div class="revenue-banner__info">
        <span class="revenue-banner__label">총 매출</span>
        <p class="revenue-banner__desc">취소된 주문을 제외한 ${validOrders.length}건의 주문 합계입니다.</p>
      </div>
      <strong class="revenue-banner__value">${formatPrice(revenue)}</strong>
    </article>
  `;
}

function renderStats(menus, orders, feedbacks) {
  const soldOutCount = menus.filter((menu) => menu.soldOut).length;
  const pendingFeedbackCount = feedbacks.filter((feedback) => !feedback.reply).length;

  statsEl.innerHTML = [
    statCardHTML("전체 메뉴", `${menus.length}개`),
    statCardHTML("품절 메뉴", `${soldOutCount}개`),
    statCardHTML("전체 주문", `${orders.length}건`),
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

function renderRecentOrders(orders) {
  const recent = orders.slice(0, 5);

  if (recent.length === 0) {
    recentOrdersEl.innerHTML = "";
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  recentOrdersEl.innerHTML = recent.map(recentOrderHTML).join("");
}

async function render() {
  const [menus, orders, feedbacks] = await Promise.all([getMenus(), getOrders(), getFeedbacks()]);
  renderRevenue(orders);
  renderStats(menus, orders, feedbacks);
  renderRecentOrders(orders);
}

if (authed) {
  render();
}

document.getElementById("logout-btn").addEventListener("click", async () => {
  await logoutAdmin();
  window.location.href = "login.html";
});
