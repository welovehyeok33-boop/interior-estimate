@AGENTS.md

# 폼잇. — 현재 구현 안내

## 우선 목표

1차는 소비자 무료 견적 상담 접수. SQL 기반 상세 엔진과 PDF는 2차이며 현재 홍보에서 제공 완료로 표현하지 않는다.

## 기술 및 실행

Next.js 16.2.5 / React 19 / TypeScript strict / Supabase / Vercel.
순수 인라인 스타일, 공유 색상 C (EstimateLayout), Tabler 아이콘, Framer Motion.

- 개발: npm run dev -- -p 3002
- 검사: npm run test:forms, npx tsc --noEmit, npm run build
- 배포: https://interior-estimate-rouge.vercel.app
- NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY는 배포 환경에 설정한다. 비밀 키는 클라이언트에 넣지 않는다.
- NEXT_PUBLIC_SITE_URL은 확인된 커스텀 도메인으로 이전할 때만 설정한다. 기본은 현재 Vercel 주소.

## 주요 경로

- / 및 /landing: 무료 상담 중심 홈
- /consult ~ /consult/step4: 공간 → 면적 → 계획 → 연락처·동의·접수
- /estimate/detail ~ step5: 2차 초안 참고 계산, 상담 연결. PDF/이메일 발송 없음.
- /blog: 가이드 및 상담 연결
- /login, /signup: 회원 기능 준비 중 안내, 상담에는 계정 불필요
- /admin, /partner/leads: 기존 임시 구현. 실제 고객 데이터 접근에 사용하기 전 보안 보강 필수.

## 소비자 폼 구조

- components/ConsultFlow.tsx: 공통 상담 화면, 가드, 확인·입력, 실패 처리
- lib/consultValidation.ts: 미정 허용, 면적/전화/저장 데이터 검사, DB payload
- lib/consultStore.ts: pomit_consult localStorage. 이름·전화 미포함
- lib/contactStore.ts: pomit_contact sessionStorage. 이름·전화, 접수 성공 시 삭제
- lib/draftStore.ts: useSyncExternalStore용 안정적인 snapshot, 저장 실패 시 메모리 초안
- lib/estimateStore.ts / estimateValidation.ts: 계산 상태·검사
- components/EstimateGuard.tsx: 계산 필수 단계 누락 시 해당 단계로 이동
- lib/site.ts: sitemap/robots/canonical 공통 주소
- tests/forms.test.mjs: 순수 로직 회귀 테스트
- tests/mock-supabase.mjs: 운영 DB를 쓰지 않는 브라우저 시험용 HTTP 서버

## DB 변경 범위

이번 수정은 기존 consultations 컬럼만 사용하며 테이블/권한은 변경하지 않았다.
region/building_type/work_scope에 undecided, area에 null, experience에 null을 보낼 수 있다.
생성 SQL상 text/nullable이나 실제 배포 제약조건은 관리자 접근으로 확인해야 한다.
접수 응답 error를 확인하며, 실패나 시간초과를 성공으로 표시하지 않는다.

## 남은 작업

소비자 화면의 구현 완료와 운영 준비 완료를 구분한다. STATUS.md / TODO.md / CONSUMER_REVIEW.md 참조.
우선순위는 관리자 인증·DB 접근 제어 → 상담 접수 관리/알림 → 실제 저장 확인 → 유입 측정이다.
현재 관리자 화면은 consultations를 다루지 않는다. 실제 DB 검사 없이 안전하다고 보고하지 않는다.
