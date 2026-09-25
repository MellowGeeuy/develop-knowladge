/**
 * npm run check — ตรวจทุกภาษาในทะเบียนก่อนเผยแพร่ · ผิดแม้ข้อเดียวจบด้วย exit code 1
 *
 * ใช้ตัวแปลง Markdown และ grammar ตัวเดียวกับหน้าเว็บ สิ่งที่ผ่านที่นี่จึงแสดงบนเว็บได้ตามนั้น
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import * as nodeModule from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import vm from 'node:vm';
import {
  KEBAB_CASE, ROOT_DIR, hasCourse, languageDir, readCourse, readRegistry, readSurfaces, readText,
} from './lib/catalog.mjs';
import { isHex } from './lib/color.mjs';
import { CONTRAST, deriveAccent, generatedTargets } from './lib/generate.mjs';
import { getLanguageInfo } from '../assets/js/utils/grammars.js';
import { extractCodeBlocks, extractLinks, renderMarkdown } from '../assets/js/utils/markdown.js';

const errors = [];
const warnings = [];
const summary = [];

const where = (path, line) => `${relative(ROOT_DIR, path)}${line ? `:${line}` : ''}`;

/* ---- JavaScript syntax ---- */

let tempDir = null;
let snippetCount = 0;

// ลองแบบ script ก่อนเพราะเร็ว ถ้าไม่ผ่านค่อยให้ node --check ตรวจแบบ module จริง
// ไม่ดูจากข้อความ error ของ script เพราะ top-level await ในวงเล็บ เช่น console.log(await x)
// ได้ข้อความว่า "missing ) after argument list" ไม่ใช่ข้อความเรื่อง module
function jsSyntaxProblem(code) {
  try {
    new vm.Script(code);
    return null;
  } catch (error) {
    if (!(error instanceof SyntaxError)) return null;
  }
  tempDir ??= mkdtempSync(join(tmpdir(), 'the-brain-check-'));
  snippetCount += 1;
  const file = join(tempDir, `snippet-${snippetCount}.mjs`);
  writeFileSync(file, code, 'utf8');
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status === 0) return null;
  return (result.stderr ?? '').split('\n').find((line) => line.includes('SyntaxError'))?.trim() ?? 'syntax error';
}

/* ---- TypeScript syntax ---- */

// ใช้ตัวลบ type ที่มากับ Node เอง (22.13 ขึ้นไป) จึงไม่ต้องติดตั้ง typescript เพิ่ม · ตรวจแค่ syntax ส่วน type ต้องตรวจด้วย tsc
const stripTypes = nodeModule.stripTypeScriptTypes;
let tsSkipped = 0;

if (stripTypes) {
  // Node เตือนว่าเป็นฟีเจอร์ทดลองทุกครั้งที่รัน check ทั้งที่เราตั้งใจใช้ เงียบไว้เฉพาะคำเตือนนี้ ตัวอื่นยังแสดงตามปกติ
  const emitWarning = process.emitWarning;
  process.emitWarning = (warning, ...rest) => {
    if (String(warning).includes('stripTypeScriptTypes')) return;
    emitWarning.call(process, warning, ...rest);
  };
}

function tsSyntaxProblem(code) {
  try {
    stripTypes(code);
    return null;
  } catch (error) {
    // enum, namespace และ parameter properties เขียนถูก แค่ Node ลบทิ้งเฉย ๆ ไม่ได้ บทเรียนตั้งใจสอนเรื่องนี้
    if (error?.code === 'ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX') return null;
    return String(error?.message ?? error).split('\n')[0];
  }
}

/* ---- ทะเบียน ---- */

