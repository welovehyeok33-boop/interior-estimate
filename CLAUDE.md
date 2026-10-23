## 2026-10-23 가이드 주거·상가 분리 및 주거 세로 줄자 / 구현·검증

`/blog`에 주거·상가 두 진입 카드, `/blog/residential`·`/blog/commercial` 전용 주소/상호 전환 추가. 게시 게이트와 명시적 audiences를 모두 통과한 글만 공간별 목록·사이트맵에 포함한다. 기존 22개 원문/주소 보존·공개 0개, 세 페이지 모두 현재 noindex 유지. 관리·상담 접수·SMS·수집/API/DB/환경변수 변경 없음.

사용자 추가 요청으로 주거 페이지에 8단계/25항목 체크리스트와 기존 검정·노랑 줄자 컨셉의 세로 타임라인 구현. 스크롤 탐색 위치 0~100%와 체크한 수를 구분, 실제 공정률·기간·보증이 아님을 표시. useScroll target/start center/end 70%로 모바일 끝까지 100% 도달, 숫자 줄바꿈 방지. 체크는 브라우저의 formit_residential_checklist_v1에 알려진 항목 ID만 보관(10KB/형식/중복 검증), 저장 차단 시 메모리로 동작하며 서버 전송 없음. 한국소비자원 2020/2016 안내 참고, 출처와 일반 정보 한계/위험 점검 전문가 요청 표시. 과거 단가·통계·법정 기간을 현재 사실로 재사용하지 않는다.

전체 179개/SEO 16개·소스 타입 통과. 로컬 읽기 전용 HTTP 49/49, 22개 보류 유지. 기본 데스크톱/390px(문서375px) 넘침 없음, 양쪽 분류 이동·탐색0/50/100·체크 후 새로고침 유지와 원상 복귀 확인, viewport reset. Sites 디자인/로컬 QA 가이드 참고하되 기존 Next/Vercel을 유지한다. 운영 배포·검수는 이어서 진행한다.

## 2026-10-23 새 형식 테스트 및 문의 접수 점검 / 완료

사용자가 끝자리 1732로 변경 형식 실제 테스트1건 최대20원을 추가 승인했다. 같은 formatter의 test 모드/가상 일반 오피스28평·3,000만원/견적 테스트 제목, 독립 EUC-KR82바이트. 고정 본문별24시간1회 HMAC 가드이며 이전 테스트·일별 기록은 보존, 하루20건/단가+VAT20원 상한/불명확한 유료 결과 재시도·충전/자동결제 없음. PR #62/main 776f838dc3422ca0d4344d23c5f6587c12c903a1 및 두 Vercel 검증·운영 success. 2026-10-23 16:40:39 KST 딱1건 실제 발송, 솔라피 처리완료/성공1·실패0·발송중0. 잔액282→264원(18차감), VAT포함 표시19.8원. 이전13:24 건과 별도이며 추가 재발송/충전 없음. 휴대폰 자체 열람과 구분한다.

관련22개/전체174개·소스 타입·ESLint, 공개접수4단계200/잘못된접수400·타출처403/no-store, 관리자진단200/noindex·비인증401/no-store 통과. 기존상담4건/최근접수10-19·10-17·10-13·10-12 조회 오류 없음. 연락처 저장 성공 후만 완료/실패입력 보존·서버 중복/알림 분리 경로 확인. 운영 가짜상담 INSERT는 실행하지 않아 실제운영 저장 E2E까지 검증했다고 단정하지 않는다. 관련 로컬6파일만 동기화/22개·타입 통과. 기본1107px 미리보기510px 검수/viewport reset,390px 도구override가 대상 탭에 적용되지 않아 정확한 모바일픽셀은 미검수. 캡처 output/sms-summary-test-20261023. 추가 유료 테스트 금지.

## 2026-10-23 견적 문자 요약 추가 / 운영 완료

사용자 승인으로 문자에 업종·평수·희망예산만 추가. consultationSms는 허용된 세부 업종/상위 분류와 기존 예산 표시 규칙을 사용하고 주거/미정/1억원 이상을 구분한다. 자유 입력·이름·전화·주소·메모는 제외. 상담 API는 저장 성공 뒤 선택한 5개 요약 필드만 전달한다. 최종 90바이트와 허용 문자를 검증하고 길면 업종/라벨만 축약하며 평수·금액·링크를 자르거나 반올림하지 않는다. 서버는 명시적 SMS/기존 단가·한도/중복·오류 분리를 유지한다. UI/DB/실제 데이터/Secret/결제 설정 변경 및 추가 유료 테스트 없음. 관련 20개/전체 172개·타입·ESLint 통과, 예시 독립 EUC-KR 78바이트 확인. PR #61/main de037fbf0307e8666dffbdc135163a09dbe273ec 운영 완료, 두 Vercel 검증·운영 success. 로컬 비인증 401/no-store·잘못된 견적 400/no-store 및 서버 종료, 관련 로컬 동기화/20개·타입 통과. 운영 보안 응답 확인.

## 2026-10-23 SOLAPI 문자 알림 운영 완료

