/**
 * course-nav.js — รายการบทด้านซ้ายของหน้าคอร์ส แยกตามระดับ · บนจอแคบกลายเป็น drawer
 */
import { escapeHtml } from '../utils/escape-html.js';
import { iconMarkup } from '../utils/icon.js';

// ต้องตรงกับ breakpoint ของ drawer ใน course.css
const DRAWER_QUERY = window.matchMedia('(max-width: 64rem)');

const pad = (number) => String(number).padStart(2, '0');

function navMarkup(course) {
  const levels = course.levels.map((level) => `
    <section class="course-nav__level" aria-labelledby="nav-level-${escapeHtml(level.id)}">
      <h2 class="course-nav__level-title" id="nav-level-${escapeHtml(level.id)}">
        <span class="course-nav__level-number">ระดับ ${level.number}</span>${escapeHtml(level.title)}
      </h2>
      <ol class="course-nav__list">
        ${level.lessons.map((lesson) => `
          <li>
            <a class="course-nav__link" href="#${escapeHtml(lesson.id)}" data-lesson-id="${escapeHtml(lesson.id)}">
              <span class="course-nav__number">${pad(lesson.number)}</span>
              <span class="course-nav__title">${escapeHtml(lesson.title)}</span>
              <span class="course-nav__state" data-state></span>
            </a>
          </li>`).join('')}
      </ol>
    </section>`).join('');

  return `
    <div class="course-nav">
      <a class="course-nav__overview" href="#" data-nav-home>${iconMarkup('i-home', { className: 'icon--sm' })}<span>ภาพรวมคอร์ส</span></a>
      <div class="course-nav__progress">
        <div class="course-nav__progress-head">
          <span>ความคืบหน้า</span>
          <span class="course-nav__progress-count" data-progress-count></span>
        </div>
        <div class="progress" role="progressbar" aria-label="ความคืบหน้าคอร์ส" aria-valuemin="0" aria-valuemax="${course.lessons.length}" data-progress-bar>
          <span class="progress__fill"></span>
        </div>
      </div>
      ${levels}
    </div>`;
}

export function createCourseNav({ container, toggle, scrim, course }) {
  container.innerHTML = navMarkup(course);

  const overview = container.querySelector('[data-nav-home]');
  const links = new Map(
    [...container.querySelectorAll('[data-lesson-id]')].map((link) => [link.dataset.lessonId, link]),
  );
  const count = container.querySelector('[data-progress-count]');
  const bar = container.querySelector('[data-progress-bar]');
  const fill = bar.querySelector('.progress__fill');

  // เลื่อนเฉพาะในกล่องรายการบท — scrollIntoView จะพาทั้งหน้าเลื่อนตามไปด้วย
  const reveal = (link) => {
    const top = link.offsetTop - container.clientHeight / 2 + link.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, top) });
  };

  function setActive(lessonId) {
    for (const [id, link] of links) {
      if (id === lessonId) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (lessonId) overview.removeAttribute('aria-current');
    else overview.setAttribute('aria-current', 'page');
    const active = links.get(lessonId);
    if (active) reveal(active);
  }

  function updateProgress(readMap) {
    let read = 0;
    for (const [id, link] of links) {
      const done = Boolean(readMap[id]);
      if (done) read += 1;
      link.classList.toggle('is-read', done);
      link.querySelector('[data-state]').innerHTML = done
        ? iconMarkup('i-check', { className: 'icon--sm', label: 'อ่านแล้ว' })
        : '';
    }
    count.textContent = `${read}/${links.size}`;
    bar.setAttribute('aria-valuenow', String(read));
    fill.style.setProperty('--value', String(links.size ? read / links.size : 0));
  }

  const isOpen = () => container.classList.contains('is-open');

  function open() {
    container.classList.add('is-open');
    scrim.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'ปิดรายการบทเรียน');
    (container.querySelector('[aria-current="page"]') ?? overview).focus();
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
    if (event.key === 'Escape' && isOpen()) close();
  });
  container.addEventListener('click', (event) => {
    if (event.target.closest('a') && DRAWER_QUERY.matches) close({ restoreFocus: false });
  });
  DRAWER_QUERY.addEventListener('change', () => close({ restoreFocus: false }));

  return { setActive, updateProgress, close };
}
