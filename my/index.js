import {
  getCurrentCustomer,
  updateCurrentCustomer,
  withdrawCurrentCustomer,
  requireCustomerAuth,
  renderAuthNav,
  initMobileNav,
  initBackLink,
  getCartCount,
  getCartTotal,
  getOrders,
  formatPrice,
  formatDateTime,
  updateCartBadge,
  getFeedbacksByCustomer,
  getFeedbackCategoryName,
  getQueryParam,
} from "../js/utils.js";

const authed = await requireCustomerAuth("../login.html");
renderAuthNav("../login.html", "../index.html");
initMobileNav();
initBackLink("../index.html");

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

const mypageTabs = document.getElementById("mypage-tabs");
const panelInfo = document.getElementById("panel-info");
const panelFeedback = document.getElementById("panel-feedback");
const myFeedbackRoot = document.getElementById("my-feedback-root");
const myFeedbackCount = document.getElementById("my-feedback-count");
const feedbackEmpty = document.getElementById("feedback-empty");

let currentCustomer = null;

async function renderProfile() {
  currentCustomer = await getCurrentCustomer();
  profileName.textContent = currentCustomer.name;
  profileEmail.textContent = currentCustomer.email;
  profileJoined.textContent = currentCustomer.joinedAt;
  profileAvatar.textContent = currentCustomer.name.slice(0, 1);
}

async function renderSummary() {
  const [cartTotal, orders] = await Promise.all([getCartTotal(), getOrders()]);
  basketCount.textContent = `${getCartCount()}개`;
  basketTotal.textContent = formatPrice(cartTotal);
  orderCount.textContent = `${orders.length}건`;
}

/** 목록에서는 요약만 보여주고, 누르면 feedback-detail.html에서 전체 내용과 답변을 볼 수 있다. */
function feedbackItemHTML(feedback) {
  const isAnswered = Boolean(feedback.reply);
  return `
    <a class="my-feedback-item glass-card" href="feedback-detail.html?id=${feedback.id}">
      <div class="my-feedback-item__top">
        <span class="badge badge-category">${getFeedbackCategoryName(feedback.category)}</span>
        <span class="badge ${isAnswered ? "badge-new" : "badge-best"}">${isAnswered ? "답변완료" : "답변대기"}</span>
        <span class="my-feedback-item__date">${formatDateTime(feedback.createdAt)}</span>
      </div>
      <h3 class="my-feedback-item__title">${feedback.title}</h3>
      <p class="my-feedback-item__content">${feedback.content}</p>
    </a>
  `;
}

async function renderMyFeedback() {
  const feedbacks = await getFeedbacksByCustomer(currentCustomer.id);

  myFeedbackCount.textContent = `총 ${feedbacks.length}건`;

  if (feedbacks.length === 0) {
    myFeedbackRoot.innerHTML = "";
    feedbackEmpty.hidden = false;
    return;
  }
  feedbackEmpty.hidden = true;
  myFeedbackRoot.innerHTML = feedbacks.map(feedbackItemHTML).join("");
}

function switchTab(tab) {
  mypageTabs.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === tab);
  });
  panelInfo.hidden = tab !== "info";
  panelFeedback.hidden = tab !== "feedback";
  if (tab === "feedback") renderMyFeedback();
}

mypageTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  switchTab(btn.dataset.tab);
});

function openEditForm() {
  nameInput.value = currentCustomer.name;
  emailInput.value = currentCustomer.email;
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

profileEditForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  if (!name || !email) return;

  await updateCurrentCustomer({ name, email });
  await renderProfile();
  closeEditForm();
});

withdrawBtn.addEventListener("click", async () => {
  const confirmed = confirm("정말 탈퇴하시겠습니까? 계정 정보가 삭제되며 되돌릴 수 없습니다.");
  if (!confirmed) return;

  await withdrawCurrentCustomer();
  alert("탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
  window.location.href = "../index.html";
});

if (authed) {
  await renderProfile();
  renderSummary();
  if (getQueryParam("tab") === "feedback") switchTab("feedback");
}
updateCartBadge();
