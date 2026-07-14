# ☕ 카페 앱 - 프로젝트 청사진

## 📁 폴더 구조 (완전 코로케이션)

```
cafe-app/
│
├── index.html                        # 메인 (고객)
├── index.css                         # 메인 페이지 스타일
├── index.js                          # 메인 페이지 로직
│
├── 👤 고객 - 로그인/회원가입 (비회원도 주문 관련 기능은 이용 가능)
│   ├── login.html
│   ├── login.css
│   ├── login.js
│   ├── signup.html
│   ├── signup.css
│   └── signup.js
│
├── 👤 고객 - 메뉴
│   └── menus/
│       ├── list.html                 # 메뉴 목록
│       ├── list.css
│       ├── list.js
│       ├── detail.html               # 메뉴 상세
│       ├── detail.css
│       └── detail.js
│
├── 👤 고객 - 마이페이지
│   └── my/
│       ├── index.html                # 마이페이지 메인
│       ├── index.css
│       └── index.js
│
├── 👤 고객 - 장바구니
│   └── basket/
│       ├── list.html                 # 장바구니
│       ├── list.css
│       └── list.js
│
├── 👤 고객 - 주문 내역
│   └── orders/
│       ├── list.html                 # 주문 내역 목록
│       ├── list.css
│       ├── list.js
│       ├── detail.html               # 주문 상세
│       ├── detail.css
│       └── detail.js                   
│
├── 👤 고객 - 건의함
│   └── feedback/
│       ├── index.html                # 불편/건의사항 제출 폼
│       ├── index.css
│       └── index.js
│
├── 🔴 관리자/사장
│   └── admin/
│       ├── login.html                # 관리자 로그인
│       ├── login.css
│       ├── login.js
│       ├── index.html                # 대시보드
│       ├── index.css
│       ├── index.js
│       │
│       ├── menus/
│       │   ├── list.html             # 메뉴 목록
│       │   ├── list.css
│       │   ├── list.js
│       │   ├── detail.html           # 메뉴 상세
│       │   ├── detail.css
│       │   ├── detail.js
│       │   ├── create.html           # 메뉴 추가
│       │   ├── create.css
│       │   ├── create.js
│       │   ├── edit.html             # 메뉴 수정
│       │   ├── edit.css
│       │   └── edit.js
│       │
│       ├── orders/
│       │   ├── list.html             # 주문 목록
│       │   ├── list.css
│       │   ├── list.js
│       │   ├── detail.html           # 주문 상세
│       │   ├── detail.css
│       │   └── detail.js
│       │
│       ├── feedback/
│       │   ├── list.html             # 건의함 목록 (열람/삭제)
│       │   ├── list.css
│       │   ├── list.js
│       │   ├── detail.html           # 건의사항 상세 (답변/수정/삭제)
│       │   ├── detail.css
│       │   └── detail.js
│       │
│       └── origins/
│           ├── list.html             # 원두 품절 관리
│           ├── list.css
│           └── list.js
│
├── 📦 공유 자원
│   ├── css/
│   │   └── variables.css             # CSS 변수 (전역)
│   ├── js/
│   │   ├── data.js                   # 메뉴/카테고리 데이터
│   │   └── utils.js                  # 공통 유틸리티
│   └── images/
│       └── menu/                     # 메뉴 사진 (menu-1.jpg ~ menu-16.jpg, placeholder.jpg)
```

## 👥 역할별 기능

| 역할 | 경로 | 주요 기능 |
|------|------|-----------|
| **비회원** | `/`, `/menus/`, `/basket/`, `/orders/` | 메인, 메뉴 조회, 장바구니, 주문하기, 주문 내역 확인 (로그인 불필요) |
| **회원(고객)** | 비회원 기능 전체 + `/my/`, `/feedback/` | 위 기능 + 마이페이지, 불편/건의사항 제출 (로그인 필요) |
| **관리자/사장** | `/admin/`, `/admin/menus/`, `/admin/orders/`, `/admin/feedback/`, `/admin/origins/` | 로그인 후 대시보드, 메뉴 CRUD, 주문 관리, 건의함 열람·답변·수정·삭제, 원두 품절 관리 |

## 🎨 디자인

- **테마**: 라이트 + 따뜻한 브라운/크림 톤
- **분위기**: 미니멀 + 모던
- **카드 스타일**: Glass morphism
- **레이아웃**: 반응형 (모바일/데스크톱)

## 📐 코로케이션 원칙

- **HTML과 동일한 디렉토리에 css, js 파일을 평탄하게 배치** (별도 하위 폴더 없음)
- **파일명은 HTML 파일명과 동일하게 매칭** (`index.html` → `index.css`, `index.js`)
- 전역 공통 자원만 `/css/`, `/js/` 폴더에 분리
- 역할별 독립 폴더로 관심사를 분리

---

## ✅ 구현 TODO

### 1단계: 공유 자원

- [x] `css/variables.css` — 전역 CSS 변수, 리셋
- [x] `js/data.js` — 메뉴/카테고리 데이터
- [x] `js/utils.js` — 공통 유틸리티 (카트, 포맷 등)
- [x] `images/menu/` — 메뉴 사진 리소스

