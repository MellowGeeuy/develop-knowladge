/**
 * course-home.js — หน้าภาพรวมของคอร์ส: hero สีโลโก้ภาษา · สิ่งที่ได้หลังเรียน · เส้นทางการเรียนตามระดับ
 */
import { formatDuration } from '../utils/catalog.js';
import { escapeHtml } from '../utils/escape-html.js';
import { iconMarkup } from '../utils/icon.js';

const pad = (number) => String(number).padStart(2, '0');

function primaryAction(progress, course) {
  const arrow = iconMarkup('i-arrow-right', { className: 'btn__arrow' });
  if (!progress.nextLesson) {
    return `<a class="btn btn--primary btn--lg" href="#${escapeHtml(course.lessons[0].id)}">ทบทวนตั้งแต่บทแรก${arrow}</a>`;
  }
  const label = progress.read === 0 ? 'เริ่มเรียนบทที่ 1' : `อ่านต่อ บทที่ ${progress.nextLesson.number}`;
  return `<a class="btn btn--primary btn--lg" href="#${escapeHtml(progress.nextLesson.id)}">${label}${arrow}</a>`;
}

function lessonRow(lesson, read) {
  const state = read
    ? iconMarkup('i-check-circle', { label: 'อ่านแล้ว' })
    : iconMarkup('i-circle', { label: 'ยังไม่ได้อ่าน' });
  return `
    <li>
      <a class="lesson-row${read ? ' is-read' : ''}" href="#${escapeHtml(lesson.id)}">
        <span class="lesson-row__number">${pad(lesson.number)}</span>
        <span class="lesson-row__body">
          <span class="lesson-row__title">${escapeHtml(lesson.title)}</span>
          <span class="lesson-row__summary">${escapeHtml(lesson.summary)}</span>
        </span>
        <span class="lesson-row__meta">${lesson.minutes} นาที</span>
        <span class="lesson-row__state">${state}</span>
      </a>
    </li>`;
}

export function renderCourseHome(container, { language, course, readMap, progress }) {
  const outcomes = (course.outcomes ?? []).map((outcome) => `
    <li class="outcome-list__item">${iconMarkup('i-check-circle')}<span>${escapeHtml(outcome)}</span></li>`).join('');

  const levels = course.levels.map((level) => {
    const read = level.lessons.filter((lesson) => readMap[lesson.id]).length;
    return `
      <section class="roadmap-level" aria-labelledby="level-${escapeHtml(level.id)}">
        <div class="roadmap-level__head">
          <span class="roadmap-level__number">ระดับ ${level.number}</span>
          <h3 class="roadmap-level__title" id="level-${escapeHtml(level.id)}">${escapeHtml(level.title)}</h3>
          <p class="roadmap-level__summary">${escapeHtml(level.summary ?? '')}</p>
          <span class="roadmap-level__count">อ่านแล้ว ${read}/${level.lessons.length} บท</span>
        </div>
        <ol class="roadmap-level__lessons">
          ${level.lessons.map((lesson) => lessonRow(lesson, Boolean(readMap[lesson.id]))).join('')}
        </ol>
      </section>`;
  }).join('');

  container.innerHTML = `
    <div class="course-home">
      <section class="course-hero" aria-labelledby="course-title">
        <span class="lang-badge lang-badge--lg" aria-hidden="true"><span class="lang-badge__text">${escapeHtml(language.badge)}</span></span>
        <div class="course-hero__body">
          <p class="eyebrow">คอร์สใน The Brain</p>
          <h1 class="course-hero__title" id="course-title" tabindex="-1">${escapeHtml(language.name)}</h1>
          <p class="course-hero__text">${escapeHtml(course.about ?? language.tagline)}</p>
          <ul class="course-hero__meta">
            <li>${iconMarkup('i-book', { className: 'icon--sm' })}${course.lessons.length} บท</li>
            <li>${iconMarkup('i-layers', { className: 'icon--sm' })}${course.levels.length} ระดับ</li>
            <li>${iconMarkup('i-clock', { className: 'icon--sm' })}ประมาณ ${formatDuration(course.totalMinutes)}</li>
          </ul>
          <div class="course-hero__progress">
            <div class="progress" role="progressbar" aria-label="ความคืบหน้าคอร์ส ${escapeHtml(language.name)}"
                 aria-valuemin="0" aria-valuemax="${progress.total}" aria-valuenow="${progress.read}">
              <span class="progress__fill" style="--value: ${progress.ratio}"></span>
            </div>
            <span class="course-hero__progress-label">อ่านแล้ว ${progress.read}/${progress.total} บท · ${progress.percent}%</span>
          </div>
          <div class="course-hero__actions">${primaryAction(progress, course)}</div>
        </div>
      </section>

      ${outcomes ? `
      <section class="course-section" aria-labelledby="outcomes-title">
        <h2 class="section-head__title" id="outcomes-title">เรียนจบแล้วทำอะไรได้</h2>
        <ul class="outcome-list">${outcomes}</ul>
      </section>` : ''}

      <section class="course-section" aria-labelledby="roadmap-title">
        <div class="section-head">
          <div>
            <h2 class="section-head__title" id="roadmap-title">เส้นทางการเรียน</h2>
            <p class="section-head__text">เรียงจากพื้นฐานไปขั้นสูง อ่านตามลำดับได้เลย หรือกดเข้าบทที่ต้องการทบทวน</p>
          </div>
        </div>
        <div class="roadmap">${levels}</div>
      </section>
    </div>`;
}
