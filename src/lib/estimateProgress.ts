export const ESTIMATE_STEP_LABELS = ["지역·유형", "면적", "공종", "자재", "완성"] as const;

const ESTIMATE_STEP_PATHS = [
  "/estimate/detail",
  "/estimate/detail/step2",
  "/estimate/detail/step3",
  "/estimate/detail/step4",
  "/estimate/detail/step5",
] as const;

const CONSULT_STEP_PATHS = [
  "/consult",
  "/consult/step2",
  "/consult/step3",
  "/consult/step4",
] as const;

export function getEstimateStep(pathname: string | null): number {
  const normalizedPath = pathname?.replace(/\/+$/, "");
  const paths = normalizedPath?.startsWith("/consult") ? CONSULT_STEP_PATHS : ESTIMATE_STEP_PATHS;
  const index = paths.findIndex(path => path === normalizedPath);
  return index < 0 ? 1 : index + 1;
}
