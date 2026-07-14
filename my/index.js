import {
  getCurrentCustomer,
  updateCurrentCustomer,
  withdrawCurrentCustomer,
  requireCustomerAuth,
  renderAuthNav,
  initMobileNav,
  getCartCount,
  getCartTotal,
  getOrders,
  formatPrice,
  formatDateTime,
  updateCartBadge,
  getFeedbacksByCustomer,
  getFeedbackCategoryName,
} from "../js/utils.js";

const authed = requireCustomerAuth("../login.html");
renderAuthNav("../login.html", "../index.html");
initMobileNav();

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

function renderProfile() {
  const customer = getCurrentCustomer();
  profileName.textContent = customer.name;
  profileEmail.textContent = customer.email;
  profileJoined.textContent = customer.joinedAt;
  profileAvatar.textContent = customer.name.slice(0, 1);
}

function renderSummary() {
  basketCount.textContent = `${getCartCount()}개`;
  basketTotal.textContent = formatPrice(getCartTotal());
  orderCount.textContent = `${getOrders().length}건`;
}

/** 내가 쓴 건의·불편사항과, 운영진이 남긴 답변을 함께 보여준다. */
function feedbackItemHTML(feedback) {
  const isAnswered = Boolean(feedback.reply);
  return `
    <article class="my-feedback-item glass-card">
      <div class="my-feedback-item__top">
        <span class="badge badge-category">${getFeedbackCategoryName(feedback.category)}</span>
        <span class="badge ${isAnswered ? "badge-new" : "badge-best"}">${isAnswered ? "답변완료" : "답변대기"}</span>
        <span class="my-feedback-item__date">${formatDateTime(feedback.createdAt)}</span>
      </div>
      <h3 class="my-feedback-item__title">${feedback.title}</h3>
      <p class="my-feedback-item__content">${feedback.content}</p>
      ${
        isAnswered
          ? `
            <div class="my-feedback-item__reply">
              <p class="my-feedback-item__reply-label">운영진 답변 · ${formatDateTime(feedback.repliedAt)}</p>
              <p class="my-feedback-item__reply-content">${feedback.reply}</p>
            </div>
          `
          : `<p class="my-feedback-item__pending">아직 답변이 등록되지 않았습니다.</p>`
      }
    </article>
  `;
}

function renderMyFeedback() {
  const customer = getCurrentCustomer();
  const feedbacks = getFeedbacksByCustomer(customer.id).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

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
  const customer = getCurrentCustomer();
  nameInput.value = customer.name;
  emailInput.value = customer.email;
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

  updateCurrentCustomer({ name, email });
  renderProfile();
  closeEditForm();
});

withdrawBtn.addEventListener("click", () => {
  const confirmed = confirm("정말 탈퇴하시겠습니까? 계정 정보가 삭제되며 되돌릴 수 없습니다.");
  if (!confirmed) return;

  withdrawCurrentCustomer();
  alert("탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
  window.location.href = "../index.html";
});

if (authed) {
  renderProfile();
  renderSummary();
}
updateCartBadge();
