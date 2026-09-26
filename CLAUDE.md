@AGENTS.md

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
│   ├── admin/page.tsx              # 내부 어드민 (비번: pomit2026)
│   ├── partner/leads/page.tsx      # 협력업체 리드 열람 페이지
│   ├── landing/page.tsx            # 무료 상담 랜딩 페이지 (신규)
│   ├── consult/page.tsx            # 무료 상담 1단계 (지역/업종)
│   ├── consult/step2/page.tsx      # 무료 상담 2단계 (평수)
│   ├── consult/step3/page.tsx      # 무료 상담 3단계 (경험/시기/종류/예산/메모)
│   ├── consult/step4/page.tsx      # 무료 상담 4단계 (이름/전화번호 → 완료)
│   ├── estimate/
│   │   ├── detail/page.tsx         # 세부 견적 1단계 (지역/업종/등급)
│   │   ├── detail/step2/page.tsx   # 2단계 (평수 입력)
│   │   ├── detail/step3/page.tsx   # 3단계 (공종 선택)
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
- [x] 홈 화면 — AI 자동 견적(메인) + AI 견적 스캔(Coming Soon)
- [x] 세부 견적 5단계 플로우 (임시 견적 엔진)
- [x] Supabase 리드 수집 (step5 이메일 입력 시 저장)
- [x] 어드민 페이지 — 리드 목록/상태변경/삭제, 비번: pomit2026
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