PR #59 구현 및 #60 무료 단가 진단 보강, main 5fd767c94a41713fc1d54d17736fbb03f28da5a7 운영 완료/두 Vercel 검증·운영 success. 사용자 승인대로 운영 Production Secret에만 저장하고 0.0.0.0/0 실제 허용 목록 및 2027-10-23 23:59:59 KST 만료를 확인했다. 첫 가격 조회 403은 IP 목록이 접속 IP /32에 한정된 원인으로 추가·확정 저장해 해결했다. 비밀키는 채팅/캡처/Git/로컬/Preview에 남기지 않는다.

신규 consultations INSERT 성공 후 Next after에서 고객 정보 없는 고정 SMS를 끝자리 1732 관리자에게 요청. 중복/실패/수정/삭제 미발송, 알림 실패와 저장 성공 분리. production+플래그/설정, 기존 원자적 RPC KST 하루 20건/유료 테스트 24시간 1회, 현재 단가+VAT 20원 상한. 무료 가격 실패는 테스트를 소모하지 않으며 유료 POST의 불명확한 결과는 재시도하지 않는다. 충전/자동결제 API·DB 마이그레이션·영속 큐 없음, best-effort 후처리다.

/admin/sms GET은 인증 후 무료 단가/안전한 상태·마스킹 번호만 확인, POST는 같은 출처+로그인+정확한 1건 확인을 요구한다. 최초 사전 조회 실패는 유료 요청 0/잔액 300원 확인. 실제 테스트는 2026-10-23 13:24:48 KST 딱 1건, 솔라피 처리완료/성공 1/실패 0/발송중 0, 지급 잔액 300→282원(18원 차감), VAT 포함 단가 19.8원. 충전/자동결제 조작 없음·자동충전 꺼짐 유지. 휴대폰 자체 수신 확인과 구분한다.

전체 168개·소스 타입·변경 ESLint 및 Vercel 빌드 통과. 운영 noindex/401/no-store/외부 출처 403·인증된 진단/중복 방지, 390px 모바일 넘침 없음/viewport reset 확인. 관련 파일만 로컬 동기화/16개·타입 통과 및 자체 서버 종료. 기존 관리자 탭/홈/데이터·통계/SEO 유지. 운용 SMS_NOTIFICATIONS.md, 증거 output/sms-notifications-20261023. 추가 유료 테스트 금지. SEO는 별도 후속 요청으로 재개.

## 2026-10-23 SEO 재개 사전 점검

사용자는 문자·이메일 알림을 모두 취소하고 SEO 작업 재개 및 별도 블로그의 필요성을 질문했다. 알림 서비스/계정/API 키/발송 기능은 연결하지 않는다. 기존 `/blog` 가이드를 우선 정비하고 별도 네이버 블로그는 보조 채널로 검토하는 방향을 제안하며, 새 사이트 개설·기존 글 재공개·콘텐츠 추가·URL 이전은 아직 하지 않았다.

운영 읽기 전용 `scripts/check-seo.mjs` 47/47 통과. 기존 원문 22개 보존/보류, 공개 글 0개, 홈·상담 안내만 사이트맵 포함, 보류 안내/noindex·canonical·robots·비인증 API 401/no-store 정상. 운영 홈에 Google/Naver 소유 확인 메타태그는 없지만 DNS/파일 확인 방식이 가능하므로 계정 미등록으로 단정하지 않는다. 다음 단계는 소유 계정 등록·사이트맵 제출/색인 현황 확인 및 기존 글별 근거를 확보한 선별 정상화다. 소스/DB/배포 변경 없음.

## 2026-10-22 확인된 합계 기준 유입 비율

사용자가 불완전 날짜에도 확인된 합계 기준으로 총합 비율을 보여달라고 명시했다. referralTotalRate의 periodComplete 제한만 제거하여 표의 폼잇 유입 합계÷확인된 사이트 방문 합계×100을 소수 1자리로 표시한다. 4/27=14.8%, 4/51=7.8%. 과거 누락일이 있으면 툴팁/표 아래 안내에 확인된 기록 기준 참고 비율임을 명시한다. 조회 실패/미연결 사이트 때문에 전체 합계가 null인 경우와 방문 0명·잘못된 수치는 기존대로 —, 양수 방문/0유입은 0% 유지. 기간·개별 사이트 동일 날짜 비교 비율·합계 함수·오류 재시도/60초 캐시·37px 노랑 띠/보조글 없음·API/DB/수집/인증은 변경하지 않는다.

전체 152개/소스 타입/변경 4파일 ESLint 통과. 로컬 Webpack /admin 200/API 401·no-store 확인 후 자체 서버 종료, 사용자 로컬 작업본에 관련 4파일 diff만 동기화 후 44개/타입 통과. PR #58 / main 49a44bde7cbd65d620fc17786225d753a863abef 운영 완료/Vercel 2곳 success. 새 운영 client asset 및 /admin 200/noindex/API 401·no-store 확인. 사용자 재로그인 후 실제 최근 7일 [27,4,3,2]/14.8%, 10월 [51,4,3,2]/7.8%와 확인된 기록 기준 참고 툴팁 대조. 5곳 오류 0, 기본 987px/390px 모바일 문서 375px·표 내부 780px/7열·37px 유지 확인, viewport reset/기존 테마 유지 및 최근 7일 복구. 캡처 output/referral-known-total-rate-20261022/weekly.jpg, month.jpg, mobile.jpg.

