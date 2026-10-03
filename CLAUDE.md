## 2026-10-03 방문 상세 정보 (앱 배포 전)
record_traffic_v3가 기존 일별 집계를 유지하면서 traffic_details에 허용한 페이지별 도달과 서버에서 추출한 추정 지역·환경·마스킹 IP를 기록합니다. raw IP/UA 및 임의 URL은 저장하지 않습니다. admin_traffic_details는 관리자 전용 서버 RPC이며 국가/지역/환경/페이지 집계와 최근 50건을 반환합니다. 단계 도달 통계는 엄격한 순서 기반 이탈 퍼널이 아닙니다.
관리자 analytics PATCH는 동일 출처·인증·boolean 검증 후 상세 수집 및 IP 수집/표시 설정을 변경합니다. 사용자 승인에 따라 상세 기록만 KST 최근 30일 보존하며 다음 수집·조회에서 정리합니다. 기존 traffic_daily 및 상담 정보는 삭제하지 않습니다. 운영 DB 마이그레이션 적용·롤백 테스트 완료, 앱 코드는 미배포입니다.

## 2026-10-03 관리자 카테고리
AdminPage에서 overview/sources/consult/engine 카테고리를 관리합니다. AdminTraffic view는 부모에서 전달하며 내부 중복 탭은 제거했습니다. hidden으로 패널을 숨겨 카테고리 이동 시 조회 기간·상담 초안이 유지됩니다. PR #13으로 운영 배포 완료했으며 DB/API 변경은 없습니다.

## 2026-10-03 관리자 확장
통계는 admin_dashboard RPC로 오늘/어제/7/30일을 조회합니다. traffic_daily source/medium/campaign/landing은 record_traffic_v2에서 하루 첫 값만 기록하고 URL 원문은 저장하지 않습니다. 이전 값은 미분류로 남습니다. 여러 날 방문자는 일별 방문자 합계입니다.
상담 관리 API /api/admin/consultations는 서버 인증·동일 출처 확인·검색/25건 페이지네이션 및 admin_version 낙관적 잠금을 사용합니다. admin_note는 고객 memo와 별개이며 next_contact_at은 UTC 저장, 화면은 KST입니다. 기존 records PATCH로 상담 상태 변경은 차단했습니다. DB migration 20261003 및 PR #12 운영 배포 완료. form.it.kr 새 안내 반영·관리자 API 비로그인 401 검증 완료.

@AGENTS.md

## 2026-10-03 내 방문 제외
관리자 통계와 /privacy의 TrafficPreference에서 브라우저·도메인별 제외 쿠키(최대 1년)를 설정합니다. /api/analytics/preference는 공개 개인정보 설정이며 관리자 권한을 부여하지 않습니다. 수집 API 및 visitorIdentity에서 제외를 적용하여 상담 전환 트리거 우회 집계도 방지합니다. 실제 신청 접수 및 이전 통계는 변경하지 않습니다.

## 2026-10-02 관리자 비밀번호 정책
사용자 요청으로 최소 16자 제한 제거. 빈 값·공백만 있는 값과 200자 초과는 거부하며 비밀번호 원문 일치, 로그인 요청 제한, 세션 서명 및 HttpOnly 쿠키는 유지합니다.

## 2026-10-02 통계
관리자 통계는 /api/admin/analytics(인증 필수), 수집은 /api/analytics에서 처리합니다. traffic_daily는 날짜+서명 쿠키 기반 방문자를 유일키로 삼으며 record_traffic RPC가 중복을 합칩니다. consultations INSERT 트리거가 신청 전환을 원자적으로 기록합니다. 통계 마이그레이션은 운영 적용 완료. UI의 사람 수는 브라우저 기준 추정치이고 신청은 접수 건수입니다.

## 2026-09-29 운영 전환 주의
서버 API 인증/저장으로 전환한 수정본입니다. 운영 DB 마이그레이션과 Vercel 서버 전용 환경변수를 먼저 구성해야 합니다. STATUS.md 최신 항목을 우선하며, 아래 과거 기능 완료 기록을 실제 운영 검증으로 간주하지 마세요. PDF 발송은 미구현이고 공개 파트너 열람은 중단했습니다.

