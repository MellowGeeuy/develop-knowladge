/**
 * search-dialog.js — หน้าต่างค้นหาแบบ command palette ใช้ร่วมกันทุกหน้า
 * หน้าเป็นคนบอกว่าจะค้นอะไร (getEntries) ส่วนนี้ดูแลแค่ UI คีย์ลัด และการเลือกผลลัพธ์
 * สร้าง <dialog> เองตอนเปิดครั้งแรก HTML ของทุกหน้าจึงไม่ต้องมีโครงนี้
 */
import { escapeHtml } from '../utils/escape-html.js';
import { iconMarkup } from '../utils/icon.js';
import { createSearchIndex, highlightTerms, searchEntries, splitQuery } from '../utils/search-index.js';

const KIND = {
  language: { label: 'ภาษา', icon: 'i-layers' },
  lesson: { label: 'บทเรียน', icon: 'i-file-text' },
  heading: { label: 'หัวข้อ', icon: 'i-hash' },
};

function isTyping(target) {
  return target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}

function resultMarkup(entry, index, terms) {
  const kind = KIND[entry.kind] ?? KIND.lesson;
  const scope = entry.languageId ? ` data-language="${escapeHtml(entry.languageId)}"` : '';
  const icon = entry.badge && entry.kind === 'language'
    ? `<span class="lang-badge lang-badge--xs" aria-hidden="true"><span class="lang-badge__text">${escapeHtml(entry.badge)}</span></span>`
    : iconMarkup(kind.icon, { className: 'icon--sm' });
  return `<li class="search-dialog__item" id="search-option-${index}" role="option" aria-selected="false" data-index="${index}"${scope}>`
    + `<span class="search-dialog__item-icon">${icon}</span>`
    + '<span class="search-dialog__item-text">'
    + `<span class="search-dialog__item-title">${highlightTerms(entry.title, terms)}</span>`
    + `<span class="search-dialog__item-context">${escapeHtml(entry.context ?? kind.label)}</span>`
    + '</span>'
    + iconMarkup('i-corner-down-left', { className: 'icon--sm search-dialog__enter' })
    + '</li>';
}

/**
 * @param {{
 *   trigger: HTMLElement | null,
 *   getEntries: () => Promise<object[]> | object[],
 *   placeholder?: string,
 *   hint?: string,
 * }} options
 */
export function initSearchDialog({ trigger, getEntries, placeholder = 'ค้นหาบทเรียนหรือหัวข้อ', hint = '' }) {
  let dialog = null;
  let input;
  let list;
  let message;
  let status;
  let index = null;
  let loading = null;
  let results = [];
  let active = -1;

  const showMessage = (text) => {
    message.textContent = text;
    message.hidden = !text;
  };

  const setActive = (next) => {
    if (results.length === 0) {
      active = -1;
      input.removeAttribute('aria-activedescendant');
      return;
    }
    active = (next + results.length) % results.length;
    list.querySelectorAll('.search-dialog__item').forEach((item) => {
      item.setAttribute('aria-selected', String(Number(item.dataset.index) === active));
    });
    const option = list.querySelector(`#search-option-${active}`);
    input.setAttribute('aria-activedescendant', option.id);
    option.scrollIntoView({ block: 'nearest' });
  };

  const render = () => {
    const query = input.value.trim();
    results = [];
    list.innerHTML = '';
    if (!index) {
      showMessage('กำลังเตรียมข้อมูลสำหรับค้นหา…');
      setActive(-1);
      return;
    }
    if (!query) {
      showMessage(hint || 'พิมพ์ชื่อบท หัวข้อ หรือคำสำคัญ เช่น closure, async, ตัวแปร');
      status.textContent = '';
      setActive(-1);
      return;
    }
    results = searchEntries(index, query, { limit: 30 });
    if (results.length === 0) {
      showMessage(`ไม่พบ “${query}” ลองใช้คำที่สั้นลงหรือสะกดแบบอื่น`);
      status.textContent = 'ไม่พบผลลัพธ์';
      setActive(-1);
      return;
    }
    const terms = splitQuery(query);
    showMessage('');
    list.innerHTML = results.map((entry, position) => resultMarkup(entry, position, terms)).join('');
    status.textContent = `พบ ${results.length} รายการ`;
    setActive(0);
  };

  const close = () => dialog?.close();

  const choose = (position) => {
    const entry = results[position];
    if (!entry) return;
    close();
    window.location.href = entry.href;
  };

  const ensureIndex = () => {
    loading ??= Promise.resolve()
      .then(() => getEntries())
      .then((entries) => {
        index = createSearchIndex(entries);
        if (dialog?.open) render();
      })
      .catch(() => {
        loading = null;
        showMessage('โหลดข้อมูลค้นหาไม่สำเร็จ ลองปิดแล้วเปิดใหม่อีกครั้ง');
      });
  };

  const build = () => {
    dialog = document.createElement('dialog');
    dialog.className = 'search-dialog';
    dialog.setAttribute('aria-label', 'ค้นหา');
    dialog.innerHTML = `
      <form class="search-dialog__form" role="search">
        ${iconMarkup('i-search')}
        <input class="search-dialog__input" type="search" autocomplete="off" spellcheck="false"
               placeholder="${escapeHtml(placeholder)}" aria-label="คำค้นหา"
               role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list">
        <kbd class="kbd">Esc</kbd>
      </form>
      <ul class="search-dialog__results" id="search-results" role="listbox" aria-label="ผลการค้นหา"></ul>
      <p class="search-dialog__empty" hidden></p>
      <div class="search-dialog__footer">
        <span class="search-dialog__hint"><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> เลือก</span>
        <span class="search-dialog__hint"><kbd class="kbd">Enter</kbd> เปิด</span>
        <span class="search-dialog__hint"><kbd class="kbd">Esc</kbd> ปิด</span>
        <span class="u-visually-hidden" role="status" aria-live="polite"></span>
      </div>`;
    document.body.append(dialog);

    input = dialog.querySelector('.search-dialog__input');
    list = dialog.querySelector('.search-dialog__results');
    message = dialog.querySelector('.search-dialog__empty');
    status = dialog.querySelector('[role="status"]');

    dialog.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      choose(active);
    });
    input.addEventListener('input', render);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setActive(active + (event.key === 'ArrowDown' ? 1 : -1));
      }
    });
    list.addEventListener('mousemove', (event) => {
      const item = event.target.closest('.search-dialog__item');
      if (item && Number(item.dataset.index) !== active) setActive(Number(item.dataset.index));
    });
    list.addEventListener('click', (event) => {
      const item = event.target.closest('.search-dialog__item');
      if (item) choose(Number(item.dataset.index));
    });
    // คลิกที่ฉากหลังนอกกรอบ (event เกิดที่ตัว dialog เอง) ให้ปิดเหมือนกด Esc
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });
  };

  const open = () => {
    if (!dialog) build();
    if (dialog.open) return;
    dialog.showModal();
    input.select();
    ensureIndex();
    render();
  };

  trigger?.addEventListener('click', open);
  document.addEventListener('keydown', (event) => {
    const shortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    const slash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping(event.target);
    if (!shortcut && !slash) return;
    event.preventDefault();
    if (dialog?.open) input.select();
    else open();
  });

  return { open, close };
}