## 2026-10-22 유입처 조회 안정화 및 정확한 합계

사용자 수정/즉시 배포 승인에 따라 serverReferralStats를 추가했다. 고정 5곳만 서버 인증 조회, 요청 제한 8→20초/일시 네트워크·429·5xx에 한 번 재시도/250ms 간격/사이트당 45초 전체 예산, route maxDuration=60. 31일 월은 30+1 순차 조회로 같은 사이트 중복 부하를 줄인다. 검증된 성공만 warm-instance 60초/64항목 메모리 캐시, 동일 사이트·정확한 날짜·토큰 해시별 진행 요청 중복 제거. cold instance는 정상 재조회하며 만료 캐시/오류를 정상값처럼 재사용하지 않는다. 원본 조회 시각·캐시 여부·안전한 실패 유형만 UI 상세에 표시, 비인증 API는 기존 401/no-store 유지. DB/인증키/수집/개인정보/봇 필터 변경 없음.

총합은 일부 사이트 미확인 시 해당 지표를 —로 표시한다. 전 사이트에서 기록을 받았으나 과거 미수집 날짜가 있으면 확인된 합계로 명시하며, 전체 기간 분모가 확인되지 않은 총합 비율은 계산하지 않는다. 오늘 진행 중이어도 모든 날짜 방문 수가 알려져 있으면 합계 인원으로 비율을 계산한다. 0명/0%/미확인/부분 기록 구분, 기존 얇은 노란 띠와 방문 숫자 아래 보조글 없음 유지. 전체 152개 회귀·소스 타입·변경 8파일 ESLint 통과. 실제 새 loader로 최근 7일 5곳 모두 정상(약 4.9초, 연속 캐시 1ms), 현재월 5곳 모두 정상(약 6.1초, 캐시 0ms).

PR #57 / main 881e9552b6929bf1818d56923b8a0b39f352e1ef 운영 완료, Vercel 2곳 success. 인증 운영 화면 최근 7일 5곳 오류 0/합계 [27,4,3,2], 오늘 [1,1,1,0]/100%, 현재월 [51,4,3,2] 확인. 과거 누락이 있는 주간/월간 전체 비율 — 및 확인된 합계 표기 정상. 새로고침 후 오피스 원본 조회 시각 유지·1분 이내 캐시 표시 확인. 다시 7일 복구. 기본 987px/모바일 390px(문서 375px, 표 내부 780px) 가로 넘침 없음·7열/37px 유지, viewport reset 및 기존 테마 유지. 로컬 Webpack 컴파일 /admin 200/API 401·no-store, 자체 서버 종료. 사용자 로컬 작업본에 8개 소스/테스트의 관련 diff만 반영 후 44개/타입 통과. 운영 새 client asset 및 /admin 200/noindex/API 401·no-store 재확인. 캡처 output/referral-stats-resilience-20261022/weekly.jpg, today.jpg, month.jpg, mobile.jpg.

## 2026-10-22 유입처 방문 조회 오류 진단

사용자 오류 제보에 읽기 전용 진단만 수행, 앱/외부 API/DB/설정/배포는 변경하지 않았다. 기존 고정 endpoint·사이트별 서버 토큰으로 오늘을 순차 15초 제한 조회하니 5곳 전부 HTTP 200 및 validateReferralStats 통과(인테리어프리 0/오피스 0/학원 0/아파트 1/빌라 0명). 응답 시간 0.94/1.14/3.91/5.52/10.03초. 이어 운영 route.ts와 같은 5곳 동시/8초 제한의 최근 7일 조회에서 인테리어프리 13명(0.56초)/오피스 10명(3.75초) 정상, 학원·아파트·빌라 모두 TimeoutError 약 8.01초로 재현. screenshot의 3곳 오류와 일치한다. 저장 데이터 미존재/인증키/응답 형식 문제로 볼 근거는 없으며 조회 제한과 느린 upstream 응답의 충돌이 확인됐다. 근본적인 외부 서버 지연 원인은 별도 미확정. 현재 모든 실패를 status:error로 뭉치고 서버 캐시/재시도 없이 매번 조회하므로 갱신마다 합계와 총합 비율이 흔들릴 수 있다. 제한/재시도/짧은 인증 서버 캐시와 실패 시 마지막 정상값의 시각·상태 명시, 미확인 분모 비율 보호를 개선 후보로 설명할 것. 데이터 수집·개인정보·봇 필터는 변경하지 않음.

## 2026-10-22 유입처 숫자/총합 띠 정리와 총합 비율

사이트 방문 값 아래 부분·일수와 총합 아래 보조글 제거. 집계 범위는 각 값 title·사이트 상세·표 아래 안내에 보존한다. totalCell padding 12→8px 12px로 노란 총합 띠 축소, 기존 테마/색상 유지. 네 합계에 더해 총합 유입 비율은 표에 표시된 폼잇 유입 총합÷사이트 방문 총합×100, 소수 1자리다. 개별 퍼센트의 평균/합산이 아니며 사이트별 비율 계산은 그대로. 0분모/미확인 —, 0유입은 0%, 부분 집계면 툴팁/안내에 잠정 표시. API/DB/수집 변경 없음. 전체 143개 회귀·타입·변경 ESLint 통과.

