-- ============================================================
-- New Cafe - Supabase 스키마
-- Supabase 대시보드 → SQL Editor에서 이 파일 전체를 한 번에 실행하세요.
-- (anon/publishable 키로는 실행할 수 없고, 대시보드 SQL Editor에서만 실행 가능합니다.)
-- ============================================================

-- ---------- 테이블 ----------

create table public.menus (
  id text primary key,
  name text not null,
  category text not null,
  price integer not null,
  description text not null,
  image text,
  temperatures text[] not null default '{}',
  badge text,
  sold_out boolean not null default false,
  signature boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bean_origins (
  id text primary key,
  name text not null,
  description text not null,
  sold_out boolean not null default false
);

-- 고객 프로필 (Supabase Auth의 auth.users와 1:1로 연결)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- 관리자 명단 (여기 등록된 user_id만 관리자 페이지 접근 가능)
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'received',
  total_count integer not null,
  total_price integer not null,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_id text,
  name text not null,
  image text,
  price integer not null,
  temperature text,
  size text,
  origin text,
  shot_option text,
  water_amount text,
  ice_amount text,
  request text,
  quantity integer not null,
  subtotal integer not null
);

create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  title text not null,
  content text not null,
  author_name text not null,
  author_email text not null,
  reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------

alter table public.menus enable row level security;
alter table public.bean_origins enable row level security;
alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.feedbacks enable row level security;

-- 현재 로그인한 사용자가 관리자인지 확인하는 헬퍼 함수.
-- security definer로 만들어야 admins 테이블에 RLS가 걸려 있어도 정책 내부에서 조회할 수 있다.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- menus: 누구나 조회, 관리자만 쓰기
create policy "menus_select_all" on public.menus for select using (true);
create policy "menus_admin_insert" on public.menus for insert with check (public.is_admin());
create policy "menus_admin_update" on public.menus for update using (public.is_admin());
create policy "menus_admin_delete" on public.menus for delete using (public.is_admin());

-- bean_origins: 누구나 조회, 관리자만 수정(품절 토글)
create policy "origins_select_all" on public.bean_origins for select using (true);
create policy "origins_admin_update" on public.bean_origins for update using (public.is_admin());

-- profiles: 본인 또는 관리자만 조회/수정, 본인 계정 생성/탈퇴만 허용
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- admins: 관리자만 조회 가능 (등록/삭제는 SQL Editor에서 수동으로만)
create policy "admins_select_admin_only" on public.admins
  for select using (public.is_admin());

-- orders: 본인 주문만 조회/생성, 상태 변경·삭제는 관리자만
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = customer_id or public.is_admin());
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = customer_id);
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());
create policy "orders_admin_delete" on public.orders
  for delete using (public.is_admin());

-- order_items: 상위 주문을 조회/생성할 수 있는 사람만 접근
create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.customer_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
    )
  );
create policy "order_items_admin_delete" on public.order_items
  for delete using (public.is_admin());

-- feedbacks: 본인 건의만 조회/생성, 답변 등록·삭제는 관리자만
create policy "feedbacks_select_own_or_admin" on public.feedbacks
  for select using (auth.uid() = customer_id or public.is_admin());
create policy "feedbacks_insert_own" on public.feedbacks
  for insert with check (auth.uid() = customer_id);
create policy "feedbacks_admin_update" on public.feedbacks
  for update using (public.is_admin());
create policy "feedbacks_admin_delete" on public.feedbacks
  for delete using (public.is_admin());

-- ---------- 시드 데이터 (기존 js/data.js의 INITIAL_MENUS / BEAN_ORIGINS 이관) ----------

insert into public.bean_origins (id, name, description, sold_out) values
  ('colombia', '콜롬비아', '부드럽고 균형 잡힌 클래식한 맛', false),
  ('ethiopia', '에티오피아', '화사한 꽃향과 산뜻한 산미', false),
  ('brazil', '브라질', '고소한 너티함과 묵직한 바디감', false);

