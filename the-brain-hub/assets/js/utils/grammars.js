/**
 * grammars.js — กติกาไฮไลต์โค้ดของแต่ละภาษา แยกจาก engine ใน highlight.js
 * เพิ่มภาษาใหม่ = เขียน grammar หนึ่งก้อนแล้วลงชื่อใน LANGUAGES โดยไม่ต้องแตะ engine
 *
 * rule แต่ละตัวมีได้ 2 แบบ
 *   { type, pattern, when? }  pattern ต้องมี flag y (sticky) เพื่อจับเฉพาะตรงตำแหน่งปัจจุบัน
 *                             type เป็นชื่อ token หรือฟังก์ชัน (text, ctx, source, end) => ชื่อ token
 *   { scan, when? }           scan(source, index, ctx, api) => { end, tokens } | null
 *                             ใช้กับของที่มีโครงสร้างซ้อนข้างใน เช่น template literal หรือ tag ของ HTML
 * token ชื่อ 'name' คือคำที่ไม่ใส่สี แต่ engine ต้องรู้ว่าเป็นคำ เพื่อตัดสินว่า / ตัวถัดไปคือหารหรือ regex
 */

const NEXT_CHAR = /\s*(\S)?/y;
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*[a-z][A-Za-z0-9]*$/;

function peekNext(source, index) {
  NEXT_CHAR.lastIndex = index;
  return NEXT_CHAR.exec(source)?.[1] ?? '';
}

/* ---------------- JavaScript / TypeScript ---------------- */

const JS_KEYWORDS = new Set([
  'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'from', 'function',
  'get', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'of', 'return', 'set', 'static',
  'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
]);

const TS_KEYWORDS = new Set([
  ...JS_KEYWORDS,
  'abstract', 'asserts', 'declare', 'enum', 'implements', 'infer', 'interface', 'is', 'keyof',
  'namespace', 'override', 'private', 'protected', 'public', 'readonly', 'satisfies', 'type', 'unique',
]);

const TS_TYPES = new Set(['any', 'bigint', 'boolean', 'never', 'number', 'object', 'string', 'symbol', 'unknown']);

const JS_LITERALS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

const JS_BUILTINS = new Set([
  'AbortController', 'AbortSignal', 'AggregateError', 'Array', 'BigInt', 'Blob', 'Boolean',
  'CustomEvent', 'Date', 'DocumentFragment', 'Element', 'Error', 'Event', 'EventTarget', 'File',
  'FileReader', 'FormData', 'Headers', 'HTMLElement', 'IntersectionObserver', 'Intl', 'Iterator',
  'JSON', 'Map', 'Math', 'MutationObserver', 'Node', 'NodeList', 'Number', 'Object', 'Promise',
  'Proxy', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Request', 'ResizeObserver',
  'Response', 'Set', 'String', 'Symbol', 'SyntaxError', 'TextDecoder', 'TextEncoder', 'TypeError',
  'URL', 'URLSearchParams', 'WeakMap', 'WeakRef', 'WeakSet', 'Worker', 'alert',
  'cancelAnimationFrame', 'clearInterval', 'clearTimeout', 'confirm', 'console', 'crypto',
  'decodeURIComponent', 'document', 'encodeURIComponent', 'exports', 'fetch', 'globalThis',
  'history', 'isFinite', 'isNaN', 'localStorage', 'location', 'module', 'navigator', 'parseFloat',
  'parseInt', 'performance', 'process', 'prompt', 'queueMicrotask', 'requestAnimationFrame',
  'require', 'sessionStorage', 'setInterval', 'setTimeout', 'structuredClone', 'window',
]);

const JS_NUMBER = /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)n?/y;
const JS_OPERATOR = /=>|\.\.\.|\?\?=|\?\?|\?\.(?!\d)|\*\*=|\*\*|===|!==|==|!=|<=|>=|&&=|\|\|=|&&|\|\||<<=|>>>=|>>=|<<|>>>|>>|\+\+|--|[-+*/%&|^]=|[-+*/%&|^~!<>=?:]/y;

function makeWordClassifier(keywords, types = new Set()) {
  return (word, ctx, source, end) => {
    const prev = ctx.prev?.text;
    const next = peekNext(source, end);
    if (prev === '.' || prev === '?.') return next === '(' ? 'function' : 'property';
    if (next === ':' && (prev === '{' || prev === ',')) return 'property';
    if (JS_LITERALS.has(word)) return 'literal';
    if (keywords.has(word)) return 'keyword';
    if (types.has(word)) return 'type';
    if (JS_BUILTINS.has(word)) return 'builtin';
    if (next === '(') return 'function';
    if (PASCAL_CASE.test(word)) return 'type';
    return 'name';
  };
}

