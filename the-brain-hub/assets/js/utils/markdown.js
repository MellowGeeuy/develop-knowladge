/**
 * markdown.js — แปลง Markdown ชุดย่อยที่บทเรียนใช้ เป็น HTML
 *
 * เขียนเองแทนการใช้ไลบรารีเพราะ
 * 1) HTML ดิบใน Markdown ถูก escape ทุกกรณี ไฟล์บทเรียนจึงฝังสคริปต์ลงหน้าเว็บไม่ได้แม้ตั้งใจ
 * 2) ต้องมี callout แบบ GitHub และแปลงลิงก์ระหว่างบทเป็น route ของเว็บ
 * 3) ไม่มี dependency ให้ดูแล และ tools/check.mjs ใช้ตัวแปลงตัวเดียวกับหน้าเว็บ ผลตรวจจึงตรงกับที่ผู้อ่านเห็น
 * ไวยากรณ์ที่รองรับเขียนไว้ใน the-brain-hub/README.md หัวข้อ "Markdown ที่รองรับ"
 */
import { escapeHtml } from './escape-html.js';
import { getLanguageInfo } from './grammars.js';
import { highlightCode } from './highlight.js';
import { iconMarkup } from './icon.js';

const CALLOUTS = {
  NOTE: { title: 'หมายเหตุ', icon: 'i-info' },
  TIP: { title: 'เคล็ดลับ', icon: 'i-lightbulb' },
  IMPORTANT: { title: 'สำคัญ', icon: 'i-bookmark' },
  WARNING: { title: 'ข้อควรระวัง', icon: 'i-alert-triangle' },
  CAUTION: { title: 'อันตราย', icon: 'i-alert-octagon' },
};

const RE = {
  blank: /^\s*$/,
  fence: /^( {0,3})(`{3,}|~{3,})[ \t]*([^\s`]*)[ \t]*(.*)$/,
  heading: /^ {0,3}(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/,
  hr: /^ {0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/,
  quote: /^ {0,3}>[ \t]?(.*)$/,
  listItem: /^( *)([-*+]|\d{1,9}[.)])(?:[ \t]+(.*))?$/,
  tableSep: /^ *\|? *:?-+:? *(?:\| *:?-+:? *)*\|? *$/,
  alert: /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/i,
};