PR #56 / main 70235738c075b5fbb93552aa9a8e73deca462686 운영 완료, Vercel 2곳 success. 사용자 재로그인 후 최근 7일 최초 [27,4,3,2]/14.8% 실제 확인. 새로고침 때 외부 HUB 통계 4곳이 조회 실패하여 [13,4,3,2]/30.8% 잠정 수치로 바뀜; 미확인은 —로 보존하며 실패 원인은 미확정, 외부 수집/API는 수정하지 않음. 총합 높이 59→37px/7열·방문 값 span 0개·부분 집계 title/상세 보존 확인. 기본 987px와 390px 모바일(문서 375px/표 내부 780px 스크롤) 페이지 넘침 없음, viewport reset/기존 테마 유지. 로컬 선택 4파일 동기화 후 35개/타입 통과, 컴파일 HTTP 200·401/no-store 및 임시 서버 종료. 운영 /admin 200/noindex·비인증 통계 401/no-store 재확인. 캡처 output/referral-summary-polish-20261022/desktop.jpg, mobile.jpg.

## 2026-10-22 무료 견적 신청 5번째 막대

AdminFlowChart 무료견적·상담의 연락처 다음에 5. 무료 견적 신청 추가. AdminTraffic의 선택 기간 totals.requests를 그대로 전달하여 상단 실제 신청 카드와 일치하며 전환 방문자/완료 페이지 조회를 대신 쓰지 않는다. 기존 1~4단계는 회, 5단계는 건. 공통 최대값/색상/82px 트랙 유지, 0건은 빈 트랙, 미확인은 —. 기간 전체 접수와 30일 보관 단계 기록의 범위를 설명하고 과거 월 단계 미보관에도 신청 막대는 보존한다. 모바일에서는 각 칸 flex-column과 트랙 margin-top:auto로 라벨 줄바꿈 시 막대가 어긋나지 않는다. 상세견적 비활성 유지, API/DB/수집/인증 변경 없음. 전체 회귀 140개·소스 타입·변경 파일 ESLint 통과. PR #55 / main 32acfe2231652a5d8f11d600e560413d28972dc3 운영 반영 및 Vercel 2곳 success. 로컬 컴파일 HTTP 200·통계 비인증 401/no-store 확인, 임시 서버 종료. 관련 4파일만 로컬 동기화 후 12개 회귀/타입 통과. 사용자 재로그인 후 실제 최근 7일 2건/상단 일치·오늘 0건/채움 높이 0 확인, 다시 7일 복구. 기본 986px·모바일 390px에서 5개 82px 트랙 top 일치 및 페이지 375px 넘침 없음, viewport reset. 캡처 output/admin-request-flow-bar-20261022/desktop.jpg, mobile.jpg. 테마 설정 변경 없음.

## 2026-10-22 유입처 표 총합

AdminReferralSites tfoot에 사이트 방문/폼잇 유입/연락처 도착/신청 완료 방문 네 표시값 합계 추가. 비율은 더하지 않는다. summarizeReferralRows는 실제 0과 null/부분 합계/안전한 정수 범위를 구분하며 기존 행을 변경하지 않는다. 전부 미확인은 —, 일부만 확인되면 부분 합계와 사이트 범위를 표시. 사이트 간 중복 제거 수치가 아님을 안내한다. C.admin.totalBg는 밝은 #FFEB99/어두운 #4A3D15의 평면색으로 기존 연노랑보다 강조하며 홈 사용처는 없다. API/DB/수집/인증 변경 없음. 전체 회귀 133개·소스 타입 검사 통과, 기존 AdminTheme set-state-in-effect 오류 1건 외 새 린트 오류 없음. PR #54 / main ba935b12029d81bd78d28be415c9702f903a31f7 운영 배포 완료, Vercel 2곳 success. 사용자 재로그인 후 최근 7일 27/4/3/2 합계 DOM 대조, 외부 일부 실패 때 26명/3곳 부분 합계도 확인. 밝은 1280px 정렬·390px 모바일 페이지 넘침 없음 및 viewport reset. 어두운 모드 직접 전환 없이 테마 색상/대비 자동 검사(모두 4.5 이상), 기존 테마 설정 유지. 공개 자산/관리자 noindex/비인증 401·no-store 확인. 로컬 작업 소스 6개에 선택 diff만 동기화, 관련 32개/타입 통과. 캡처 output/admin-referral-totals-20261022/desktop.jpg.

## 2026-10-22 인테리어프리 오늘 방문 — 해결

외부 static-interior-site/api/formit-stats.js만 운영 소스 변경. 첫 이벤트 전에는 일별 Redis 키가 없어 오늘 0명과 누락을 구분하지 못했던 원인 확인. 인증된 원자적 조회에서 counts/visitors/clickers 세 키가 모두 없는 현재일이고 수집 설정/시작일이 유효할 때만 0으로 보고한다. 과거 빈 날짜·불일치·설정 누락·저장소 실패는 null/오류 유지, 현재일 coverage=partial 유지. DB/수집기/동의/봇 필터/폼잇 앱 수정 없음. 37개 회귀, 빌드/881 HTML 검사 및 폼잇 응답 계약 통과. 외부 Vercel dpl_8RMVokhy79yCDKReYGEcsNA37H6G production READY 배포. 운영 API 오늘 0/no_events·어제 1·7일 13·10/1 null, 비인증 401 확인. 인증된 폼잇 오늘 화면도 0명/방문 없음 확인, output/interiorfree-visitors-20261022/today.jpg 보관.

