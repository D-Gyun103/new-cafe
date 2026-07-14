import { getBeanOrigins, setBeanOriginSoldOut, showToast, requireAdminAuth } from "../../js/utils.js";

requireAdminAuth();

const root = document.getElementById("origins-root");

function originCardHTML(origin) {
  return `
    <article class="origin-card glass-card${origin.soldOut ? " is-soldout" : ""}">
      <div class="origin-card__info">
        <div class="origin-card__top">
          <h3>${origin.name}</h3>
          <span class="badge ${origin.soldOut ? "badge-soldout" : "badge-new"}">${
            origin.soldOut ? "품절" : "판매중"
          }</span>
        </div>
        <p>${origin.desc}</p>
      </div>
      <button
        class="btn ${origin.soldOut ? "btn-primary" : "btn-danger"} btn-sm"
        data-toggle-id="${origin.id}"
        type="button"
      >
        ${origin.soldOut ? "판매 재개" : "품절 처리"}
      </button>
    </article>
  `;
}

function render() {
  root.innerHTML = getBeanOrigins().map(originCardHTML).join("");
}

root.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-toggle-id]");
  if (!btn) return;
  const id = btn.dataset.toggleId;
  const origin = getBeanOrigins().find((o) => o.id === id);
  if (!origin) return;

  const nextSoldOut = !origin.soldOut;
  setBeanOriginSoldOut(id, nextSoldOut);
  showToast(`${origin.name} 원두를 ${nextSoldOut ? "품절" : "판매중"} 처리했습니다.`);
  render();
});

render();