function checkColors(label, entry, surfaces) {
  for (const key of ['color', 'colorInk', 'colorAlt']) {
    if (entry[key] !== undefined && !isHex(entry[key])) {
      errors.push(`${label}: ${key} ต้องเป็นสี hex เช่น #F7DF1E`);
      return;
    }
  }
  for (const [key, value] of Object.entries(entry.overrides ?? {})) {
    if (!isHex(value)) {
      errors.push(`${label}: overrides.${key} ต้องเป็นสี hex`);
      return;
    }
  }
  if (!entry.color || !entry.colorInk) return;

  const accent = deriveAccent(entry, surfaces);
  const minimum = {
    ink: CONTRAST.ink,
    strongLight: CONTRAST.strong,
    strongDark: CONTRAST.strong,
    textLight: CONTRAST.text,
    textDark: CONTRAST.text,
    altLight: CONTRAST.alt,
    altDark: CONTRAST.alt,
  };
  for (const [key, min] of Object.entries(minimum)) {
    const ratio = accent.contrast[key];
    if (ratio < min) {
      const hint = key === 'ink' ? ' (ลองเปลี่ยน colorInk เป็น #000000 หรือ #FFFFFF)' : '';
      errors.push(`${label}: คอนทราสต์ ${key} ได้ ${ratio.toFixed(2)}:1 ต่ำกว่าเกณฑ์ ${min}:1${hint}`);
    }
  }
}

function checkRegistry(registry, surfaces) {
  if (!registry.hub) errors.push('languages.json: ไม่มีข้อมูล hub');
  else checkColors('languages.json → hub', registry.hub, surfaces);

  if (!Array.isArray(registry.languages)) {
    errors.push('languages.json: languages ต้องเป็น array');
    return;
  }

  const ids = new Set();
  const folders = new Set();
  registry.languages.forEach((language, index) => {
    const label = `languages.json → ${language.id ?? `รายการที่ ${index + 1}`}`;
    for (const key of ['id', 'name', 'badge', 'folder', 'status', 'color', 'colorInk', 'tagline']) {
      if (!language[key]) errors.push(`${label}: ไม่มี "${key}"`);
    }
    if (language.id && !KEBAB_CASE.test(language.id)) errors.push(`${label}: id ต้องเป็น kebab-case`);
    if (ids.has(language.id)) errors.push(`${label}: id ซ้ำกับภาษาอื่น`);
    ids.add(language.id);
    if (language.folder && !KEBAB_CASE.test(language.folder)) errors.push(`${label}: folder ต้องเป็นโฟลเดอร์ชั้นเดียวชื่อ kebab-case`);
    if (language.folder === 'the-brain-hub') errors.push(`${label}: ใช้โฟลเดอร์ the-brain-hub ไม่ได้`);
    if (folders.has(language.folder)) errors.push(`${label}: folder ซ้ำกับภาษาอื่น`);
    folders.add(language.folder);
    if (language.badge && language.badge.length > 3) warnings.push(`${label}: badge ยาวเกิน 3 ตัวอักษร จะล้นกรอบ`);
    if (!['ready', 'planned'].includes(language.status)) errors.push(`${label}: status ต้องเป็น ready หรือ planned`);
    if (language.status === 'ready' && !hasCourse(language)) {
      errors.push(`${label}: status เป็น ready แต่ไม่มี ${language.folder}/course.json`);
    }
    if (language.logo && !existsSync(join(languageDir(language), language.logo))) {
      errors.push(`${label}: ไม่พบไฟล์โลโก้ ${language.folder}/${language.logo}`);
    }
    checkColors(label, language, surfaces);
  });
}

/* ---- คอร์สและบทเรียน ---- */

