import { FEEDBACK_CATEGORIES } from "../js/data.js";
import {
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  formatDateTime,
  getFeedbackCategoryName,
  getQueryParam,
  requireCustomerAuth,
  renderAuthNav,
  initMobileNav,
  initBackLink,
  updateCartBadge,
  showToast,
} from "../js/utils.js";

const authed = await requireCustomerAuth("../login.html");
renderAuthNav("../login.html", "../index.html");
initMobileNav();
initBackLink("index.html?tab=feedback");
updateCartBadge();

const root = document.getElementById("feedback-detail-root");
let feedback = null;
let editing = false;

function notFoundHTML() {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">😕</div>
      <p>건의사항을 찾을 수 없습니다.</p>
      <a class="btn btn-primary btn-sm" href="index.html?tab=feedback">마이페이지로</a>
    </div>
  `;
}

function viewHTML() {
  const isAnswered = Boolean(feedback.reply);
  return `
    <div class="feedback-detail__card glass-card">
      <div class="feedback-detail__header">
        <div class="feedback-detail__badges">
          <span class="badge badge-category">${getFeedbackCategoryName(feedback.category)}</span>
          <span class="badge ${isAnswered ? "badge-new" : "badge-best"}">${isAnswered ? "답변완료" : "답변대기"}</span>
        </div>
        <span class="feedback-detail__date">${formatDateTime(feedback.createdAt)}</span>
      </div>

      <h1 class="feedback-detail__title">${feedback.title}</h1>

      <div class="feedback-detail__section">
        <h3>내용</h3>
        <p class="feedback-detail__content">${feedback.content}</p>
      </div>

      <div class="feedback-detail__section">
        <h3>운영진 답변</h3>
        ${
          isAnswered
            ? `<p class="feedback-detail__content">${feedback.reply}</p>
               <span class="feedback-detail__reply-date">${formatDateTime(feedback.repliedAt)}</span>`
            : `<p class="feedback-detail__pending">아직 답변이 등록되지 않았습니다.</p>`
        }
      </div>

      ${
        isAnswered
          ? ""
          : `
            <div class="feedback-detail__actions">
              <button class="btn btn-outline btn-sm" id="edit-btn" type="button">수정</button>
              <button class="btn btn-danger btn-sm" id="delete-btn" type="button">삭제</button>
            </div>
          `
      }
    </div>
  `;
}

function editFormHTML() {
  return `
    <form class="feedback-detail__card glass-card" id="edit-form">
      <div class="field">
        <label for="edit-category">구분</label>
        <select id="edit-category" name="category">
          ${FEEDBACK_CATEGORIES.map(
            (c) => `<option value="${c.id}" ${c.id === feedback.category ? "selected" : ""}>${c.name}</option>`
          ).join("")}
        </select>
      </div>
      <div class="field">
        <label for="edit-title">제목</label>
        <input type="text" id="edit-title" name="title" value="${feedback.title}" required />
      </div>
      <div class="field">
        <label for="edit-content">내용</label>
        <textarea id="edit-content" name="content" required>${feedback.content}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline btn-sm" id="cancel-edit-btn">취소</button>
        <button type="submit" class="btn btn-primary btn-sm">저장</button>
      </div>
    </form>
  `;
}

function render() {
  if (!feedback) {
    root.innerHTML = notFoundHTML();
    return;
  }

  root.innerHTML = editing ? editFormHTML() : viewHTML();

  if (editing) {
    document.getElementById("cancel-edit-btn").addEventListener("click", () => {
      editing = false;
      render();
    });
    document.getElementById("edit-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      feedback = await updateFeedback(feedback.id, {
        category: formData.get("category"),
        title: formData.get("title").trim(),
        content: formData.get("content").trim(),
      });
      editing = false;
      showToast("수정되었습니다.");
      render();
    });
    return;
  }

  document.getElementById("edit-btn")?.addEventListener("click", () => {
    editing = true;
    render();
  });
  document.getElementById("delete-btn")?.addEventListener("click", async () => {
    if (!confirm("이 건의사항을 삭제하시겠습니까?")) return;
    await deleteFeedback(feedback.id);
    showToast("삭제되었습니다.");
    window.location.href = "index.html?tab=feedback";
  });
}

if (authed) {
  const id = getQueryParam("id");
  feedback = id ? await getFeedbackById(id) : null;
  render();
}
