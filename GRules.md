# GRules — กฎการทำงานของโปรเจกต์ The Brain (develop-knowladge)

> อ้างอิง: MDN Web Docs · Google JS Style Guide · BEM · WCAG 2.2

---

## กฎทั่วไป (General Rules)

- ชื่อไฟล์: `kebab-case` lowercase เสมอ
- ห้าม hardcode API keys, tokens, passwords ในโค้ด
- Update log: สร้าง `Updates/Update v.xxxx.md` ทุก session ที่มีการแก้ไขโค้ดหรือเนื้อหา
- จบทุกงานด้วย `npm run check` (ในโฟลเดอร์ `the-brain-hub`) ที่ขึ้นว่า "ผ่าน"

---

## กฎการ Coding

### HTML
- ใช้ semantic HTML5 elements
- `id`: `kebab-case` unique ต่อหน้า
- `class`: BEM pattern → `block__element--modifier` · สถานะใช้ `is-*`

### CSS
- Token ครั้งเดียว — นิยามใน `the-brain-hub/assets/css/design-system.css` ที่เดียว
  ยกเว้นสีประจำภาษาที่ generate ลง `generated/language-accents.css` จาก `languages.json`
- ห้าม hardcode สีหรือ spacing — ใช้ CSS Custom Properties เสมอ
- page-specific CSS เก็บเฉพาะ layout ที่ unique ของหน้า component ที่ใช้ซ้ำอยู่ใน design-system
- ห้ามเขียนเครื่องหมายเปิดหรือปิดคอมเมนต์ CSS ซ้อนในคอมเมนต์ (บล็อกถัดไปจะหายเงียบ ๆ)
- selector ที่ตั้ง `display` และ element อาจโดน `hidden` ต้องมี `selector[hidden] { display: none; }` คู่กันเสมอ

### JavaScript
- ตัวแปร / function: `camelCase` · Class: `PascalCase` · Constant: `UPPER_SNAKE_CASE` · ไฟล์: `kebab-case`
- ห้ามเขียน logic inline ใน HTML — แยกเป็นไฟล์ `.js` เสมอ
- Module layers: `utils/ → modules/ → pages/` (modules import จาก utils เท่านั้น ห้าม import วนกัน)
- path ที่ JavaScript fetch เองต้องผูกกับ `import.meta.url` ไม่ใช่ path relative ของหน้า
- ข้อความจากไฟล์หรือจากผู้ใช้เข้าหน้าเว็บผ่าน `textContent` หรือ `escapeHtml` เท่านั้น

---

## กฎโครงสร้างไฟล์

```
develop-knowladge/
├── the-brain-hub/     แพลตฟอร์ม (หน้า hub · design system · ตัวเล่นคอร์ส · templates · tools)
│   └── assets/
│       ├── css/       design-system.css · generated/ · page-specific/
│       ├── js/        utils/ · modules/ · pages/
│       └── images/    icon-sprite.svg · favicon.svg
└── <ภาษา>/            ชุดเนื้อหา: README.md · index.html (generate) · course.json · lessons/
```

- โฟลเดอร์ภาษาไม่มี CSS หรือ JavaScript ของตัวเอง ถ้าต้องการความสามารถใหม่ให้เพิ่มที่ the-brain-hub ให้ทุกภาษาได้ใช้
- เพิ่มภาษาใหม่ด้วย `npm run new-language` เท่านั้น ไม่สร้างโฟลเดอร์ด้วยมือ

---

## กฎเนื้อหาบทเรียน

- ทุกบทใช้โครงเดียวกันตาม `the-brain-hub/templates/lesson.md`
- หัวเรื่อง `#` บรรทัดแรกต้องตรงกับ `title` ใน `course.json`
- ผลลัพธ์ของโค้ดเขียนเป็น `// → ค่า` ท้ายบรรทัด และต้องรันได้ผลตรงจริง
- เขียนหนึ่งย่อหน้าเป็นบรรทัดเดียว (ขึ้นบรรทัดกลางประโยคไทยจะกลายเป็นช่องว่างบนเว็บ)
- ใช้เฉพาะ Markdown ที่ตัวแปลงรองรับ (ตารางอยู่ใน `the-brain-hub/README.md`) HTML ดิบจะแสดงเป็นตัวอักษร

---

## กฎ UI/UX

- ระยะทุกค่าเป็นพหุคูณของ 4 · line-height เป็น rem หาร 4px ลงตัว · ความสูง control มีแค่ 32 / 40 / 48px
- ทุก section ในหน้าเดียวกันใช้ `.container` ตัวเดียวกัน (ขอบซ้าย-ขวาต้องวัดได้ค่าเดียว)
- สีประจำภาษามาจากสีหลักของโลโก้ภาษาใน `languages.json` ห้ามตั้งสีภาษาใน CSS ตรง ๆ
- ข้อความผ่านคอนทราสต์ 4.5:1 ตัวชี้และเส้นขอบที่มีความหมายผ่าน 3:1 ทั้งธีมสว่างและมืด
- ไอคอนใช้ SVG sprite (`the-brain-hub/assets/images/icon-sprite.svg`) ไม่ใช้ emoji ใน UI
- Animation ที่เป็น feedback ของ control ต้อง < 300ms · อนิเมชันตกแต่งหน้า Intro ใช้ token `--duration-intro` แยก
- ทุกอนิเมชันปิดได้ด้วย `prefers-reduced-motion`
- ก่อนเชื่อว่า UI ตรงแล้ว ให้วัดด้วย getBoundingClientRect ไม่ใช่ดูด้วยตาอย่างเดียว

---

## กฎ Security

- ห้าม hardcode credentials ในโค้ด
- ไม่ยิง request ออกนอกเครื่อง นอกจาก Google Fonts และลิงก์ที่ผู้อ่านกดเอง
- `tools/serve.mjs` ฟังเฉพาะ `127.0.0.1` และไม่เสิร์ฟโฟลเดอร์ที่ขึ้นต้นด้วยจุด (`.claude`, `.git`)

---

## กฎที่ห้ามทำ (Do NOT)

- ห้าม hardcode API keys, tokens, passwords
- ห้ามนิยาม CSS token ซ้ำในหลายไฟล์
- ห้ามเขียน JS logic inline ใน HTML
- ห้ามเก็บ vendor libs ปะปนกับ code ของเรา (ตอนนี้ไม่มี vendor เลย)
- ห้ามใช้ `!important` ใน CSS
- ห้ามแก้ไฟล์ที่ generate ด้วยมือ
- ห้ามลบไฟล์โดยไม่ backup หรือ confirm กับ G ก่อน

---

_อัปเดตล่าสุด: 2026-09-25_