const INLINE = {
  escape: /\\([\\`*_{}[\]()#+\-.!|>~<])/g,
  code: /(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g,
  autolink: /<(https?:\/\/[^\s<>]+)>/g,
  image: /!\[([^\]]*)\]\(\s*([^\s()]+)\s*\)/g,
  link: /\[((?:\\.|[^\]\\])+)\]\(\s*<?([^\s()<>]+(?:\([^\s()]*\)[^\s()<>]*)*)>?(?:\s+"([^"]*)")?\s*\)/g,
};

/* ==========================================================================
   Block parser — Markdown → AST
   ========================================================================== */

function indentOf(line) {
  return line.length - line.trimStart().length;
}

function nextNonBlank(lines, from) {
  for (let index = from; index < lines.length; index += 1) {
    if (!RE.blank.test(lines[index])) return index;
  }
  return -1;
}

function splitRow(line) {
  let row = line.trim();
  if (row.startsWith('|')) row = row.slice(1);
  if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1);
  const cells = [];
  let cell = '';
  let inCode = false;
  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    if (char === '\\' && row[index + 1] === '|') {
      cell += '|';
      index += 1;
      continue;
    }
    if (char === '`') inCode = !inCode;
    if (char === '|' && !inCode) {
      cells.push(cell.trim());
      cell = '';
      continue;
    }
    cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

function isTableStart(lines, index) {
  const header = lines[index];
  const separator = lines[index + 1];
  if (!header || !separator) return false;
  if (!header.includes('|') || !separator.includes('|') || !RE.tableSep.test(separator)) return false;
  return splitRow(header).length === splitRow(separator).length;
}

function startsBlock(lines, index) {
  const line = lines[index];
  return RE.fence.test(line)
    || RE.heading.test(line)
    || RE.hr.test(line)
    || RE.quote.test(line)
    || RE.listItem.test(line)
    || isTableStart(lines, index);
}

function parseFenceMeta(meta) {
  const result = { file: '', flags: [] };
  for (const token of meta.match(/\S+="[^"]*"|\S+/g) ?? []) {
    const pair = /^(file|title)=(?:"([^"]*)"|(\S+))$/.exec(token);
    if (pair) result.file = pair[2] ?? pair[3];
    else result.flags.push(token.toLowerCase());
  }
  return result;
}

function parseFence(lines, start, match, offset) {
  const indent = match[1].length;
  const marker = match[2];
  const close = new RegExp(`^ {0,3}${marker[0] === '`' ? '`' : '~'}{${marker.length},}[ \\t]*$`);
  const body = [];
  let index = start + 1;
  while (index < lines.length && !close.test(lines[index])) {
    let cut = 0;
    while (cut < indent && lines[index][cut] === ' ') cut += 1;
    body.push(lines[index].slice(cut));
    index += 1;
  }
  return {
    node: {
      type: 'code',
      lang: match[3].toLowerCase() || 'text',
      meta: parseFenceMeta(match[4].trim()),
      text: body.join('\n'),
      line: offset + start + 1,
    },
    next: index + 1,
  };
}

function parseQuote(lines, start, offset) {
  const inner = [];
  let index = start;
  while (index < lines.length) {
    const match = RE.quote.exec(lines[index]);
    if (!match) break;
    inner.push(match[1]);
    index += 1;
  }
  const alert = RE.alert.exec(inner[0]?.trim() ?? '');
  if (alert) inner.shift();
  const innerOffset = offset + start + (alert ? 1 : 0);
  return {
    node: {
      type: 'quote',
      alert: alert ? alert[1].toUpperCase() : null,
      children: parseBlocks(inner, innerOffset),
      line: offset + start + 1,
    },
    next: index,
  };
}

function parseTable(lines, start, offset) {
  const header = splitRow(lines[start]);
  const align = splitRow(lines[start + 1]).map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'end';
    return null;
  });
  const rows = [];
  let index = start + 2;
  while (index < lines.length && !RE.blank.test(lines[index]) && lines[index].includes('|')) {
    rows.push(splitRow(lines[index]));
    index += 1;
  }
  return { node: { type: 'table', header, align, rows, line: offset + start + 1 }, next: index };
}

function parseList(lines, start, offset) {
  const first = RE.listItem.exec(lines[start]);
  const baseIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items = [];
  let loose = false;
  let index = start;

  while (index < lines.length) {
    const match = RE.listItem.exec(lines[index]);
    if (!match || match[1].length !== baseIndent || /\d/.test(match[2]) !== ordered) break;
    const contentIndent = baseIndent + match[2].length + 1;
    const itemStart = index;
    const itemLines = [match[3] ?? ''];
    index += 1;

    while (index < lines.length) {
      const line = lines[index];
      if (RE.blank.test(line)) {
        const next = nextNonBlank(lines, index);
        if (next !== -1 && indentOf(lines[next]) >= contentIndent) {
          itemLines.push('');
          index += 1;
          continue;
        }
        break;
      }
      const indent = indentOf(line);
      if (indent >= contentIndent || (indent > baseIndent && RE.listItem.test(line))) {
        itemLines.push(line.slice(Math.min(indent, contentIndent)));
        index += 1;
        continue;
      }
      if (RE.listItem.test(line) || startsBlock(lines, index)) break;
      // บรรทัดที่ไม่ได้ย่อหน้าแต่ยังไม่ขึ้นบล็อกใหม่ นับเป็นข้อความของข้อเดิม (lazy continuation)
      itemLines.push(line.trim());
      index += 1;
    }

    if (itemLines.includes('')) loose = true;
    items.push(parseBlocks(itemLines, offset + itemStart));

    const next = nextNonBlank(lines, index);
    if (next !== -1 && next !== index) {
      const sibling = RE.listItem.exec(lines[next]);
      if (sibling && sibling[1].length === baseIndent && /\d/.test(sibling[2]) === ordered) {
        loose = true;
        index = next;
      }
    }
  }

  return {
    node: {
      type: 'list',
      ordered,
      start: ordered ? Number.parseInt(first[2], 10) : 1,
      items,
      loose,
      line: offset + start + 1,
    },
    next: index,
  };
}

