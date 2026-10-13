import { redirect } from "next/navigation";
import { DETAIL_ESTIMATE_ENABLED } from "@/lib/features";
import type { ReactNode } from "react";
import { EstimateProgressProvider } from "@/components/EstimateProgressProvider";

export default function EstimateDetailLayout({ children }: { children: ReactNode }) {
  if (!DETAIL_ESTIMATE_ENABLED) redirect("/estimate");
  return <EstimateProgressProvider>{children}</EstimateProgressProvider>;
}
