import { registerCustomer, isCustomerAuthed } from "./js/utils.js";

const params = new URLSearchParams(window.location.search);
const redirect = params.get("redirect");
const defaultTarget = "my/index.html";

if (isCustomerAuthed()) {
  window.location.href = redirect || defaultTarget;
}

const loginLink = document.getElementById("login-link");
if (redirect) {
  loginLink.href = `login.html?redirect=${encodeURIComponent(redirect)}`;
}

const form = document.getElementById("signup-form");
const errorEl = document.getElementById("signup-error");
const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("password-toggle");

passwordToggle.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  passwordToggle.textContent = showing ? "보기" : "숨기기";
  passwordToggle.setAttribute("aria-label", showing ? "비밀번호 표시" : "비밀번호 숨기기");
});

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const username = formData.get("username").trim();
  const password = formData.get("password").trim();
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();

  if (!username || !password || !name || !email) return;

  const result = registerCustomer({ username, password, name, email });
  if (!result.ok) {
    showError(result.error);
    return;
  }

  window.location.href = redirect || defaultTarget;
});
