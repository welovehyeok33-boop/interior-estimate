@AGENTS.md

# 폼잇. — AI 기반 자동 견적 플랫폼

## 프로젝트 개요
- **서비스명:** 폼잇.
- **목적:** 현직 인테리어 전문가 + 100여개 업체 데이터 기반 AI 자동 견적 플랫폼
- **MVP 핵심 플로우:** 조건 입력 → 견적 계산 → PDF 발급(회원가입) → 리드 수집

## 기술 스택
- **프레임워크:** Next.js 16 (App Router)
- **언어:** TypeScript
- **UI:** Mantine v9 + @tabler/icons-react
- **개발 서버:** `npm run dev` (포트 3002)
- **배포 예정:** Vercel
- **DB 예정:** Supabase
- **이메일 예정:** Resend 또는 Nodemailer
- **PDF 예정:** pdf-lib (기존 PDF 템플릿에 숫자 삽입)

## 디렉토리 구조
```
src/
└── app/
    ├── layout.tsx         # Mantine Provider, 전역 설정
    ├── globals.css        # 전역 스타일 (최소화)
    ├── page.tsx           # 홈 화면 (간단/세부 견적 선택)
    ├── estimate/
    │   ├── simple/        # AI 간단 견적 (미구현)
    │   └── detail/        # AI 세부 견적 (미구현)
public/
└── logo.png               # 인테리어허브 로고
```

## 현재 구현 상태
- [x] 홈 화면 — 하늘/비행기 컨셉 히어로, 간단/세부 견적 카드
- [x] 인테리어허브 로고 적용
- [x] 비행기 CSS 애니메이션 (3대, 속도/크기 다름)
- [x] Mantine 테마 세팅 (layout.tsx)
- [ ] 간단 견적 입력 폼
- [ ] 세부 견적 입력 폼 (다중 페이지)
- [ ] 견적 계산 엔진 (준혁 씨 수식 기반)
- [ ] 결과 화면
- [ ] PDF 생성 + 이메일 발송
- [ ] 회원가입/로그인 (Supabase Auth)
- [ ] 어드민 리드 관리 테이블

## 핵심 비즈니스 로직
### 견적 계산 공식
```
공종 금액 = 물량 × 단가(자재등급) × 지역계수
총 견적 = Σ 선택된 공종 금액
```

### 사용자 입력 변수
- 평수, 지역, 욕실 개수, 방 개수, 창호 개수, 자재 등급, 공종 선택

### 지역계수 (예정)
- 서울 강남권: 1.2 / 서울 일반: 1.1 / 경기: 1.0 / 지방: 0.9

### 수익 모델
1. 직영 인테리어 회사 운영
2. 외주 중계 수수료 (~5%)
3. 업체 리드 열람료 (건당 15~20만원 예정)
4. 추후 종합 플랫폼 확장

## 개발 서버 실행
```bash
cd /Users/shinjoonhyeok/Desktop/claude/interior-estimate
npm run dev -- -p 3002
```
→ http://localhost:3002

## 주요 컨벤션
- 컴포넌트: Mantine 컴포넌트 우선 사용
- 스타일: Mantine style prop 또는 inline style (Tailwind 미사용)
- 라우팅: Next.js App Router (app/ 디렉토리)
- 한국어 UI: 모든 텍스트 한국어
- "use client" 필요한 컴포넌트에만 선언

## 다음 작업 순서
1. 세부 견적 입력 폼 (다중 페이지 스텝)
2. 간단 견적 입력 폼
3. 견적 계산 엔진 (단가표 준혁 씨 직접 입력)
4. 결과 화면
5. PDF 생성 + 이메일 발송
6. Supabase 연동 (회원가입 + DB)
7. 어드민 리드 페이지