## 2026-10-22 관리자 월별 통계

AdminTraffic(대시보드/유입 트래픽)와 AdminReferralSites의 최근 30일 옆 월 입력을 추가. adminStatsPeriod가 KST 달력월/현재월 오늘까지/윤년/31일 및 입력 검증을 공유한다. presets RPC는 보존하고 월별만 새 admin_dashboard_range/admin_traffic_details_range(date,date)를 호출한다. 20261022_admin_monthly_statistics.sql 운영 Formit DB 적용 완료, 읽기 전용 SQL 테스트로 실제 방문/신청/출처/전환 합계·윤년/말일·범위/권한/30일 상세 보관 확인 PASS. 두 함수는 service_role 전용이며 기존 함수/테이블/기록/설정은 수정하지 않는다.

외부 API는 최대 30일씩 조회하여 31일 달을 30+1로 검증·합산한다. null/부분 집계와 동일 날짜 유입 비율 기준 유지. 상세 보관 기한이 지난 날이 포함되면 상담 입력 진입/연락처 도착은 부분값이나 0 대신 —, 남아 있는 상세 기록만 범위를 밝혀 표시한다. month를 요청 키에 포함해 유입처 월 변경 시 이전 결과를 숨긴다. 전체 회귀 129개·ESLint·소스 타입 검사 통과. PR #53 / main 548dc9e51f9049b2fc594b71ce1568ac65eaab7d 운영 반영, Vercel 2곳 success. 인증된 두 화면에서 현재월/31일 과거월/기간 전환·새로고침 및 밝은 390px 모바일 확인, 뷰포트 복구. 사용자 테마 설정은 변경하지 않았다. 새/기존 API 4개 비인증 401/no-store 확인, 로컬 관련 40개 회귀/소스 타입 검사 통과.

## 2026-10-22 관리자 탭 순서

관리자 카테고리 배열만 대시보드 → 유입처 관리 → 유입 트래픽 → 상담 관리 순서로 변경. flow ID/패널 연결·조회/갱신·테마·반응형·상담 상태·통계는 유지한다. admin-efficiency 회귀에 순서/aria-controls/실제 클릭 패널 전환 검증 추가.

PR #52 / main 57d200074a0799fb9d6e4a90e882a927148fc9e3 운영 반영 완료. Vercel 2곳 운영 success, 관련 10개 회귀·ESLint·소스 타입 검사 통과. 운영 공개 JS에서 새 순서, /admin HTTP 200/noindex와 비인증 API 401/no-store 확인. 로컬 두 파일 동기화 후 3개 회귀 통과. 실제 인증 화면 시각 검수는 미수행.

## 2026-10-22 SEO 기반 및 기존 글 보류

사용자가 기존 글 22개의 검수 전 검색 제외를 승인했다. 원문은 src/data/posts.ts에 보존하며 상태/검수 기록 없는 글은 기본 보류다. status=published + 유효한 KST 비미래 발행/검수일 + 검수자 + HTTPS 출처 + 비어 있지 않은 내용만 공개 목록/사이트맵/본문/Article 대상이다. 기존 /blog/[slug]는 robust decode/NFC 조회로 HTTP 200 noindex 검수 안내를 내고 원문을 RSC로 직렬화하지 않는다. dynamicParams=false로 미등록 주소는 404. 새 글 추가 없음.

siteMetadata는 form.it.kr 대표주소/로봇/검증코드/공유메타/JSON-LD를 일원화한다. 현재 sitemap은 /와 /landing 두 개, 빈 /blog는 noindex. utility layout은 noindex+canonical null이며 기존 AdminTheme/EstimateProgressProvider 유지. robots는 noindex를 읽도록 페이지 크롤링을 허용하며 API만 제외한다. SEO_FOUNDATION.md에 정책/게시 게이트/검증/소유확인 잔여 작업을 기록했다. 기존 OG/파비콘·관리자 UI/통계/인증/DB 변경 없음. 전체 회귀 116개와 로컬 HTTP 47개 통과. PR #51 / main 607bccd170d45d55a1ad58c9df271f36d2df1199 운영 완료, primary/duplicate Vercel 검토·운영 success 및 운영 HTTP 47/47 통과. 실제 Google/Naver 소유확인/제출/색인 상태는 미확인이다.

## 2026-10-22 아파트 길잡이 유입처 제외

운영 배포 완료: PR #50 / main 83157ad13683d2f80956dd61c25ba836c9378ca9, primary/duplicate Vercel 검토·운영 success. /admin HTTP 200·유입처 UI 자산/비로그인 API 401/no-store 확인. 활성 설정은 서버 전용이라 공개 JS에서 5곳 데이터를 직접 검수하지 않았고, 인증된 운영 화면 검수는 미수행. 로컬 관련 4개 소스/테스트 동기화 후 25개 회귀 통과.

