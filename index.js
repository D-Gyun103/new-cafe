import { CATEGORIES } from "./js/data.js";
import {
  getMenus,
  formatPrice,
  resolveImageSrc,
  updateCartBadge,
  renderAuthNav,
  getBeanOrigins,
  initMobileNav,
} from "./js/utils.js";

const bestRoot = document.getElementById("best-root");
const categoryRoot = document.getElementById("category-root");
const heroBeansRoot = document.getElementById("hero-beans");
const heroTodayRoot = document.getElementById("hero-slide-today");
const heroSignatureRoot = document.getElementById("hero-signature");

function menuCardHTML(menu) {
  const badges = [];
  if (menu.signature) {
    badges.push(`<span class="badge badge-signature">시그니처</span>`);
  }
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

function renderBestMenus(menus) {
  const bestMenus = menus.filter((menu) => menu.badge === "BEST" && !menu.soldOut).slice(0, 4);
  bestRoot.innerHTML = bestMenus.map(menuCardHTML).join("");
}

function renderCategoryTiles(menus) {
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

function renderHeroBeans(beanOrigins) {
  if (!heroBeansRoot) return;
  heroBeansRoot.innerHTML = beanOrigins
    .map(
      (origin) => `
        <div class="hero__bean">
          <strong>${origin.name}${origin.soldOut ? " (품절)" : ""}</strong>
          <span>${origin.desc}</span>
        </div>
      `
    )
    .join("");
}

/** 날짜가 바뀌면 다른 메뉴가 나오도록, 연중 일수를 이용해 오늘의 메뉴를 정한다. */
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function renderHeroToday(menus) {
  if (!heroTodayRoot) return;
  const available = menus.filter((menu) => !menu.soldOut);
  if (available.length === 0) return;
  const pick = available[getDayOfYear(new Date()) % available.length];

  heroTodayRoot.innerHTML = `
    <div class="hero__media">
      <img src="${resolveImageSrc(pick.image)}" alt="" />
    </div>
    <div class="hero__overlay"></div>
    <div class="hero__content container">
      <p class="eyebrow">Today's Pick</p>
      <h1 class="hero__title">오늘의 추천 메뉴<br />${pick.name}</h1>
      <p class="hero__desc">${pick.description}</p>
      <div class="hero__actions">
        <a class="btn btn-primary" href="menus/detail.html?id=${pick.id}">자세히 보기</a>
      </div>
    </div>
  `;
}

function renderHeroSignature(menus) {
  if (!heroSignatureRoot) return;
  const signatureMenus = menus.filter((menu) => menu.signature);
  heroSignatureRoot.innerHTML = signatureMenus
    .map(
      (menu) => `
        <a class="hero__signature-card" href="menus/detail.html?id=${menu.id}">
          <img src="${resolveImageSrc(menu.image)}" alt="${menu.name}" loading="lazy" />
          <div class="hero__signature-card__info">
            <strong>${menu.name}</strong>
            <span>${formatPrice(menu.price)}</span>
          </div>
        </a>
      `
    )
    .join("");
}

/* ===== 히어로 자동 전환 캐러셀 (20초 주기 + 호버 시 좌우 버튼) ===== */
const HERO_INTERVAL = 20000;
const heroSlides = document.querySelectorAll(".hero__slide");
const heroPrevBtn = document.getElementById("hero-prev");
const heroNextBtn = document.getElementById("hero-next");
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === heroIndex));
}

function startHeroAutoplay() {
  clearInterval(heroTimer);
  if (heroSlides.length > 1) {
    heroTimer = setInterval(() => showHeroSlide(heroIndex + 1), HERO_INTERVAL);
  }
}

heroNextBtn?.addEventListener("click", () => {
  showHeroSlide(heroIndex + 1);
  startHeroAutoplay();
});

heroPrevBtn?.addEventListener("click", () => {
  showHeroSlide(heroIndex - 1);
  startHeroAutoplay();
});

async function init() {
  const [menus, beanOrigins] = await Promise.all([getMenus(), getBeanOrigins()]);
  renderBestMenus(menus);
  renderCategoryTiles(menus);
  renderHeroBeans(beanOrigins);
  renderHeroToday(menus);
  renderHeroSignature(menus);
  startHeroAutoplay();
}

init();
updateCartBadge();
renderAuthNav("login.html", "index.html");
initMobileNav();
