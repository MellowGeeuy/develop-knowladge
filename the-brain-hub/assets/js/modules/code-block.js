/**
 * code-block.js — ปุ่มคัดลอกของกล่องโค้ดที่ utils/markdown.js สร้าง
 * ใช้ event delegation ตัวเดียวต่อ container เนื้อหาเปลี่ยนทั้งก้อนเมื่อเปลี่ยนบทก็ไม่ต้องผูกใหม่
 * ตรรกะคัดลอกและทางสำรองดัดแปลงจาก UXUI Theory/assets/js/modules/code-block.js
 */
import { spriteHref } from '../utils/icon.js';

const RESET_MS = 1800;
const resetTimers = new WeakMap();

async function copyToClipboard(codeElement) {
  try {
    await navigator.clipboard.writeText(codeElement.textContent);
    return true;
  } catch {
    // เบราว์เซอร์บางตัวไม่ให้เขียนคลิปบอร์ดโดยตรง จึงเลือกข้อความไว้ให้กด Ctrl+C เอง
    const range = document.createRange();
    range.selectNodeContents(codeElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    return false;
  }
}

function setButtonState(button, done) {
  button.classList.toggle('is-done', done);
  button.querySelector('span').textContent = done ? 'คัดลอกแล้ว' : 'คัดลอก';
  button.querySelector('use')?.setAttribute('href', spriteHref(done ? 'i-check' : 'i-copy'));
}

export function initCodeBlocks(root, { announce = () => {} } = {}) {
  root.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-code]');
    if (!button || !root.contains(button)) return;
    const code = button.closest('.code-block')?.querySelector('code');
    if (!code) return;

    if (!(await copyToClipboard(code))) {
      announce('เบราว์เซอร์ไม่ให้คัดลอกอัตโนมัติ เลือกโค้ดไว้ให้แล้ว กด Ctrl+C');
      return;
    }
    setButtonState(button, true);
    announce('คัดลอกโค้ดแล้ว');
    window.clearTimeout(resetTimers.get(button));
    resetTimers.set(button, window.setTimeout(() => setButtonState(button, false), RESET_MS));
  });
}