function parseParagraph(lines, start, offset) {
  const buffer = [lines[start].trimStart()];
  let index = start + 1;
  while (index < lines.length && !RE.blank.test(lines[index]) && !startsBlock(lines, index)) {
    buffer.push(lines[index].trimStart());
    index += 1;
  }
  return { node: { type: 'paragraph', text: buffer.join('\n'), line: offset + start + 1 }, next: index };
}

function parseBlocks(lines, offset = 0) {
  const nodes = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (RE.blank.test(line)) {
      index += 1;
      continue;
    }

    let result;
    const fence = RE.fence.exec(line);
    const heading = RE.heading.exec(line);
    if (fence) {
      result = parseFence(lines, index, fence, offset);
    } else if (heading) {
      result = { node: { type: 'heading', level: heading[1].length, text: heading[2], line: offset + index + 1 }, next: index + 1 };
    } else if (RE.hr.test(line)) {
      result = { node: { type: 'hr', line: offset + index + 1 }, next: index + 1 };
    } else if (RE.quote.test(line)) {
      result = parseQuote(lines, index, offset);
    } else if (isTableStart(lines, index)) {
      result = parseTable(lines, index, offset);
    } else if (RE.listItem.test(line)) {
      result = parseList(lines, index, offset);
    } else {
      result = parseParagraph(lines, index, offset);
    }
    nodes.push(result.node);
    index = result.next;
  }
  return nodes;
}

export function parseMarkdown(source) {
  const lines = String(source ?? '').replace(/\r\n?/g, '\n').replace(/\t/g, '  ').split('\n');
  return parseBlocks(lines, 0);
}

/** เดินทุก node ในต้นไม้ (รวมใน callout และ list) */
export function walkNodes(nodes, visit) {
  for (const node of nodes) {
    visit(node);
    if (node.children) walkNodes(node.children, visit);
    if (node.items) node.items.forEach((item) => walkNodes(item, visit));
  }
}

/* ==========================================================================
   Inline
   ========================================================================== */

