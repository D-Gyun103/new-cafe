import {
  getMenuById,
  deleteMenu,
  formatPrice,
  getCategoryName,
  getQueryParam,
  resolveImageSrc,
  showToast,
} from "../../js/utils.js";

const root = document.getElementById("menu-detail-root");
const id = getQueryParam("id");
const menu = id ? getMenuById(id) : null;

function render() {
  if (!menu) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">😕</div>
        <p>메뉴를 찾을 수 없습니다.</p>
        <a class="btn btn-primary btn-sm" href="list.html">메뉴 목록으로</a>
      </div>
    `;
    return;
  }

  const badges = [];
  if (menu.badge) {
    const cls = menu.badge === "BEST" ? "badge-best" : "badge-new";
    badges.push(`<span class="badge ${cls}">${menu.badge}</span>`);
  }
  badges.push(`<span class="badge badge-category">${getCategoryName(menu.category)}</span>`);

  const temps = menu.temperatures.length
    ? menu.temperatures.map((t) => `<span class="badge badge-category">${t}</span>`).join("")
    : `<span class="hint">온도 옵션 없음</span>`;

  root.innerHTML = `
    <div class="menu-detail__card glass-card">
      <div class="menu-detail__top">
        <img class="menu-detail__image" src="${resolveImageSrc(menu.image)}" alt="${menu.name}" />
        <div class="menu-detail__heading">
          <div class="menu-detail__badges">${badges.join("")}</div>
          <h1 class="menu-detail__name">${menu.name}</h1>
          <span class="menu-detail__price">${formatPrice(menu.price)}</span>
        </div>
      </div>

      <div class="menu-detail__section">
        <h3>메뉴 설명</h3>
        <p>${menu.description}</p>
      </div>

      <div class="menu-detail__section">
        <h3>온도 옵션</h3>
        <div class="menu-detail__temps">${temps}</div>
      </div>

      <div class="menu-detail__section">
        <h3>판매 상태</h3>
        <p class="menu-detail__status ${menu.soldOut ? "is-soldout" : "is-open"}">
          ${menu.soldOut ? "품절" : "판매 중"}
        </p>
      </div>

      <div class="menu-detail__actions">
        <a class="btn btn-outline btn-block" href="edit.html?id=${menu.id}">수정</a>
        <button class="btn btn-danger btn-block" id="delete-btn" type="button">삭제</button>
      </div>
    </div>
  `;

  document.getElementById("delete-btn").addEventListener("click", () => {
    if (confirm("이 메뉴를 삭제하시겠습니까?")) {
      deleteMenu(menu.id);
      showToast("메뉴가 삭제되었습니다.");
      window.location.href = "list.html";
    }
  });
}

render();