REFERRAL_SITES에서 buildhyeok_apt/apt.buildhyeok.com만 제외하여 유입처 관리/API 활성 목록은 인테리어프리와 Interior HUB 4곳(총 5곳)이다. 해당 외부 API와 연락처 집계 조회도 더 이상 실행하지 않는다. 기존 traffic_daily/상담/UTM 인식/일반 대시보드의 과거 데이터·서버 환경변수·외부 사이트는 삭제/변경하지 않았다. 남은 5곳의 링크/유입 비율/부분 집계/표 구성은 유지한다. 관련 테스트 25개·ESLint·소스 타입 검사 통과.

인테리어프리 읽기 전용 점검(2026-10-22 11:13 KST): API HTTP 200, 오늘 visitors/recordedVisitors=null 및 visitorDays=0/1, 어제 1명, 최근 7일 알려진 6일 합계 13명. 외부 api/formit-stats.js는 Redis counts와 중복 제거 집합의 합계를 검증할 수 없는 날짜에 null을 반환한다. 오늘이 항상 차단되는 코드는 아니다. 이번 작업은 표시 원인 진단만 수행하며 미제공을 0으로 바꾸거나 외부 수집을 수정하지 않는다.

## 2026-10-22 상담 목록 높이 압축

PR #49 / main f3f8e82c68abe7cd4097d046c0b79e77eca6d9c2 운영 반영 완료. primary/duplicate Vercel 검토·운영 success. /admin HTTP 200 및 공개 JS의 압축 간격/기존 편집·계약률 코드, consultations 비로그인 401/no-store 확인. 실제 인증 화면/모바일 픽셀 검수는 미수행.

AdminConsultations의 목록 카드만 상하 여백 20→12px/좌우 20→16px, 카드 사이 12→8px, 업종 행 margin 7→3px로 압축했다. 버튼은 8px/16px 간격으로 줄바꿈을 유지한다. 이름 17px·업종 13px·접수일/희망 예산/상태·노란 테두리·테마는 보존한다. Editor와 자동 저장/상태/계약률/조회/API/DB는 변경하지 않았다. 관련 테스트 19개·변경 파일 ESLint·소스 타입 검사 통과. browser inventory가 비어 있어 실제 화면/모바일 픽셀 검수는 미수행.

## 2026-10-22 유입처 클릭 표시 제거

PR #48 / main 9f18ff4efd2006c7d80b9a2ee047cd142962fa4e 운영 배포 완료. Vercel 검토·운영 success 및 공개 자산 반영/비인증 401/no-store 확인. 실제 인증 화면/모바일 시각 검수는 미수행.

AdminReferralSites 요약 표와 펼친 상세에서 버튼 클릭/클릭 집계 일수만 제거했다. 사이트 방문·폼잇 유입·연락처 도착·신청 완료 방문·유입 비율은 유지한다. 7열 표로 줄이고 그룹/상세 colSpan은 columns.length를 공유하며 최소 폭은 780px이다. 클릭 수집/서버 응답/유입 비율 계산은 변경하지 않는다. 관련 회귀 23개·변경 파일 ESLint·소스 타입 검사 통과. 실제 운영 배포/브라우저 시각 검수는 별도 확인한다.

## 2026-10-22 유입 비율 기준

유입 비율은 폼잇 유입자/해당 외부 사이트 방문자×100이다. validateReferralStats의 visitorDates는 실제 방문 수가 알려진 KST 날짜(0명 포함, null 제외)다. 전체 날짜가 있으면 admin_dashboard의 source별 합계를 재사용하고 일부만 있으면 동일 source+visitorDates의 traffic_daily exact HEAD count로 분자를 맞춘다. 클릭 기록 누락/오늘 진행 중이어도 숫자를 표시하며 잠정으로 구분한다. rateBasis에는 계산 분자·분모·비교 일수·상태를 담는다. 미수집은 0으로 만들지 않고 0분모/미연결/조회 오류를 구분한다. 원본 선택 기간 합계·API 인증·DB 권한·외부 사이트는 유지하며 마이그레이션 없음. 관련 테스트 22개 통과.

## 2026-10-22 유입처 한 행 표 (카드 대체)

AdminReferralSites는 열 카드 대신 table/tbody 기반 한 사이트 한 행이다. groupReferralRows는 원본을 변경하지 않고 인테리어프리 → .interiorhub.kr 4곳 → 기타로 묶는다. API 배열은 그대로 유지한다. 요약은 4개 주요 수치·비율·연결 상태·부분 범위를 보여주고 행 끝 화살표로 전체 열을 차지하는 상세/홍보 링크를 연다(한 번에 1곳). 모바일은 표 영역만 가로 스크롤. 조회/인증/집계/DB/외부 사이트 변경 없음. 실제 화면은 브라우저 연결 복구 후 검수 필요.

## 2026-10-22 유입처 카드 압축 (후속 표로 대체)

AdminReferralSites의 사이트 grid는 repeat(auto-fit, minmax(min(100%, 340px), 1fr))로 2~3열/좁은 화면 1열이다. 각 카드에 4개 요약 지표, 상태, 부분 합계 범위, 유입 비율·버튼 클릭을 유지하고, 긴 안내/원본 갱신/홍보 링크는 닫힌 details로 제공한다. 링크 복사·기간·취소 가능한 no-store 조회 동작은 그대로다. API/DB/집계 계산 변경 없음. tests/admin-referrals-layout.test.mjs에 표시/기능 회귀 4개 추가.

## 2026-10-21 아파트·빌라 유입처

