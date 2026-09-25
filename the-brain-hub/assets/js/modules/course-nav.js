/**
 * course-nav.js — รายการบทด้านซ้ายของหน้าคอร์ส
 *   จอกว้าง: กางเต็ม หรือหุบเหลือแถบแคบ (rail) ที่เห็นแค่จุดของแต่ละบท · จำสถานะไว้ข้ามหน้าและข้ามภาษา
 *   จอแคบ:  เป็น drawer เปิดจากปุ่มบนแถบบน
 * ทุกชิ้นบนแกนซ้าย (ปุ่มหุบ วงความคืบหน้า ภาพรวม ระดับ จุดของบท) กว้างเท่ากัน ตอนหุบจึงเหลือแกนเดียวที่ยังตรงแนวเดิม
 */
import { escapeHtml } from '../utils/escape-html.js';
import { iconMarkup } from '../utils/icon.js';

// ต้องตรงกับ breakpoint ของ drawer ใน course.css
const DRAWER_QUERY = window.matchMedia('(max-width: 64rem)');
const STORAGE_KEY = 'the-brain.sidebar';

const pad = (number) => String(number).padStart(2, '0');

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

function saveCollapsed(collapsed) {
  try {
    localStorage.setItem(STORAGE_KEY, collapsed ? 'collapsed' : 'expanded');
  } catch {
    // storage ถูกปิด (เช่นโหมดส่วนตัวบางแบบ) ก็แค่ไม่จำ เมนูยังหุบและกางได้ตามปกติ
  }
}

// ระยะเวลาอ่านจาก token ใน design-system.css ที่เดียว · reduced motion ตั้งทุกตัวเป็น 0ms ไว้แล้ว
function tokenMs(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
}

function lessonMarkup(lesson) {
  const id = escapeHtml(lesson.id);
  return `
    <li class="course-nav__item" data-item="${id}">
      <a class="course-nav__link" href="#${id}" data-lesson-id="${id}">
        <span class="course-nav__node" aria-hidden="true">
          <span class="course-nav__number">${pad(lesson.number)}</span>
          <span class="course-nav__check">${iconMarkup('i-check', { className: 'icon--sm' })}</span>
        </span>
        <span class="course-nav__label"><span class="u-visually-hidden">บทที่ ${lesson.number} </span><span class="course-nav__title">${escapeHtml(lesson.title)}</span><span class="u-visually-hidden" data-state></span></span>
      </a>
    </li>`;
}

function levelMarkup(level) {
  const id = escapeHtml(level.id);
  return `
    <section class="course-nav__level" aria-labelledby="nav-level-${id}" data-level="${id}">
      <h2 class="course-nav__level-head" id="nav-level-${id}">
        <span class="course-nav__chip" aria-hidden="true">${level.number}</span>
        <span class="course-nav__label">
          <span class="course-nav__level-title"><span class="u-visually-hidden">ระดับ ${level.number} </span>${escapeHtml(level.title)}</span>
          <span class="course-nav__level-count" aria-hidden="true" data-level-count></span>
        </span>
      </h2>
      <ol class="course-nav__list">${level.lessons.map(lessonMarkup).join('')}</ol>
    </section>`;
}

function navMarkup(course) {
  return `
    <div class="course-nav">
      <div class="course-nav__head">
        <button type="button" class="course-nav__row course-nav__toggle" aria-controls="course-sidebar" aria-keyshortcuts="[" data-nav-toggle>
          <span class="course-nav__icon" data-toggle-icon></span>
          <span class="course-nav__label"><span data-toggle-label></span><kbd class="kbd" aria-hidden="true">[</kbd></span>
        </button>
        <div class="course-nav__row course-nav__progress">
          <span class="course-nav__ring" role="progressbar" aria-label="ความคืบหน้าคอร์ส" aria-valuemin="0" aria-valuemax="${course.lessons.length}" data-progress-ring>
            <span class="course-nav__ring-count" aria-hidden="true" data-progress-count></span>
          </span>
          <span class="course-nav__label">
            <span class="course-nav__progress-title">ความคืบหน้า</span>
            <span class="course-nav__progress-text" data-progress-text></span>
          </span>
        </div>
        <a class="course-nav__row course-nav__overview" href="#" data-nav-home data-tip="ภาพรวมคอร์ส">
          <span class="course-nav__icon">${iconMarkup('i-home', { className: 'icon--sm' })}</span>
          <span class="course-nav__label">ภาพรวมคอร์ส</span>
        </a>
      </div>
      ${course.levels.map(levelMarkup).join('')}
    </div>`;
}

