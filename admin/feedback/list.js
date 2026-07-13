import { FEEDBACK_CATEGORIES } from "../../js/data.js";
import {
  getFeedbacks,
  deleteFeedback,
  formatDateTime,
  getFeedbackCategoryName,
  showToast,
  requireAdminAuth,
} from "../../js/utils.js";

requireAdminAuth();

const listEl = document.getElementById("feedback-list");
const emptyState = document.getElementById("empty-state");
const resultCount = document.getElementById("result-count");
const categoryTabsEl = document.getElementById("category-tabs");
const statusTabsEl = document.getElementById("status-tabs");

let activeCategory = "all";
let activeStatus = "all";

function renderCategoryTabs() {
  FEEDBACK_CATEGORIES.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.dataset.category = category.id;
    btn.textContent = category.name;
    categoryTabsEl.appendChild(btn);
  });
}

function feedbackRowHTML(feedback) {
  const isAnswered = Boolean(feedback.reply);

  return `
    <article class="feedback-row glass-card" data-feedback-id="${feedback.id}">
      <div class="feedback-row__body">
        <div class="feedback-row__top">
          <span class="badge badge-category">${getFeedbackCategoryName(feedback.category)}</span>
          <span class="badge ${isAnswered ? "badge-new" : "badge-best"}">${isAnswered ? "답변완료" : "미답변"}</span>
        </div>
        <h3 class="feedback-row__title">${feedback.title}</h3>
        <p class="feedback-row__excerpt">${feedback.content}</p>
        <div class="feedback-row__bottom">
          <span class="feedback-row__author">${feedback.authorName}</span>
          <span class="feedback-row__date">${formatDateTime(feedback.createdAt)}</span>
        </div>
      </div>
      <div class="feedback-row__actions">
        <a class="btn btn-outline btn-sm" href="detail.html?id=${feedback.id}">상세</a>
        <button class="btn btn-danger btn-sm" data-delete-id="${feedback.id}" type="button">삭제</button>
      </div>
    </article>
  `;
}

function render() {
  const feedbacks = getFeedbacks().filter((feedback) => {
    const matchesCategory = activeCategory === "all" || feedback.category === activeCategory;
    const isAnswered = Boolean(feedback.reply);
    const matchesStatus =
      activeStatus === "all" ||
      (activeStatus === "answered" && isAnswered) ||
      (activeStatus === "pending" && !isAnswered);
    return matchesCategory && matchesStatus;
  });

  resultCount.textContent = `총 ${feedbacks.length}건`;

  if (feedbacks.length === 0) {
    listEl.innerHTML = "";
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  listEl.innerHTML = feedbacks.map(feedbackRowHTML).join("");
}

categoryTabsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  categoryTabsEl.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
  btn.classList.add("is-active");
  activeCategory = btn.dataset.category;
  render();
});

statusTabsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  statusTabsEl.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
  btn.classList.add("is-active");
  activeStatus = btn.dataset.status;
  render();
});

listEl.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest("[data-delete-id]");
  if (!deleteBtn) return;
  if (confirm("이 건의사항을 삭제하시겠습니까?")) {
    deleteFeedback(deleteBtn.dataset.deleteId);
    showToast("삭제되었습니다.");
    render();
  }
});

renderCategoryTabs();
render();
