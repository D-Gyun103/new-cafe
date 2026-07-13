import { CATEGORIES, TEMPERATURES } from "../../js/data.js";
import {
  getMenuById,
  updateMenu,
  getQueryParam,
  showToast,
  resolveImageSrc,
  requireAdminAuth,
} from "../../js/utils.js";

requireAdminAuth();

const root = document.getElementById("menu-form-root");
const id = getQueryParam("id");
const menu = id ? getMenuById(id) : null;

function categoryOptions() {
  return CATEGORIES.map(
    (c) => `<option value="${c.id}" ${c.id === menu.category ? "selected" : ""}>${c.name}</option>`
  ).join("");
}

function temperatureCheckboxes() {
  return TEMPERATURES.map(
    (t) => `
      <label>
        <input type="checkbox" name="temperature" value="${t.id}" ${
          menu.temperatures.includes(t.id) ? "checked" : ""
        } />
        <span>${t.name}</span>
      </label>
    `
  ).join("");
}

function badgeOptions() {
  const options = [
    { value: "", label: "없음" },
    { value: "BEST", label: "BEST" },
    { value: "NEW", label: "NEW" },
  ];
  return options
    .map(
      (o) =>
        `<option value="${o.value}" ${o.value === (menu.badge ?? "") ? "selected" : ""}>${o.label}</option>`
    )
    .join("");
}

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

  root.innerHTML = `
    <form class="glass-card menu-form" id="menu-form">
      <div class="menu-form__layout">
        <div class="menu-form__media">
          <div class="menu-form__preview">
            <img id="image-preview" src="${resolveImageSrc(menu.image)}" alt="${menu.name} 미리보기" />
          </div>
          <div class="field">
            <label for="image">이미지 URL</label>
            <input type="text" id="image" name="image" value="${menu.image}" placeholder="https://example.com/photo.jpg" />
            <span class="hint">메뉴 사진의 이미지 주소 또는 파일명입니다.</span>
          </div>
        </div>

        <div class="menu-form__fields">
          <div class="field">
            <label for="name">메뉴 이름</label>
            <input type="text" id="name" name="name" value="${menu.name}" required />
          </div>

          <div class="field">
            <label for="category">카테고리</label>
            <select id="category" name="category" required>${categoryOptions()}</select>
          </div>

          <div class="field">
            <label for="price">가격 (원)</label>
            <input type="number" id="price" name="price" min="0" step="1" value="${menu.price}" required />
          </div>

          <div class="field">
            <label for="description">메뉴 설명</label>
            <textarea id="description" name="description" required>${menu.description}</textarea>
          </div>

          <div class="field">
            <label>온도 옵션</label>
            <div class="checkbox-group">${temperatureCheckboxes()}</div>
          </div>

          <div class="field">
            <label for="badge">뱃지</label>
            <select id="badge" name="badge">${badgeOptions()}</select>
          </div>

          <div class="field">
            <label class="checkbox-group">
              <input type="checkbox" id="soldOut" name="soldOut" ${menu.soldOut ? "checked" : ""} />
              <span>품절 처리</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <a class="btn btn-outline btn-block" href="detail.html?id=${menu.id}">취소</a>
        <button class="btn btn-primary btn-block" type="submit">수정 완료</button>
      </div>
    </form>
  `;

  const previewImg = document.getElementById("image-preview");
  previewImg.addEventListener("error", () => {
    previewImg.src = resolveImageSrc("");
  });
  document.getElementById("image").addEventListener("input", (e) => {
    previewImg.src = resolveImageSrc(e.target.value.trim());
  });

  document.getElementById("menu-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    updateMenu(menu.id, {
      name: formData.get("name").trim(),
      image: formData.get("image").trim(),
      category: formData.get("category"),
      price: formData.get("price"),
      description: formData.get("description").trim(),
      temperatures: formData.getAll("temperature"),
      badge: formData.get("badge"),
      soldOut: formData.get("soldOut") === "on",
    });

    showToast("메뉴가 수정되었습니다.");
    setTimeout(() => {
      window.location.href = `detail.html?id=${menu.id}`;
    }, 600);
  });
}

render();
