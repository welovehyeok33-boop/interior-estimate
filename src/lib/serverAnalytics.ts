import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { koreaDay } from "./analytics";

export const VISITOR_COOKIE = "formit_visitor";
function key() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("Analytics unavailable");
  return value;
}
function signature(value: string) {
  return createHmac("sha256", key()).update("traffic-v1:" + value).digest("hex");
}
function readId(token?: string) {
  if (!token || !/^[a-f0-9-]{36}\.[a-f0-9]{64}$/.test(token)) return null;
  const [id, mac] = token.split(".");
  return timingSafeEqual(Buffer.from(mac), Buffer.from(signature(id))) ? id : null;
}
export async function visitorIdentity(create = false) {
  const jar = await cookies();
  let id = readId(jar.get(VISITOR_COOKIE)?.value);
  if (!id && !create) return null;
  if (!id) {
    id = randomUUID();
    jar.set(VISITOR_COOKIE, id + "." + signature(id), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
      path: "/", expires: new Date(Date.parse(koreaDay() + "T00:00:00+09:00") + 86400000),
    });
  }
  const day = koreaDay();
  return { day, visitor: signature(day + ":" + id) };
}
export function trafficBucket(request: Request) {
  const ip = (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  return signature("limit:" + ip);
}
