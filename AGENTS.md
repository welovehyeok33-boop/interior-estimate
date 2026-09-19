<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 폼잇. 에이전트 가이드

## 프로젝트 한 줄 요약
Next.js 16 + Supabase 기반 인테리어 자동 견적 플랫폼. 소비자 견적·상담 신청 수집 → 협력업체 유료 연결.

## 절대 지켜야 할 규칙

### 스타일
- **Tailwind, Mantine, CSS 모듈 절대 사용 금지** → 순수 인라인 스타일만
- 색상은 반드시 `C` 상수 사용 (`src/components/EstimateLayout.tsx`)
- 애니메이션은 Framer Motion v12만 (`motion.div`, `AnimatePresence`)

### 코드
- 모든 클라이언트 컴포넌트 최상단에 `"use client";`
- Supabase 직접 호출하는 페이지는 반드시 `export const dynamic = "force-dynamic";`
- TypeScript strict 모드 — `any` 사용 금지
- 아이콘은 `@tabler/icons-react`만

### Supabase
- RLS 비활성화 상태 (테이블별로 `disable row level security`)
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `.env.local`은 git에 포함 안 됨 → 직접 생성 필요

## 주요 상태 관리
| 스토어 | 파일 | localStorage 키 | 용도 |
|--------|------|-----------------|------|
| 견적 폼 | `src/lib/estimateStore.ts` | `"interior_estimate"` | 5단계 견적 플로우 |
| 상담 폼 | `src/lib/consultStore.ts` | `"pomit_consult"` | 4단계 무료 상담 플로우 |

## 라우트 맵
```
/                   → 홈 (두 서비스 카드)
/landing            → 무료 상담 랜딩 페이지
/consult            → 상담 1단계 (지역/업종)
/consult/step2      → 상담 2단계 (평수)
/consult/step3      → 상담 3단계 (경험/시기/종류/예산/메모)
/consult/step4      → 상담 4단계 (이름/전화 → 완료)
/estimate/detail    → 견적 1단계 (지역/업종/등급)
/estimate/detail/step2 → 견적 2단계 (평수)
/estimate/detail/step3 → 견적 3단계 (공종)
/estimate/detail/step4 → 견적 4단계 (자재 등급)
/estimate/detail/step5 → 견적 5단계 (결과 + 이메일)
/estimate/scan      → AI 견적 스캔 (Coming Soon)
/admin              → 어드민 (비번: pomit2026)
/partner/leads      → 협력업체 리드 열람
```

## Supabase 테이블 요약
| 테이블 | 용도 | 핵심 컬럼 |
|--------|------|-----------|
| `leads` | 견적 이메일 수집 | email, region, building_type, area, estimated_total, status |
| `consultations` | 상담 전화번호 수집 | name, phone, region, building_type, area, budget, status |

## 작업 전 체크리스트
- [ ] `npm run dev -- -p 3002` 로 개발 서버 확인
- [ ] Supabase 연결 필요 시 `.env.local` 확인
- [ ] 수정할 파일 반드시 Read로 먼저 읽기

## 작업 후 체크리스트
- [ ] `tsc --noEmit` 빌드 에러 없는지 확인 (`.next/` 내부 에러는 무시)
- [ ] 모바일 반응형 확인 (maxWidth: 560)
- [ ] Supabase 연동 변경 시 RLS 비활성화 상태 유지 확인
- [ ] CLAUDE.md 현재 구현 상태 업데이트
- [ ] STATUS.md 업데이트

## 세션 종료 시
1. 이 대화에서 변경한 파일 목록 정리
2. STATUS.md 업데이트
3. TODO.md 완료 항목 체크 / 신규 항목 추가
4. git commit + push 권장
