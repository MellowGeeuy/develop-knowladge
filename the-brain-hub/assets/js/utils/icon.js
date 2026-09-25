import { escapeHtml } from './escape-html.js';

// ผูกกับที่อยู่ของไฟล์นี้ ไม่ใช่ของหน้า — หน้า hub กับหน้าภาษาอยู่คนละความลึก path แบบ relative จะชี้ผิด
const SPRITE_URL = new URL('../../images/icon-sprite.svg', import.meta.url).href;

export function spriteHref(id) {
  return `${SPRITE_URL}#${id}`;
}

/** ไอคอนจาก sprite · ไม่ส่ง label = ไอคอนตกแต่ง (aria-hidden) */
export function iconMarkup(id, { className = '', label = '' } = {}) {
  const classes = ['icon', className].filter(Boolean).join(' ');
  const a11y = label ? `role="img" aria-label="${escapeHtml(label)}"` : 'aria-hidden="true"';
  return `<svg class="${classes}" ${a11y} focusable="false"><use href="${spriteHref(id)}"></use></svg>`;
}
