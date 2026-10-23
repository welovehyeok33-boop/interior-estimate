import { INDUSTRIES, INDUSTRY_LABELS, validArea, validBudget } from './intakeValidation';
import { formatConsultBudget } from './consultStore';

// Only these approved summary fields may cross the notification boundary.
export type ConsultationSmsSummary = {
  buildingType: string;
  commercialType?: string;
  commercialSub?: string;
  area: number;
  budget: string;
};

// Fixed labels use ASCII, common Korean syllables and the EUC-KR middle dot.
// Reject other characters rather than under-counting emoji or arbitrary input.
export function fitsShortSms(text: string): boolean {
  if (!text || !/^[\x20-\x7e\n가-힣·]+$/.test(text)) return false;
  return Array.from(text).reduce((bytes, char) => bytes + (char.charCodeAt(0) < 128 ? 1 : 2), 0) <= 90;
}

export function buildConsultationSms(summary: ConsultationSmsSummary): string | null {
  if (!validArea(summary.area) || !validBudget(summary.budget)) return null;
  let category: string;
  let industry: string;
  if (summary.buildingType === 'residential') {
    category = industry = '주거';
  } else if (summary.buildingType === 'commercial' && typeof summary.commercialType === 'string'
    && Object.hasOwn(INDUSTRIES, summary.commercialType)) {
    category = summary.commercialType === 'unknown' ? '업종 미정' : INDUSTRY_LABELS[summary.commercialType];
    const subs = INDUSTRIES[summary.commercialType];
    // Never copy free-form descriptions, even for legacy unknown/other industries.
    industry = typeof summary.commercialSub === 'string' && subs.includes(summary.commercialSub)
      ? summary.commercialSub : category;
  } else return null;
  const budget = summary.budget === 'unknown' ? '미정' : formatConsultBudget(summary.budget);
  const render = (label: string, budgetLabel = '희망예산') =>
    `[폼잇] 새 견적\n${label} · ${summary.area}평\n${budgetLabel} ${budget}\nhttps://form.it.kr/admin`;
  // Prefer the selected sub-industry. If needed, shorten only its category label,
  // never silently truncate the area, budget, or admin link and never use LMS.
  return [render(industry), render(category), render(category, '예산')].find(fitsShortSms) ?? null;
}
