// ===== 카페 앱 - 메뉴 / 카테고리 데이터 =====

export const CATEGORIES = [
  { id: "coffee", name: "커피" },
  { id: "non-coffee", name: "논커피" },
  { id: "tea", name: "티" },
  { id: "dessert", name: "디저트" },
];

export const TEMPERATURES = [
  { id: "HOT", name: "HOT" },
  { id: "ICE", name: "ICE" },
];

export const ORDER_STATUSES = [
  { id: "received", name: "접수" },
  { id: "preparing", name: "준비중" },
  { id: "done", name: "완료" },
  { id: "canceled", name: "취소" },
];

export const FEEDBACK_CATEGORIES = [
  { id: "complaint", name: "불편사항" },
  { id: "suggestion", name: "건의사항" },
];

// 온도 옵션이 있는(=음료) 메뉴에서 선택하는 사이즈
export const SIZE_OPTIONS = [
  { id: "regular", name: "Regular", priceDiff: 0 },
  { id: "large", name: "Large", priceDiff: 500 },
];

// 커피 메뉴에서 선택하는 샷 옵션
export const SHOT_OPTIONS = [
  { id: "normal", name: "기본" },
  { id: "extra", name: "샷 추가" },
  { id: "mild", name: "연하게" },
];

// 온도 옵션이 있는(=음료) 메뉴에서 선택하는 물 양
export const WATER_OPTIONS = [
  { id: "normal", name: "보통" },
  { id: "less", name: "물 적게" },
  { id: "more", name: "물 많이" },
];

// 온도 옵션이 있는(=음료) 메뉴에서 선택하는 얼음 양
export const ICE_OPTIONS = [
  { id: "normal", name: "보통" },
  { id: "less", name: "얼음 적게" },
  { id: "more", name: "얼음 많이" },
];

