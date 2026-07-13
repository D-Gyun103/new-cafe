import { getMenus, formatPrice, resolveImageSrc, updateCartBadge } from "./js/utils.js";

const bestRoot = document.getElementById("best-root");

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

function render() {
  const bestMenus = getMenus()
    .filter((menu) => menu.badge === "BEST" && !menu.soldOut)
    .slice(0, 4);
  bestRoot.innerHTML = bestMenus.map(menuCardHTML).join("");
}

render();
updateCartBadge();
