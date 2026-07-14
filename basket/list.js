import {
  getCart,
  getMenuById,
  updateCartItemQty,
  removeFromCart,
  createOrder,
  formatPrice,
  resolveImageSrc,
  showToast,
  updateCartBadge,
  renderAuthNav,
  initMobileNav,
  getBeanOriginName,
  getSizeOptionName,
  getShotOptionName,
  getWaterOptionName,
  getIceOptionName,
  getMenuUnitPrice,
} from "../js/utils.js";

const root = document.getElementById("basket-root");
const emptyState = document.getElementById("empty-state");
const summaryEl = document.getElementById("basket-summary");
const summaryCount = document.getElementById("summary-count");
const summaryTotal = document.getElementById("summary-total");
const orderBtn = document.getElementById("order-btn");

function basketItemHTML(item, menu) {
  return `
    <div class="basket-item glass-card" data-cart-item-id="${item.cartItemId}">
      <div class="basket-item__photo">
        <img src="${resolveImageSrc(menu.image)}" alt="${menu.name}" loading="lazy" />
      </div>
      <div class="basket-item__body">
        <div class="basket-item__top">
          <h3 class="basket-item__name">${menu.name}</h3>
          <button class="basket-item__remove" type="button" aria-label="삭제">✕</button>
        </div>
        <div class="basket-item__badges">
          ${item.temperature ? `<span class="badge badge-category">${item.temperature}</span>` : ""}
          ${item.size ? `<span class="badge badge-category">${getSizeOptionName(item.size)}</span>` : ""}
          ${item.origin ? `<span class="badge badge-category">${getBeanOriginName(item.origin)}</span>` : ""}
          ${getShotOptionName(item.shotOption) ? `<span class="badge badge-category">${getShotOptionName(item.shotOption)}</span>` : ""}
          ${getWaterOptionName(item.waterAmount) ? `<span class="badge badge-category">${getWaterOptionName(item.waterAmount)}</span>` : ""}
          ${getIceOptionName(item.iceAmount) ? `<span class="badge badge-category">${getIceOptionName(item.iceAmount)}</span>` : ""}
        </div>
        ${item.request ? `<p class="basket-item__request">요청사항: ${item.request}</p>` : ""}
        <div class="basket-item__bottom">
          <div class="quantity-stepper quantity-stepper--sm">
            <button type="button" class="qty-minus">−</button>
            <span>${item.quantity}</span>
            <button type="button" class="qty-plus">+</button>
          </div>
          <span class="basket-item__price">${formatPrice(getMenuUnitPrice(menu, item.size) * item.quantity)}</span>
        </div>
      </div>
    </div>
  `;
}

function render() {
  const cart = getCart();
  const items = cart
    .map((item) => ({ item, menu: getMenuById(item.menuId) }))
    .filter(({ menu }) => menu);

  if (items.length === 0) {
    root.innerHTML = "";
    emptyState.hidden = false;
    summaryEl.hidden = true;
    updateCartBadge();
    return;
  }

  emptyState.hidden = true;
  summaryEl.hidden = false;
  root.innerHTML = items.map(({ item, menu }) => basketItemHTML(item, menu)).join("");

  const totalCount = items.reduce((sum, { item }) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, { item, menu }) => sum + item.quantity * getMenuUnitPrice(menu, item.size),
    0
  );
  summaryCount.textContent = `${totalCount}개`;
  summaryTotal.textContent = formatPrice(totalPrice);
  updateCartBadge();
}

root.addEventListener("click", (e) => {
  const card = e.target.closest(".basket-item");
  if (!card) return;
  const cartItemId = card.dataset.cartItemId;
  const item = getCart().find((i) => i.cartItemId === cartItemId);
  if (!item) return;

  if (e.target.closest(".qty-minus")) {
    if (item.quantity <= 1) return;
    updateCartItemQty(cartItemId, item.quantity - 1);
    render();
  } else if (e.target.closest(".qty-plus")) {
    updateCartItemQty(cartItemId, item.quantity + 1);
    render();
  } else if (e.target.closest(".basket-item__remove")) {
    removeFromCart(cartItemId);
    render();
  }
});

orderBtn.addEventListener("click", () => {
  const order = createOrder();
  if (!order) return;
  showToast("주문이 완료되었습니다.");
  updateCartBadge();
  setTimeout(() => {
    window.location.href = `../orders/detail.html?id=${order.id}`;
  }, 700);
});

render();
renderAuthNav("../login.html", "../index.html");
initMobileNav();
