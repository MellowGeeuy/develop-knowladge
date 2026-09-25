/**
 * color.mjs — คำนวณสีประจำภาษาให้ผ่านคอนทราสต์ WCAG โดยยังเป็นสีของโลโก้เดิม
 *
 * เลื่อนเฉพาะความสว่างใน OKLCH (hue คงที่ chroma ลดเท่าที่จำเป็นให้อยู่ใน sRGB)
 * เพราะ OKLCH สว่างเท่ากันตามที่ตาเห็น ผลจึงยังเป็นเฉดเดียวกับโลโก้ ไม่ใช่สีที่เพี้ยนไปอีกโทน
 */

export function parseHex(hex) {
  const value = String(hex).trim().replace(/^#/, '');
  const full = value.length === 3 ? value.split('').map((char) => char + char).join('') : value;
  if (!/^[\da-f]{6}$/i.test(full)) throw new Error(`สีต้องเป็น hex เช่น #F7DF1E (ได้ "${hex}")`);
  return {
    r: Number.parseInt(full.slice(0, 2), 16) / 255,
    g: Number.parseInt(full.slice(2, 4), 16) / 255,
    b: Number.parseInt(full.slice(4, 6), 16) / 255,
  };
}

export function isHex(value) {
  return /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(String(value ?? ''));
}

export function toHex({ r, g, b }) {
  const channel = (value) => Math.round(Math.min(1, Math.max(0, value)) * 255).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

const toLinear = (value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const fromLinear = (value) => (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055);

export function relativeLuminance(hex) {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* ---- OKLab / OKLCH (Björn Ottosson, 2020) ---- */

function rgbToOklch({ r, g, b }) {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return { l: L, c: Math.hypot(A, B), h: (Math.atan2(B, A) * 180) / Math.PI };
}

function oklchToLinearRgb({ l, c, h }) {
  const rad = (h * Math.PI) / 180;
  const A = c * Math.cos(rad);
  const B = c * Math.sin(rad);
  const l1 = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m1 = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s1 = (l - 0.0894841775 * A - 1.2914855480 * B) ** 3;
  return {
    r: 4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1,
    g: -1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1,
    b: -0.0041960863 * l1 - 0.7034186147 * m1 + 1.7076147010 * s1,
  };
}

const inGamut = ({ r, g, b }) => [r, g, b].every((value) => value >= -1e-4 && value <= 1 + 1e-4);

function oklchToHex(color) {
  let lo = 0;
  let hi = color.c;
  let linear = oklchToLinearRgb(color);
  if (!inGamut(linear)) {
    for (let step = 0; step < 30; step += 1) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinearRgb({ ...color, c: mid }))) lo = mid;
      else hi = mid;
    }
    linear = oklchToLinearRgb({ ...color, c: lo });
  }
  return toHex({ r: fromLinear(linear.r), g: fromLinear(linear.g), b: fromLinear(linear.b) });
}

export function worstContrast(color, backgrounds) {
  return Math.min(...backgrounds.map((background) => contrastRatio(color, background)));
}

/**
 * คืนสีที่ใกล้สีเดิมที่สุดซึ่งผ่านคอนทราสต์ target กับพื้นทุกสีใน backgrounds
 * direction: 'darker' สำหรับธีมสว่าง · 'lighter' สำหรับธีมมืด
 */
export function adjustForContrast(hex, backgrounds, target, direction) {
  const base = hex.toLowerCase();
  if (worstContrast(base, backgrounds) >= target) return base;
  const start = rgbToOklch(parseHex(base));
  let near = start.l;
  let far = direction === 'darker' ? 0 : 1;
  let best = direction === 'darker' ? '#000000' : '#ffffff';
  for (let step = 0; step < 40; step += 1) {
    const mid = (near + far) / 2;
    const candidate = oklchToHex({ ...start, l: mid });
    if (worstContrast(candidate, backgrounds) >= target) {
      best = candidate;
      far = mid;
    } else {
      near = mid;
    }
  }
  return best;
}

export function rotateHue(hex, degrees) {
  const color = rgbToOklch(parseHex(hex));
  return oklchToHex({ ...color, h: color.h + degrees });
}
