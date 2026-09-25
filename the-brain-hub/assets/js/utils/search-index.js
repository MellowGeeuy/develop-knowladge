/**
 * search-index.js — ดัชนีค้นหาแบบง่ายที่ใช้ได้ทั้งหน้า Dashboard (ข้ามทุกภาษา) และหน้าคอร์ส (ลึกถึงหัวข้อ)
 * จับคู่แบบ substring เพราะภาษาไทยไม่มีช่องว่างคั่นคำ การตัดคำด้วยช่องว่างจะค้น "ตัวแปร" ในประโยคไม่เจอ
 *
 * entry: { id, kind: 'language'|'lesson'|'heading', title, context?, summary?, keywords?, href, languageId?, boost? }
 */
import { escapeHtml } from './escape-html.js';

export function normalizeForSearch(text) {
  return String(text ?? '').normalize('NFC').toLowerCase();
}

export function createSearchIndex(entries) {
  return entries.map((entry, order) => ({
    ...entry,
    order,
    searchTitle: normalizeForSearch(entry.title),
    searchKeywords: (entry.keywords ?? []).map(normalizeForSearch),
    searchSummary: normalizeForSearch(entry.summary),
    searchContext: normalizeForSearch(entry.context),
  }));
}

function scoreTerm(entry, term) {
  if (entry.searchTitle.startsWith(term)) return 100;
  if (entry.searchTitle.includes(term)) return 60;
  if (entry.searchKeywords.includes(term)) return 50;
  if (entry.searchKeywords.some((keyword) => keyword.includes(term))) return 35;
  if (entry.searchSummary.includes(term)) return 20;
  if (entry.searchContext.includes(term)) return 10;
  return 0;
}

export function splitQuery(query) {
  return normalizeForSearch(query).split(/\s+/).filter(Boolean);
}

/** ทุกคำในคำค้นต้องเจอใน entry เดียวกัน · เรียงตามคะแนนแล้วตามลำดับเดิมของ entry */
export function searchEntries(index, query, { limit = 30 } = {}) {
  const terms = splitQuery(query);
  if (terms.length === 0) return [];

  const results = [];
  for (const entry of index) {
    let score = 0;
    for (const term of terms) {
      const termScore = scoreTerm(entry, term);
      if (termScore === 0) {
        score = 0;
        break;
      }
      score += termScore;
    }
    if (score > 0) results.push({ entry, score: score + (entry.boost ?? 0) });
  }

  results.sort((a, b) => b.score - a.score || a.entry.order - b.entry.order);
  return results.slice(0, limit).map(({ entry, score }) => ({ ...entry, score }));
}

/** escape ข้อความแล้วครอบส่วนที่ตรงกับคำค้นด้วย <mark> */
export function highlightTerms(text, terms) {
  const source = String(text ?? '');
  const lower = normalizeForSearch(source);
  if (lower.length !== source.length || terms.length === 0) return escapeHtml(source);

  const ranges = [];
  for (const term of terms) {
    let from = lower.indexOf(term);
    while (from !== -1) {
      ranges.push([from, from + term.length]);
      from = lower.indexOf(term, from + term.length);
    }
  }
  if (ranges.length === 0) return escapeHtml(source);

  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0]];
  for (const [start, end] of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  let html = '';
  let cursor = 0;
  for (const [start, end] of merged) {
    html += escapeHtml(source.slice(cursor, start));
    html += `<mark>${escapeHtml(source.slice(start, end))}</mark>`;
    cursor = end;
  }
  return html + escapeHtml(source.slice(cursor));
}
