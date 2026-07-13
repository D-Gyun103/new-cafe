import { CATEGORIES } from "./js/data.js";
import { getMenus, formatPrice, resolveImageSrc, updateCartBadge } from "./js/utils.js";

const bestRoot = document.getElementById("best-root");
const categoryRoot = document.getElementById("category-root");

function menuCardHTML(menu) {
  const badges = [];
  if (menu.badge) {
    const cls = menu.badge === "BEST" ? "badge-best" : "badge-new";
    badges.push(`<span class="badge ${cls}">${menu.badge}</span>`);
  }

  return `
    <a class="menu-card glass-card${menu.soldOut ? " is-soldout" : ""}" href="menus/detail.html?id=${menu.id}">
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

function renderBestMenus() {
  const bestMenus = getMenus()
    .filter((menu) => menu.badge === "BEST" && !menu.soldOut)
    .slice(0, 4);
  bestRoot.innerHTML = bestMenus.map(menuCardHTML).join("");
}

function renderCategoryTiles() {
  const menus = getMenus();
  categoryRoot.innerHTML = CATEGORIES.map((category) => {
    const sample =
      menus.find((menu) => menu.category === category.id && !menu.soldOut) ??
      menus.find((menu) => menu.category === category.id);
    return `
      <a class="category-tile" href="menus/list.html?category=${category.id}">
        <img src="${resolveImageSrc(sample?.image)}" alt="${category.name}" loading="lazy" />
        <span class="category-tile__label">${category.name}</span>
      </a>
    `;
  }).join("");
}

renderBestMenus();
renderCategoryTiles();
updateCartBadge();
