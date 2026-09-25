/**
 * theme-toggle.js — สลับธีมสว่าง/มืด
 * ดัดแปลงจาก UXUI Theory/assets/js/modules/theme-toggle.js
 * ต่างจากต้นฉบับตรงที่ไม่เขียน data-theme ถ้าผู้ใช้ยังไม่เคยเลือก ปล่อยให้ color-scheme ตามระบบปฏิบัติการ
 * แบบสด ๆ (เปลี่ยนธีมเครื่องตอนเปิดหน้าอยู่ หน้าก็เปลี่ยนตาม)
 */
import { spriteHref } from '../utils/icon.js';

const STORAGE_KEY = 'the-brain.theme';
const DARK_QUERY = window.matchMedia('(prefers-color-scheme: dark)');

function readStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function currentTheme() {
  return document.documentElement.dataset.theme ?? (DARK_QUERY.matches ? 'dark' : 'light');
}

export function applyStoredTheme() {
  const stored = readStoredTheme();
  if (stored) document.documentElement.dataset.theme = stored;
}

export function initThemeToggle(button) {
  applyStoredTheme();
  if (!button) return;

  const render = () => {
    const dark = currentTheme() === 'dark';
    const label = dark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด';
    button.querySelector('use')?.setAttribute('href', spriteHref(dark ? 'i-sun' : 'i-moon'));
    button.setAttribute('aria-label', label);
    button.title = label;
  };

  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // เขียนไม่ได้ (โหมดส่วนตัว) ก็ยังสลับในหน้านี้ได้ แค่ไม่จำข้ามหน้า
    }
    render();
  });

  DARK_QUERY.addEventListener('change', render);
  render();
}