function checkLesson(path, lesson, lessonFiles, stats) {
  const source = readText(path);
  const { title } = renderMarkdown(source, { stripTitle: true });
  if (!title) errors.push(`${where(path, 1)}: บรรทัดแรกต้องเป็นหัวเรื่อง "# ${lesson.title}"`);
  else if (title !== lesson.title) errors.push(`${where(path, 1)}: หัวเรื่อง "${title}" ไม่ตรงกับ title ใน course.json "${lesson.title}"`);

  for (const link of extractLinks(source)) {
    const { href } = link;
    if (/^https:\/\//i.test(href) || /^mailto:/i.test(href) || href.startsWith('#')) continue;
    if (/^http:\/\//i.test(href)) {
      warnings.push(`${where(path, link.line)}: ลิงก์ ${href} ควรเป็น https`);
      continue;
    }
    if (/^[a-z][a-z\d+.-]*:/i.test(href)) {
      errors.push(`${where(path, link.line)}: ลิงก์ ${href} ใช้ scheme ที่ไม่ปลอดภัย`);
      continue;
    }
    const target = resolve(dirname(path), decodeURI(href.split('#')[0]));
    if (!existsSync(target)) {
      errors.push(`${where(path, link.line)}: ลิงก์ ${href} ชี้ไฟล์ที่ไม่มีอยู่`);
    } else if (target.endsWith('.md') && target.includes(`${sep}lessons${sep}`) && !lessonFiles.has(target)) {
      warnings.push(`${where(path, link.line)}: ลิงก์ ${href} ชี้บทที่ไม่อยู่ใน course.json`);
    }
  }

  for (const block of extractCodeBlocks(source)) {
    stats.blocks += 1;
    const info = getLanguageInfo(block.lang);
    if (!info.known) warnings.push(`${where(path, block.line)}: ไม่รู้จักภาษา "${block.lang}" จะแสดงเป็นข้อความธรรมดา`);
    if (block.meta.flags.includes('nocheck')) {
      stats.skipped += 1;
      continue;
    }
    if (info.id === 'js') {
      stats.checked += 1;
      const problem = jsSyntaxProblem(block.text);
      if (problem) errors.push(`${where(path, block.line)}: โค้ด JavaScript มี syntax error — ${problem} (ถ้าตั้งใจให้ผิด ใส่ nocheck ต่อท้ายชื่อภาษา)`);
    } else if (info.id === 'ts') {
      if (!stripTypes) {
        tsSkipped += 1;
        continue;
      }
      stats.checked += 1;
      const problem = tsSyntaxProblem(block.text);
      if (problem) errors.push(`${where(path, block.line)}: โค้ด TypeScript มี syntax error — ${problem} (ถ้าตั้งใจให้ผิด ใส่ nocheck ต่อท้ายชื่อภาษา)`);
    } else if (block.lang === 'json') {
      stats.checked += 1;
      try {
        JSON.parse(block.text);
      } catch (error) {
        errors.push(`${where(path, block.line)}: JSON ไม่ถูกต้อง — ${error.message}`);
      }
    }
  }
}

function checkCourse(language) {
  const dir = languageDir(language);
  const label = `${language.folder}/course.json`;
  let course;
  try {
    course = readCourse(language);
  } catch (error) {
    errors.push(error.message);
    return;
  }

  const levels = Array.isArray(course.levels) ? course.levels : [];
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  if (levels.length === 0) errors.push(`${label}: ต้องมี levels อย่างน้อย 1 ระดับ`);
  if (lessons.length === 0) errors.push(`${label}: ต้องมี lessons อย่างน้อย 1 บท`);

  const levelIds = new Set();
  for (const level of levels) {
    if (!level.id || !level.title) errors.push(`${label}: ระดับทุกตัวต้องมี id และ title`);
    if (levelIds.has(level.id)) errors.push(`${label}: ระดับ id "${level.id}" ซ้ำ`);
    levelIds.add(level.id);
  }

  const lessonIds = new Set();
  const lessonFiles = new Map();
  for (const lesson of lessons) {
    const lessonLabel = `${label} → ${lesson.id ?? '(ไม่มี id)'}`;
    for (const key of ['id', 'level', 'title', 'summary', 'file']) {
      if (!lesson[key]) errors.push(`${lessonLabel}: ไม่มี "${key}"`);
    }
    if (lesson.id && !KEBAB_CASE.test(lesson.id)) errors.push(`${lessonLabel}: id ต้องเป็น kebab-case`);
    if (lessonIds.has(lesson.id)) errors.push(`${lessonLabel}: id ซ้ำ`);
    lessonIds.add(lesson.id);
    if (lesson.level && !levelIds.has(lesson.level)) errors.push(`${lessonLabel}: ระดับ "${lesson.level}" ไม่มีใน levels`);
    if (!Number.isInteger(lesson.minutes) || lesson.minutes <= 0) errors.push(`${lessonLabel}: minutes ต้องเป็นจำนวนเต็มบวก`);
    if (lesson.keywords !== undefined && !Array.isArray(lesson.keywords)) errors.push(`${lessonLabel}: keywords ต้องเป็น array`);
    if (!lesson.file) continue;

    const path = resolve(dir, lesson.file);
    if (!path.startsWith(dir + sep)) {
      errors.push(`${lessonLabel}: ไฟล์ต้องอยู่ในโฟลเดอร์ ${language.folder}`);
      continue;
    }
    if (lessonFiles.has(path)) errors.push(`${lessonLabel}: ใช้ไฟล์ซ้ำกับบทอื่น`);
    if (!existsSync(path)) {
      errors.push(`${lessonLabel}: ไม่พบไฟล์ ${lesson.file}`);
      continue;
    }
    lessonFiles.set(path, lesson);
  }

  const lessonsDir = join(dir, 'lessons');
  if (existsSync(lessonsDir)) {
    for (const name of readdirSync(lessonsDir)) {
      if (name.endsWith('.md') && !lessonFiles.has(join(lessonsDir, name))) {
        warnings.push(`${language.folder}/lessons/${name}: ไม่ได้อยู่ใน course.json จึงไม่แสดงบนเว็บ`);
      }
    }
  }

  const stats = { blocks: 0, checked: 0, skipped: 0 };
  for (const [path, lesson] of lessonFiles) checkLesson(path, lesson, lessonFiles, stats);
  summary.push(`${language.name}: ${lessons.length} บท · ${levels.length} ระดับ · code block ${stats.blocks} ก้อน (ตรวจ syntax ${stats.checked} · ข้าม ${stats.skipped})`);
}

/* ---- ไฟล์ที่สร้างจากแหล่งเดียว ---- */

function checkGenerated() {
  for (const target of generatedTargets()) {
    const actual = existsSync(target.path) ? readText(target.path) : null;
    if (actual !== target.expected) {
      errors.push(`${relative(ROOT_DIR, target.path)}: ไม่ตรงกับต้นทาง (${target.label}) — สั่ง npm run sync`);
    }
  }
}

/* ---- run ---- */

try {
  const registry = readRegistry();
  const surfaces = readSurfaces();
  checkRegistry(registry, surfaces);
  const ready = registry.languages.filter((language) => language.status === 'ready').length;
  summary.push(`ทะเบียน: ${registry.languages.length} ภาษา (พร้อมเรียน ${ready} · กำลังจัดทำ ${registry.languages.length - ready})`);
  for (const language of registry.languages) {
    if (hasCourse(language)) checkCourse(language);
  }
  checkGenerated();
  if (tsSkipped) {
    warnings.push(`ข้ามการตรวจ syntax ของโค้ด TypeScript ${tsSkipped} ก้อน เพราะ Node ${process.version} ยังไม่มี module.stripTypeScriptTypes (ต้องใช้ Node 22.13 ขึ้นไป)`);
  }
} catch (error) {
  errors.push(error.message);
} finally {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
}

console.log('The Brain · ตรวจเนื้อหา');
for (const line of summary) console.log(`  ${line}`);
for (const warning of warnings) console.log(`  [เตือน] ${warning}`);
for (const problem of errors) console.log(`  [ผิด]   ${problem}`);
if (errors.length) {
  console.log(`ไม่ผ่าน: พบปัญหา ${errors.length} ข้อ${warnings.length ? ` · ข้อเตือน ${warnings.length} ข้อ` : ''}`);
  process.exitCode = 1;
} else {
  console.log(`ผ่าน${warnings.length ? ` (ข้อเตือน ${warnings.length} ข้อ)` : ''}`);
}
