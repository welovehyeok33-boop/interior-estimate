import type { ReferralReport, ReferralRow } from './referralSites';

// Read one authenticated request incrementally; also accept the existing JSON endpoint contract.
export async function readReferralReport(response: Response, update: (report: ReferralReport, pending: boolean) => void, signal: AbortSignal) {
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || '조회 실패');
  }
  if (!response.headers?.get('content-type')?.includes('application/x-ndjson')) {
    const report: ReferralReport = await response.json();
    if (!signal.aborted) update(report, false);
    return;
  }
  if (!response.body) throw new Error('집계 응답을 확인하지 못했어요.');
  const reader = response.body.getReader(), decoder = new TextDecoder();
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', abort, { once: true });
  let report: ReferralReport | null = null, buffer = '', complete = false;
  const received = new Set<string>();
  const message = (line: string) => {
    if (!line.trim() || signal.aborted) return;
    const event = JSON.parse(line);
    if (complete) throw new Error('집계 응답 순서를 확인하지 못했어요.');
    if (event.type === 'start' && !report && Array.isArray(event.report?.rows)) {
      report = event.report as ReferralReport;
      update(report, true);
    } else if (event.type === 'row' && report && typeof event.row?.source === 'string' &&
      report.rows.some(row => row.source === event.row.source) && !received.has(event.row.source)) {
      const row = event.row as ReferralRow;
      received.add(row.source);
      report = { ...report, rows: report.rows.map(before => before.source === row.source ? row : before) };
      update(report, true);
    } else if (event.type === 'done' && report && received.size === report.rows.length) {
      complete = true;
      report = { ...report, updatedAt: event.updatedAt || report.updatedAt };
      update(report, false);
    } else throw new Error(event.type === 'error' ? '집계 조회가 중단됐어요. 새로고침해주세요.' : '집계 응답을 확인하지 못했어요.');
  };
  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      if (buffer.length > 128_000) throw new Error('집계 응답이 너무 큽니다.');
      let end;
      while ((end = buffer.indexOf('\n')) >= 0) { message(buffer.slice(0, end)); buffer = buffer.slice(end + 1); }
      if (done) break;
    }
    if (signal.aborted) return;
    if (buffer.trim()) message(buffer);
    if (!complete) throw new Error('일부 사이트 집계를 받지 못했어요. 새로고침해주세요.');
  } finally {
    signal.removeEventListener('abort', abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
