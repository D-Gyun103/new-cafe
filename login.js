import { loginCustomer, isCustomerAuthed } from "./js/utils.js";

const params = new URLSearchParams(window.location.search);
const redirect = params.get("redirect");
const defaultTarget = "my/index.html";

if (isCustomerAuthed()) {
  window.location.href = redirect || defaultTarget;
}

const signupLink = document.getElementById("signup-link");
if (redirect) {
  signupLink.href = `signup.html?redirect=${encodeURIComponent(redirect)}`;
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

  if (loginCustomer(username, password)) {
    window.location.href = redirect || defaultTarget;
    return;
  }

  errorEl.hidden = false;
});