REFERRAL_SITES는 기존 4곳에 apt.interiorhub.kr/interiorhub_apt 및 villa.interiorhub.kr/interiorhub_villa를 더해 6곳이다. /consult UTM 링크와 UTM 없는 referrer 분류를 지원한다. 고정 HTTPS API, 서버 전용 토큰, 기존 관리자 인증을 유지한다. 두 사이트에 별도 WordPress bridge 1.0.1을 활성화하고 원래 Residential Launch 플러그인·페이지는 보존했다. 최초 설치일은 부분 일자라 null이며 다음 온전한 KST일부터 정상 일일 집계된다. 로컬 소스/ZIP과 외부 사이트 작업 기록은 output/formit-bridge-20261021/README.md(Interior HUB 작업공간)에 기록했다. 새 폼잇 DB 마이그레이션 없음.

## 2026-10-16 유입처 통합
- 2026-10-21 전환 집계는 현재 저장된 상담 기준. 20261021_sync_deleted_consultation_conversion.sql 운영 적용: 삭제 시 동일 브라우저/KST일의 다른 상담이 남으면 전환 유지, 없으면 해제. 방문/출처/페이지 기록 보존. supabase/tests/consultation_conversion_delete.sql은 격리된 로컬 DB 전용.
- 2026-10-21 유입처 기간 통계 점검: 외부 4곳 오늘/어제/7일/30일 API 모두 정상 응답. 일부 날짜 null이면 전체 방문·클릭 합계가 숨겨지던 문제 확인. 전체 기간 값과 수집된 날짜 합계를 분리하고 UI에 부분 합계·방문/클릭 집계 일수·조회/원본 갱신 시각 표시. 불완전한 기간 비율 계산 차단 유지. 기간/API 테스트 10개 통과.
- 2026-10-17 상담 관리 계약률: 선택 접수 기간 계약/전체 상담 비율(소수 1자리), 상태 저장 시 갱신. 검색·상태 필터 분모 영향 없음. 0건/로딩/실패는 —. 기존 테마 대응, 서버/DB 변경 없음.
- 2026-10-16 관리자 효율 점검: 최초 통계 중복 갱신 제거, 숨긴 트래픽 조회 중단, 상담 목록 첫 탭 진입 지연 로드(이후 마운트 보존), 상세견적 중단 중 records?summary=1로 상담 총건수만 조회. 유입처 연락처 도착은 행 다운로드/5만 건 제한 대신 사이트별 정확한 HEAD count 병렬 조회. 집계 의미·자동 저장·인증·DB 스키마 유지. 실측 속도 개선율은 측정하지 않음.
- 2026-10-16 유입처 카드 압축: 여백·통계 높이 축소, 이름/주소 인라인, 홍보 링크 기본 접힘. 집계/서버 변경 없음. 타입·린트·유입처 테스트 통과.
후속 승인 완료: 사용자가 오피스·학원 일별 브라우저 중복 제거 수집과 배포를 직접 승인. 네 사이트 집계 API 검증 및 운영 서버 전용 키 등록 완료. 오피스·학원 10월 17일부터 집계, 아파트 클릭도 10월 17일부터 온전한 수치. 아래 승인 대기 설명은 이전 상태.
AdminReferralSites와 인증된 GET /api/admin/referrals 추가. REFERRAL_SITES는 허용된 4개 사이트의 서버 조회 주소와 UTM 목적지를 고정합니다. FORMIT_REFERRAL_TOKENS는 source→전용 토큰 JSON이며 서버 전용입니다. 외부 통계는 version=1/KST/daily_unique_browser 계약을 검증하고 미수집은 null로 유지합니다. 부분 집계에는 비율을 만들지 않습니다. 폼잇 수치는 기존 admin_dashboard 및 traffic_details와 traffic_daily 관계에서 조회하며 고객 정보나 식별자는 반환하지 않습니다. 새 DB 마이그레이션 없음. 오피스·학원은 별도 수집 승인 전 미연결 유지.

## 2026-10-13 밝은 관리자 대시보드 (미배포)
사용자 참고 화면의 밝은 운영 대시보드로 변경. C.admin과 관리자용 상태 팔레트만 수정. AdminFlowChart는 기존 details.pages를 상담/상세견적으로 분리한 도달 막대이며 이탈률/완료를 추정하지 않습니다. 상태 카드 클릭 시 상담은 initialStatus/key로 목록 초기화, 상세견적은 기존 tab 필터로 이동. 방문 통계 기간과 전체 기간 상태 집계는 명시적으로 구분합니다. 기존 상태 유지 확정. 별도 새 상태/확인할 일 영역/DB 변경 없음. 빌드/타입/린트 및 66 테스트 통과, 1280/390 화면 확인. 로컬 가상 미리보기만 갱신, 배포 안 함.

## 2026-10-12 노란색 관리자 현황 (미배포, 후속 디자인으로 대체)
차콜 재디자인을 사용자 요청으로 따뜻한 블랙/옐로로 수정. AdminStatusOverview에 상담과 상세견적을 별도 패널로 표시. records GET은 인증 후 전체 및 상태별 exact count를 반환하며 최근 500건 목록과 분리합니다. 기존 상태 의미/고객 기록 변경 없음. 미정/완료/불발 신규 상태 추가 여부는 사용자 질문 답변 대기. 소비자 홈은 수정하지 않았습니다.