// / หลังค่า (ชื่อ ตัวเลข วงเล็บปิด) คือการหาร ส่วนหลัง operator หรือ keyword คือจุดเริ่ม regex
function jsRegexAllowed(ctx) {
  const prev = ctx.prev;
  if (!prev) return true;
  if (prev.type === 'keyword') return prev.text !== 'this' && prev.text !== 'super';
  if (prev.type === 'operator') return prev.text !== '++' && prev.text !== '--';
  if (prev.type === 'punctuation') return !')]}'.includes(prev.text);
  return false;
}

function skipQuoted(source, start) {
  const quote = source[start];
  let cursor = start + 1;
  while (cursor < source.length && source[cursor] !== quote && source[cursor] !== '\n') {
    cursor += source[cursor] === '\\' ? 2 : 1;
  }
  return cursor + 1;
}

function skipTemplate(source, start) {
  let cursor = start + 1;
  while (cursor < source.length) {
    const char = source[cursor];
    if (char === '\\') {
      cursor += 2;
    } else if (char === '`') {
      return cursor + 1;
    } else if (char === '$' && source[cursor + 1] === '{') {
      cursor = findClosingBrace(source, cursor + 2) + 1;
    } else {
      cursor += 1;
    }
  }
  return source.length;
}

function findClosingBrace(source, start) {
  let depth = 0;
  let cursor = start;
  while (cursor < source.length) {
    const char = source[cursor];
    const next = source[cursor + 1];
    if (char === '"' || char === "'") {
      cursor = skipQuoted(source, cursor);
      continue;
    }
    if (char === '`') {
      cursor = skipTemplate(source, cursor);
      continue;
    }
    if (char === '/' && next === '/') {
      const newline = source.indexOf('\n', cursor);
      cursor = newline === -1 ? source.length : newline;
      continue;
    }
    if (char === '/' && next === '*') {
      const close = source.indexOf('*/', cursor + 2);
      cursor = close === -1 ? source.length : close + 2;
      continue;
    }
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      if (depth === 0) return cursor;
      depth -= 1;
    }
    cursor += 1;
  }
  return source.length;
}

// template literal ต้องไล่เองเพราะใน ${ } ซ้อน template อีกชั้นได้ (เช่น map แล้วสร้าง <li> ในบท DOM)
// regex ธรรมดาจะตัดสตริงผิดที่ backtick ตัวในสุด
function scanTemplateLiteral(source, index, ctx, api) {
  if (source[index] !== '`') return null;
  const tokens = [];
  let cursor = index + 1;
  let chunkStart = index;
  while (cursor < source.length) {
    const char = source[cursor];
    if (char === '\\') {
      cursor += 2;
      continue;
    }
    if (char === '`') {
      cursor += 1;
      tokens.push({ type: 'string', text: source.slice(chunkStart, cursor) });
      return { end: cursor, tokens };
    }
    if (char === '$' && source[cursor + 1] === '{') {
      tokens.push({ type: 'string', text: source.slice(chunkStart, cursor) });
      const exprStart = cursor + 2;
      const exprEnd = findClosingBrace(source, exprStart);
      tokens.push({ type: 'punctuation', text: '${' });
      tokens.push(...api.tokenize(source.slice(exprStart, exprEnd), api.languageId));
      if (exprEnd < source.length) tokens.push({ type: 'punctuation', text: '}' });
      cursor = exprEnd + 1;
      chunkStart = cursor;
      continue;
    }
    cursor += 1;
  }
  tokens.push({ type: 'string', text: source.slice(chunkStart) });
  return { end: source.length, tokens };
}

