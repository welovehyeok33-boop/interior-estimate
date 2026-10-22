# SEO 기반 정리 — 2026-10-22

사용자 승인: 기존 글 22개는 검수 전 검색에서 제외한다. 새 글을 추가하지 않으며, 원문은 `src/data/posts.ts`에 그대로 보관한다.

## 현재 공개·검색 정책

- `/`와 `/landing`: 각각 고유한 제목·설명·대표주소를 가진 검색 허용 페이지. 사이트맵도 이 두 주소만 포함한다.
- `/blog`: 검수를 마친 글이 없어 안내만 노출하고 `noindex, follow`. 향후 승인된 글이 생기면 목록과 사이트맵이 함께 열린다.
- 기존 `/blog/[slug]` 22개: 한글/인코딩 주소를 정상 인식하고 HTTP 200 검수 안내와 `noindex, follow`를 반환한다. 검수 전 본문·설명은 HTML/RSC·클라이언트 props에 넣지 않고 Article 구조화 데이터도 생성하지 않는다. 알 수 없는 글 주소는 404다.
- `/admin`, `/consult` 하위, `/estimate` 하위, `/login`, `/signup`, `/partner` 하위, `/privacy`: `noindex, follow`, 홈 canonical 상속 제거. 인증/API 차단을 대신하는 설정이 아니다.
- robots.txt는 `https://form.it.kr/sitemap.xml`을 가리킨다. noindex를 읽을 수 있도록 해당 페이지 크롤링은 허용하며 API만 차단한다.
- 모든 canonical/OG 주소는 `https://form.it.kr`. 운영에서 승인된 기존 공유 이미지·파비콘과 관리자 테마·데이터·수집 기능은 변경하지 않는다.
- Organization/WebSite JSON-LD는 실제 브랜드·주소·기존 180px 아이콘만 사용한다. 미확인 전문가 자격, 주소, 평점, 허위 검수자를 만들지 않는다. Preview 환경은 공개 페이지도 noindex다.

## 기존 글 재공개 조건

각 글의 근거/단가 적용 조건/오래된 연도/안전·법률 관련 내용을 사람이 먼저 검수한다. 파일의 `status: 'published'`, 유효한 발행일, 이름이 있는 검수자와 검수일, 제목이 있는 HTTPS 출처가 모두 있어야 공개된다. 빈 내용/미래 날짜/잘못된 날짜/자격 증명이 포함된 출처 URL은 게시 게이트를 통과하지 못한다. 필드가 채워졌다는 사실만으로 내용의 정확성이 검증되지는 않는다.

승인된 글만 본문·출처·검수 기록·관련 글·Article/BreadcrumbList JSON-LD·사이트맵에 포함한다. 날짜는 실제 발행/검수 기록을 쓰며 매 요청마다 현재 시각으로 갱신하지 않는다. 본문 렌더러는 기존의 제한된 Markdown 형식(문단·제목·목록·표·인용·코드·굵게)을 처리하고 원시 HTML은 실행하지 않는다. 새 게시물은 이 형식의 지원 범위를 검토한 후 추가한다.

## 별도로 확인할 항목

- Google Search Console 및 네이버 서치어드바이저 소유 확인과 사이트맵 제출 여부는 확인/실행하지 않았다. 환경변수 `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`에 소유 계정이 발급한 코드가 있으면 해당 확인 메타태그가 출력된다. 임의 코드를 만들지 않았다.
- 실제 색인 제외/재수집에는 시간이 걸린다. noindex 배포나 사이트맵 제출만으로 노출 순위·즉시 반영을 보장하지 않는다.
- 공개 글이 0개이므로 RSS는 만들지 않았다. 재공개 후 실제 승인된 글만 담는 피드를 별도 검토한다.
- 인증된 관리자 화면의 픽셀/모바일 시각 검수는 이번 작업에서 수행하지 않았다. 관리자 UI/인증/DB 마이그레이션은 변경하지 않는다.

## 검증

- 회귀 테스트 전체: `node --experimental-strip-types --test tests/*.test.mjs` (PowerShell에서는 파일 목록을 배열로 전달).
- SEO 회귀 11개: 게시 게이트·한글 slug·모든 22개 보류 응답·메타데이터·사이트맵·안전한 JSON-LD·승인 템플릿의 단일 H1/목록/표.
- 소스 타입 검사 및 변경 파일 ESLint.
- 읽기 전용 실제 HTTP 47개: `node --experimental-strip-types scripts/check-seo.mjs http://127.0.0.1:3012`. 운영 배포 후 인자 없이 같은 검사를 실행한다. 고객 데이터/방문 이벤트/신청을 생성하지 않는다.

## 공식 기준

- [Google: noindex를 읽을 수 있도록 크롤링 허용](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: canonical URL과 실제 수정일 기준 사이트맵](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [네이버: 검색 최적화 기본 가이드](https://searchadvisor.naver.com/guide/seo-basic-intro)