export function slugify(text) {
  return String(text ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// id ของหัวข้อขึ้นต้นด้วย h- เสมอ กันไม่ให้ชนกับ id ของบท (#modules, #event-loop)
// ไม่งั้นเบราว์เซอร์จะกระโดดไปหาหัวข้อชื่อเดียวกันในบทปัจจุบันก่อนที่ router จะเปลี่ยนบท
function createSlugger() {
  const seen = new Map();
  return (text) => {
    const base = `h-${slugify(text) || 'section'}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

export function toPlainText(text) {
  return String(text ?? '')
    .replace(INLINE.escape, '$1')
    .replace(/`+([^`]*)`+/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|~~|\*/g, '')
    .trim();
}

function applyEmphasis(html) {
  return html
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>')
    .replace(/(^|[^*\w])\*(?=[^\s*])([^*]*?[^\s*])\*(?![*\w])/g, '$1<em>$2</em>');
}

function isSafeHref(href) {
  if (/^(?:https?:|mailto:)/i.test(href)) return true;
  return !/^[a-z][a-z\d+.-]*:/i.test(href);
}

function resolveHref(href, resolver) {
  if (!isSafeHref(href)) return null;
  const custom = resolver?.(href);
  if (custom) return custom;
  return { href, external: /^https?:\/\//i.test(href) };
}

function renderLink(label, href, title, state) {
  const resolved = resolveHref(href, state.options.resolveLink);
  const inner = applyEmphasis(escapeHtml(label));
  if (!resolved) return inner;
  const attrs = [`href="${escapeHtml(resolved.href)}"`];
  if (title) attrs.push(`title="${escapeHtml(title)}"`);
  if (!resolved.external) return `<a ${attrs.join(' ')}>${inner}</a>`;
  attrs.push('target="_blank"', 'rel="noopener noreferrer"');
  return `<a ${attrs.join(' ')}>${inner}${iconMarkup('i-arrow-up-right', { className: 'icon--sm' })}`
    + '<span class="u-visually-hidden"> (เปิดในแท็บใหม่)</span></a>';
}

function renderImage(alt, src, state) {
  const resolved = resolveHref(src, state.options.resolveAsset);
  if (!resolved) return escapeHtml(alt);
  return `<img src="${escapeHtml(resolved.href)}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function normalizeCodeSpan(code) {
  const flat = code.replace(/\n/g, ' ');
  return /^ .* $/.test(flat) && flat.trim() ? flat.slice(1, -1) : flat;
}

function renderInline(text, state) {
  const slots = [];
  const hold = (html) => `\u0000${slots.push(html) - 1}\u0000`;

  let out = String(text);
  out = out.replace(INLINE.escape, (_, char) => hold(escapeHtml(char)));
  out = out.replace(INLINE.code, (_, ticks, code) => hold(`<code>${escapeHtml(normalizeCodeSpan(code))}</code>`));
  out = out.replace(INLINE.autolink, (_, url) => hold(renderLink(url, url, '', state)));
  out = out.replace(INLINE.image, (_, alt, src) => hold(renderImage(alt, src, state)));
  out = out.replace(INLINE.link, (_, label, href, title) => hold(renderLink(label, href, title, state)));
  out = escapeHtml(out);
  out = applyEmphasis(out);
  out = out.replace(/(?:\\| {2,})\n/g, '<br>\n');

  // slot ซ้อนกันได้ (โค้ดในข้อความลิงก์) จึงแทนค่ากลับจนไม่เหลือ
  let previous;
  do {
    previous = out;
    out = out.replace(/\u0000(\d+)\u0000/g, (_, slot) => slots[Number(slot)]);
  } while (out !== previous);
  return out;
}

/* ==========================================================================
   Render — AST → HTML
   ========================================================================== */

function renderCode(node) {
  const language = getLanguageInfo(node.lang);
  const file = node.meta.file
    ? `<span class="code-block__file">${escapeHtml(node.meta.file)}</span>`
    : '';
  return `<figure class="code-block" data-lang="${escapeHtml(language.id)}">`
    + '<div class="code-block__head">'
    + `<span class="code-block__lang">${escapeHtml(language.label)}</span>${file}`
    + '<button type="button" class="btn btn--ghost btn--sm code-block__copy" data-copy-code>'
    + `${iconMarkup('i-copy', { className: 'icon--sm' })}<span>คัดลอก</span></button>`
    + '</div>'
    + `<pre class="code-block__body" tabindex="0" aria-label="ตัวอย่างโค้ด ${escapeHtml(language.label)}">`
    + `<code>${highlightCode(node.text, language.id)}</code></pre>`
    + '</figure>';
}

function renderCallout(node, state, depth) {
  const callout = CALLOUTS[node.alert];
  const modifier = node.alert.toLowerCase();
  return `<div class="callout callout--${modifier}" role="note">`
    + `<p class="callout__title">${iconMarkup(callout.icon, { className: 'icon--sm' })}<span>${callout.title}</span></p>`
    + `<div class="callout__body">${renderNodes(node.children, state, depth + 1)}</div>`
    + '</div>';
}

function renderList(node, state, depth) {
  const tag = node.ordered ? 'ol' : 'ul';
  const start = node.ordered && node.start !== 1 ? ` start="${node.start}"` : '';
  const items = node.items.map((children) => {
    const inner = children.map((child) => {
      if (!node.loose && child.type === 'paragraph') return renderInline(child.text, state);
      return renderNode(child, state, depth + 1);
    });
    return `<li>${inner.join('')}</li>`;
  });
  return `<${tag}${start}>${items.join('')}</${tag}>`;
}

function renderTable(node, state) {
  const cellClass = (align) => (align ? ` class="is-${align}"` : '');
  const head = node.header
    .map((cell, column) => `<th scope="col"${cellClass(node.align[column])}>${renderInline(cell, state)}</th>`)
    .join('');
  const body = node.rows
    .map((row) => `<tr>${node.header
      .map((_, column) => `<td${cellClass(node.align[column])}>${renderInline(row[column] ?? '', state)}</td>`)
      .join('')}</tr>`)
    .join('');
  return '<div class="table-wrap" role="region" tabindex="0" aria-label="ตาราง">'
    + `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderHeading(node, state, depth) {
  const inner = renderInline(node.text, state);
  // หัวข้อที่อยู่ใน callout หรือ list ไม่ใช่โครงของบท จึงไม่นับเข้าสารบัญและไม่ใช้แท็กหัวข้อ
  if (depth > 0) return `<p><strong>${inner}</strong></p>`;
  const plain = toPlainText(node.text);
  const id = state.slug(plain);
  if (node.level === 2 || node.level === 3) state.headings.push({ level: node.level, text: plain, id });
  return `<h${node.level} id="${escapeHtml(id)}">${inner}</h${node.level}>`;
}

function renderNode(node, state, depth) {
  switch (node.type) {
    case 'heading':
      return renderHeading(node, state, depth);
    case 'paragraph':
      return `<p>${renderInline(node.text, state)}</p>`;
    case 'code':
      return renderCode(node);
    case 'quote':
      return node.alert
        ? renderCallout(node, state, depth)
        : `<blockquote>${renderNodes(node.children, state, depth + 1)}</blockquote>`;
    case 'list':
      return renderList(node, state, depth);
    case 'table':
      return renderTable(node, state);
    case 'hr':
      return '<hr>';
    default:
      return '';
  }
}

function renderNodes(nodes, state, depth) {
  return nodes.map((node) => renderNode(node, state, depth)).join('\n');
}

/**
 * @param {string} source
 * @param {{
 *   resolveLink?: (href: string) => ({ href: string, external: boolean } | null),
 *   resolveAsset?: (src: string) => ({ href: string } | null),
 *   stripTitle?: boolean,     ดึง # หัวเรื่องบรรทัดแรกออกมาเป็น title แยกจากเนื้อหา
 *   leadFromQuote?: boolean,  quote ธรรมดาก้อนแรกหลังหัวเรื่องกลายเป็นคำนำ (.lead)
 * }} options
 * @returns {{ html: string, lead: string, title: string, headings: {level:number,text:string,id:string}[] }}
 */
export function renderMarkdown(source, options = {}) {
  const state = { options, slug: createSlugger(), headings: [] };
  let nodes = parseMarkdown(source);

  let title = '';
  if (options.stripTitle && nodes[0]?.type === 'heading' && nodes[0].level === 1) {
    title = toPlainText(nodes[0].text);
    nodes = nodes.slice(1);
  }

  let lead = '';
  const first = nodes[0];
  if (options.leadFromQuote && first?.type === 'quote' && !first.alert
    && first.children.every((child) => child.type === 'paragraph')) {
    lead = first.children.map((child) => `<p class="lead">${renderInline(child.text, state)}</p>`).join('\n');
    nodes = nodes.slice(1);
  }

  return { html: renderNodes(nodes, state, 0), lead, title, headings: state.headings };
}

/** ข้อมูลสำหรับเครื่องมือตรวจ: code block ทุกก้อน (รวมที่อยู่ใน callout และ list) */
export function extractCodeBlocks(source) {
  const blocks = [];
  walkNodes(parseMarkdown(source), (node) => {
    if (node.type === 'code') blocks.push(node);
  });
  return blocks;
}

/** ข้อมูลสำหรับเครื่องมือตรวจ: href ของลิงก์ทุกตัวที่อยู่นอกโค้ด */
export function extractLinks(source) {
  const links = [];
  walkNodes(parseMarkdown(source), (node) => {
    let texts = [];
    if (node.type === 'paragraph' || node.type === 'heading') texts = [node.text];
    if (node.type === 'table') texts = [...node.header, ...node.rows.flat()];
    for (const text of texts) {
      const withoutCode = text.replace(INLINE.code, '');
      for (const match of withoutCode.matchAll(INLINE.link)) links.push({ href: match[2], line: node.line });
    }
  });
  return links;
}
