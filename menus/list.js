import { CATEGORIES } from "../js/data.js";
import { getMenus, formatPrice, resolveImageSrc, updateCartBadge } from "../js/utils.js";

const root = document.getElementById("menu-root");
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

function menuCardHTML(menu) {
  const badges = [];
  if (menu.badge) {
    const cls = menu.badge === "BEST" ? "badge-best" : "badge-new";
    badges.push(`<span class="badge ${cls}">${menu.badge}</span>`);
  }

  return `
    <a class="menu-card glass-card${menu.soldOut ? " is-soldout" : ""}" href="detail.html?id=${menu.id}">
      <div class="menu-card__photo">
        <img src="${resolveImageSrc(menu.image)}" alt="${menu.name}" loading="lazy" />
        <div class="menu-card__badges">${badges.join("")}</div>
        ${menu.soldOut ? `<div class="menu-card__soldout-scrim"><span class="badge badge-soldout">품절</span></div>` : ""}
      </div>
      <div class="menu-card__body">
        <h3 class="menu-card__name">${menu.name}</h3>
        <p class="menu-card__desc">${menu.description}</p>
        <span class="menu-card__price">${formatPrice(menu.price)}</span>
      </div>
    </a>
  `;
}

function render() {
  const filtered = getMenus().filter((menu) =>
    menu.name.toLowerCase().includes(keyword.toLowerCase())
  );

  root.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  const categoriesToRender =
    activeCategory === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.id === activeCategory);

  categoriesToRender.forEach((category) => {
    const items = filtered.filter((menu) => menu.category === category.id);
    if (items.length === 0) return;

    const section = document.createElement("section");
    section.className = "menu-section";
    section.innerHTML = `
      <h2 class="menu-section__title">${category.name}</h2>
      <div class="menu-section__grid">${items.map(menuCardHTML).join("")}</div>
    `;
    root.appendChild(section);
  });

  if (!root.children.length) {
    emptyState.hidden = false;
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
updateCartBadge();
