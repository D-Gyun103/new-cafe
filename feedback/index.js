import { FEEDBACK_CATEGORIES } from "../js/data.js";
import {
  createFeedback,
  showToast,
  updateCartBadge,
  requireCustomerAuth,
  renderAuthNav,
  initMobileNav,
} from "../js/utils.js";

await requireCustomerAuth("../login.html");
renderAuthNav("../login.html", "../index.html");
initMobileNav();

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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  await createFeedback({
    category: formData.get("category"),
    title: formData.get("title").trim(),
    content: formData.get("content").trim(),
  });

  submitBtn.disabled = false;
  showToast("소중한 의견 감사합니다. 접수되었습니다.");
  form.reset();
  categoryGroup.querySelector("input").checked = true;
});

updateCartBadge();
