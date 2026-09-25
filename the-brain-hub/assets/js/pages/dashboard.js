import {
  formatDuration, isReady, languageUrl, loadCourse, loadRegistry, logoUrl,
} from '../utils/catalog.js';
import { escapeHtml } from '../utils/escape-html.js';
import { iconMarkup } from '../utils/icon.js';
import { getReadMap, onProgressChange, summarizeProgress } from '../utils/progress-store.js';
import { brainNetworkMarkup } from '../modules/brain-network.js';
import { renderLanguageCards } from '../modules/language-cards.js';
import { initSearchDialog } from '../modules/search-dialog.js';
import { initThemeToggle } from '../modules/theme-toggle.js';

const FILTERS = {
  all: () => true,
  ready: (item) => item.ready,
  planned: (item) => !item.ready,
};

async function loadItems() {
  const { languages } = await loadRegistry();
  const items = await Promise.all(languages.map(async (language) => {
    let course = null;
    if (isReady(language)) {
      try {
        course = await loadCourse(language);
      } catch (error) {
        // ภาษาที่โหลดคอร์สไม่ได้แสดงเป็นการ์ดที่ยังไม่พร้อม ดีกว่าทำให้ทั้งหน้าว่าง
        console.error(error);
      }
    }
    return {
      language,
      course,
      ready: Boolean(course),
      logoUrl: logoUrl(language),
      duration: course ? formatDuration(course.totalMinutes) : '',
    };
  }));
  return items.sort((a, b) => Number(b.ready) - Number(a.ready) || a.language.order - b.language.order);
}

function attachProgress(items) {
  for (const item of items) {
    if (!item.ready) continue;
    item.progress = summarizeProgress(item.course, getReadMap(item.language.id));
    const next = item.progress.nextLesson;
    const inProgress = item.progress.read > 0 && next;
    item.href = inProgress ? languageUrl(item.language, next.id) : languageUrl(item.language);
  }
}

function setStat(name, value) {
  document.querySelector(`[data-stat="${name}"]`).textContent = value;
}

function renderStats(items) {
  const ready = items.filter((item) => item.ready);
  const lessons = ready.reduce((sum, item) => sum + item.course.lessons.length, 0);
  const read = ready.reduce((sum, item) => sum + item.progress.read, 0);
  const minutes = ready.reduce((sum, item) => sum + item.course.totalMinutes, 0);
  setStat('languages', String(items.length));
  setStat('languages-sub', `พร้อมเรียน ${ready.length} · กำลังจัดทำ ${items.length - ready.length}`);
  setStat('lessons', String(lessons));
  setStat('lessons-sub', lessons ? `รวมประมาณ ${formatDuration(minutes)}` : 'ยังไม่มีบทเรียน');
  setStat('read', `${lessons ? Math.round((read / lessons) * 100) : 0}%`);
  setStat('read-sub', `${read} จาก ${lessons} บท`);
}

// ปุ่มหลักของ hero พาไปเรียนต่อจากภาษาที่อ่านล่าสุด ถ้ายังไม่เคยอ่านเลยพาไปเริ่มภาษาแรกที่พร้อม
function renderHeroActions(container, items) {
  const ready = items.filter((item) => item.ready);
  if (ready.length === 0) {
    container.innerHTML = '';
    return;
  }
  const started = ready
    .filter((item) => item.progress.read > 0 && item.progress.nextLesson)
    .sort((a, b) => b.progress.lastReadAt.localeCompare(a.progress.lastReadAt));
  const arrow = iconMarkup('i-arrow-right', { className: 'btn__arrow' });

  let primary;
  if (started.length) {
    const { language, progress } = started[0];
    primary = `<a class="btn btn--primary btn--lg" href="${escapeHtml(languageUrl(language, progress.nextLesson.id))}">`
      + `เรียนต่อ ${escapeHtml(language.name)} บทที่ ${progress.nextLesson.number}${arrow}</a>`;
  } else {
    const { language } = ready[0];
    primary = `<a class="btn btn--primary btn--lg" href="${escapeHtml(languageUrl(language))}">`
      + `เริ่มเรียน ${escapeHtml(language.name)}${arrow}</a>`;
  }
  container.innerHTML = `${primary}<a class="btn btn--secondary btn--lg" href="#library">ดูคลังภาษา</a>`;
}

function renderFilters(group, items, active) {
  for (const button of group.querySelectorAll('[data-filter]')) {
    const key = button.dataset.filter;
    button.setAttribute('aria-pressed', String(key === active));
    button.querySelector('[data-count]').textContent = String(items.filter(FILTERS[key]).length);
  }
}

function searchEntries(items) {
  const entries = [];
  for (const { language, course, ready } of items) {
    if (!ready) continue;
    entries.push({
      id: `language:${language.id}`,
      kind: 'language',
      title: language.name,
      context: `ภาษา · ${course.lessons.length} บท`,
      summary: language.tagline,
      keywords: language.keywords ?? [],
      href: languageUrl(language),
      languageId: language.id,
      badge: language.badge,
      boost: 10,
    });
    for (const lesson of course.lessons) {
      entries.push({
        id: `lesson:${language.id}:${lesson.id}`,
        kind: 'lesson',
        title: lesson.title,
        context: `${language.name} · บทที่ ${lesson.number} · ${lesson.level?.title ?? ''}`,
        summary: lesson.summary,
        keywords: lesson.keywords,
        href: languageUrl(language, lesson.id),
        languageId: language.id,
      });
    }
  }
  return entries;
}

function renderError(grid, error) {
  grid.innerHTML = `<p class="dash-library__empty">โหลดทะเบียนภาษาไม่สำเร็จ — ${escapeHtml(error.message)}</p>`;
}

async function init() {
  document.getElementById('boot-notice')?.remove();
  initThemeToggle(document.getElementById('theme-toggle'));
  document.getElementById('hero-art').innerHTML = brainNetworkMarkup();

  const grid = document.getElementById('lang-grid');
  const filterGroup = document.getElementById('lang-filter');
  const empty = document.getElementById('lang-empty');
  const heroActions = document.getElementById('hero-actions');

  let items;
  try {
    items = await loadItems();
  } catch (error) {
    renderError(grid, error);
    return;
  }

  let filter = 'all';
  const render = () => {
    attachProgress(items);
    renderStats(items);
    renderHeroActions(heroActions, items);
    renderFilters(filterGroup, items, filter);
    const visible = items.filter(FILTERS[filter]);
    renderLanguageCards(grid, visible);
    empty.hidden = visible.length > 0;
  };

  filterGroup.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button || button.dataset.filter === filter) return;
    filter = button.dataset.filter;
    render();
  });

  onProgressChange(render);
  render();

  initSearchDialog({
    trigger: document.getElementById('search-trigger'),
    getEntries: () => searchEntries(items),
    placeholder: 'ค้นหาภาษาหรือบทเรียนจากทุกภาษา',
    hint: 'ค้นได้ทั้งชื่อภาษา ชื่อบท และคำสำคัญ เช่น closure, promise, ตัวแปร',
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