# 폼잇. — AI 기반 자동 견적 플랫폼

## 회사 정보
- **모회사:** Forma Labs
- **플랫폼명:** 폼잇.
- **대표:** 준혁 씨 (현직 인테리어 전문가, 2026년 5월 퇴사 예정)
- **목적:** AI 기반 인테리어 자동 견적 + 리드 수집 + 협력업체 연결 플랫폼

## 서비스 구조
```
폼잇. (플랫폼)
  ├ AI 자동 견적    — 소비자가 조건 입력 → 견적 확인 → 이메일 수집
  └ AI 견적 스캔   — 업체 견적서 사진 업로드 → AI 분석 (Coming Soon)

비즈니스 모델
  ├ 협력업체 리드 열람료 (건당 금액대별 차등, 예: 5~20만원)
  ├ 직영 인테리어 설계 + 시공 (Forma Space 예정)
  └ 견적 데이터 축적 → AI 엔진 고도화
```

## 기술 스택
- **프레임워크:** Next.js 16 (App Router, Turbopack)
- **언어:** TypeScript
- **스타일:** 순수 인라인 스타일 (Tailwind/Mantine 미사용)
- **애니메이션:** Framer Motion v12
- **아이콘:** @tabler/icons-react
- **DB:** Supabase (PostgreSQL)
- **배포:** Vercel
- **이메일 예정:** Resend + pdf-lib (견적 엔진 완성 후)
- **개발 서버:** `npm run dev` (포트 3002)

## 배포 정보
- **프로덕션:** https://interior-estimate-rouge.vercel.app
- **GitHub:** https://github.com/welovehyeok33-boop/interior-estimate
- **Supabase 프로젝트:** https://mzkueethbnnzgthfpkwa.supabase.co

## 디렉토리 구조
```
src/
├── app/
│   ├── page.tsx                    # 홈 화면 (두 가지 핵심 서비스)
│   ├── page.v1.tsx                 # 홈 화면 백업 (이전 버전)
│   ├── admin/page.tsx              # 내부 어드민 (비번: (폐기 대상 구형 비밀번호))
│   ├── partner/leads/page.tsx      # 협력업체 리드 열람 페이지
│   ├── landing/page.tsx            # 무료 상담 랜딩 페이지 (신규)
│   ├── consult/page.tsx            # 무료 상담 1단계 (지역/업종)
│   ├── consult/step2/page.tsx      # 무료 상담 2단계 (평수)
│   ├── consult/step3/page.tsx      # 무료 상담 3단계 (경험/시기/종류/예산/메모)
│   ├── consult/step4/page.tsx      # 무료 상담 4단계 (이름/전화번호 → 완료)
│   ├── estimate/
│   │   ├── detail/page.tsx         # 세부 견적 1단계 (지역/업종/등급)
│   │   ├── detail/step2/page.tsx   # 2단계 (평수 입력)
│   │   ├── detail/step3/page.tsx   # 3단계 (공통 질문, 공종 자동 변환)
│   │   ├── detail/step4/page.tsx   # 4단계 (자재 등급)
│   │   └── detail/step5/page.tsx   # 5단계 (결과 + 이메일 수집)
│   └── estimate/scan/page.tsx      # AI 견적 스캔 (Coming Soon)
├── components/
│   └── EstimateLayout.tsx          # FlightPath, C (색상 상수)
└── lib/
    ├── estimateStore.ts            # localStorage - 견적 폼 상태
    ├── consultStore.ts             # localStorage - 상담 폼 상태
    └── supabase.ts                 # Supabase 클라이언트
```

## 색상 시스템 (C 객체)
```ts
// src/components/EstimateLayout.tsx 에 정의
C.bg, C.card, C.border, C.primary (#F5C200 노란색)
C.selectedBg, C.selectedBorder, C.textDark, C.textMid, C.textLight
```
- 홈 전용 `C.home`: 아이보리/웜 차콜/브론즈 테두리 마감. 기존 `C` 토큰은 유지하므로 견적·상담 화면에는 영향 없음. 홈 제목 첫 줄만 시스템 명조체 폴백 사용, 본문과 CTA는 기존 Pretendard 유지.

