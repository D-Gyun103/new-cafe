import { CATEGORIES, TEMPERATURES } from "../../js/data.js";
import { createMenu, showToast, resolveImageSrc, requireAdminAuth } from "../../js/utils.js";

requireAdminAuth();

const form = document.getElementById("menu-form");
const categorySelect = document.getElementById("category");
const temperatureField = document.getElementById("temperature-field");
const temperatureGroup = document.getElementById("temperature-group");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("image-preview");

function updateTemperatureFieldVisibility() {
  const isDessert = categorySelect.value === "dessert";
  temperatureField.hidden = isDessert;
  if (isDessert) {
    temperatureGroup.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  }
}

categorySelect.addEventListener("change", updateTemperatureFieldVisibility);

imagePreview.src = resolveImageSrc("");
imagePreview.addEventListener("error", () => {
  imagePreview.src = resolveImageSrc("");
});
imageInput.addEventListener("input", (e) => {
  imagePreview.src = resolveImageSrc(e.target.value.trim());
});

CATEGORIES.forEach((category) => {
  const option = document.createElement("option");
  option.value = category.id;
  option.textContent = category.name;
  categorySelect.appendChild(option);
});

TEMPERATURES.forEach((temp) => {
  const label = document.createElement("label");
  label.innerHTML = `
    <input type="checkbox" name="temperature" value="${temp.id}" />
    <span>${temp.name}</span>
  `;
  temperatureGroup.appendChild(label);
});

updateTemperatureFieldVisibility();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  const menu = createMenu({
    name: formData.get("name").trim(),
    image: formData.get("image").trim(),
    category: formData.get("category"),
    price: formData.get("price"),
    description: formData.get("description").trim(),
    temperatures: formData.getAll("temperature"),
    badge: formData.get("badge"),
    soldOut: formData.get("soldOut") === "on",
    signature: formData.get("signature") === "on",
  });

  showToast(`'${menu.name}' 메뉴가 추가되었습니다.`);
  setTimeout(() => {
    window.location.href = "list.html";
  }, 600);
});
