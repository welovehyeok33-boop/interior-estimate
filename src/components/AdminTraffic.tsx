"use client";
import { useEffect, useState } from "react";
import { C } from "@/components/EstimateLayout";
import { conversionRate, koreaDay, type TrafficReport } from "@/lib/analytics";
import TrafficPreference from './TrafficPreference';

export default function AdminTraffic({ refresh }: { refresh: number }) {
  const [data, setData] = useState<TrafficReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function read() {
      setLoading(true); setError("");
      try {
        const r = await fetch("/api/admin/analytics", { cache: "no-store", signal: controller.signal });
        const body = await r.json();
        if (!r.ok) throw new Error(body.error || "통계를 불러오지 못했어요.");
        setData(body);
      } catch (e) {
        if (!controller.signal.aborted) { setError(e instanceof Error ? e.message : "통계 연결 오류"); setData(null); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void read();
    return () => controller.abort();
  }, [refresh, retry]);
  const today = data?.days.at(-1);
  const yesterday = data?.days.at(-2);
  const startedDay = data ? koreaDay(new Date(data.startedAt)) : "";
  const rate = today ? conversionRate(today.converted, today.visitors) : null;
  const max = Math.max(1, ...(data?.days.map(d => Math.max(d.visitors, d.requests)) ?? []));
  const buttonStyle = { background: C.primary, color: C.textDark, border: 0, borderRadius: 8, padding: "8px 12px", cursor: "pointer" };
  return <section aria-label="방문 및 신청 통계" aria-busy={loading}
    style={{ marginBottom: 28, padding: 20, borderRadius: 16, background: C.home.darkCard, color: C.home.onDark, border: `1px solid ${C.home.darkLine}` }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
      <div><h2 style={{ margin: 0, fontSize: 20 }}>오늘의 방문과 신청</h2>
        <p style={{ color: C.home.mutedOnDark, margin: "6px 0 18px", fontSize: 12 }}>한국시간 자정 기준 · 방문자는 브라우저별 하루 1회</p></div>
      <button type="button" disabled={loading} onClick={() => setRetry(v => v + 1)} style={buttonStyle}>통계 새로고침</button>
    </div>
    {error && <p role="alert">{error} <button type="button" onClick={() => setRetry(v => v + 1)} style={buttonStyle}>다시 시도</button></p>}
    <TrafficPreference />
    {loading && <p role="status">통계를 불러오는 중...</p>}
    {data && today && <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {[
          { title: "오늘 방문자", value: today.visitors + "명", note: yesterday && yesterday.day >= startedDay ? `어제 ${yesterday.visitors}명` : "어제 방문 기록 없음" },
          { title: "무료 견적 신청", value: today.requests + "건", note: "오늘 DB에 접수된 신청" },
          { title: "신청 전환율", value: rate === null ? "—" : rate + "%", note: "방문자 중 오늘 신청한 비율" },
          { title: "연락 대기", value: data.pendingRequests + "건", note: `현재 보관 중 전체 신청 ${data.totalRequests}건` },
        ].map(card => <div key={card.title} style={{ padding: 16, background: C.headerFrom, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: C.home.mutedOnDark }}>{card.title}</div>
          <strong style={{ display: "block", fontSize: 28, margin: "9px 0", color: C.primary }}>{card.value}</strong>
          <div style={{ fontSize: 11, color: C.home.mutedOnDark }}>{card.note}</div>
        </div>)}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.8 }}>오늘 상담 입력 시작 <strong>{today.consult_starts}명</strong> · 상세견적 진입 <strong>{today.engine_starts}명</strong> · 신청 완료 방문자 <strong>{today.converted}명</strong></p>
      <h3 style={{ fontSize: 15, margin: "24px 0 12px" }}>최근 7일 추이</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 370, borderCollapse: "collapse", fontSize: 12, textAlign: "right" }}>
          <thead><tr>{["날짜", "방문자", "신청", "전환율", "방문 / 신청"].map(t => <th key={t} style={{ padding: "10px 6px", borderBottom: `1px solid ${C.home.darkLine}` }}>{t}</th>)}</tr></thead>
          <tbody>{data.days.map(d => {
            const hasTraffic = d.day >= startedDay;
            const percent = conversionRate(d.converted, d.visitors);
            return <tr key={d.day}>
              <th scope="row" style={{ padding: "12px 6px", whiteSpace: "nowrap" }}>{d.day.slice(5)}{d.day === today.day ? " 오늘" : ""}</th>
              <td>{hasTraffic ? d.visitors + "명" : "기록 없음"}</td>
              <td>{d.requests}건</td><td>{hasTraffic && percent !== null ? percent + "%" : "—"}</td>
              <td aria-hidden="true" style={{ width: "30%", paddingLeft: 12 }}>
                <div style={{ height: 5, width: `${d.visitors / max * 100}%`, background: C.primary, marginBottom: 4, borderRadius: 4 }} />
                <div style={{ height: 5, width: `${d.requests / max * 100}%`, background: C.home.mutedOnDark, borderRadius: 4 }} />
              </td>
            </tr>;
          })}</tbody>
        </table>
      </div>
      <p style={{ color: C.home.mutedOnDark, fontSize: 11, lineHeight: 1.8, marginBottom: 0 }}>
        방문 집계 시작: {new Date(data.startedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}<br />
        노란 막대는 방문자, 회색 막대는 신청 건수입니다. 새로고침은 방문자를 늘리지 않습니다.
        기기·브라우저 변경 또는 쿠키 삭제 시 별도로 집계됩니다. 관리자 로그인 중인 방문, 알려진 봇, 추적 거부 설정은 제외합니다.
        쿠키가 없는 신청은 접수 건수에만 포함되어 전환율과 차이가 날 수 있습니다. 집계 시작 당일은 일부 시간만 반영됩니다.<br />
        마지막 갱신: {new Date(data.updatedAt).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" })}
      </p>
    </>}
  </section>;
}
