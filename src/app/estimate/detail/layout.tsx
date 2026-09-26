import type { ReactNode } from "react";
import { EstimateProgressProvider } from "@/components/EstimateProgressProvider";

export default function EstimateDetailLayout({ children }: { children: ReactNode }) {
  return <EstimateProgressProvider>{children}</EstimateProgressProvider>;
}
