/**
 * progress-store.js — จำว่าอ่านบทไหนแล้ว เก็บใน localStorage ของเบราว์เซอร์นี้
 * โครงข้อมูล: { [languageId]: { [lessonId]: เวลาที่กดอ่านจบ (ISO) } }
 * ทุกหน้าอยู่ origin เดียวกัน Dashboard จึงอ่านสิ่งที่หน้าคอร์สบันทึกไว้ได้
 */
const STORAGE_KEY = 'the-brain.progress.v1';

export const PROGRESS_EVENT = 'brain:progress-change';

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    // โหมดส่วนตัวหรือข้อมูลเสีย: เริ่มนับใหม่ดีกว่าทำให้ทั้งหน้าพัง
    return {};
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getReadMap(languageId) {
  const entry = readAll()[languageId];
  return entry && typeof entry === 'object' ? entry : {};
}

export function isLessonRead(languageId, lessonId) {
  return Boolean(getReadMap(languageId)[lessonId]);
}

export function setLessonRead(languageId, lessonId, read) {
  const data = readAll();
  const entry = { ...(data[languageId] ?? {}) };
  if (read) entry[lessonId] = new Date().toISOString();
  else delete entry[lessonId];
  data[languageId] = entry;
  const saved = writeAll(data);
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { languageId, lessonId, read, saved } }));
  return saved;
}

/** เรียก callback ทุกครั้งที่ความคืบหน้าเปลี่ยน รวมถึงเปลี่ยนจากแท็บอื่น · คืนฟังก์ชันยกเลิก */
export function onProgressChange(callback) {
  const handleLocal = (event) => callback(event.detail ?? {});
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) callback({});
  };
  window.addEventListener(PROGRESS_EVENT, handleLocal);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(PROGRESS_EVENT, handleLocal);
    window.removeEventListener('storage', handleStorage);
  };
}

/** นับเฉพาะบทที่ยังอยู่ใน course · บทที่ถูกลบออกจาก course.json แล้วไม่ทำให้เปอร์เซ็นต์เกิน 100 */
export function summarizeProgress(course, readMap) {
  const total = course.lessons.length;
  const readLessons = course.lessons.filter((lesson) => readMap[lesson.id]);
  const read = readLessons.length;
  const lastReadAt = readLessons.reduce(
    (latest, lesson) => (readMap[lesson.id] > latest ? readMap[lesson.id] : latest),
    '',
  );
  return {
    total,
    read,
    ratio: total ? read / total : 0,
    percent: total ? Math.round((read / total) * 100) : 0,
    nextLesson: course.lessons.find((lesson) => !readMap[lesson.id]) ?? null,
    lastReadAt,
  };
}
