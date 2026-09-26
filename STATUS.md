# 폼잇. 현재 상태 (STATUS)

> 마지막 업데이트: 2026-09-26

## 배포 현황
| 환경 | URL | 상태 |
|------|-----|------|
| 프로덕션 | https://interior-estimate-rouge.vercel.app | ✅ 배포됨 |
| 개발 | http://localhost:3002 | `npm run dev -- -p 3002` |
| GitHub | https://github.com/welovehyeok33-boop/interior-estimate | ✅ 연결됨 |
| Supabase | https://mzkueethbnnzgthfpkwa.supabase.co | ✅ 연결됨 |

## 기능 상태

### ✅ 완료
- 홈 화면 (`/`) — AI 자동 견적 + AI 견적 스캔(Coming Soon)
- 세부 견적 5단계 플로우 (`/estimate/detail` ~ `step5`)
- Supabase `leads` 테이블 저장 (step5 이메일 입력 시)
- 어드민 페이지 (`/admin`) — 리드 목록/상태변경/삭제, 비번: pomit2026
- 파트너 페이지 (`/partner/leads`) — qualified 리드 열람 (결제 미연동)
- 랜딩 페이지 (`/landing`) — 무료 상담 CTA
- 무료 상담 4단계 폼 (`/consult`) — Supabase `consultations` 저장
- 모바일 반응형

### 🔧 부분 완료 / 임시 상태
- 견적 엔진 — 임시 계산 로직 사용 중 (준혁 씨 엑셀 단가표로 교체 예정)
- 파트너 페이지 — 열람 모달 있으나 실제 결제 미연동

### ❌ 미완성
- `consultations` 어드민 연결 (상담 신청 목록 관리)
- 파트너 로그인 (Supabase Auth)
- PDF 발송 (Resend)
- 파트너 결제 연동
- Vercel Analytics

## Supabase 테이블 상태
| 테이블 | RLS | 데이터 |
|--------|-----|--------|
| `leads` | 비활성화 ✅ | 실제 리드 수집 중 |
| `consultations` | 비활성화 ✅ | 실제 상담 신청 수집 중 |

## 최근 변경사항
- 2026-09-26: `아직 잘 모르겠어요` 선택 시 공간/업종을 직접 적는 선택 입력란 추가 (200자). 기존 화면 유지, 입력은 `commercialSub` → `commercial_sub` 저장 경로 사용.
- 2026-09-25: 세부 견적 상가 업종에 `아직 잘 모르겠어요` 선택지 추가
- 2026-09-19: 랜딩페이지 + 무료 상담 4단계 플로우 완성
- 2026-09-19: `consultations` 테이블 생성 + RLS 비활성화
- 2026-09-19: 어드민 삭제 기능 추가
- 2026-09-19: 문서 시스템 구축 (AGENTS.md, CLAUDE.md, STATUS.md, TODO.md, DECISIONS.md)
