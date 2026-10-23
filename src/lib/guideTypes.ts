export type GuideStage = {
  id: string;
  title: string;
  summary: string;
  items: readonly { id: string; title: string; detail: string }[];
};

export type GuideSource = { title: string; url: string };
export type GuideBody = { points: readonly string[]; question: string; record: string };
export type GuideDetailItem = {
  id: string;
  title: string;
  detail: string;
  stageId: string;
  stageTitle: string;
  step: number;
  previous: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
};
