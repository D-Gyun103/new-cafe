import { ORDER_STATUSES } from "../../js/data.js";
import {
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  formatPrice,
  formatDateTime,
  getQueryParam,
  resolveImageSrc,
  getOrderStatusName,
  getOrderStatusBadgeClass,
  showToast,
} from "../../js/utils.js";

const root = document.getElementById("order-detail-root");
const id = getQueryParam("id");
let order = id ? getOrderById(id) : null;

function itemRowHTML(item) {
  return `
    <div class="order-item">
      <div class="order-item__photo">
        <img src="${resolveImageSrc(item.image)}" alt="${item.name}" loading="lazy" />
      </div>
      <div class="order-item__body">
        <div class="order-item__top">
          <h3 class="order-item__name">${item.name}</h3>
          <span class="order-item__subtotal">${formatPrice(item.subtotal)}</span>
        </div>
        <div class="order-item__meta">
          ${item.temperature ? `<span class="badge badge-category">${item.temperature}</span>` : ""}
          <span class="order-item__qty">${formatPrice(item.price)} · ${item.quantity}개</span>
        </div>
      </div>
    </div>
  `;
}

function render() {
  if (!order) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">😕</div>
        <p>주문을 찾을 수 없습니다.</p>
        <a class="btn btn-primary btn-sm" href="list.html">주문 목록으로</a>
      </div>
    `;
    return;
  }

  const status = order.status ?? "received";
  const statusOptions = ORDER_STATUSES.map(
    (s) => `<option value="${s.id}" ${s.id === status ? "selected" : ""}>${s.name}</option>`
  ).join("");

  root.innerHTML = `
    <div class="order-detail__card glass-card">
      <div class="order-detail__header">
        <span class="badge ${getOrderStatusBadgeClass(status)}">${getOrderStatusName(status)}</span>
        <span class="order-detail__date">${formatDateTime(order.createdAt)}</span>
      </div>

      <div class="order-detail__items">
        ${order.items.map(itemRowHTML).join("")}
      </div>

      <div class="order-detail__summary">
        <div class="order-detail__summary-row">
          <span>총 수량</span>
          <span>${order.totalCount}개</span>
        </div>
        <div class="order-detail__summary-row order-detail__summary-row--total">
          <span>총 결제금액</span>
          <span>${formatPrice(order.totalPrice)}</span>
        </div>
      </div>

      <div class="order-detail__section">
        <h3>주문 상태 변경</h3>
        <select id="status-select" class="order-detail__status-select">${statusOptions}</select>
      </div>

      <div class="order-detail__actions">
        <button class="btn btn-danger btn-block" id="delete-btn" type="button">주문 삭제</button>
      </div>
    </div>
  `;

  document.getElementById("status-select").addEventListener("change", (e) => {
    order = updateOrderStatus(order.id, e.target.value);
    showToast("주문 상태가 변경되었습니다.");
    render();
  });

  document.getElementById("delete-btn").addEventListener("click", () => {
    if (confirm("이 주문을 삭제하시겠습니까?")) {
      deleteOrder(order.id);
      showToast("주문이 삭제되었습니다.");
      window.location.href = "list.html";
    }
  });
}

render();
