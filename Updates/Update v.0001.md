# Update v.0001 — สร้าง The Brain Hub และคลังความรู้ JavaScript 23 บท

**วันที่:** 2026-09-25 · **ไฟล์ที่สร้าง:** `the-brain-hub/` ทั้งโฟลเดอร์ · `java-script/{README.md, index.html, course.json, lessons/}` · `index.html` · `CLAUDE.md` · `GRules.md`

## สิ่งที่ต้องได้ (Guy สั่ง 2026-09-25)

- คลังความรู้การเขียนโปรแกรมด้วย JavaScript พร้อม `README.md` ว่าโฟลเดอร์นี้คืออะไร สอนอะไร
- เว็บที่มีหน้ากาก (Intro) ตอนเข้า แล้วเข้า Dashboard ชื่อ **The Brain** ที่มีการ์ดของแต่ละภาษา
- โฟลเดอร์ `the-brain-hub` เป็นตัวหลัก แล้วพาไปยังโฟลเดอร์ของแต่ละภาษา
- รองรับการเพิ่มภาษาอื่น · ใส่ใจ alignment · หน้าตา modern · สีของแต่ละภาษาอิงสีหลักของโลโก้ภาษา
- ฟีเจอร์ที่ Guy เลือก: จำบทที่อ่านแล้ว + ค้นหาด้วย Ctrl+K

## สิ่งที่สร้าง

### the-brain-hub (แพลตฟอร์มที่ทุกภาษาใช้ร่วมกัน)
- **Intro** โลโก้สมองแบบเครือข่าย 42 node มีอนิเมชัน · ปุ่มเข้า (กด Enter ได้) · แถว badge ภาษาจากทะเบียน
- **Dashboard** กริด 12 คอลัมน์ (hero 8 + ตัวเลขสรุป 4) · การ์ดภาษาแบบ subgrid 5 แถว · ปุ่มกรองสถานะ · ค้นหาข้ามทุกภาษา · ปุ่มเรียนต่อจากบทล่าสุด
- **หน้าคอร์ส** (template เดียวทุกภาษา) เมนูบทตามระดับ (drawer บนมือถือ) · เนื้อหา · "ในบทนี้" แบบ scroll-spy · แถบอ่านถึงไหน · ปุ่มอ่านจบแล้ว · บทก่อน/ถัดไป · ปุ่ม ← →
- `languages.json` ทะเบียนเดียว: The Brain `#6D4AFF`/`#22D3EE` · JavaScript `#F7DF1E` (ready) · TypeScript `#3178C6` (planned)
- `design-system.css` token ครั้งเดียวด้วย `light-dark()` · ชุดปิดของระยะ ตัวอักษร line-height และความสูง control
- utils: `markdown` (เขียนเอง escape HTML ทุกกรณี) · `highlight` + `grammars` (js ts json html css bash powershell) · `search-index` · `catalog` · `progress-store` · `icon` · `escape-html`
- tools (Node ล้วน ไม่มี dependency): `npm start` · `npm run new-language` · `npm run sync` · `npm run check`
- templates: `course-page.html` · `course.json` · `README.md` · `lesson.md`

### java-script
- 23 บท 4 ระดับ: พื้นฐานภาษา (6) · ข้อมูลและโครงสร้างโค้ด (6) · Browser และงาน Asynchronous (6) · เขียนแบบมืออาชีพ (5) รวมประมาณ 6 ชั่วโมง
- `README.md` บอกว่าโฟลเดอร์คืออะไร เหมาะกับใคร สอนอะไร ตารางบททั้งหมด (generate จาก `course.json`)

## สิ่งที่เปลี่ยนจากแผน

- **ตัด cross-document View Transition ออก** (แผนเดิมให้โลโก้ลอยจาก Intro ไปแถบบนของ Dashboard)
  Chrome โยน `InvalidStateError: Transition was aborted because of invalid state. ViewTransition opt-in disabled`
  ทุกครั้งที่ URL ปลายทางมี `#fragment` ซึ่งคือลิงก์เข้าบท ปุ่มอ่านต่อ และผลค้นหาเกือบทั้งหมด (ทดสอบ 8 แบบ ดู KG)
- ลิงก์ชื่อภาษาใน breadcrumb เปลี่ยนจาก `./` เป็น `#` ไม่ต้องโหลดหน้าใหม่
- JavaScript ธีมสว่างตั้ง `overrides` เป็นอำพัน `#A16207` / `#854D0E` แทนค่าอัตโนมัติ `#988800` / `#7e7000` ที่ออกเขียวมะกอก
- ค้นหาในคอร์สให้บทมาก่อนหัวข้อย่อย (boost 50) หลังเห็นว่าหัวข้อ "Closure" ขึ้นก่อนบท "Scope, Hoisting และ Closure"

