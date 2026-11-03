// Bound each attempt so a stalled request cannot hold the page-event queue forever.
// Only transient failures retry; deliberate exclusions and rejected inputs do not.
export async function deliverTraffic(body: string, request: typeof fetch = fetch,
  timeoutMs = 5000, pause: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms))) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const response = await Promise.race([
        request('/api/analytics', { method: 'POST', credentials: 'same-origin', keepalive: true,
          headers: { 'Content-Type': 'application/json' }, body, signal: controller.signal }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => {
          controller.abort(); reject(new Error('Traffic request timeout'));
        }, timeoutMs); }),
      ]);
      if (response.ok || (response.status < 500 && ![408, 429].includes(response.status))) return true;
    } catch { /* A transient network failure can recover without waiting for the minute tick. */ }
    finally { if (timer !== undefined) clearTimeout(timer); }
    if (attempt === 0) await pause(500);
  }
  return false;
}
