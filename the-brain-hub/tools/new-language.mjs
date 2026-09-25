/**
 * npm run new-language -- --id python --name Python --badge PY --folder python --color "#3776AB" --ink "#FFFFFF" [--alt "#FFD43B"] [--tagline "..."]
 *
 * สร้างชุดเนื้อหาของภาษาใหม่จาก templates/ แล้วลงทะเบียนใน languages.json เป็นสถานะ planned
 * ภาษาที่มีในทะเบียนแล้ว (เช่น typescript) สั่งแค่ --id ก็สร้างโฟลเดอร์ตามข้อมูลเดิม
 * ไม่เขียนทับไฟล์ที่มีอยู่แล้วเด็ดขาด รันซ้ำได้อย่างปลอดภัย
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import {
  KEBAB_CASE, REGISTRY_PATH, ROOT_DIR, TEMPLATES_DIR, languageDir, readRegistry, readText, writeRegistry,
} from './lib/catalog.mjs';
import { contrastRatio, isHex } from './lib/color.mjs';
import { CONTRAST, escapeForJson, fillTemplate, syncAll, templateValues } from './lib/generate.mjs';

function fail(message) {
  console.error(`new-language: ${message}`);
  process.exit(1);
}

const { values: args } = parseArgs({
  options: {
    id: { type: 'string' },
    name: { type: 'string' },
    badge: { type: 'string' },
    folder: { type: 'string' },
    color: { type: 'string' },
    ink: { type: 'string' },
    alt: { type: 'string' },
    tagline: { type: 'string' },
  },
});

if (!args.id) fail('ต้องระบุ --id เช่น --id python');

const registry = readRegistry();
let language = registry.languages.find((entry) => entry.id === args.id);
const isNew = !language;

if (isNew) {
  const missing = ['name', 'badge', 'color', 'ink'].filter((key) => !args[key]);
  if (missing.length) fail(`ภาษาใหม่ต้องระบุ ${missing.map((key) => `--${key}`).join(' ')}`);
  if (!KEBAB_CASE.test(args.id)) fail('--id ต้องเป็น kebab-case เช่น python หรือ go-lang');

  const folder = args.folder ?? args.id;
  if (!KEBAB_CASE.test(folder)) fail('--folder ต้องเป็นชื่อโฟลเดอร์ชั้นเดียวแบบ kebab-case');
  if (folder === 'the-brain-hub') fail('ใช้โฟลเดอร์ the-brain-hub ไม่ได้');
  if (registry.languages.some((entry) => entry.folder === folder)) fail(`โฟลเดอร์ ${folder} ถูกใช้โดยภาษาอื่นแล้ว`);

  for (const key of ['color', 'ink', 'alt']) {
    if (args[key] && !isHex(args[key])) fail(`--${key} ต้องเป็นสี hex เช่น #3776AB`);
  }
  const inkContrast = contrastRatio(args.ink, args.color);
  if (inkContrast < CONTRAST.ink) {
    fail(`ตัวอักษร ${args.ink} บนสี ${args.color} ได้คอนทราสต์ ${inkContrast.toFixed(2)}:1 ต่ำกว่า ${CONTRAST.ink}:1 ลองใช้ #000000 หรือ #FFFFFF`);
  }

  language = {
    id: args.id,
    name: args.name,
    badge: args.badge,
    folder,
    status: 'planned',
    color: args.color.toUpperCase(),
    colorInk: args.ink.toUpperCase(),
    ...(args.alt ? { colorAlt: args.alt.toUpperCase() } : {}),
    tagline: args.tagline ?? `เรียน ${args.name} ทีละบท ตั้งแต่พื้นฐานจนใช้งานได้จริง`,
    keywords: [args.id],
  };
}

const dir = languageDir(language);
const values = templateValues(language);
const created = [];

function writeNew(path, content) {
  if (existsSync(path)) return;
  writeFileSync(path, content, 'utf8');
  created.push(relative(ROOT_DIR, path));
}

mkdirSync(join(dir, 'lessons'), { recursive: true });
writeNew(join(dir, 'course.json'), fillTemplate(readText(join(TEMPLATES_DIR, 'course.json')), values, escapeForJson));
if (!readdirSync(join(dir, 'lessons')).some((name) => name.endsWith('.md'))) {
  writeNew(join(dir, 'lessons', '01-introduction.md'), fillTemplate(readText(join(TEMPLATES_DIR, 'lesson.md')), values));
}
writeNew(join(dir, 'README.md'), fillTemplate(readText(join(TEMPLATES_DIR, 'README.md')), values));

if (isNew) {
  registry.languages.push(language);
  writeRegistry(registry);
  created.push(`${relative(ROOT_DIR, REGISTRY_PATH)} (เพิ่ม ${language.name})`);
}

const synced = syncAll();

console.log(`new-language: เตรียม ${language.name} ที่โฟลเดอร์ ${language.folder}/ แล้ว`);
for (const path of created) console.log(`  สร้าง ${path}`);
for (const target of synced) console.log(`  sync  ${relative(ROOT_DIR, target.path)} (${target.label})`);
console.log([
  '',
  'ขั้นต่อไป',
  `  1. เขียนบทใน ${language.folder}/lessons/ และลงรายการใน ${language.folder}/course.json`,
  '  2. npm run sync แล้ว npm run check จนผ่าน',
  `  3. แก้ status ของ ${language.id} ใน languages.json เป็น "ready" การ์ดบน Dashboard จะกดเข้าเรียนได้`,
].join('\n'));