insert into public.menus (id, name, category, price, description, image, temperatures, badge, sold_out, signature) values
  ('menu-1', '아메리카노', 'coffee', 4500, '진하게 내린 에스프레소에 물을 더해 깔끔하게 즐기는 기본 커피입니다.', 'menu-1.jpg', ARRAY['HOT','ICE'], 'BEST', false, false),
  ('menu-2', '카페라떼', 'coffee', 5000, '부드러운 스팀 밀크와 에스프레소가 조화를 이루는 커피입니다.', 'menu-2.jpg', ARRAY['HOT','ICE'], 'BEST', false, false),
  ('menu-3', '바닐라라떼', 'coffee', 5500, '달콤한 바닐라 시럽이 더해져 부드럽고 향긋한 라떼입니다.', 'menu-3.jpg', ARRAY['HOT','ICE'], null, false, false),
  ('menu-4', '카푸치노', 'coffee', 5000, '풍성하고 부드러운 우유 거품이 매력적인 이탈리안 커피입니다.', 'menu-4.jpg', ARRAY['HOT','ICE'], null, false, false),
  ('menu-5', '카라멜마키아토', 'coffee', 5800, '달콤 쌉싸름한 카라멜과 에스프레소가 층층이 어우러진 커피입니다.', 'menu-5.jpg', ARRAY['HOT','ICE'], null, false, false),
  ('menu-6', '콜드브루', 'coffee', 5200, '찬물로 긴 시간 우려내어 부드럽고 깊은 풍미를 가진 커피입니다.', 'menu-6.jpg', ARRAY['ICE'], null, false, false),
  ('menu-7', '에스프레소', 'coffee', 3500, '군더더기 없이 진하고 강렬한 커피 본연의 맛을 느낄 수 있습니다.', 'menu-7.jpg', ARRAY['HOT'], null, false, false),
  ('menu-8', '초콜릿라떼', 'non-coffee', 5500, '진한 초콜릿과 부드러운 우유가 만나 달콤함을 더한 음료입니다.', 'menu-8.jpg', ARRAY['HOT','ICE'], null, false, false),
  ('menu-9', '그린티라떼', 'non-coffee', 5800, '고소한 말차와 부드러운 우유가 조화롭게 어우러진 음료입니다.', 'menu-9.jpg', ARRAY['HOT','ICE'], null, false, false),
  ('menu-10', '유자차', 'tea', 5000, '새콤달콤한 유자로 만들어 상큼하고 향긋한 전통차입니다.', 'menu-10.jpg', ARRAY['HOT','ICE'], null, false, false),
  ('menu-11', '캐모마일티', 'tea', 4800, '은은한 꽃향기가 편안함을 더해주는 허브티입니다.', 'menu-11.jpg', ARRAY['HOT'], 'NEW', false, false),
  ('menu-12', '페퍼민트티', 'tea', 4800, '상쾌한 민트 향이 가득해 입안을 개운하게 해주는 허브티입니다.', 'menu-12.jpg', ARRAY['HOT','ICE'], null, false, false),
  ('menu-13', '티라미수', 'dessert', 6500, '부드러운 마스카포네 크림과 촉촉한 커피 시트가 어우러진 디저트입니다.', 'menu-13.jpg', ARRAY[]::text[], 'BEST', false, true),
  ('menu-14', '뉴욕치즈케이크', 'dessert', 6800, '진하고 크리미한 정통 뉴욕 스타일의 묵직한 치즈케이크입니다.', 'menu-14.jpg', ARRAY[]::text[], null, false, false),
  ('menu-15', '크루아상', 'dessert', 4200, '겹겹이 쌓아 구워 바삭한 결이 살아있는 프랑스식 페이스트리입니다.', 'menu-15.jpg', ARRAY[]::text[], null, true, false),
  ('menu-16', '초코쿠키', 'dessert', 3500, '진한 초콜릿 청크가 듬뿍 들어간 겉바속촉 수제 쿠키입니다.', 'menu-16.jpg', ARRAY[]::text[], null, false, false),
  ('menu-17', '플랫화이트', 'coffee', 5300, '진한 에스프레소에 얇은 밀크 폼을 더해 부드럽고 진한 풍미가 살아있는 커피입니다.', 'menu-17.jpg', ARRAY['HOT','ICE'], null, false, true),
  ('menu-18', '아인슈페너', 'coffee', 6000, '진한 커피 위에 부드러운 크림을 듬뿍 올려 달콤 쌉싸름하게 즐기는 비엔나 커피입니다.', 'menu-18.jpg', ARRAY['HOT','ICE'], 'NEW', false, true),
  ('menu-19', '헤이즐넛라떼', 'coffee', 5600, '고소한 헤이즐넛 시럽과 부드러운 우유가 에스프레소와 어우러진 향긋한 라떼입니다.', 'menu-19.jpg', ARRAY['HOT','ICE'], 'NEW', false, true),
  ('menu-20', '흑당버블라떼', 'non-coffee', 5800, '진한 흑당 시럽과 쫀득한 타피오카 펄이 들어간 달콤한 밀크 음료입니다.', 'menu-20.jpg', ARRAY['ICE'], 'BEST', false, false),
  ('menu-21', '얼그레이티', 'tea', 4800, '은은한 베르가못 향이 매력적인 향긋하고 우아한 홍차입니다.', 'menu-21.jpg', ARRAY['HOT','ICE'], null, false, false),
  ('menu-22', '마카롱', 'dessert', 3800, '쫀득한 코크와 부드러운 필링이 조화로운 색색의 프랑스식 디저트입니다.', 'menu-22.jpg', ARRAY[]::text[], null, false, false);

-- ---------- 관리자 계정 등록 ----------
-- 1) 앱 배포 후 Supabase 대시보드 → Authentication → Users → "Add user"로 관리자 계정을 이메일/비밀번호로 만든다.
--    (또는 admin/login.html에서 아직 계정이 없을 때 뜨는 안내를 따라 signUp으로 만들어도 된다.)
-- 2) 생성된 사용자의 UID를 복사해서 아래 문장의 <ADMIN_USER_UUID>에 채운 뒤 SQL Editor에서 실행한다.
--
-- insert into public.admins (user_id) values ('<ADMIN_USER_UUID>');
