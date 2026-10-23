export const COMMERCIAL_STAGES = [
  { id: 'plan', percent: 0, title: '업종과 공간 계획 정하기', summary: '어떤 사업을 어떻게 운영할지 먼저 정리해요.', items: [
    { id: 'plan-business', title: '업종과 필요한 공간 정리하기', detail: '사무·판매·조리·교육 등 실제 활동과 고객·직원의 동선을 적어보세요.' },
    { id: 'plan-budget', title: '예산과 오픈 일정 나누기', detail: '공사비 외 장비·집기·이전 비용과 영업 준비 일정을 함께 정리하세요.' },
  ] },
  { id: 'lease', percent: 15, title: '임대·건물 조건 확인하기', summary: '계약과 공사 전에 이 공간의 조건을 확인해요.', items: [
    { id: 'lease-use', title: '건물 용도와 영업 가능 여부 확인하기', detail: '실제 업종과 건물 조건에 필요한 확인을 관할 기관·전문가에게 요청하세요.' },
    { id: 'lease-consent', title: '임대인 동의와 원상복구 조건 확인하기', detail: '공사 가능 범위와 간판·공용부 사용, 계약 종료 시 조건을 문서로 확인하세요.' },
  ] },
  { id: 'compare', percent: 30, title: '현장과 견적 비교하기', summary: '설비 조건과 같은 공사 범위로 비교해요.', items: [
    { id: 'compare-site', title: '실측과 기존 설비 상태 확인하기', detail: '현장 치수와 전기·급배수·환기 등의 조건을 담당 전문가와 확인하세요.' },
    { id: 'compare-quote', title: '업체와 견적의 포함·별도 항목 비교하기', detail: '실제 계약 상대와 담당자, 자재·설비·철거 등 견적 범위를 맞춰보세요.' },
  ] },
  { id: 'contract', percent: 45, title: '인테리어 계약 확인하기', summary: '공사 범위와 바뀔 때의 절차를 남겨요.', items: [
    { id: 'contract-scope', title: '공사 범위·자재·지급 조건 확인하기', detail: '도면·견적·일정과 지급 조건이 최종 계약 내용에 어떻게 포함되는지 확인하세요.' },
    { id: 'contract-change', title: '추가 공사와 지연·보수 조건 정하기', detail: '변경 승인과 정산 방법, 일정 변경·하자 접수 절차를 문서에 남기세요.' },
  ] },
  { id: 'before-work', percent: 60, title: '착공과 사전 절차 준비하기', summary: '업종·건물별 확인과 현장 일정을 맞춰요.', items: [
    { id: 'before-permits', title: '업종별 사전 확인과 담당자 정하기', detail: '필요한 건축·위생·소방 등 확인 범위를 관할 기관에 문의하고 담당을 정하세요.' },
    { id: 'before-building', title: '건물 공사 절차와 현장 인계 정리하기', detail: '작업 시간·보양·반출입과 기존 상태, 출입·연락 방법을 공유하세요.' },
  ] },
  { id: 'during-work', percent: 75, title: '공사 중 설비와 변경 확인하기', summary: '완성 뒤 보이지 않을 부분과 변경 내용을 기록해요.', items: [
    { id: 'during-services', title: '설비 공정과 확인 자료 챙기기', detail: '배관·배선·환기 등은 담당 전문가의 점검 결과와 공정 기록을 요청하세요.' },
    { id: 'during-design', title: '자재·배치·일정 변경 확인하기', detail: '실제 제품·장비 배치·동선이 합의한 내용과 맞는지 확인하세요.' },
  ] },
  { id: 'handover', percent: 90, title: '완공·인수·정산 준비하기', summary: '남은 작업과 인수 자료를 구분해요.', items: [
    { id: 'handover-inspect', title: '계약 대조와 보완 목록 작성하기', detail: '시공 범위와 안전한 사용 상태를 담당자와 살피고 보완 일정을 합의하세요.' },
    { id: 'handover-settle', title: '최종 정산과 시설 인수 자료 챙기기', detail: '변경·지급 내역을 대조하고 제품·보증·관리 자료를 받으세요.' },
  ] },
  { id: 'opening', percent: 100, title: '오픈 전 확인과 운영 준비하기', summary: '공사 완료와 영업 준비는 각각 확인해요.', items: [
    { id: 'opening-ready', title: '영업 전 필요한 절차와 시설 확인하기', detail: '내 업종에 필요한 절차의 완료 여부와 장비 사용 안내를 확인하세요.' },
    { id: 'opening-care', title: '운영·하자보수 연락과 기록 정리하기', detail: '오픈 후 발견한 문제의 접수 방법과 유지관리 자료를 모아두세요.' },
  ] },
] as const;

export const COMMERCIAL_ITEMS = COMMERCIAL_STAGES.flatMap((stage, index) => stage.items.map(item => ({ ...item, stageId: stage.id, stageTitle: stage.title, step: index + 1 })));
export type CommercialItemId = (typeof COMMERCIAL_ITEMS)[number]['id'];

export function commercialGuidePath(id: CommercialItemId): string { return '/blog/commercial/' + id; }

export function getCommercialGuide(id: string) {
  const index = COMMERCIAL_ITEMS.findIndex(item => item.id === id);
  if (index < 0) return undefined;
  return { ...COMMERCIAL_ITEMS[index], previous: COMMERCIAL_ITEMS[index - 1] ?? null, next: COMMERCIAL_ITEMS[index + 1] ?? null };
}

export type CommercialGuide = NonNullable<ReturnType<typeof getCommercialGuide>>;

export const COMMERCIAL_SOURCES = [
  { title: '찾기쉬운 생활법령정보 · 음식점 창업의 영업신고·허가 안내 (업종별 확인 예시)', url: 'https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?ccfNo=5&cciNo=1&cnpClsNo=1&csmSeq=839&menuType=cnpcls' },
  { title: '국가법령정보센터 · 건축물대장 발급·열람 안내', url: 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1020109037' },
] as const;
