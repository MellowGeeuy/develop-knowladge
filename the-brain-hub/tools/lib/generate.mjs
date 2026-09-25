/**
 * generate.mjs — ไฟล์ทุกตัวที่ "สร้างจากแหล่งเดียว" อยู่ที่นี่ ทั้ง sync (เขียน) และ check (เทียบ) เรียกใช้ชุดเดียวกัน
 *   languages.json          → assets/css/generated/language-accents.css
 *   templates/course-page.html + ทะเบียน → <ภาษา>/index.html
 *   <ภาษา>/course.json      → ตารางบทใน <ภาษา>/README.md (ระหว่าง marker)
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ACCENTS_CSS_PATH, README_END, README_START, TEMPLATES_DIR,
  hasCourse, languageDir, readCourse, readRegistry, readSurfaces, readText, writeIfChanged,
} from './catalog.mjs';
import { adjustForContrast, contrastRatio, rotateHue, worstContrast } from './color.mjs';

export const CONTRAST = {
  ink: 4.5,
  text: 4.5,
  strong: 3,
  alt: 3,
};

/**
 * สีที่ต่อยอดจากสีโลโก้ ต่อธีม:
 *   strong ≥ 3:1 กับพื้นทุกชั้น (แถบความคืบหน้า ตัวชี้ focus ring)
 *   text   ≥ 4.5:1 กับพื้นที่ข้อความวางได้ (ป้ายเล็ก ลิงก์ที่ hover)
 *   alt    ≥ 3:1 กับพื้นหลังหน้า (ปลายสีไล่ของหัวเรื่องตัวใหญ่)
 * override ในทะเบียนใช้แทนค่าอัตโนมัติได้ แต่ต้องผ่านเกณฑ์เดียวกัน
 */
export function deriveAccent(entry, surfaces) {
  const color = entry.color.toLowerCase();
  const alt = (entry.colorAlt ?? rotateHue(color, 40)).toLowerCase();
  const overrides = entry.overrides ?? {};
  const textSurfaces = (theme) => surfaces[theme].slice(0, 3);
  const pick = (key, compute) => (overrides[key] ? overrides[key].toLowerCase() : compute());

  const result = {
    color,
    ink: entry.colorInk.toLowerCase(),
    alt,
    strongLight: pick('strongLight', () => adjustForContrast(color, surfaces.light, CONTRAST.strong, 'darker')),
    strongDark: pick('strongDark', () => adjustForContrast(color, surfaces.dark, CONTRAST.strong, 'lighter')),
    textLight: pick('textLight', () => adjustForContrast(color, textSurfaces('light'), CONTRAST.text, 'darker')),
    textDark: pick('textDark', () => adjustForContrast(color, textSurfaces('dark'), CONTRAST.text, 'lighter')),
    altLight: pick('altLight', () => adjustForContrast(alt, surfaces.light.slice(0, 1), CONTRAST.alt, 'darker')),
    altDark: pick('altDark', () => adjustForContrast(alt, surfaces.dark.slice(0, 1), CONTRAST.alt, 'lighter')),
  };

  result.contrast = {
    ink: contrastRatio(result.ink, color),
    strongLight: worstContrast(result.strongLight, surfaces.light),
    strongDark: worstContrast(result.strongDark, surfaces.dark),
    textLight: worstContrast(result.textLight, textSurfaces('light')),
    textDark: worstContrast(result.textDark, textSurfaces('dark')),
    altLight: worstContrast(result.altLight, surfaces.light.slice(0, 1)),
    altDark: worstContrast(result.altDark, surfaces.dark.slice(0, 1)),
  };
  return result;
}

function accentDeclarations(accent) {
  return [
    `  --accent: ${accent.color};`,
    `  --accent-ink: ${accent.ink};`,
    `  --accent-alt: ${accent.alt};`,
    `  --accent-strong: light-dark(${accent.strongLight}, ${accent.strongDark});`,
    `  --accent-text: light-dark(${accent.textLight}, ${accent.textDark});`,
    `  --accent-alt-strong: light-dark(${accent.altLight}, ${accent.altDark});`,
  ];
}

