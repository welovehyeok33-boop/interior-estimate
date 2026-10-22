import type { ReactNode } from "react";
import { EstimateProgressProvider } from "@/components/EstimateProgressProvider";
import { utilityMetadata } from '@/lib/siteMetadata';

export const metadata = utilityMetadata('무료 견적 상담 신청');

export default function ConsultLayout({ children }: { children: ReactNode }) {
  return <EstimateProgressProvider>{children}</EstimateProgressProvider>;
}