## 2026-10-12 관리자 디자인 (미배포, 후속 디자인으로 대체)
C.admin에 관리자 전용 팔레트 추가. adminStyles, admin/page, AdminConsultations, AdminTraffic의 화면 구성만 정리했습니다. 메인 및 소비자용 C 토큰은 변경하지 않았습니다. 월별 상태 숫자 카드·접힌 집계 안내·항목별 상담 요약·구분된 편집 영역을 사용합니다. 가상 데이터로 데스크톱/390px 및 저장 확인, 실고객 변경 없음. 배포는 별도 요청 시 진행.

## 2026-10-12 상담 상태 색상
PR #15(0cdaae2) 운영 배포 완료. 아래 미배포/이메일 커밋 제외 메모는 배포 이전 기록이며, 실제 배포에는 이메일 코드가 제거되어 있습니다.
GET /api/admin/consultations의 month=YYYY-MM은 한국시간 월초 이상/다음 월초 미만으로 필터링합니다. summary는 동일 접수 월 전체의 현재 상태 건수(head/count exact)이며 검색/상태/연락 필터와 무관합니다. 월말 역사 상태가 아닙니다. 이메일 발송 모듈/테스트/신청 후 호출은 사용자 취소에 따라 제거하여 운영 배포에 포함되지 않습니다.
AdminConsultations 접힌 카드에는 이름/지역 아래 업종(commercial_type, commercial_sub)과 면적(area, 평)을 노출합니다. 주거는 공간: 주거, 누락/잘못된 면적은 미입력으로 표시합니다. 기존 API 데이터를 사용하며 DB 변경은 없습니다.
후속 요청으로 CONSULT_STATUS_OPTIONS는 contact_attempted를 제외하고 quoted → lost → contracted 순서를 사용합니다. 기존 contact_attempted는 표시/메모 저장 호환을 위해 레이블 및 서버 검증에 남깁니다. lost 저장 시 next_contact_at을 null로 정리하므로 기존 DB overdue 집계에도 포함되지 않습니다. 기존 연락 일정 해제는 편집 UI에 안내합니다.
C.consultStatus에 7개 상태별 전경/배경 토큰을 정의하고 adminStyles의 consultStatusStyle/consultStatusBadge로 상담 목록·선택·필터·통계 요약에 공유합니다. 알 수 없는 기존 상태는 중립색과 기존 텍스트로 유지합니다. 미배포.
이메일 알림은 10월 9일 사용자가 취소했습니다. 기존 이메일 커밋 e8bb443은 운영에 포함하지 말아야 합니다.

## 2026-10-05 상담 접수 알림 (사용자 취소, 미배포)
consultations POST의 신규 INSERT 성공 후 after로 consultNotification을 호출합니다. 저장 실패·중복 제출은 메일 발송 안 함. 메일에는 개인정보 없이 고정 접수 안내와 https://form.it.kr/admin만 넣습니다. 수신자는 사용자 입력이 아닌 서버 환경변수로 결정합니다.
Resend 연결을 위한 Production 전용 환경변수: RESEND_API_KEY(발송 권한 키), CONSULT_NOTIFY_FROM(인증된 발신 도메인의 순수 이메일 주소), CONSULT_NOTIFY_TO(사용자가 지정한 수신 주소). NEXT_PUBLIC 접두사 금지, 키를 채팅·Git에 저장하지 말 것. VERCEL_ENV=production 이외는 발송하지 않습니다. 도메인의 기존 웹사이트 DNS를 교체하지 않고 Resend가 제시한 발신 인증 레코드만 추가해야 합니다.
일시 오류는 5초 제한/최대 3회로 재시도하며 같은 idempotency key를 사용합니다. 영속 큐나 배달 보장 기능은 없으며 지속 장애는 고정 오류 코드만 로그에 남깁니다. 메일 설정·발송 실패가 상담 저장 응답을 실패시키면 안 됩니다. 서비스 연결 및 실제 수신 확인 전에는 완료라고 안내하지 않습니다.

## 2026-10-03 방문 상세 정보 (운영 배포 완료)
record_traffic_v3가 기존 일별 집계를 유지하면서 traffic_details에 허용한 페이지별 도달과 서버에서 추출한 추정 지역·환경·마스킹 IP를 기록합니다. raw IP/UA 및 임의 URL은 저장하지 않습니다. admin_traffic_details는 관리자 전용 서버 RPC이며 국가/지역/환경/페이지 집계와 최근 50건을 반환합니다. 단계 도달 통계는 엄격한 순서 기반 이탈 퍼널이 아닙니다.
관리자 analytics PATCH는 동일 출처·인증·boolean 검증 후 상세 수집 및 IP 수집/표시 설정을 변경합니다. 사용자 승인에 따라 상세 기록만 KST 최근 30일 보존하며 다음 수집·조회에서 정리합니다. 기존 traffic_daily 및 상담 정보는 삭제하지 않습니다. 운영 DB 마이그레이션 적용·롤백 테스트 완료. PR #14(242fcb7)로 운영 배포 성공, 공개 경로·메뉴 반영·관리자 API 비로그인 차단·DNT 제외 확인. 운영 로그인 후 실제 상세 데이터 조회는 별도 확인 필요.

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
