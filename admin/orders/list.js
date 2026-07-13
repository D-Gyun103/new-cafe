import { ORDER_STATUSES } from "../../js/data.js";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  formatPrice,
  formatDateTime,
  resolveImageSrc,
  getOrderStatusName,
  getOrderStatusBadgeClass,
  showToast,
  requireAdminAuth,
} from "../../js/utils.js";

requireAdminAuth();

const listEl = document.getElementById("order-list");
const emptyState = document.getElementById("empty-state");
const resultCount = document.getElementById("result-count");
const tabsEl = document.getElementById("status-tabs");

let activeStatus = "all";

function renderTabs() {
  ORDER_STATUSES.forEach((status) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.dataset.status = status.id;
    btn.textContent = status.name;
    tabsEl.appendChild(btn);
  });
}

function statusOptionsHTML(currentStatus) {
  return ORDER_STATUSES.map(
    (s) => `<option value="${s.id}" ${s.id === currentStatus ? "selected" : ""}>${s.name}</option>`
  ).join("");
}

function orderRowHTML(order) {
  const status = order.status ?? "received";
  const firstItem = order.items[0];
  const itemsPreview = order.items.map((item) => item.name).join(", ");

  return `
    <article class="order-row glass-card" data-order-id="${order.id}">
      <img class="order-row__photo" src="${resolveImageSrc(firstItem?.image)}" alt="${firstItem?.name ?? ""}" />
      <div class="order-row__body">
        <div class="order-row__top">
          <span class="order-row__date">${formatDateTime(order.createdAt)}</span>
          <span class="badge ${getOrderStatusBadgeClass(status)}">${getOrderStatusName(status)}</span>
        </div>
        <p class="order-row__items">${itemsPreview}</p>
        <div class="order-row__bottom">
          <span class="order-row__count">${order.totalCount}개</span>
          <span class="order-row__price">${formatPrice(order.totalPrice)}</span>
        </div>
      </div>
      <div class="order-row__actions">
        <select class="order-row__status-select" data-status-select aria-label="주문 상태 변경">
          ${statusOptionsHTML(status)}
        </select>
        <a class="btn btn-outline btn-sm" href="detail.html?id=${order.id}">상세</a>
        <button class="btn btn-danger btn-sm" data-delete-id="${order.id}" type="button">삭제</button>
      </div>
    </article>
  `;
}

function render() {
  const orders = getOrders().filter(
    (order) => activeStatus === "all" || (order.status ?? "received") === activeStatus
  );

  resultCount.textContent = `총 ${orders.length}건의 주문`;

  if (orders.length === 0) {
    listEl.innerHTML = "";
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  listEl.innerHTML = orders.map(orderRowHTML).join("");
}

tabsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  tabsEl.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
  btn.classList.add("is-active");
  activeStatus = btn.dataset.status;
  render();
});

listEl.addEventListener("change", (e) => {
  const select = e.target.closest("[data-status-select]");
  if (!select) return;
  const row = select.closest("[data-order-id]");
  updateOrderStatus(row.dataset.orderId, select.value);
  showToast("주문 상태가 변경되었습니다.");
  render();
});

listEl.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest("[data-delete-id]");
  if (!deleteBtn) return;
  if (confirm("이 주문을 삭제하시겠습니까?")) {
    deleteOrder(deleteBtn.dataset.deleteId);
    showToast("주문이 삭제되었습니다.");
    render();
  }
});

renderTabs();
render();