// tooltip ของแถบแคบเป็นภาพอย่างเดียว ชื่อจริงอยู่ในลิงก์แล้ว (ซ่อนแบบที่ screen reader ยังอ่านได้)
// ใช้ position: fixed เพราะกล่องเลื่อนของเมนูตัดทุกอย่างที่ล้นออกด้านข้าง
function createTooltip() {
  const tip = document.createElement('div');
  tip.className = 'rail-tip';
  tip.hidden = true;
  tip.setAttribute('aria-hidden', 'true');
  document.body.append(tip);
  return tip;
}

export function createCourseNav({ container, layout, toggle, scrim, course }) {
  container.innerHTML = navMarkup(course);

  const nav = container.querySelector('.course-nav');
  const overview = container.querySelector('[data-nav-home]');
  const collapseButton = container.querySelector('[data-nav-toggle]');
  const collapseIcon = collapseButton.querySelector('[data-toggle-icon]');
  const collapseLabel = collapseButton.querySelector('[data-toggle-label]');
  const progressRow = container.querySelector('.course-nav__progress');
  const ring = container.querySelector('[data-progress-ring]');
  const ringCount = container.querySelector('[data-progress-count]');
  const progressText = container.querySelector('[data-progress-text]');
  const lessons = course.lessons.map((lesson) => {
    const item = container.querySelector(`[data-item="${CSS.escape(lesson.id)}"]`);
    return { lesson, item, link: item.querySelector('.course-nav__link'), state: item.querySelector('[data-state]') };
  });
  const byId = new Map(lessons.map((entry) => [entry.lesson.id, entry]));
  const levels = course.levels.map((level) => {
    const section = container.querySelector(`[data-level="${CSS.escape(level.id)}"]`);
    return { level, section, head: section.querySelector('.course-nav__level-head'), count: section.querySelector('[data-level-count]') };
  });
  const tip = createTooltip();

  let readMap = {};
  let activeId = null;
  let collapsed = readCollapsed();
  let switching = false;

  // เลื่อนเฉพาะในกล่องรายการบท — scrollIntoView จะพาทั้งหน้าเลื่อนตามไปด้วย
  const reveal = (link) => {
    const top = link.offsetTop - container.clientHeight / 2 + link.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, top) });
  };

  function refreshTips() {
    for (const { lesson, link } of lessons) {
      const parts = [`บทที่ ${lesson.number} · ${lesson.title}`];
      if (lesson.id === activeId) parts.push('กำลังอ่าน');
      if (readMap[lesson.id]) parts.push('อ่านแล้ว');
      link.dataset.tip = parts.join(' · ');
    }
    for (const { level, head } of levels) {
      const done = level.lessons.filter((lesson) => readMap[lesson.id]).length;
      head.dataset.tip = `ระดับ ${level.number} · ${level.title} · อ่านแล้ว ${done}/${level.lessons.length}`;
    }
    const read = lessons.filter(({ lesson }) => readMap[lesson.id]).length;
    progressRow.dataset.tip = `อ่านแล้ว ${read} จาก ${lessons.length} บท`;
  }

  /* ---- tooltip บนแถบแคบ ---- */

  let tipTarget = null;

  function hideTip() {
    tipTarget = null;
    tip.hidden = true;
  }

  function showTip(target) {
    if (!target?.dataset.tip || !collapsed || switching || DRAWER_QUERY.matches) {
      hideTip();
      return;
    }
    tipTarget = target;
    tip.textContent = target.dataset.tip;
    const rect = target.getBoundingClientRect();
    tip.style.setProperty('--tip-x', `${Math.round(rect.right)}px`);
    tip.style.setProperty('--tip-y', `${Math.round(rect.top + rect.height / 2)}px`);
    tip.hidden = false;
  }

  container.addEventListener('pointerover', (event) => {
    const target = event.target.closest('[data-tip]');
    if (target !== tipTarget) showTip(target);
  });
  container.addEventListener('pointerleave', hideTip);
  container.addEventListener('focusin', (event) => showTip(event.target.closest('[data-tip]')));
  container.addEventListener('focusout', hideTip);
  container.addEventListener('scroll', hideTip, { passive: true });
  window.addEventListener('scroll', hideTip, { passive: true });

  /* ---- หุบ / กาง ---- */

  function renderToggle() {
    const label = collapsed ? 'กางรายการบท' : 'หุบรายการบท';
    collapseButton.setAttribute('aria-expanded', String(!collapsed));
    collapseButton.dataset.tip = `${label} (กด [)`;
    collapseLabel.textContent = label;
    collapseIcon.innerHTML = iconMarkup(collapsed ? 'i-panel-left-open' : 'i-panel-left-close', { className: 'icon--sm' });
  }

  const applyWidth = () => {
    layout.dataset.sidebar = collapsed ? 'collapsed' : 'expanded';
  };

  const applyRail = () => {
    container.classList.toggle('is-rail', collapsed);
    renderToggle();
  };

  // จางออก → สลับโครงเมนูตอนที่มองไม่เห็น → จางเข้า ขณะที่คอลัมน์หดหรือขยายไปพร้อมกัน
  // ความกว้างข้อความถูกตรึงไว้ระหว่างนั้น ชื่อบทจึงถูกขอบตัดเหมือนพับเข้า แทนที่จะตัดบรรทัดใหม่ทุกเฟรม
  async function setCollapsed(value) {
    if (value === collapsed || switching) return;
    collapsed = value;
    saveCollapsed(collapsed);
    hideTip();

    const fadeOut = tokenMs('--duration-fast');
    if (!fadeOut || typeof nav.animate !== 'function') {
      applyWidth();
      applyRail();
      return;
    }

    switching = true;
    const label = nav.querySelector('.course-nav__link .course-nav__label');
    nav.style.setProperty('--label-w', collapsed
      ? `${label.getBoundingClientRect().width}px`
      : 'calc(var(--sidebar-w) - var(--control-sm) - var(--space-3))');
    layout.classList.add('is-sidebar-animating');
    applyWidth();

    const out = nav.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeOut, easing: 'ease-in', fill: 'forwards' });
    await out.finished;
    applyRail();
    const fadeIn = nav.animate([{ opacity: 0 }, { opacity: 1 }], { duration: tokenMs('--duration-base'), easing: 'ease-out', fill: 'forwards' });
    out.cancel();
    await fadeIn.finished;
    fadeIn.cancel();

    nav.style.removeProperty('--label-w');
    layout.classList.remove('is-sidebar-animating');
    switching = false;
    const active = byId.get(activeId)?.link;
    if (active) reveal(active);
  }

  function toggleCollapsed() {
    if (DRAWER_QUERY.matches) return false;
    setCollapsed(!collapsed);
    return true;
  }

  collapseButton.addEventListener('click', () => setCollapsed(!collapsed));
  applyWidth();
  applyRail();

  /* ---- สถานะของบท ---- */

  function setActive(lessonId) {
    activeId = lessonId ?? null;
    for (const { lesson, link } of lessons) {
      if (lesson.id === activeId) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (activeId) overview.removeAttribute('aria-current');
    else overview.setAttribute('aria-current', 'page');
    refreshTips();
    const active = byId.get(activeId)?.link;
    if (active) reveal(active);
  }

  function updateProgress(map) {
    readMap = map;
    let read = 0;
    let previousRead = false;
    for (const { lesson, item, state } of lessons) {
      const done = Boolean(map[lesson.id]);
      if (done) read += 1;
      // เส้นระหว่างจุดเป็นสีภาษาเมื่อบทก่อนหน้าอ่านแล้ว · บทแรกของแต่ละระดับไม่มีเส้นด้านบน (CSS ซ่อนไว้)
      item.classList.toggle('is-read', done);
      item.classList.toggle('is-prev-read', previousRead);
      state.textContent = done ? ' · อ่านแล้ว' : '';
      previousRead = done;
    }
    for (const { level, section, count } of levels) {
      const done = level.lessons.filter((lesson) => map[lesson.id]).length;
      count.textContent = `${done}/${level.lessons.length}`;
      section.classList.toggle('is-complete', done === level.lessons.length);
    }
    const total = lessons.length;
    const ratio = total ? read / total : 0;
    ring.style.setProperty('--value', String(ratio));
    ring.setAttribute('aria-valuenow', String(read));
    ring.setAttribute('aria-valuetext', `อ่านแล้ว ${read} จาก ${total} บท`);
    ringCount.textContent = String(read);
    progressText.textContent = `${read}/${total} บท · ${Math.round(ratio * 100)}%`;
    refreshTips();
  }

  /* ---- drawer บนจอแคบ ---- */

  const isOpen = () => container.classList.contains('is-open');

  function open() {
    container.classList.add('is-open');
    scrim.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'ปิดรายการบทเรียน');
    (container.querySelector('.course-nav__link[aria-current="page"]') ?? overview).focus();
  }

  function close({ restoreFocus = true } = {}) {
    if (!isOpen()) return;
    container.classList.remove('is-open');
    scrim.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'เปิดรายการบทเรียน');
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => (isOpen() ? close() : open()));
  scrim.addEventListener('click', () => close());
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    hideTip();
    if (isOpen()) close();
  });
  container.addEventListener('click', (event) => {
    if (event.target.closest('a') && DRAWER_QUERY.matches) close({ restoreFocus: false });
  });
  DRAWER_QUERY.addEventListener('change', () => {
    hideTip();
    close({ restoreFocus: false });
  });

  return { setActive, updateProgress, close, toggleCollapsed };
}
