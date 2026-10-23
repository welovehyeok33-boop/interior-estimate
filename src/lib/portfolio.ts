export const PORTFOLIO_FIELDS = [
  { id: 'interior', number: '01', label: '인테리어', english: 'INTERIOR', status: '출발점', title: '기술보다 먼저, 공간을 이해합니다.', description: '주거와 상가, 그 공간을 쓰는 사람과 공사를 준비하는 과정. 우리가 풀고 싶은 질문은 인테리어 현장에서 시작됩니다.', output: '공간 · 공사 범위 · 사용자 경험', connection: '현장의 질문을 개발의 설계 조건으로 연결합니다.' },
  { id: 'development', number: '02', label: '개발', english: 'DEVELOPMENT', status: '현재 작업', title: '복잡한 과정을, 쓰기 쉬운 서비스로.', description: '공간과 예산을 묻는 신청 화면부터 상담을 관리하는 도구까지. 필요한 정보를 한 번에 이해하고 사용할 수 있도록 만듭니다.', output: '웹 서비스 · UX/UI · 운영 도구', connection: '서비스에서 반복되는 정보를 AI 확장의 출발점으로 삼습니다.' },
  { id: 'ai', number: '03', label: 'AI', english: 'ARTIFICIAL INTELLIGENCE', status: '확장 방향', title: '많은 정보에서, 필요한 맥락을 찾습니다.', description: '견적 항목을 읽고 정리하거나 반복 업무를 돕는 방향을 탐색합니다. AI 견적 스캔은 준비 중이며, 현재 자동 분석 서비스를 제공하는 것은 아닙니다.', output: '정보 구조화 · 반복 업무 지원 구상', connection: '정리된 정보가 콘텐츠와 고객 경험에 활용되는 방향을 설계합니다.' },
  { id: 'marketing', number: '04', label: '마케팅', english: 'MARKETING', status: '현재 작업 · 확장', title: '좋은 서비스를, 필요한 사람에게.', description: '정보를 찾는 사람과 서비스를 연결하고, 유입과 상담 흐름을 살펴봅니다. 결과는 다시 콘텐츠와 서비스의 개선에 연결합니다.', output: '콘텐츠 · 유입 분석 · 개선', connection: '고객의 반응을 다시 공간과 서비스의 질문으로 돌려보냅니다.' },
] as const;

export type PortfolioFieldId = (typeof PORTFOLIO_FIELDS)[number]['id'];
export function getPortfolioField(id: string) {
  return PORTFOLIO_FIELDS.find(field => field.id === id) ?? PORTFOLIO_FIELDS[0];
}

// Verified platform work, not invented construction projects or third-party client work.
export const PORTFOLIO_WORKS = [
  { id: 'consultation', number: '01', title: '인테리어의 첫 질문을,\n하나의 신청 흐름으로.', name: '폼잇 무료 견적 상담', type: '서비스 기획 · UX/UI · 웹 개발', description: '공간, 면적, 일정과 예산을 차례로 정리하는 상담 신청 경험. 소비자의 입력과 운영자의 확인 흐름을 연결한 작업입니다.', status: '운영 중', links: [{ label: '서비스 둘러보기', href: '/landing' }] },
  { id: 'guides', number: '02', title: '계약 전부터 그다음까지,\n준비의 순서를 보이게.', name: '주거 · 상가 인테리어 가이드', type: '정보 설계 · 콘텐츠 구조 · 인터랙션', description: '위에서 아래로 내려가는 줄자를 따라 준비 단계를 살펴보고, 궁금한 항목은 상세 페이지로 이어집니다. 현재는 기본 틀을 다듬는 단계입니다.', status: '기본 틀 공개', links: [{ label: '주거 가이드', href: '/blog/residential' }, { label: '상가 가이드', href: '/blog/commercial' }] },
  { id: 'operations', number: '03', title: '방문에서 상담까지,\n흐름이 보이는 운영.', name: '유입 분석 · 상담 관리', type: '운영 도구 · 데이터 시각화', description: '사이트 방문과 폼잇 유입, 신청과 상담 상태를 함께 확인하는 관리자 도구. 실제 고객 정보와 내부 수치는 공개하지 않고 관리 구조만 소개합니다.', status: '내부 운영', links: [] },
] as const;

export const PORTFOLIO_PREVIEW_NOTICE = '회사 소개 · 포트폴리오 콘셉트 시안';
export const PORTFOLIO_IMAGE_NOTICE = 'AI로 제작한 공간 콘셉트 이미지 · 실제 시공 실적이 아닙니다.';
