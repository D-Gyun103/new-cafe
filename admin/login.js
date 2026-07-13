import { loginAdmin, isAdminAuthed } from "../js/utils.js";

if (isAdminAuthed()) {
  window.location.href = "index.html";
}

const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");

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
