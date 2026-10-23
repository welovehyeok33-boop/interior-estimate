# 회사 포트폴리오 콘셉트 시안

사용자 요청: 인테리어를 기반으로 개발·AI·마케팅이 서로 상호작용하는 회사 포트폴리오 페이지. 회사명·실적 자료 대신 우선 예시로 제작한다.

- 주소: `/portfolio`. 홈과 기존 메뉴는 변경하지 않으며 별도 주소로만 확인한다.
- 콘셉트 시안임을 표시한다. 고유 canonical과 `noindex, follow`, 사이트맵 제외 유지. 회사명과 실제 공개 자료 확정 후 검색 공개를 검토한다.
- 인테리어→개발→AI→마케팅→경험 개선의 연결 맵. 네 분야 버튼과 접근성 상태·설명 연결 제공. 선택은 컴포넌트 메모리에만 두고 서버·브라우저 저장을 사용하지 않는다.
- 작업 예시는 하나의 폼잇 플랫폼 안의 상담·주거/상가 가이드·운영 도구다. 별도 고객사나 시공 프로젝트 실적으로 제시하지 않는다.
- 공개 예시에 고객 이름·연락처·실제 관리자 수치·매출·임의 성과는 없다. 관리자 주소/데이터 조회/새로운 수집은 연결하지 않는다.
- AI 견적 스캔은 확장 방향·준비 중이며 현재 파일 업로드/자동 분석/시세 판정을 제공하지 않는다고 명시한다.
- 사이트 기존 브랜드 토큰과 인라인 스타일을 사용한다. Sites의 프레젠테이션·검수 원칙을 참고하되 기존 Next/Vercel을 유지한다.

## 이미지 제작 기록

- 방식: 기본 내장 image_gen 도구. 외부 CLI/API·추가 키 사용 없음.
- 프로젝트 자산: `public/portfolio/space-concept-v1.png` (1536×1024 PNG). Next Image가 반응형 크기·로딩을 처리한다.
- 원본: `C:/Users/user/.codex/generated_images/01a0b8a9-64fd-7380-8d4d-67b4c6b891e7/exec-b5c8594f-4305-48a8-bd03-4d7c00e4ff3f.png`. 원본은 보존했다.
- 웹 이미지 옆에 AI 공간 콘셉트이며 실제 시공 실적이 아니라는 설명을 항상 표시한다.
- 최종 프롬프트:

> Use case: photorealistic-natural. Asset type: hero photograph for an interior-led company portfolio website concept. Create one refined editorial architectural interior image, wide horizontal composition approximately 3:2. A contemporary Korean residential lounge and dining space with warm ivory plaster, pale natural oak joinery, travertine and tactile linen, a large side window casting soft afternoon light and deliberate architectural shadows. Restrained furniture, one sculptural pendant, calm lived-in quality but no people. Camera eye level, natural wide architectural perspective, precise material detail, high-end design magazine composition. Palette warm cream, oak, charcoal and a small muted golden accent, matching an understated black/yellow interior brand. No text, no typography, no logos, no collage, no interface, no watermarks. This is an explicitly illustrative interior concept, not a depiction of a claimed real construction project.
