import {
  getProfile,
  saveProfile,
  resetCustomerData,
  getCartCount,
  getCartTotal,
  getOrders,
  formatPrice,
  updateCartBadge,
} from "../js/utils.js";

const profileAvatar = document.getElementById("profile-avatar");
const profileView = document.getElementById("profile-view");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileJoined = document.getElementById("profile-joined");

const editProfileBtn = document.getElementById("edit-profile-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const profileEditForm = document.getElementById("profile-edit-form");
const nameInput = document.getElementById("name-input");
const emailInput = document.getElementById("email-input");

const basketCount = document.getElementById("basket-count");
const basketTotal = document.getElementById("basket-total");
const orderCount = document.getElementById("order-count");

const withdrawBtn = document.getElementById("withdraw-btn");

function renderProfile() {
  const profile = getProfile();
  profileName.textContent = profile.name;
  profileEmail.textContent = profile.email;
  profileJoined.textContent = profile.joinedAt;
  profileAvatar.textContent = profile.name.slice(0, 1);
}

function renderSummary() {
  basketCount.textContent = `${getCartCount()}개`;
  basketTotal.textContent = formatPrice(getCartTotal());
  orderCount.textContent = `${getOrders().length}건`;
}

function openEditForm() {
  const profile = getProfile();
  nameInput.value = profile.name;
  emailInput.value = profile.email;
  profileView.hidden = true;
  profileEditForm.hidden = false;
  nameInput.focus();
}

function closeEditForm() {
  profileEditForm.hidden = true;
  profileView.hidden = false;
}

editProfileBtn.addEventListener("click", openEditForm);
cancelEditBtn.addEventListener("click", closeEditForm);

profileEditForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  if (!name || !email) return;

  saveProfile({ name, email });
  renderProfile();
  closeEditForm();
});

withdrawBtn.addEventListener("click", () => {
  const confirmed = confirm(
    "정말 탈퇴하시겠습니까? 프로필 정보와 장바구니, 주문 내역이 모두 삭제되며 되돌릴 수 없습니다."
  );
  if (!confirmed) return;

  resetCustomerData();
  alert("탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
  window.location.href = "../index.html";
});

renderProfile();
renderSummary();
updateCartBadge();
