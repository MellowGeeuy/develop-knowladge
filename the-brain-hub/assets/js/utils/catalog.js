/**
 * catalog.js — โหลดทะเบียนภาษา (languages.json) และคอร์สของแต่ละภาษา (course.json)
 *
 * URL ทุกตัวคำนวณจากที่อยู่ของไฟล์นี้ (import.meta.url) ไม่ใช่จากหน้าที่เรียก
 * เพราะ fetch แบบ relative resolve จากที่อยู่ของเอกสาร และหน้า hub กับหน้าภาษาอยู่คนละความลึก
 */
const HUB_URL = new URL('../../../', import.meta.url);
const ROOT_URL = new URL('../', HUB_URL);

let registryPromise = null;
const coursePromises = new Map();
const lessonPromises = new Map();

async function fetchResource(url, kind) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`โหลด ${url} ไม่สำเร็จ (HTTP ${response.status})`);
  return kind === 'json' ? response.json() : response.text();
}

// เก็บ promise ไว้ใช้ซ้ำ แต่ถ้าโหลดพลาดต้องลบทิ้ง ไม่งั้นกดลองใหม่ก็ได้ error เดิมตลอด
function cached(store, key, load) {
  if (!store.has(key)) {
    store.set(key, load().catch((error) => {
      store.delete(key);
      throw error;
    }));
  }
  return store.get(key);
}

export function hubUrl(path = '') {
  return new URL(path, HUB_URL).href;
}

export function dashboardUrl() {
  return hubUrl('dashboard/');
}

export function languageUrl(language, hash = '') {
  const url = new URL(`${language.folder}/`, ROOT_URL);
  if (hash) url.hash = hash;
  return url.href;
}

export function logoUrl(language) {
  return language.logo ? new URL(language.logo, languageUrl(language)).href : '';
}

export function isReady(language) {
  return language.status === 'ready';
}

export function loadRegistry() {
  registryPromise ??= fetchResource(hubUrl('languages.json'), 'json')
    .then((raw) => ({
      hub: raw.hub,
      languages: raw.languages.map((language, order) => ({ ...language, order })),
    }))
    .catch((error) => {
      registryPromise = null;
      throw error;
    });
  return registryPromise;
}

function normalizeCourse(raw, language, courseUrl) {
  const levels = raw.levels.map((level, index) => ({ ...level, number: index + 1, lessons: [] }));
  const levelById = new Map(levels.map((level) => [level.id, level]));
  const lessons = raw.lessons.map((lesson, index) => ({
    ...lesson,
    number: index + 1,
    keywords: lesson.keywords ?? [],
    level: levelById.get(lesson.level) ?? null,
    fileUrl: new URL(lesson.file, courseUrl).href,
  }));
  lessons.forEach((lesson, index) => {
    lesson.prev = lessons[index - 1] ?? null;
    lesson.next = lessons[index + 1] ?? null;
    lesson.level?.lessons.push(lesson);
  });
  return {
    ...raw,
    language,
    levels,
    lessons,
    lessonById: new Map(lessons.map((lesson) => [lesson.id, lesson])),
    totalMinutes: lessons.reduce((sum, lesson) => sum + (lesson.minutes ?? 0), 0),
  };
}

export function loadCourse(language) {
  const courseUrl = new URL('course.json', languageUrl(language)).href;
  return cached(coursePromises, language.id, () => fetchResource(courseUrl, 'json')
    .then((raw) => normalizeCourse(raw, language, courseUrl)));
}

export function loadLessonSource(lesson) {
  return cached(lessonPromises, lesson.fileUrl, () => fetchResource(lesson.fileUrl, 'text'));
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} นาที`;
  const hours = Math.round((minutes / 60) * 2) / 2;
  return `${String(hours).replace('.5', '½')} ชม.`;
}
