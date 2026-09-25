/**
 * highlight.js — engine ไฮไลต์โค้ด ทำงานกับ grammar ใดก็ได้จาก grammars.js
 * ผลลัพธ์เป็น <span class="tok tok--ชนิด"> ที่รวมข้อความกลับแล้วต้องได้โค้ดเดิมทุกตัวอักษร
 * (ปุ่มคัดลอกอ่าน textContent จากผลนี้ตรง ๆ)
 */
import { escapeHtml } from './escape-html.js';
import { getLanguageInfo } from './grammars.js';

function createContext() {
  return {
    prev: null,
    depth: 0,
    lineStart: true,
    afterSpace: true,
    commandPosition: true,
  };
}

function updateContext(ctx, type, text) {
  const isSpace = /^\s+$/.test(text);
  ctx.afterSpace = /\s$/.test(text);
  if (text.includes('\n')) {
    ctx.lineStart = /\n[ \t]*$/.test(text);
    if (ctx.lineStart) ctx.commandPosition = true;
  } else if (!isSpace) {
    ctx.lineStart = false;
  }

  if (type === null || type === 'comment') return;

  ctx.prev = { type, text };
  if (type === 'punctuation') {
    if (text === '{') ctx.depth += 1;
    if (text === '}') ctx.depth = Math.max(0, ctx.depth - 1);
  }
  ctx.commandPosition = type === 'operator' && /^(?:\|\|?|&&?|;)$/.test(text);
}

function matchRule(grammar, source, index, ctx, api) {
  for (const rule of grammar.rules) {
    if (rule.when && !rule.when(ctx)) continue;

    if (rule.scan) {
      const result = rule.scan(source, index, ctx, api);
      if (result && result.end > index) return result;
      continue;
    }

    rule.pattern.lastIndex = index;
    const match = rule.pattern.exec(source);
    if (!match || match[0] === '') continue;
    const end = index + match[0].length;
    const type = typeof rule.type === 'function' ? rule.type(match[0], ctx, source, end) : rule.type;
    return { end, tokens: [{ type, text: match[0] }] };
  }
  return null;
}

/** แตกโค้ดเป็น token · grammar เป็น null ได้ (คืนทั้งก้อนเป็นข้อความธรรมดา) */
export function tokenize(source, grammar) {
  const text = String(source ?? '');
  if (!grammar) return text ? [{ type: null, text }] : [];

  const tokens = [];
  const ctx = createContext();
  const api = {
    languageId: grammar.id,
    tokenize: (inner, languageId) => tokenize(inner, getLanguageInfo(languageId).grammar),
  };
  let plain = '';

  const push = (type, value) => {
    if (!value) return;
    if (type === null || type === 'name') {
      plain += value;
    } else {
      if (plain) {
        tokens.push({ type: null, text: plain });
        plain = '';
      }
      tokens.push({ type, text: value });
    }
    updateContext(ctx, type, value);
  };

  let index = 0;
  while (index < text.length) {
    const step = matchRule(grammar, text, index, ctx, api);
    if (step) {
      step.tokens.forEach((token) => push(token.type, token.text));
      index = step.end;
    } else {
      push(null, text[index]);
      index += 1;
    }
  }
  if (plain) tokens.push({ type: null, text: plain });
  return tokens;
}

export function renderTokens(tokens) {
  return tokens
    .map(({ type, text }) => (type ? `<span class="tok tok--${type}">${escapeHtml(text)}</span>` : escapeHtml(text)))
    .join('');
}

export function highlightCode(source, lang) {
  return renderTokens(tokenize(source, getLanguageInfo(lang).grammar));
}
