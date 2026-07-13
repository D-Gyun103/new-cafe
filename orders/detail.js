import {
  getOrderById,
  formatPrice,
  formatDateTime,
  getQueryParam,
  resolveImageSrc,
} from "../js/utils.js";

const root = document.getElementById("order-detail-root");
const id = getQueryParam("id");
const order = id ? getOrderById(id) : null;

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
        <p>주문 내역을 찾을 수 없습니다.</p>
        <a class="btn btn-primary btn-sm" href="list.html">주문 내역으로</a>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="order-detail__card glass-card">
      <div class="order-detail__header">
        <span class="badge badge-new">주문완료</span>
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

      <a class="btn btn-primary btn-block" href="../menus/list.html">메뉴 더 보러 가기</a>
    </div>
  `;
}

render();
