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
- 지역 입력 검증: `node --experimental-strip-types --test tests/estimate-region.test.mjs` (4개 통과), `npx tsc --noEmit`, 변경 입력 페이지/유틸/테스트 ESLint, `npm run build` 통과. 390px 모바일에서 지방 입력/서울 전환 시 숨김/빈칸 진행/5단계 결과의 상세 지역 표시 확인. 실제 리드 제출은 하지 않음.
- 2026-09-26: `지방` 선택 시 시·군·구 선택 입력란 추가 (50자). 견적 계산의 지역 코드는 유지하고 결과/관리자/파트너 화면에 설명 표시. 리드 저장 시 기존 `region` 필드에 `local:지역 설명` 형식으로 전달하며 빈 설명은 기존 `local` 유지. 저장 오류 시 성공 처리하지 않도록 수정. 실제 운영 DB 저장/제약조건 검증은 미실시, DB/RLS 변경 없음.
- 2026-09-26: `아직 잘 모르겠어요` 선택 시 공간/업종을 직접 적는 선택 입력란 추가 (200자). 기존 화면 유지, 입력은 `commercialSub` → `commercial_sub` 저장 경로 사용.
- 2026-09-25: 세부 견적 상가 업종에 `아직 잘 모르겠어요` 선택지 추가
- 2026-09-19: 랜딩페이지 + 무료 상담 4단계 플로우 완성
- 2026-09-19: `consultations` 테이블 생성 + RLS 비활성화
- 2026-09-19: 어드민 삭제 기능 추가
- 2026-09-19: 문서 시스템 구축 (AGENTS.md, CLAUDE.md, STATUS.md, TODO.md, DECISIONS.md)
