"use client";
import type { ReactNode } from 'react';
import { C } from './EstimateLayout';

// Small, HTML-free renderer for the existing guide format. Text is always escaped by React.
function inline(value: string): ReactNode {
  return value.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part);
}

export default function GuideContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  for (let i = 0; i < lines.length;) {
    const start = i, line = lines[i].trim();
    if (!line) { i++; continue; }
    if (line.startsWith('```')) {
      const code: string[] = []; i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      if (i < lines.length) i++;
      blocks.push(<pre key={start} style={{ padding: 16, overflowX: 'auto', background: C.bg, borderRadius: 10 }}><code>{code.join('\n')}</code></pre>);
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const text = inline(heading[2]);
      blocks.push(heading[1].length <= 2 ? <h2 key={start} style={{ fontSize: 22, color: C.textDark, margin: '32px 0 12px' }}>{text}</h2> : <h3 key={start} style={{ fontSize: 18, color: C.textDark, margin: '24px 0 10px' }}>{text}</h3>);
      i++; continue;
    }
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i++].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
        if (!cells.every(cell => /^:?-{3,}:?$/.test(cell))) rows.push(cells);
      }
      if (rows.length) blocks.push(<div key={start} role="region" aria-label="본문 표" tabIndex={0} style={{ maxWidth: '100%', overflowX: 'auto', margin: '20px 0', border: '1px solid ' + C.border, borderRadius: 10 }}><table style={{ width: '100%', minWidth: 420, borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr>{rows[0].map((cell, j) => <th key={j} scope="col" style={{ padding: 12, background: C.bg }}>{inline(cell)}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, j) => <tr key={j}>{row.map((cell, k) => <td key={k} style={{ padding: 12, borderTop: '1px solid ' + C.border }}>{inline(cell)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    const ordered = /^\d+\.\s+/.test(line), bullet = /^[-*]\s+/.test(line);
    if (ordered || bullet) {
      const items: ReactNode[] = [];
      const pattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
      while (i < lines.length && pattern.test(lines[i].trim())) {
        items.push(<li key={i} style={{ margin: '6px 0' }}>{inline(lines[i++].trim().replace(pattern, ''))}</li>);
      }
      blocks.push(ordered ? <ol key={start} style={{ paddingLeft: 24 }}>{items}</ol> : <ul key={start} style={{ paddingLeft: 24 }}>{items}</ul>);
      continue;
    }
    if (line.startsWith('> ')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) quote.push(lines[i++].trim().slice(2));
      blocks.push(<blockquote key={start} style={{ borderLeft: '3px solid ' + C.primary, paddingLeft: 16, margin: '20px 0' }}>{inline(quote.join(' '))}</blockquote>);
      continue;
    }
    const paragraph = [lines[i++].trim()];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|[-*]\s|\d+\.\s|\||>\s|```)/.test(lines[i].trim())) paragraph.push(lines[i++].trim());
    blocks.push(<p key={start} style={{ margin: '12px 0' }}>{inline(paragraph.join(' '))}</p>);
  }
  return <div style={{ fontSize: 16, lineHeight: 1.9, color: C.textMid, overflowWrap: 'anywhere' }}>{blocks}</div>;
}
