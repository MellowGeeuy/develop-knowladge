/**
 * course.js — หน้าคอร์สของทุกภาษา (โหลดผ่าน templates/course-page.html)
 * ภาษามาจาก <html data-language="..."> ข้อมูลที่เหลือมาจาก languages.json และ course.json ของภาษานั้น
 *
 * route อยู่ใน hash:  #                 ภาพรวมคอร์ส
 *                     #<lesson-id>      บทเรียน
 *                     #<lesson-id>/<h>  บทเรียน แล้วเลื่อนไปหัวข้อ h
 */
import { dashboardUrl, loadCourse, loadLessonSource, loadRegistry } from '../utils/catalog.js';
import { escapeHtml } from '../utils/escape-html.js';
import { renderMarkdown } from '../utils/markdown.js';
import { getReadMap, onProgressChange, setLessonRead, summarizeProgress } from '../utils/progress-store.js';
import { initCodeBlocks } from '../modules/code-block.js';
import { renderCourseHome } from '../modules/course-home.js';
import { createCourseNav } from '../modules/course-nav.js';
import {
  readToggleMarkup, renderLesson, renderLessonSkeleton, renderToc, watchToc,
} from '../modules/lesson-view.js';
import { createReadingProgress } from '../modules/reading-progress.js';
import { initSearchDialog } from '../modules/search-dialog.js';
import { initThemeToggle } from '../modules/theme-toggle.js';

function parseRoute(hash) {
  let raw = hash.replace(/^#/, '');
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // hash ที่ encode มาไม่ครบ ใช้ตามที่เป็นดีกว่าโยน error ทั้งหน้า
  }
  const slash = raw.indexOf('/');
  if (slash === -1) return { lessonId: raw || null, headingId: null };
  return { lessonId: raw.slice(0, slash) || null, headingId: raw.slice(slash + 1) || null };
}

function isTyping(target) {
  return target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}

function createAnnouncer() {
  const region = document.createElement('p');
  region.className = 'u-visually-hidden';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  document.body.append(region);
  return (message) => {
    // ล้างก่อนแล้วค่อยใส่ ข้อความเดิมซ้ำจะได้ถูกอ่านอีกครั้ง
    region.textContent = '';
    window.setTimeout(() => {
      region.textContent = message;
    }, 50);
  };
}

function messageMarkup(title, text, action = '') {
  return `<div class="course-message">
    <h1 class="course-message__title" tabindex="-1">${escapeHtml(title)}</h1>
    <p class="course-message__text">${escapeHtml(text)}</p>
    ${action}
  </div>`;
}

async function searchEntries(course) {
  const entries = course.lessons.map((lesson) => ({
    id: lesson.id,
    kind: 'lesson',
    title: lesson.title,
    context: `บทที่ ${lesson.number} · ระดับ ${lesson.level?.number ?? '-'} ${lesson.level?.title ?? ''}`,
    summary: lesson.summary,
    keywords: lesson.keywords,
    href: `#${lesson.id}`,
    // บทที่ชื่อมีคำค้นต้องมาก่อนหัวข้อย่อยที่ขึ้นต้นด้วยคำเดียวกัน (60 + 50 > 100)
    boost: 50,
  }));

  const sources = await Promise.all(course.lessons.map((lesson) => loadLessonSource(lesson)
    .then((source) => ({ lesson, source }), () => null)));

  for (const item of sources) {
    if (!item) continue;
    const { headings } = renderMarkdown(item.source, { stripTitle: true, leadFromQuote: true });
    for (const heading of headings) {
      entries.push({
        id: `${item.lesson.id}/${heading.id}`,
        kind: 'heading',
        title: heading.text,
        context: `บทที่ ${item.lesson.number} · ${item.lesson.title}`,
        href: `#${item.lesson.id}/${encodeURIComponent(heading.id)}`,
      });
    }
  }
  return entries;
}