### 2단계: 관리자 - 메뉴 관리 시스템

- [x] `admin/menus/list.html` — 메뉴 목록
- [x] `admin/menus/list.css`
- [x] `admin/menus/list.js`
- [x] `admin/menus/detail.html` — 메뉴 상세
- [x] `admin/menus/detail.css`
- [x] `admin/menus/detail.js`
- [x] `admin/menus/create.html` — 메뉴 추가
- [x] `admin/menus/create.css`
- [x] `admin/menus/create.js`
- [x] `admin/menus/edit.html` — 메뉴 수정
- [x] `admin/menus/edit.css`
- [x] `admin/menus/edit.js`

### 3단계: 고객 - 메뉴 조회 시스템

- [x] `menus/list.html` — 메뉴 목록
- [x] `menus/list.css`
- [x] `menus/list.js`
- [x] `menus/detail.html` — 메뉴 상세
- [x] `menus/detail.css`
- [x] `menus/detail.js`

### 4단계: 고객 - 장바구니 관리 시스템

- [x] `basket/list.html` — 장바구니
- [x] `basket/list.css`
- [x] `basket/list.js`

### 5단계: 고객 - 주문 관리 시스템

- [x] `orders/list.html` — 주문 내역 목록
- [x] `orders/list.css`
- [x] `orders/list.js`
- [x] `orders/detail.html` — 주문 상세
- [x] `orders/detail.css`
- [x] `orders/detail.js`

### 6단계: 고객 - 메인 페이지

- [x] `index.html`
- [x] `index.css`
- [x] `index.js`

### 7단계: 고객 - 마이페이지

- [x] `my/index.html`
- [x] `my/index.css`
- [x] `my/index.js`

### 8단계: 관리자 - 대시보드 & 주문 관리

- [x] `admin/index.html` — 대시보드
- [x] `admin/index.css`
- [x] `admin/index.js`
- [x] `admin/orders/list.html` — 주문 목록
- [x] `admin/orders/list.css`
- [x] `admin/orders/list.js`
- [x] `admin/orders/detail.html` — 주문 상세
- [x] `admin/orders/detail.css`
- [x] `admin/orders/detail.js`

### 9단계: 건의함 (불편/건의사항 접수 및 관리)

- [x] `feedback/index.html` — 고객용 제출 폼 (열람 없이 제출만 가능)
- [x] `feedback/index.css`
- [x] `feedback/index.js`
- [x] `admin/feedback/list.html` — 건의함 목록 (카테고리/답변상태 필터, 삭제)
- [x] `admin/feedback/list.css`
- [x] `admin/feedback/list.js`
- [x] `admin/feedback/detail.html` — 상세 (답변 등록/수정, 삭제)
- [x] `admin/feedback/detail.css`
- [x] `admin/feedback/detail.js`

### 10단계: 관리자 로그인 (간단 세션 인증)

- [x] `admin/login.html` — 로그인 폼
- [x] `admin/login.css`
- [x] `admin/login.js`
- [x] 홈 푸터에 "관리자 로그인" 진입점 추가
- [x] 기존 관리자 페이지 전체(`admin/index.js`, `admin/menus/*`, `admin/orders/*`, `admin/feedback/*`)에 인증 가드 적용

### 11단계: 고객 로그인 (회원가입/로그인, 비회원 접근 제한)

- [x] `login.html` / `login.css` / `login.js` — 로그인 폼, 회원가입 링크, 로그인 후 원래 페이지로 복귀
- [x] `signup.html` / `signup.css` / `signup.js` — 회원가입 폼 (아이디/비밀번호/이름/이메일)
- [x] `js/utils.js` — 고객 계정 CRUD 및 세션 함수 (`registerCustomer`, `loginCustomer`, `logoutCustomer`, `getCurrentCustomer`, `requireCustomerAuth` 등)
- [x] `my/index.js`, `feedback/index.js`에 `requireCustomerAuth` 가드 적용 (비회원은 로그인 페이지로 이동)
- [x] 메뉴 조회·장바구니·주문하기·주문 내역은 비회원도 그대로 이용 가능 (가드 미적용)
- [x] `my/index.html`에 로그아웃 버튼 추가, 회원 탈퇴 시 계정만 삭제(장바구니·주문 내역은 유지)

### 12단계: 원두 품절 관리

- [x] `admin/origins/list.html` / `list.css` / `list.js` — 원두별 품절 상태 토글
- [x] `js/utils.js` — 원두 데이터를 localStorage 기반으로 전환 (`getBeanOrigins`, `setBeanOriginSoldOut`)
- [x] `menus/detail.js` — 품절 원두는 선택 불가(비활성화)로 표시, 기본 선택값도 품절이 아닌 원두로 자동 지정
- [x] `index.js` — 홈 히어로 "원두 소개" 슬라이드에도 품절 여부 반영
- [x] 관리자 대시보드에 "원두 관리" 바로가기 추가