## ตรวจแล้ว

- `npm run check` ผ่าน · 23 บท · code block 190 ก้อน (ตรวจ syntax 167 · ข้าม 1 ที่ตั้งใจเป็น CommonJS)
- โค้ดตัวอย่าง: รันใน Node 117 ก้อน ผลตรงกับ `// →` ทุกก้อน · รันใน Chrome 18 ก้อน (DOM, localStorage, Intl ภาษาไทย) ตรงทุกก้อน · เทสต์ในบทที่ 21 รันจริงด้วย `node --test` ผ่าน 6/6
- Playwright 80/80 ข้อ ที่ 1440×900 และ 390×844 ทั้งธีมสว่างและมืด
  - ขอบซ้าย-ขวาของทุก `.container` ในทุกหน้าได้ค่าเดียว · ทุกบล็อกในคอลัมน์เนื้อหาของทั้ง 23 บทขอบซ้าย-ขวาค่าเดียว
  - การ์ดในแถวเดียวกันสูงเท่ากันและแถวย่อยทั้ง 5 เริ่มที่ y เดียวกัน · ตัวเลขสรุปชิดขวาแนวเดียวกัน
  - ความสูง control อยู่ใน {32, 40, 48} ทุกตัว · line-height หาร 4 ลงตัวทุกจุด · ชิ้นในหน้า Intro จุดกึ่งกลางต่างกันไม่เกิน 1px
  - คอนทราสต์ตัวอักษรผ่าน WCAG ทุกจุด (composite พื้นโปร่งใสก่อนคำนวณ) ทั้งสองธีม
  - เปิดครบ 23 บทไม่มี console error · อ่านจบแล้ว → Dashboard ขึ้น 1/23, 4%, "อ่านต่อ บทที่ 2" · Ctrl+K "closure" เจอบท 09 ทั้งจาก Dashboard และหน้าคอร์ส · ← → เปลี่ยนบท · ธีมคงอยู่ข้ามหน้า · drawer มือถือเปิดด้วยปุ่มปิดด้วย Esc
  - จอ 390px ทั้ง 23 บทไม่ล้นแนวนอน (ก่อนแก้วัดได้ 580px เพราะกริดคอลัมน์เดียวขยายตามโค้ดที่ยาวที่สุด)
  - เปิดแบบ `file://` แล้วขึ้นข้อความบอกวิธีเปิดที่ถูก
- Scale บนสำเนาใน scratchpad: `new-language python` สร้างครบและ `check` ผ่าน · รันซ้ำไม่เขียนทับ · `--id typescript` สร้างจากทะเบียนเดิมได้ · สีตัวอักษรคอนทราสต์ 2.64:1 และโฟลเดอร์ซ้ำถูกปฏิเสธ · ใส่ 14 ภาษาแล้วการ์ดทุกแถวตรงกันที่ 1440, 768, 390px · หน้า Python ใช้สี `#3776AB` เองโดยไม่แก้ CSS
- กฎของ Guy ผ่านทั้ง 73 ไฟล์: kebab-case · ไม่มี script/style inline · ไม่มี `!important` · token อยู่เฉพาะ design-system และไฟล์ generate · ไม่มี px ดิบ · ไม่มี mojibake/BOM · ไม่ยิง request ออกนอกเครื่องนอกจาก Google Fonts
- ลิงก์ภายนอก 87 ลิงก์เปิดได้ทั้งหมด แก้ 6 ลิงก์ที่ถูก redirect ให้เป็น URL ปัจจุบัน

## ยังไม่ได้ตรวจ

- ทดสอบเฉพาะ Chrome ยังไม่ได้เปิดใน Firefox และ Safari (ฟีเจอร์ที่ใช้คือ `light-dark()`, subgrid, `:has()`, `<dialog>` รองรับทุกเบราว์เซอร์หลักแล้ว แต่ยังไม่ได้รันจริง)

## ที่ยังค้าง / รอ Guy ตัดสิน

- `java-script/javascript-knowladge` ไฟล์ว่างที่มีมาก่อน ไม่ได้ใช้ ยังไม่ลบ
- ชื่อโฟลเดอร์ `types-script` ยังไม่เปลี่ยน
- ยังไม่มี git และยังไม่ขึ้น GitHub Pages
