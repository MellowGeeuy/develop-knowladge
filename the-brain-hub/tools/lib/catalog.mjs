/**
 * catalog.mjs — ที่อยู่ไฟล์และการอ่าน/เขียนทะเบียนภาษาฝั่ง Node (ใช้ร่วมกันทุก tool)
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HUB_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ROOT_DIR = resolve(HUB_DIR, '..');
export const REGISTRY_PATH = join(HUB_DIR, 'languages.json');
export const TEMPLATES_DIR = join(HUB_DIR, 'templates');
export const DESIGN_SYSTEM_PATH = join(HUB_DIR, 'assets', 'css', 'design-system.css');
export const ACCENTS_CSS_PATH = join(HUB_DIR, 'assets', 'css', 'generated', 'language-accents.css');

export const README_START = '<!-- brain:lessons:start -->';
export const README_END = '<!-- brain:lessons:end -->';

export const KEBAB_CASE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export function readText(path) {
  return readFileSync(path, 'utf8');
}

/** เขียนเฉพาะเมื่อเนื้อหาเปลี่ยน · คืน true ถ้าเขียนจริง (UTF-8 ไม่มี BOM) */
export function writeIfChanged(path, content) {
  if (existsSync(path) && readText(path) === content) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
  return true;
}

export function readJson(path) {
  try {
    return JSON.parse(readText(path));
  } catch (error) {
    throw new Error(`อ่าน JSON ไม่ได้: ${path}\n  ${error.message}`);
  }
}

export function readRegistry() {
  return readJson(REGISTRY_PATH);
}

export function writeRegistry(registry) {
  return writeIfChanged(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`);
}

export function languageDir(language) {
  return join(ROOT_DIR, language.folder);
}

export function coursePath(language) {
  return join(languageDir(language), 'course.json');
}

export function hasCourse(language) {
  return existsSync(coursePath(language));
}

export function readCourse(language) {
  return readJson(coursePath(language));
}

/**
 * อ่านสีพื้นจาก design-system.css ตรง ๆ เพื่อให้การคำนวณคอนทราสต์ใช้ค่าเดียวกับที่หน้าเว็บใช้จริง
 * (ถ้าก๊อปค่ามาไว้ในนี้ วันที่แก้ token จะคำนวณเทียบกับพื้นเก่าโดยไม่มีใครรู้)
 */
export function readSurfaces() {
  const css = readText(DESIGN_SYSTEM_PATH);
  const tokens = new Map();
  for (const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!tokens.has(match[1])) tokens.set(match[1], match[2].trim());
  }

  const resolveValue = (value, depth = 0) => {
    if (depth > 10) throw new Error(`token วนอ้างกันเองใน design-system.css: ${value}`);
    const reference = /^var\((--[\w-]+)\)$/.exec(value);
    if (reference) {
      if (!tokens.has(reference[1])) throw new Error(`ไม่พบ token ${reference[1]} ใน design-system.css`);
      return resolveValue(tokens.get(reference[1]), depth + 1);
    }
    return value;
  };

  const pair = (name) => {
    const raw = tokens.get(name);
    const match = raw && /^light-dark\(\s*(.+?)\s*,\s*(.+?)\s*\)$/.exec(raw);
    if (!match) throw new Error(`${name} ใน design-system.css ต้องเขียนเป็น light-dark(ค่าสว่าง, ค่ามืด)`);
    return { light: resolveValue(match[1]), dark: resolveValue(match[2]) };
  };

  const names = ['--color-bg', '--color-surface', '--color-surface-2', '--color-surface-3'];
  const pairs = names.map(pair);
  return {
    light: pairs.map((entry) => entry.light),
    dark: pairs.map((entry) => entry.dark),
  };
}
