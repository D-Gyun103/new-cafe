import { CATEGORIES } from "../../js/data.js";
import {
  getMenus,
  deleteMenu,
  formatPrice,
  getCategoryName,
  resolveImageSrc,
  showToast,
  requireAdminAuth,
} from "../../js/utils.js";

const authed = await requireAdminAuth();

const grid = document.getElementById("menu-grid");
const emptyState = document.getElementById("empty-state");
const resultCount = document.getElementById("result-count");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const tabsEl = document.getElementById("category-tabs");

let allMenus = [];
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
  const card = document.createElement("article");
  card.className = `menu-card glass-card${menu.soldOut ? " is-soldout" : ""}`;

  const badges = [];
  if (menu.signature) {
    badges.push(`<span class="badge badge-signature">시그니처</span>`);
  }
  if (menu.badge) {
    const cls = menu.badge === "BEST" ? "badge-best" : "badge-new";
    badges.push(`<span class="badge ${cls}">${menu.badge}</span>`);
  }
  if (menu.soldOut) {
    badges.push(`<span class="badge badge-soldout">품절</span>`);
  }

  card.innerHTML = `
    <div class="menu-card__top">
      <img class="menu-card__image" src="${resolveImageSrc(menu.image)}" alt="${menu.name}" />
      <div class="menu-card__badges">${badges.join("")}</div>
    </div>
    <div class="menu-card__info">
      <span class="badge badge-category">${getCategoryName(menu.category)}</span>
      <h3 class="menu-card__name">${menu.name}</h3>
      <p class="menu-card__desc">${menu.description}</p>
    </div>
    <div class="menu-card__meta">
      <span class="menu-card__price">${formatPrice(menu.price)}</span>
    </div>
    <div class="menu-card__actions">
      <a class="btn btn-outline btn-sm" href="detail.html?id=${menu.id}">상세</a>
      <a class="btn btn-outline btn-sm" href="edit.html?id=${menu.id}">수정</a>
      <button class="btn btn-danger btn-sm" data-delete-id="${menu.id}" type="button">삭제</button>
    </div>
  `;
  return card;
}

function render() {
  const menus = allMenus.filter((menu) => {
    const matchesCategory = activeCategory === "all" || menu.category === activeCategory;
    const matchesKeyword = menu.name.toLowerCase().includes(keyword.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  grid.innerHTML = "";
  resultCount.textContent = `총 ${menus.length}개의 메뉴`;

  if (menus.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    menus.forEach((menu) => grid.appendChild(renderMenuCard(menu)));
  }
}

async function reload() {
  allMenus = await getMenus();
  render();
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

searchBtn.addEventListener("click", () => {
  keyword = searchInput.value.trim();
  render();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    keyword = searchInput.value.trim();
    render();
  }
});

grid.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest("[data-delete-id]");
  if (!deleteBtn) return;
  const id = deleteBtn.dataset.deleteId;
  if (confirm("이 메뉴를 삭제하시겠습니까?")) {
    await deleteMenu(id);
    showToast("메뉴가 삭제되었습니다.");
    reload();
  }
});

if (authed) {
  renderTabs();
  reload();
}
