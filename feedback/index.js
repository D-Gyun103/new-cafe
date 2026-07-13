import { FEEDBACK_CATEGORIES } from "../js/data.js";
import { createFeedback, showToast, updateCartBadge } from "../js/utils.js";

const form = document.getElementById("feedback-form");
const categoryGroup = document.getElementById("category-group");

categoryGroup.innerHTML = FEEDBACK_CATEGORIES.map(
  (category, index) => `
    <label>
      <input type="radio" name="category" value="${category.id}" ${index === 0 ? "checked" : ""} />
      <span>${category.name}</span>
    </label>
  `
).join("");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  createFeedback({
    category: formData.get("category"),
    title: formData.get("title").trim(),
    content: formData.get("content").trim(),
  });

  showToast("소중한 의견 감사합니다. 접수되었습니다.");
  form.reset();
  categoryGroup.querySelector("input").checked = true;
});

updateCartBadge();
