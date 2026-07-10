import { CATEGORIES, TEMPERATURES } from "../../js/data.js";
import { createMenu, showToast } from "../../js/utils.js";

const form = document.getElementById("menu-form");
const categorySelect = document.getElementById("category");
const temperatureGroup = document.getElementById("temperature-group");

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
  });

  showToast(`'${menu.name}' 메뉴가 추가되었습니다.`);
  setTimeout(() => {
    window.location.href = "list.html";
  }, 600);
});
