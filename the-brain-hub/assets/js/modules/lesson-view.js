/**
 * lesson-view.js — หน้าอ่านบทเรียน: หัวบท · เนื้อหา · ปุ่มอ่านจบ · บทก่อน/ถัดไป · สารบัญ "ในบทนี้"
 */
import { escapeHtml } from '../utils/escape-html.js';
import { iconMarkup } from '../utils/icon.js';

export function renderLessonSkeleton(container) {
  container.innerHTML = `
    <div class="lesson" aria-busy="true">
      <div class="skeleton" aria-hidden="true">
        <span class="skeleton__line skeleton__line--short"></span>
        <span class="skeleton__line skeleton__line--title"></span>
        <span class="skeleton__line"></span>
        <span class="skeleton__line"></span>
        <span class="skeleton__line skeleton__line--short"></span>
      </div>
      <p class="u-visually-hidden" role="status">กำลังโหลดบทเรียน</p>
    </div>`;
}

export function readToggleMarkup(read) {
  const icon = iconMarkup(read ? 'i-check-circle' : 'i-circle');
  const title = read ? 'อ่านจบแล้ว' : 'ทำเครื่องหมายว่าอ่านจบแล้ว';
  const hint = read ? 'กดอีกครั้งเพื่อยกเลิก' : 'ความคืบหน้าจะแสดงบนหน้า Dashboard ของ The Brain';
  return `${icon}<span class="read-toggle__text"><span class="read-toggle__title">${title}</span>`
    + `<span class="read-toggle__hint">${hint}</span></span>`;
}

function pagerLink(lesson, direction) {
  if (!lesson) return '';
  const next = direction === 'next';
  const label = next
    ? `บทถัดไป${iconMarkup('i-arrow-right', { className: 'icon--sm' })}`
    : `${iconMarkup('i-arrow-left', { className: 'icon--sm' })}บทก่อนหน้า`;
  return `<a class="pager__link pager__link--${direction}" href="#${escapeHtml(lesson.id)}" rel="${next ? 'next' : 'prev'}">`
    + `<span class="pager__label">${label}</span>`
    + `<span class="pager__title">${escapeHtml(lesson.title)}</span></a>`;
}

export function renderLesson(container, { course, lesson, rendered, read }) {
  const level = lesson.level;
  container.innerHTML = `
    <article class="lesson" aria-labelledby="lesson-title">
      <header class="lesson__header">
        <p class="lesson__meta">
          <span class="lesson__level">ระดับ ${level?.number ?? '-'} · ${escapeHtml(level?.title ?? '')}</span>
          <span class="lesson__meta-item">บทที่ ${lesson.number}/${course.lessons.length}</span>
          <span class="lesson__meta-item">${iconMarkup('i-clock', { className: 'icon--sm' })}${lesson.minutes} นาที</span>
        </p>
        <h1 class="lesson__title" id="lesson-title" tabindex="-1">${escapeHtml(rendered.title || lesson.title)}</h1>
        ${rendered.lead}
      </header>
      <div class="prose lesson__body">${rendered.html}</div>
      <footer class="lesson__footer">
        <button type="button" class="read-toggle" data-read-toggle aria-pressed="${read}">${readToggleMarkup(read)}</button>
        <nav class="pager" aria-label="เปลี่ยนบท">
          ${pagerLink(lesson.prev, 'prev')}
          ${pagerLink(lesson.next, 'next')}
        </nav>
      </footer>
    </article>`;
  return container.querySelector('.lesson');
}

export function renderToc(container, { lesson, headings }) {
  if (headings.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <p class="toc__title">ในบทนี้</p>
    <ol class="toc__list">
      ${headings.map((heading) => `
        <li><a class="toc__link${heading.level === 3 ? ' toc__link--sub' : ''}"
               href="#${escapeHtml(lesson.id)}/${encodeURIComponent(heading.id)}"
               data-heading-id="${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a></li>`).join('')}
    </ol>`;
}

/** ไฮไลต์หัวข้อที่กำลังอ่านในสารบัญ · คืนฟังก์ชันหยุดติดตาม */
export function watchToc(container, article) {
  const links = new Map(
    [...container.querySelectorAll('[data-heading-id]')].map((link) => [link.dataset.headingId, link]),
  );
  const headings = [...article.querySelectorAll('.prose > h2, .prose > h3')].filter((heading) => links.has(heading.id));
  if (headings.length === 0) return () => {};

  const setActive = (id) => {
    for (const [headingId, link] of links) {
      link.classList.toggle('is-active', headingId === id);
      if (headingId === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    const first = headings.find((heading) => visible.has(heading));
    if (first) setActive(first.id);
  }, { rootMargin: '-80px 0px -65% 0px' });

  headings.forEach((heading) => observer.observe(heading));
  setActive(headings[0].id);
  return () => observer.disconnect();
}
