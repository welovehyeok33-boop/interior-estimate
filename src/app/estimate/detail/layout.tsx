import EstimateGuard from "@/components/EstimateGuard";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <EstimateGuard>{children}</EstimateGuard>;
}
