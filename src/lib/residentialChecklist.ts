export const RESIDENTIAL_CHECKLIST_KEY = 'formit_residential_checklist_v1';

export const RESIDENTIAL_STAGES = [
  {
    id: 'plan', percent: 0, title: '어디를, 얼마나 바꿀지 정하기', summary: '견적을 받기 전, 내 기준부터 정리해요.',
    items: [
      { id: 'plan-scope', title: '공사할 공간과 남길 부분 정하기', detail: '전체 공사인지 부분 공사인지, 꼭 필요한 항목과 선택 항목을 나눠보세요.' },
      { id: 'plan-budget', title: '예산에 포함할 항목 정리하기', detail: '공사비 외에 가구·가전·이사·임시 거주 비용도 따로 적어두세요.' },
      { id: 'plan-schedule', title: '공사 희망일과 입주일 정하기', detail: '현재 거주지 일정과 새 공간 사용 일정을 함께 확인하세요.' },
    ],
  },
  {
    id: 'compare', percent: 15, title: '업체와 견적 비교하기', summary: '같은 공사 범위로 비교해야 차이가 보여요.',
    items: [
      { id: 'compare-company', title: '실제 계약할 사업자 확인하기', detail: '사업자명·연락처·사업장과 담당자를 확인하고, 필요한 건설업 등록도 확인하세요.' },
      { id: 'compare-scope', title: '포함·별도 공사를 구분한 견적 받기', detail: '철거·폐기물·자재·시공·세금 등이 어디까지 포함인지 업체에 물어보세요.' },
      { id: 'compare-material', title: '자재와 규격을 같은 조건으로 맞추기', detail: '브랜드·제품명·규격·수량이 다르면 총액만으로 비교하기 어려워요.' },
    ],
  },
  {
    id: 'contract', percent: 30, title: '서명 전에 계약서 확인하기', summary: '말로 합의한 내용도 문서에 남겨요.',
    items: [
      { id: 'contract-document', title: '계약서와 상세 견적서 함께 받기', detail: '공사 범위·자재·규격·공사 기간이 합의한 내용과 일치하는지 확인하세요.' },
      { id: 'contract-payment', title: '대금 지급 시점과 조건 확인하기', detail: '총액과 지급 일정을 적고, 각 지급 단계에서 무엇을 확인할지 합의하세요.' },
      { id: 'contract-change', title: '추가·변경 공사 합의 방법 정하기', detail: '변경 범위·금액·기간을 작업 전에 서면으로 확인하는 절차를 정하세요.' },
      { id: 'contract-as', title: '하자보수 담당과 처리 조건 확인하기', detail: '보수 주체·범위·기간·연락 방법, 지연·해지 조건과 보증 여부를 확인하세요.' },
    ],
  },
  {
    id: 'before-work', percent: 45, title: '착공 전 생활과 현장 준비하기', summary: '우리 집 일정뿐 아니라 건물의 절차도 확인해요.',
    items: [
      { id: 'before-building', title: '관리사무소에 공사 절차 확인하기', detail: '신고·동의·작업 시간·보양·엘리베이터 사용 등 이 건물에 필요한 절차를 문의하세요.' },
      { id: 'before-permission', title: '구조·설비 변경의 사전 확인 받기', detail: '철거·확장·구조·전기·가스 등의 변경은 업체와 관리 주체에 필요한 절차를 확인하세요. 직접 작업하지 마세요.' },
      { id: 'before-record', title: '기존 상태와 인계 내용 남기기', detail: '공사 전 사진, 남길 물건, 열쇠 전달과 현장 연락 방법을 정리하세요.' },
    ],
  },
  {
    id: 'during-work', percent: 60, title: '공사 중 바뀐 내용 확인하기', summary: '덮이고 나면 확인하기 어려운 부분을 기록해요.',
    items: [
      { id: 'during-progress', title: '담당자와 일정·변경 사항 확인하기', detail: '진행 상황과 지연 사유를 기록하고 변경되는 완료 예정일을 확인하세요.' },
      { id: 'during-hidden', title: '가려지는 공정의 확인 자료 받기', detail: '배관·배선·방수 등은 담당 전문가의 점검 결과와 공정 사진을 요청하세요.' },
      { id: 'during-material', title: '반입 자재를 계약 내역과 대조하기', detail: '제품·색상·규격이 다르면 시공 전에 설명과 변경 합의 내용을 확인하세요.' },
    ],
  },
  {
    id: 'inspection', percent: 75, title: '완공 전에 함께 둘러보기', summary: '공간별로 확인하고 남은 작업을 한 장에 모아요.',
    items: [
      { id: 'inspection-scope', title: '계약 항목과 실제 시공 대조하기', detail: '빠진 공사나 다른 자재가 없는지 견적서와 함께 확인하세요.' },
      { id: 'inspection-finish', title: '마감과 사용 상태 함께 확인하기', detail: '문·가구의 열림, 마감 손상과 설비 작동을 담당자와 확인하세요. 위험한 시험은 전문가에게 요청하세요.' },
      { id: 'inspection-list', title: '보완할 항목과 완료 예정일 남기기', detail: '위치·사진·요청 사항·담당자를 정리하고 처리 일정을 합의하세요.' },
    ],
  },
  {
    id: 'handover', percent: 90, title: '인수와 정산 자료 챙기기', summary: '마무리된 내용과 남은 약속을 구분해요.',
    items: [
      { id: 'handover-repair', title: '보완 작업 결과와 인수 조건 확인하기', detail: '미완료 항목이 있으면 처리 일정과 인수·지급 조건을 계약에 맞춰 협의하세요.' },
      { id: 'handover-payment', title: '최종 금액과 증빙 대조하기', detail: '원계약·서면 변경 내역·지급 내역을 비교하고 거래 증빙을 보관하세요.' },
      { id: 'handover-docs', title: '보증·제품·관리 자료 받기', detail: '자재와 제품 정보, 보증 서류, 사용 설명과 하자 접수 연락처를 챙기세요.' },
    ],
  },
  {
    id: 'after-move', percent: 100, title: '입주 후에도 기록 이어가기', summary: '실제로 생활하며 발견한 불편도 놓치지 않아요.',
    items: [
      { id: 'after-record', title: '발견한 문제를 사진과 날짜로 남기기', detail: '발생 위치·증상·발견 시점과 업체에 전달한 내용을 함께 보관하세요.' },
      { id: 'after-contact', title: '계약상 담당자에게 보수 요청하기', detail: '공종과 계약에 따라 보수 조건이 다를 수 있어요. 적용 조건과 처리 일정을 확인하세요.' },
      { id: 'after-archive', title: '계약·변경·보수 기록 모아두기', detail: '분쟁이 해결되지 않으면 보관한 자료를 바탕으로 한국소비자원의 상담·피해구제 안내를 확인하세요.' },
    ],
  },
] as const;

export const RESIDENTIAL_CHECK_IDS: readonly string[] = RESIDENTIAL_STAGES.flatMap(stage => stage.items.map(item => item.id));

export function parseResidentialChecks(raw: string): string[] {
  if (raw.length > 10000) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return RESIDENTIAL_CHECK_IDS.filter(id => value.includes(id));
  } catch { return []; }
}

export function guideScrollPercent(progress: number): number {
  return Number.isFinite(progress) ? Math.round(Math.max(0, Math.min(1, progress)) * 100) : 0;
}

export const RESIDENTIAL_SOURCES = [
  { title: '한국소비자원 · 주택 리모델링 소비자 주의사항 (2020)', url: 'https://www.kca.go.kr/kca/sub.do?menukey=5293&mode=view&no=1002952671' },
  { title: '한국소비자원 · 인테리어 업체 선정·계약 시 유의사항 (2016)', url: 'https://www.kca.go.kr/home/sub.do?menukey=4005&mode=view&no=1001947436' },
] as const;
