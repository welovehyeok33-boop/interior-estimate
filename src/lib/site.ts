// Set NEXT_PUBLIC_SITE_URL when moving to the confirmed custom domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://interior-estimate-rouge.vercel.app").replace(/\/$/, "");