## Supabase 테이블

### leads (AI 자동 견적 이메일 수집)
```sql
id, created_at, email, region, building_type,
residential_grade, commercial_type, commercial_sub,
area, works(text[]), material_grade, estimated_total,
status ('new' | 'qualified' | 'contracted')
```
- RLS 비활성화
- status = 'qualified' 인 리드만 파트너 페이지에 노출
- 공간 설명은 폼의 `spaceDescription`(최대 200자)으로 세부업종 `commercialSub`와 분리한다. 스키마 변경 없이 제출 시에만 `commercial_sub`에 `식당 · 공간 설명: ...` 또는 `공간 설명: ...` 형태로 전달한다. 빈 설명은 기존 업종명 유지, 구버전 unknown의 `commercialSub` 메모는 호환 처리. 관리자/파트너는 기존 문자열 표시 경로 사용. 실제 DB 저장/길이 제약은 운영 반영 전 검증 필요.
- 견적 폼은 `region` 코드와 `regionDetail` 설명을 분리해 유지한다. 리드 저장 시 `region`에는 기존 코드 또는 `local:부산 해운대구` 형식을 사용하고 `estimateRegion.ts`로 표시한다. 기존 코드 기반 계산은 유지. 실제 DB의 상세 지역 저장 허용 여부는 운영 반영 전 확인 필요.

### consultations (무료 상담 신청)
```sql
id, created_at, region, building_type, area,
experience ('yes'|'no'), schedule ('1month'|'3months'|'6months'|'undecided'),
work_scope ('full'|'partial'), budget ('~1000'|'1000~3000'|'3000~5000'|'5000+'|'unknown'),
memo, name, phone,
status ('new' | 'contacted' | 'contracted')
```
- RLS 비활성화
- 생성 SQL:
```sql
create table consultations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  region text, building_type text, area numeric,
  experience text, schedule text, work_scope text,
  budget text, memo text, name text, phone text,
  status text default 'new'
);
alter table consultations disable row level security;
```