async function init() {
  document.getElementById('boot-notice')?.remove();
  initThemeToggle(document.getElementById('theme-toggle'));
  window.history.scrollRestoration = 'manual';

  const layout = document.getElementById('course-layout');
  const main = document.getElementById('main');
  const toc = document.getElementById('course-toc');
  const announce = createAnnouncer();
  const languageId = document.documentElement.dataset.language;

  let language;
  let course;
  try {
    const registry = await loadRegistry();
    language = registry.languages.find((entry) => entry.id === languageId);
    if (!language) throw new Error(`ไม่พบภาษา "${languageId}" ใน the-brain-hub/languages.json`);
    course = await loadCourse(language);
  } catch (error) {
    layout.dataset.view = 'home';
    main.innerHTML = messageMarkup(
      'โหลดคอร์สไม่สำเร็จ',
      error.message,
      `<a class="btn btn--secondary" href="${escapeHtml(dashboardUrl())}">กลับไปหน้า Dashboard</a>`,
    );
    return;
  }

  const nav = createCourseNav({
    container: document.getElementById('course-sidebar'),
    toggle: document.getElementById('course-menu-toggle'),
    scrim: document.getElementById('course-scrim'),
    course,
  });
  const readingProgress = createReadingProgress(document.getElementById('reading-progress'));
  initCodeBlocks(main, { announce });

  const lessonByFile = new Map(course.lessons.map((lesson) => [lesson.fileUrl, lesson]));
  const state = { lessonId: undefined, stopToc: () => {}, token: 0 };
  const readMap = () => getReadMap(language.id);

  // ลิงก์ในไฟล์ .md ชี้ไปไฟล์บทอื่น (ใช้ได้บน GitHub) บนเว็บแปลงเป็น route ของบทนั้นแทน
  const linkResolver = (lesson) => (href) => {
    if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(href)) return null;
    const url = new URL(href, lesson.fileUrl);
    url.hash = '';
    const target = lessonByFile.get(url.href);
    return { href: target ? `#${target.id}` : url.href, external: false };
  };

  const setTitle = (text) => {
    document.title = text ? `${text} · ${language.name} · The Brain` : `${language.name} · The Brain`;
  };

  const scrollToHeading = (headingId) => {
    const target = headingId ? document.getElementById(headingId) : null;
    if (!target) return false;
    target.scrollIntoView({ block: 'start' });
    return true;
  };

  const resetLessonChrome = () => {
    state.stopToc();
    state.stopToc = () => {};
    toc.innerHTML = '';
    readingProgress.track(null);
  };

  function showHome({ focus }) {
    state.token += 1;
    resetLessonChrome();
    state.lessonId = null;
    layout.dataset.view = 'home';
    nav.setActive(null);
    const map = readMap();
    renderCourseHome(main, { language, course, readMap: map, progress: summarizeProgress(course, map) });
    setTitle('');
    window.scrollTo(0, 0);
    if (focus) main.querySelector('#course-title')?.focus({ preventScroll: true });
  }

  function showNotFound(lessonId) {
    state.token += 1;
    resetLessonChrome();
    state.lessonId = null;
    layout.dataset.view = 'home';
    nav.setActive(null);
    main.innerHTML = messageMarkup(
      'ไม่พบบทเรียนนี้',
      `ไม่มีบท "${lessonId}" ในคอร์ส ${language.name} อาจถูกเปลี่ยนชื่อหรือย้ายไปแล้ว`,
      '<a class="btn btn--secondary" href="#">ไปหน้าภาพรวมคอร์ส</a>',
    );
    setTitle('ไม่พบบทเรียน');
  }

  async function showLesson(lesson, headingId, { focus }) {
    state.token += 1;
    const token = state.token;
    resetLessonChrome();
    state.lessonId = lesson.id;
    layout.dataset.view = 'lesson';
    nav.setActive(lesson.id);
    setTitle(lesson.title);
    renderLessonSkeleton(main);
    window.scrollTo(0, 0);

    let source;
    try {
      source = await loadLessonSource(lesson);
    } catch (error) {
      if (token !== state.token) return;
      main.innerHTML = messageMarkup(
        'โหลดบทเรียนไม่สำเร็จ',
        error.message,
        '<button type="button" class="btn btn--secondary" data-retry>ลองอีกครั้ง</button>',
      );
      main.querySelector('[data-retry]').addEventListener('click', () => showLesson(lesson, headingId, { focus: true }));
      return;
    }
    // ผู้ใช้เปลี่ยนไปบทอื่นระหว่างรอไฟล์ ไม่ต้องวาดบทเก่าทับ
    if (token !== state.token) return;

    const rendered = renderMarkdown(source, {
      stripTitle: true,
      leadFromQuote: true,
      resolveLink: linkResolver(lesson),
    });
    const article = renderLesson(main, { course, lesson, rendered, read: Boolean(readMap()[lesson.id]) });
    renderToc(toc, { lesson, headings: rendered.headings });
    state.stopToc = watchToc(toc, article);
    readingProgress.track(article);
    if (!scrollToHeading(headingId)) window.scrollTo(0, 0);
    if (focus) article.querySelector('#lesson-title')?.focus({ preventScroll: true });
  }

  let firstRoute = true;
  const route = () => {
    const { lessonId, headingId } = parseRoute(window.location.hash);
    // โฟกัสหัวเรื่องเฉพาะตอนเปลี่ยนหน้าภายใน ให้ screen reader รู้ว่าเนื้อหาเปลี่ยน · ตอนเปิดหน้าครั้งแรกไม่ต้องแย่งโฟกัส
    const focus = !firstRoute;
    firstRoute = false;

    if (!lessonId) {
      showHome({ focus });
      return;
    }
    const lesson = course.lessonById.get(lessonId);
    if (!lesson) {
      showNotFound(lessonId);
      return;
    }
    if (lesson.id === state.lessonId && main.querySelector('.lesson__body')) {
      if (!scrollToHeading(headingId)) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    showLesson(lesson, headingId, { focus });
  };

  window.addEventListener('hashchange', route);
  route();

  main.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-read-toggle]');
    if (!toggle || !state.lessonId) return;
    const read = toggle.getAttribute('aria-pressed') !== 'true';
    setLessonRead(language.id, state.lessonId, read);
    announce(read ? 'บันทึกว่าอ่านบทนี้จบแล้ว' : 'ยกเลิกเครื่องหมายอ่านจบแล้ว');
  });

  onProgressChange(() => {
    const map = readMap();
    nav.updateProgress(map);
    const toggle = main.querySelector('[data-read-toggle]');
    if (toggle && state.lessonId) {
      const read = Boolean(map[state.lessonId]);
      toggle.setAttribute('aria-pressed', String(read));
      toggle.innerHTML = readToggleMarkup(read);
    }
    if (state.lessonId === null && main.querySelector('.course-home')) {
      renderCourseHome(main, { language, course, readMap: map, progress: summarizeProgress(course, map) });
    }
  });
  nav.updateProgress(readMap());

  // ← → เปลี่ยนบท แต่ไม่แย่งปุ่มลูกศรจากช่องพิมพ์ กล่องโค้ดที่เลื่อนแนวนอน หรือหน้าต่างค้นหา
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (isTyping(event.target) || event.target.closest?.('pre, .table-wrap') || document.querySelector('dialog[open]')) return;
    const lesson = state.lessonId ? course.lessonById.get(state.lessonId) : null;
    const target = event.key === 'ArrowLeft' ? lesson?.prev : lesson?.next;
    if (!target) return;
    event.preventDefault();
    window.location.hash = target.id;
  });

  initSearchDialog({
    trigger: document.getElementById('search-trigger'),
    getEntries: () => searchEntries(course),
    placeholder: `ค้นหาในคอร์ส ${language.name}`,
    hint: 'ค้นได้ทั้งชื่อบท หัวข้อย่อยในบท และคำสำคัญ เช่น closure, promise, ตัวแปร',
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
