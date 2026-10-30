# 출처 확인 방문 집계

폼잇 유입처 관리의 **외부 사이트 방문자 수**에서 직접접속·출처 확인 불가를 제외한다. 폼잇 자체 유입·신청 원본과 기존 외부 사이트 통계는 보존한다.

- `visitor_scope=known_referrer`를 명시한 기존 인증 API 요청에만 필터한 값을 제공한다.
- 폼잇 서버는 `visitorScope: known_referrer`를 검증한다. 구형 수집기가 매개변수를 무시한 전체 합계로 대체하지 않는다.
- 실제 외부 HTTP(S) referrer가 있는 브라우저를 사이트별·한국시간 날짜별 한 번 센다. 내부 주소·빈 referrer·UTM 이름만 있는 방문은 제외한다. 기존 수집 거부·DNT/GPC·관리자·알려진 봇 제외를 유지한다.
- 기존 식별자를 날짜별 HMAC으로 처리한다. 새 외부 서비스나 교차 사이트 브라우저 연결은 없다. 폼잇에는 날짜별 합계만 전달한다.

## Interior HUB 4곳

별도 플러그인을 설치하지 않고 이 PHP 모듈을 **기존 파일 끝에 한 번만** 추가한다. 첫 `<?php`는 제거하고 원래 코드의 PHP 영역 안에 붙인다. 원본은 백업하고 편집기에서 실제 저장 파일·앞부분을 확인한다.

이미 v1.0.0이 있으면 `// Formit known-referrer module v1.0.0.` 마커부터 끝의 모듈 영역만 v1.1.0으로 교체한다. 기존 수집기 본문은 보존하고 모듈을 중복 추가하지 않는다.

- OFFICE·ACADEMY: 기존 `ih-admin/formit.php`
- APT·VILLA: 기존 `formit-residential-bridge/ih-formit-bridge.php`

**v1.1.0은 기존 Koko Analytics의 출처별 순방문 기록을 읽는다.** v1.0.0의 신규 빈 테이블 때문에 HUB 과거 방문이 0명처럼 보이던 문제를 바로잡는다. 새 테이블이나 수집기를 만들지 않는다. 기존 통계·인증·기본 응답·수집 설정은 변경하지 않는다.

설치된 Koko Analytics 2.5.3의 `Pageview_Aggregator.php`를 확인했다. `referrer_stats.unique_hits`는 사이트 전체의 동일한 `new_visitor` 플래그로 증가한다. 페이지뷰나 Koko 화면의 최소 1명 보정값을 합산하지 않고, 실제 외부 참조처의 raw unique_hits만 합산한다. Cookie 방식(사이트 자정에 만료)과 요청 기간의 UTC+9 날짜 경계를 확인하며, 일별 출처 합계가 같은 공급자 전체 방문보다 많으면 해당 날짜는 미확인이다. 단순 30분 세션 수나 현재 source별 비율로 과거 브라우저 방문을 추정하지 않는다.

기존 site_stats 기록이 없는 과거 날짜는 `null`, site_stats에는 방문이 있지만 외부 참조처가 없으면 실제 출처 확인 방문 0명이다. API는 `provider: koko_cookie`와 기존 보관 기록의 시작 날짜를 반환한다. 클릭은 수집 근거가 없어 `null`이며 사용하지 않는 클릭 누락으로 방문 기록을 부분 집계 처리하지 않는다. v1.0.0에서 이미 생성한 테이블은 추가 쓰기 없이 보존하고 90일 만료 정책만 유지한다.

검증은 PHP 8 이상에서 `php integrations/formit-known-referrer/tests/retained-source.php`로 실행한다. 동일한 파일을 WordPress 공식 PHP.wasm의 PHP 8.3에서도 실행해 35개 assertion을 확인했다. 배경: [Koko의 쿠키 만료와 중복 제거](https://www.kokoanalytics.com/docs/faq/does-koko-analytics-use-cookies/), [출처별 raw 집계 구현](https://github.com/ibericode/koko-analytics/blob/main/src/Pageview_Aggregator.php).

## 인테리어프리

기존 Redis 트래픽 기록을 저장소 안에서만 필터한다. 날짜별 상세 행 수와 방문자 세트 수가 모두 일치하는 날만 사용한다. 상세 보관 만료·상한·손상·누락은 `null`로 표시한다. 출처가 남지 않은 방문을 직접접속으로 추정해 임의 삭제하지 않는다.

## 배포 순서와 원복

먼저 각 외부 API의 필터 응답·인증 차단을 검증한 뒤 폼잇 서버의 필터 요청을 배포한다. 외부 적용이 끝나기 전에 폼잇만 배포하지 않는다. 원복은 폼잇 요청을 이전 버전으로 돌리면 된다. 새 집계 테이블 자동 삭제는 하지 않는다.

브라우저의 referrer 전달 정책 때문에 실제 방문의 출처도 확인되지 않을 수 있다. 이 값은 봇을 식별한 인원 수가 아닌 **출처 확인 방문 집계**다. 폼잇 유입 열은 실제 도착 기록을 유지하므로 직접 진입한 방문자가 나중에 폼잇으로 이동하거나 링크가 공유되면 분자·분모의 대상이 다를 수 있다.