## 현재 구현 상태
- [x] 유입용 `/consult`은 공종 선택 없이 지역·공간/업종 → 면적 → 공사 시기·희망 예산 슬라이더 → 연락처 신청으로 구성. 신청 화면 요약 포함. 공종 선택은 견적엔진용에만 유지. 2026-09-26 로컬만 적용.
- [x] 관리자 `/admin`에 1차 상담(`consultations`) / 2차 상세 견적 미리보기(`leads`) 분리 탭과 각 요청 정보 조회 추가. 상담 저장 실패 시 완료 화면 차단. 2026-09-26 로컬만 적용. 인증/RLS 보안 개선과 실제 DB 검증은 미완료.
- [x] AI 자동 견적 방식 선택 (`/estimate`) — 유입용은 기존 `/consult` 4단계, 견적엔진용은 `/estimate/detail` 5단계로 분리 진입. 홈/블로그/스캔 진입 링크 및 첫 단계의 방식 재선택 연결. 최종 엔진·PDF 준비 중 안내, 기존 폼/저장/계산은 그대로. 2026-09-26 로컬만 적용.
- [x] 홈 화면 — AI 자동 견적(메인) + AI 견적 스캔(Coming Soon)
- [x] 홈 클래식 마감 — 구성·문구·CTA·목업 유지, 색감/타이포/선/그림자 정돈. 2026-09-26 사용자 요청으로 로컬만 적용, 커밋·푸시·배포하지 않음.
- [x] 홈 휴대폰 시연 고도화 — `HomePhoneDemo.tsx`, `homeDemo.ts`, `C.phone` 사용. 견적 4장면/스캔 3장면, 수동 장면 선택·재생 제어, 가시성/모션 축소 대응. 데이터는 설명용 예시이며 실제 엔진·폼/localStorage와 분리. 시연 내부 문구/금액과 기기 외관만 교체하고 나머지 홈 구성·링크 보존. 2026-09-26 로컬만 적용, 푸시·배포 없음.
- [x] 세부 견적 5단계 플로우 (임시 견적 엔진)
- [x] 세부 견적 3단계를 공종 직접 선택에서 소비자 질문 방식으로 교체. 공간 상태·철거·공사 범위를 먼저 묻고 천장/벽/바닥 후속 질문은 선택 시에만 노출하며, 답변은 기존 임시 계산용 공종으로 자동 변환. 2026-09-26 로컬 적용만.
- [x] 세부 견적 줄자 진행 표시 고도화 — `EstimateLayout.tsx`의 SVG/HTML 단계 라벨과 `C.ruler` 토큰. `estimate/detail/layout.tsx`의 `EstimateProgressProvider`가 공유 MotionValue를 유지해 페이지 이동마다 0.55초 전진/후진. 직접 진입은 현재 단계로 초기화, 모션 축소 시 즉시 이동. 라우트/라벨 정의는 `estimateProgress.ts`. 2026-09-26 로컬 적용만, 푸시·배포 없음.
- [x] Supabase 리드 수집 (step5 이메일 입력 시 저장)
- [x] 어드민 페이지 — 리드 목록/상태변경/삭제, 비번: (폐기 대상 구형 비밀번호)
- [x] 파트너 페이지 — qualified 리드 열람 (결제 연동 미완성)
- [x] 모바일 반응형
- [x] 랜딩 페이지 (/landing) — 무료 상담 신청 유도
- [x] 무료 상담 4단계 폼 (/consult) — 전화번호 수집 → consultations 테이블 저장
- [x] 세부 견적 상가 업종 — `아직 잘 모르겠어요` 선택 후 세부 업종 없이 진행 가능
- [x] `아직 잘 모르겠어요` — 공간/업종 설명 선택 입력 (최대 200자), 기존 commercial_sub 컬럼으로 전달. 빈칸도 진행 가능.
- [x] 공간 설명란을 주거 전체 등급/상가 전체 업종·세부업종으로 확대. 선택한 항목 아래 공통 입력란 하나만 표시하고 옵션 변경 시 설명 유지. 결과 화면에도 설명 표시.
- [x] `지방` — 시·군·구 선택 입력 (최대 50자), 결과/관리자/파트너 지역 표시. 빈칸도 진행 가능하며 상세 주소는 요청하지 않음.
- [ ] consultations 테이블 어드민 연결 (상담 신청 목록 관리)
- [ ] 파트너 로그인 (Supabase Auth 예정)
- [ ] PDF 발송 (Resend, 견적 엔진 완성 후)
- [ ] 견적 엔진 교체 (준혁 씨 엑셀 단가표 → Supabase → 연결)
- [ ] 업종별 맞춤 질문지
- [ ] 파트너 결제 연동 (금액대별 차등 열람료)
- [ ] Vercel Analytics (방문자 수)

## 견적 엔진 계획 (준혁 씨 파트)
```
엑셀 시트 1 — 공종별 단가표 (공종/세부항목/단위/단가)
엑셀 시트 2 — 업종별 질문 + 공종 연결 규칙
              예: 카페 "홀 면적" → 바닥 × 1.0 + 도장 × 0.8
엑셀 시트 3 — 지역 계수 (서울강남 1.25 / 서울일반 1.15 / 수도권 1.05 / 지방 0.95)
```
완성 후 CSV → Supabase import → 프론트 연결

## 다음 작업 순서
1. 준혁 씨 — 엑셀 공종 단가표 + 업종별 질문지 작성
2. Supabase 견적 엔진 테이블 설계 + import
3. 업종별 질문지 UI 교체 (step2~4 갈아엎기)
4. 견적 결과 축소 (총액만 웹 노출, 전체는 이메일로)
5. Resend 연결 + PDF 발송
6. 파트너 로그인 + 결제 연동

## 개발 서버 실행
```bash
cd /Users/shinjoonhyeok/Desktop/claude/interior-estimate
npm run dev -- -p 3002
```
→ http://localhost:3002
