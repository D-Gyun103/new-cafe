import {
  getFeedbackById,
  replyToFeedback,
  deleteFeedback,
  formatDateTime,
  getFeedbackCategoryName,
  getQueryParam,
  showToast,
  requireAdminAuth,
} from "../../js/utils.js";

const authed = await requireAdminAuth();

const root = document.getElementById("feedback-detail-root");
const id = getQueryParam("id");
let feedback = null;

function render() {
  if (!feedback) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">😕</div>
        <p>건의사항을 찾을 수 없습니다.</p>
        <a class="btn btn-primary btn-sm" href="list.html">건의함 목록으로</a>
      </div>
    `;
    return;
  }

  const isAnswered = Boolean(feedback.reply);

  root.innerHTML = `
    <div class="feedback-detail__card glass-card">
      <div class="feedback-detail__header">
        <div class="feedback-detail__badges">
          <span class="badge badge-category">${getFeedbackCategoryName(feedback.category)}</span>
          <span class="badge ${isAnswered ? "badge-new" : "badge-best"}">${isAnswered ? "답변완료" : "미답변"}</span>
        </div>
        <span class="feedback-detail__date">${formatDateTime(feedback.createdAt)}</span>
      </div>

      <div>
        <h1 class="feedback-detail__title">${feedback.title}</h1>
        <p class="feedback-detail__author">${feedback.authorName} · ${feedback.authorEmail}</p>
      </div>

      <div class="feedback-detail__section">
        <h3>내용</h3>
        <p class="feedback-detail__content">${feedback.content}</p>
      </div>

      <div class="feedback-detail__section">
        <h3>답변</h3>
        <textarea id="reply-input" class="feedback-detail__reply-input" placeholder="답변을 입력해주세요.">${feedback.reply ?? ""}</textarea>
        ${feedback.repliedAt ? `<span class="hint">최근 답변: ${formatDateTime(feedback.repliedAt)}</span>` : ""}
        <button class="btn btn-primary" id="reply-btn" type="button">${isAnswered ? "답변 수정" : "답변 등록"}</button>
      </div>

      <div class="feedback-detail__actions">
        <button class="btn btn-danger btn-block" id="delete-btn" type="button">건의사항 삭제</button>
      </div>
    </div>
  `;

  document.getElementById("reply-btn").addEventListener("click", async () => {
    const replyText = document.getElementById("reply-input").value.trim();
    if (!replyText) {
      showToast("답변 내용을 입력해주세요.");
      return;
    }
    feedback = await replyToFeedback(feedback.id, replyText);
    showToast("답변이 저장되었습니다.");
    render();
  });

  document.getElementById("delete-btn").addEventListener("click", async () => {
    if (confirm("이 건의사항을 삭제하시겠습니까?")) {
      await deleteFeedback(feedback.id);
      showToast("삭제되었습니다.");
      window.location.href = "list.html";
    }
  });
}

if (authed) {
  feedback = id ? await getFeedbackById(id) : null;
  render();
}
