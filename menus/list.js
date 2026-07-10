import { CATEGORIES } from "../js/data.js";
import { getMenus, formatPrice } from "../js/utils.js";

const grid = document.getElementById("menu-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const tabsEl = document.getElementById("category-tabs");

let activeCategory = "all";
let keyword = "";

function renderTabs() {
  CATEGORIES.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.dataset.category = category.id;
    btn.textContent = category.name;
    tabsEl.appendChild(btn);
  });
}

function renderMenuCard(menu) {
  const card = document.createElement("a");
  card.className = `menu-card glass-card${menu.soldOut ? " is-soldout" : ""}`;
  card.href = `detail.html?id=${menu.id}`;

  const badges = [];
  if (menu.badge) {
    const cls = menu.badge === "BEST" ? "badge-best" : "badge-new";
    badges.push(`<span class="badge ${cls}">${menu.badge}</span>`);
  }
  if (menu.soldOut) {
    badges.push(`<span class="badge badge-soldout">품절</span>`);
  }

  card.innerHTML = `
    <div class="menu-card__badges">${badges.join("")}</div>
    <div class="menu-card__image">${menu.image}</div>
    <h3 class="menu-card__name">${menu.name}</h3>
    <p class="menu-card__desc">${menu.description}</p>
    <span class="menu-card__price">${formatPrice(menu.price)}</span>
  `;
  return card;
}

function render() {
  const menus = getMenus().filter((menu) => {
    const matchesCategory = activeCategory === "all" || menu.category === activeCategory;
    const matchesKeyword = menu.name.toLowerCase().includes(keyword.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  grid.innerHTML = "";

  if (menus.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    menus.forEach((menu) => grid.appendChild(renderMenuCard(menu)));
  }
}

tabsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  tabsEl.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
  btn.classList.add("is-active");
  activeCategory = btn.dataset.category;
  render();
});

searchInput.addEventListener("input", (e) => {
  keyword = e.target.value.trim();
  render();
});

renderTabs();
render();
