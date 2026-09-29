import { redirect } from "next/navigation";

export default function PartnerLeadsPage() {
  // Partner authorization and consent are not ready for public release.
  redirect("/admin");
}
