// ===== Supabase 클라이언트 (전역 공용) =====
// 이 프로젝트는 번들러가 없는 순수 정적 사이트라서, npm 패키지 대신
// esm.sh CDN을 통해 브라우저에서 바로 import 가능한 형태로 supabase-js를 불러온다.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sjtkbvbcqesotnbrgbya.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LnQopzY1AusD0DqohhLVug_koW_GQpb";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