export function accentsCss(registry, surfaces) {
  const hub = deriveAccent(registry.hub, surfaces);
  const blocks = [
    '/* สร้างอัตโนมัติโดย the-brain-hub/tools/sync.mjs จาก languages.json — ห้ามแก้มือ',
    '   แก้สีที่ languages.json แล้วรัน npm run sync · สีตัวชี้และตัวอักษรถูกเลื่อนความสว่างให้ผ่านคอนทราสต์ทั้งสองธีม */',
    '',
    `/* ${registry.hub.name} · ใช้กับหน้า hub และเป็นค่าเริ่มต้นของทุกหน้า */`,
    ':root {',
    `  --brand: ${hub.color};`,
    `  --brand-ink: ${hub.ink};`,
    `  --brand-alt: ${hub.alt};`,
    ...accentDeclarations(hub),
    '}',
  ];

  for (const language of registry.languages) {
    const accent = deriveAccent(language, surfaces);
    blocks.push(
      '',
      `/* ${language.name} · สีโลโก้ ${language.color.toUpperCase()} */`,
      `[data-language="${language.id}"] {`,
      ...accentDeclarations(accent),
      '}',
    );
  }
  return `${blocks.join('\n')}\n`;
}

/* ---- templates ---- */

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export function fillTemplate(template, values, escape = (value) => value) {
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, key) => {
    if (!(key in values)) throw new Error(`template ต้องการค่า ${placeholder} แต่ไม่มีให้`);
    return escape(values[key]);
  });
}

export function templateValues(language) {
  return {
    id: language.id,
    name: language.name,
    badge: language.badge,
    folder: language.folder,
    description: language.tagline ?? `เรียน ${language.name} ทีละบท`,
  };
}

export const escapeForJson = (value) => JSON.stringify(String(value)).slice(1, -1);

export function coursePage(language) {
  const template = readText(join(TEMPLATES_DIR, 'course-page.html'));
  return fillTemplate(template, templateValues(language), escapeHtml);
}

export function lessonsTable(language, course) {
  const rows = [
    '| # | บทเรียน | เรียนอะไร | เวลา |',
    '|---|---|---|---:|',
  ];
  for (const [levelIndex, level] of course.levels.entries()) {
    rows.push(`| | **ระดับ ${levelIndex + 1} · ${level.title}** | | |`);
    course.lessons
      .map((lesson, index) => ({ lesson, number: index + 1 }))
      .filter(({ lesson }) => lesson.level === level.id)
      .forEach(({ lesson, number }) => {
        const cell = (text) => String(text).replace(/\|/g, '\\|');
        rows.push(`| ${String(number).padStart(2, '0')} | [${cell(lesson.title)}](${lesson.file}) | ${cell(lesson.summary)} | ${lesson.minutes} นาที |`);
      });
  }
  const total = course.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  rows.push('', `รวม ${course.lessons.length} บท · ${course.levels.length} ระดับ · ประมาณ ${Math.round(total / 6) / 10} ชั่วโมง`);
  return rows.join('\n');
}

/** คืนข้อความ README ที่ตารางบทถูกแทนแล้ว · null ถ้าไม่มี marker */
export function readmeWithLessons(readme, table) {
  const start = readme.indexOf(README_START);
  const end = readme.indexOf(README_END);
  if (start === -1 || end === -1 || end < start) return null;
  return `${readme.slice(0, start + README_START.length)}\n${table}\n${readme.slice(end)}`;
}

/**
 * เป้าหมายทั้งหมดที่ควรเป็นไปตามแหล่งเดียว: [{ path, expected, label }]
 * sync เขียนตามนี้ · check เทียบกับไฟล์จริงตามนี้
 */
export function generatedTargets(registry = readRegistry(), surfaces = readSurfaces()) {
  const targets = [{ path: ACCENTS_CSS_PATH, expected: accentsCss(registry, surfaces), label: 'สีประจำภาษา' }];
  for (const language of registry.languages) {
    if (!hasCourse(language)) continue;
    const dir = languageDir(language);
    targets.push({ path: join(dir, 'index.html'), expected: coursePage(language), label: `หน้าเว็บ ${language.name}` });
    const readmePath = join(dir, 'README.md');
    if (existsSync(readmePath)) {
      const updated = readmeWithLessons(readText(readmePath), lessonsTable(language, readCourse(language)));
      if (updated !== null) targets.push({ path: readmePath, expected: updated, label: `ตารางบทใน README ${language.name}` });
    }
  }
  return targets;
}

export function syncAll() {
  return generatedTargets()
    .filter((target) => writeIfChanged(target.path, target.expected))
    .map((target) => target);
}
