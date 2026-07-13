import { loginAdmin, isAdminAuthed } from "../js/utils.js";

if (isAdminAuthed()) {
  window.location.href = "index.html";
}

const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");
const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("password-toggle");

passwordToggle.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  passwordToggle.textContent = showing ? "보기" : "숨기기";
  passwordToggle.setAttribute("aria-label", showing ? "비밀번호 표시" : "비밀번호 숨기기");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const username = formData.get("username").trim();
  const password = formData.get("password").trim();

  if (loginAdmin(username, password)) {
    window.location.href = "index.html";
    return;
  }

  errorEl.hidden = false;
});