function jsRules(classifyWord, { decorators = false } = {}) {
  return [
    { type: null, pattern: /\s+/y },
    { type: 'comment', pattern: /\/\/[^\n]*/y },
    { type: 'comment', pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
    { scan: scanTemplateLiteral },
    { type: 'string', pattern: /'(?:\\[\s\S]|[^\\'\n])*'?|"(?:\\[\s\S]|[^\\"\n])*"?/y },
    { type: 'regex', pattern: /\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[dgimsuyv]*/y, when: jsRegexAllowed },
    ...(decorators ? [{ type: 'meta', pattern: /@[A-Za-z_$][\w$]*/y }] : []),
    { type: 'property', pattern: /#[A-Za-z_$][\w$]*/y },
    { type: 'number', pattern: JS_NUMBER },
    { type: classifyWord, pattern: /[A-Za-z_$\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*/y },
    { type: 'operator', pattern: JS_OPERATOR },
    { type: 'punctuation', pattern: /[{}()[\];,.]/y },
  ];
}

const JAVASCRIPT = { id: 'js', rules: jsRules(makeWordClassifier(JS_KEYWORDS)) };
const TYPESCRIPT = { id: 'ts', rules: jsRules(makeWordClassifier(TS_KEYWORDS, TS_TYPES), { decorators: true }) };

/* ---------------- JSON ---------------- */

const JSON_GRAMMAR = {
  id: 'json',
  rules: [
    { type: null, pattern: /\s+/y },
    { type: 'comment', pattern: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y },
    { type: (text, ctx, source, end) => (peekNext(source, end) === ':' ? 'property' : 'string'), pattern: /"(?:\\.|[^"\\\n])*"?/y },
    { type: 'number', pattern: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y },
    { type: 'literal', pattern: /\b(?:true|false|null)\b/y },
    { type: 'punctuation', pattern: /[{}[\],:]/y },
  ],
};

/* ---------------- HTML ---------------- */

const HTML_TAG = /<\/?[A-Za-z][\w:-]*(?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/y;
const HTML_TAG_PART = /\s+|\/?>|=|"[^"]*"|'[^']*'|[^\s"'>/=]+|\//y;

// แตก tag ทีละชิ้นจากข้อความจริง (ไม่ประกอบกลับจาก group ของ regex) ข้อความที่ได้จึงตรงกับต้นฉบับทุกตัวอักษร
function tagTokens(text) {
  const open = text.startsWith('</') ? '</' : '<';
  const name = /^[A-Za-z][\w:-]*/.exec(text.slice(open.length))[0];
  const tokens = [{ type: 'punctuation', text: open }, { type: 'tag', text: name }];
  let cursor = open.length + name.length;
  let expectValue = false;
  while (cursor < text.length) {
    HTML_TAG_PART.lastIndex = cursor;
    const part = HTML_TAG_PART.exec(text)[0];
    let type = 'attr';
    if (/^\s+$/.test(part)) {
      type = null;
    } else if (part === '>' || part === '/>' || part === '/') {
      type = 'punctuation';
    } else if (part === '=') {
      type = 'operator';
      expectValue = true;
    } else if (expectValue) {
      type = 'string';
      expectValue = false;
    }
    tokens.push({ type, text: part });
    cursor += part.length;
  }
  return tokens;
}

function scanHtmlTag(source, index, ctx, api) {
  HTML_TAG.lastIndex = index;
  const match = HTML_TAG.exec(source);
  if (!match) return null;
  const text = match[0];
  const tokens = tagTokens(text);
  let end = index + text.length;
  const name = /^<([A-Za-z][\w:-]*)/.exec(text)?.[1]?.toLowerCase();
  // เนื้อใน <script> กับ <style> ไฮไลต์ด้วย grammar ของภาษานั้นแทนการปล่อยเป็นข้อความเฉย ๆ
  if ((name === 'script' || name === 'style') && !text.endsWith('/>')) {
    const closeTag = new RegExp(`</${name}\\s*>`, 'ig');
    closeTag.lastIndex = end;
    const close = closeTag.exec(source);
    const innerEnd = close ? close.index : source.length;
    tokens.push(...api.tokenize(source.slice(end, innerEnd), name === 'script' ? 'js' : 'css'));
    end = innerEnd;
  }
  return { end, tokens };
}

const HTML = {
  id: 'html',
  rules: [
    { type: 'comment', pattern: /<!--[\s\S]*?(?:-->|$)/y },
    { type: 'meta', pattern: /<!doctype[^>]*>/iy },
    { scan: scanHtmlTag },
    { type: 'literal', pattern: /&(?:[a-zA-Z]+|#\d+|#x[\da-fA-F]+);/y },
    { type: null, pattern: /[^<&]+/y },
  ],
};

/* ---------------- CSS ---------------- */

const CSS_SELECTOR_AHEAD = /[^{};]*\{/y;

function cssSelectorAhead(source, index) {
  CSS_SELECTOR_AHEAD.lastIndex = index;
  return CSS_SELECTOR_AHEAD.test(source);
}

const CSS = {
  id: 'css',
  rules: [
    { type: null, pattern: /\s+/y },
    { type: 'comment', pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
    { type: 'string', pattern: /"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y },
    { type: 'keyword', pattern: /@[\w-]+|!important/y },
    { type: 'variable', pattern: /--[\w-]+/y },
    {
      type: (text, ctx, source, end) => {
        const next = peekNext(source, end);
        const inDeclaration = ctx.depth > 0 && !cssSelectorAhead(source, end - text.length);
        if (next === ':' && (inDeclaration || ctx.prev?.text === '(')) return 'property';
        if (ctx.depth === 0 || cssSelectorAhead(source, end - text.length)) return 'selector';
        return 'name';
      },
      pattern: /-?[A-Za-z_][\w-]*(?![\w(-])/y,
    },
    { type: 'function', pattern: /-?[A-Za-z_][\w-]*(?=\()/y },
    { type: 'number', pattern: /#[\da-fA-F]{3,8}(?![\w-])/y, when: (ctx) => ctx.depth > 0 },
    { type: 'selector', pattern: /[.#]-?[A-Za-z_][\w-]*|::?[A-Za-z-]+|\*|&/y },
    { type: 'number', pattern: /-?(?:\d+\.?\d*|\.\d+)(?:[A-Za-z%]+)?/y },
    { type: 'punctuation', pattern: /[{}();:,>+~[\]=]/y },
  ],
};

/* ---------------- Terminal (bash / PowerShell แบบคร่าว ๆ) ---------------- */

const SHELL_KEYWORDS = new Set([
  'case', 'do', 'done', 'elif', 'else', 'esac', 'export', 'fi', 'for', 'function', 'if', 'in',
  'local', 'return', 'source', 'then', 'until', 'while',
]);

const SHELL = {
  id: 'bash',
  rules: [
    { type: null, pattern: /[ \t]+|\r?\n/y },
    { type: 'comment', pattern: /#[^\n]*/y, when: (ctx) => ctx.afterSpace || ctx.lineStart },
    { type: 'string', pattern: /"(?:\\[\s\S]|[^"\\])*"?|'[^']*'?/y },
    { type: 'variable', pattern: /\$(?:env:\w+|\{[^}\n]*\}|\([^)\n]*\)|[\w@#?$!*-]+)|%\w+%/y },
    { type: 'attr', pattern: /--?[A-Za-z][\w-]*(?:=\S*)?/y, when: (ctx) => ctx.afterSpace && !ctx.commandPosition },
    { type: 'operator', pattern: /&&|\|\||[|;&]|>>?|</y },
    {
      type: (word, ctx) => {
        if (SHELL_KEYWORDS.has(word)) return 'keyword';
        return ctx.commandPosition ? 'function' : 'name';
      },
      pattern: /[^\s|;&<>"'$#]+/y,
    },
  ],
};

/* ---------------- ทะเบียนภาษา ---------------- */

export const LANGUAGES = {
  js: { label: 'JavaScript', grammar: JAVASCRIPT },
  ts: { label: 'TypeScript', grammar: TYPESCRIPT },
  json: { label: 'JSON', grammar: JSON_GRAMMAR },
  html: { label: 'HTML', grammar: HTML },
  css: { label: 'CSS', grammar: CSS },
  bash: { label: 'Terminal', grammar: SHELL },
  powershell: { label: 'PowerShell', grammar: SHELL },
  text: { label: 'ข้อความ', grammar: null },
};

const ALIASES = {
  javascript: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'js',
  typescript: 'ts',
  tsx: 'ts',
  jsonc: 'json',
  xml: 'html',
  svg: 'html',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  terminal: 'bash',
  ps1: 'powershell',
  pwsh: 'powershell',
  txt: 'text',
  plaintext: 'text',
  '': 'text',
};

/** คืนข้อมูลภาษาของ code fence · known = false แปลว่ายังไม่มี grammar (แสดงเป็นข้อความธรรมดา) */
export function getLanguageInfo(lang) {
  const key = String(lang ?? '').trim().toLowerCase();
  const id = ALIASES[key] ?? key;
  const entry = LANGUAGES[id];
  if (entry) return { id, label: entry.label, grammar: entry.grammar, known: true };
  return { id, label: id.toUpperCase(), grammar: null, known: false };
}
