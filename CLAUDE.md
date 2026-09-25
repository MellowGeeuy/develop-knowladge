# CLAUDE.md — The Brain (develop-knowladge)

## Project Identity

- ชื่อโปรเจกต์: **The Brain** — คลังความรู้การพัฒนาโปรแกรม แยกคอร์สตามภาษา
- Stack: HTML + CSS + JavaScript ล้วน (ES Modules ไม่มี bundler) · เครื่องมือเป็น Node.js 20 ขึ้นไป ไม่มี dependency
  (ตรวจ syntax ของโค้ด TypeScript ใน `npm run check` ต้องใช้ Node 22.13 ขึ้นไป แนะนำ Node 24 LTS)
- Pattern: `the-brain-hub/` คือแพลตฟอร์ม (Intro, Dashboard, design system, ตัวเล่นคอร์ส, tools)
  ส่วนโฟลเดอร์ของแต่ละภาษาเป็นชุดเนื้อหา (`course.json` + `lessons/*.md` + `README.md` + `index.html` ที่ generate)

## กฎโปรเจกต์นี้

ดูกฎการทำงานทั้งหมดได้ที่ **`GRules.md`** ในโฟลเดอร์นี้
Friday ต้องอ่านและปฏิบัติตาม GRules.md ทุกครั้งที่ทำงานใน project นี้

กฎที่พลาดบ่อยและต้องจำ

- ทะเบียนภาษาอยู่ที่ `the-brain-hub/languages.json` ที่เดียว การ์ด สี และหน้าเว็บของทุกภาษาอ่านจากไฟล์นี้
- ไฟล์ที่ generate **ห้ามแก้มือ**: `<ภาษา>/index.html`, `the-brain-hub/assets/css/generated/language-accents.css`
  และตารางบทใน README ระหว่าง `<!-- brain:lessons:start -->` กับ `end` ให้แก้ต้นทางแล้วสั่ง `npm run sync`
- งานที่แตะเนื้อหาหรือโค้ดทุกครั้งต้องจบด้วย `npm run check` ที่ขึ้นว่า "ผ่าน"
- ต้องเปิดผ่าน `http://` เสมอ (ES Modules กับ fetch ใช้ `file://` ไม่ได้)

## เปิดดูงาน

```
cd the-brain-hub
npm start
```

แล้วเปิด `http://127.0.0.1:8765/` · Dashboard อยู่ที่ `/the-brain-hub/dashboard/` · คอร์ส JavaScript อยู่ที่ `/java-script/` · คอร์ส TypeScript อยู่ที่ `/types-script/`

## โครงสร้างไฟล์สำคัญ

```
index.html              redirect ไป the-brain-hub/ (เปิด root แล้วเจอ Intro)
the-brain-hub/          MAIN — Intro · Dashboard · languages.json · templates/ · tools/ · assets/
  assets/css/           design-system.css (token ที่เดียว) · generated/ · page-specific/{intro,dashboard,course}.css
  assets/js/            utils/ → modules/ → pages/ (พึ่งพาทางเดียว)
  tools/                serve · new-language · sync · check (npm start / run new-language / sync / check)
java-script/            คอร์ส JavaScript 23 บท 4 ระดับ (course.json + lessons/)
types-script/           คอร์ส TypeScript 23 บท 4 ระดับ อิง TypeScript 7 + Node.js 24 (course.json + lessons/)
Updates/                บันทึกทุก session ที่แก้โค้ด (ล่าสุด v.0002)
.claude/knowledge-graph/ ความรู้และการตัดสินใจของโปรเจกต์นี้ — grep INDEX.md ก่อนเริ่มงานใหม่
```

## สถานะล่าสุด (2026-09-26 · หลัง Update v.0002)

**เสร็จแล้ว**
- Intro (หน้ากาก) → Dashboard The Brain ที่มีการ์ดภาษา สถิติ ค้นหาข้ามทุกภาษา และตัวกรองสถานะ
- คอร์ส JavaScript 23 บท และคอร์ส TypeScript 23 บท (พร้อมเรียนทั้งคู่ รวม 46 บท)
- หน้าคอร์ส: เมนูซ้ายหุบเป็นแถบแคบได้ (ปุ่มหรือคีย์ `[`) ค้นหาถึงหัวข้อย่อย บันทึกว่าอ่านแล้ว แถบอ่านถึงไหน ธีมสว่าง-มืด
- สีของแต่ละภาษามาจากสีโลโก้ในทะเบียน ถูกเลื่อนความสว่างให้ผ่านคอนทราสต์อัตโนมัติ
- เพิ่มภาษาด้วยคำสั่งเดียว `npm run new-language` (TypeScript คือภาษาจริงภาษาที่สองที่เพิ่มด้วยวิธีนี้)

**ที่ยังค้าง / รอ Guy ตัดสิน**
- `java-script/javascript-knowladge` เป็นไฟล์ว่าง (0 byte) ที่มีมาก่อน ไม่ได้ใช้ ยังไม่ลบ รอ Guy ตัดสิน
- ชื่อโฟลเดอร์ `types-script` ยังไม่เปลี่ยน (URL ของคอร์สคือ `/types-script/`) รอ Guy ตัดสิน
- ยังไม่มี git และยังไม่ขึ้น GitHub Pages (โครงรองรับแล้ว ทุก path เป็น relative)
- เครื่องนี้ใช้ Node 20.18 (หมดระยะดูแล เม.ย. 2026) `npm run check` จึงข้ามการตรวจ syntax ของโค้ด TypeScript พร้อมคำเตือน

## หมายเหตุสำคัญ

- ก่อนเชื่อว่า UI ตรงแล้ว ให้วัดด้วย Playwright อ่าน `getBoundingClientRect` (วิธีอยู่ใน KG `brain-hub-alignment-audit`)
- โค้ดตัวอย่างในบทเรียนเขียนผลเป็น `// → ค่า` และต้องรันได้ผลตรงจริง (วิธีตรวจอยู่ใน KG `lesson-snippet-output-verification`)
- บท TypeScript มีข้อตกลงเพิ่ม `// ❌ ข้อความ error ของ tsc` · `// ชนิด:` · `// เท่ากับ` และตรวจด้วย tsc 7 จริงทุกก้อน (วิธีอยู่ใน KG `typescript-lesson-verification`)
- เมนูซ้ายของหน้าคอร์ส: ทุกชิ้นบนแกนซ้ายกว้าง 32px และตรงกับโลโก้บนแถบบน แก้ CSS ส่วนนี้แล้วต้องวัดซ้ำ (KG `course-sidebar-rail-collapse`)
