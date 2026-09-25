---
name: brain-hub-content-pack-architecture
type: decision
agent: friday
date: 2026-09-25
updated: 2026-09-26
---

## Triple

[[brain-hub-content-pack-architecture]] --is--> the-brain-hub เป็นแพลตฟอร์ม (Intro, Dashboard, design system, ตัวเล่นคอร์ส, templates, tools) ส่วนโฟลเดอร์ภาษาเป็นชุดเนื้อหาล้วน (course.json + lessons/*.md + README + index.html ที่ generate)
[[brain-hub-content-pack-architecture]] --source--> Guy 2026-09-25 "ตัว Main คือให้สร้าง Folder ... the-brain-hub แล้วค่อยให้ Pass ไปจามแต่ละภาษา" และ "ทำให้ Scale ที่จะเพิ่มภาษาอื่นเข้ามาด้วย"
[[brain-hub-content-pack-architecture]] --uses--> `the-brain-hub/languages.json` เป็นแหล่งเดียวของการ์ด สี และหน้าเว็บทุกภาษา
[[brain-hub-content-pack-architecture]] --produces--> `npm run new-language` · `npm run sync` · `npm run check` (`the-brain-hub/tools/`)
[[brain-hub-content-pack-architecture]] --uses--> [[uxui-theory:clean-url-page-folders]] (path ที่ JS fetch ผูกกับ import.meta.url เพราะหน้า hub กับหน้าภาษาอยู่คนละความลึก)
[[brain-hub-content-pack-architecture]] --uses--> [[uxui-theory:static-site-ready-for-github-pages]] (ลิงก์ relative ทั้งหมด ขึ้น Pages ได้โดยไม่แก้)
[[brain-hub-content-pack-architecture]] --uses--> [[markdown-subset-renderer]]
[[brain-hub-content-pack-architecture]] --uses--> [[language-accent-from-logo-color]]
[[brain-hub-content-pack-architecture]] --verified-with--> สำเนาใน scratchpad 2026-09-25: new-language python สร้าง 4 ไฟล์ + ลงทะเบียน + sync แล้ว check ผ่าน · รันซ้ำไม่เขียนทับ · --id typescript สร้างจากทะเบียนเดิม · ink คอนทราสต์ 2.64:1 และโฟลเดอร์ซ้ำถูกปฏิเสธ (exit 1) · 14 ภาษาการ์ดตรงแถวที่ 1440/768/390px
[[brain-hub-content-pack-architecture]] --verified-with--> [[brain-hub-alignment-audit]] (หน้าตาและการทำงาน 80/80) และ [[lesson-snippet-output-verification]] (ผลโค้ดในบทเรียน)
[[brain-hub-content-pack-architecture]] --avoid--> cross-document view transition ระหว่างหน้า เพราะลิงก์เข้าบทมี #fragment ดู [[cross-document-view-transition-hash-error]]
[[brain-hub-content-pack-architecture]] --documented-in--> `C:\Users\loxbit\Desktop\develop-knowladge\the-brain-hub\README.md` หัวข้อ "เพิ่มภาษาใหม่" · `Updates\Update v.0001.md`
[[brain-hub-content-pack-architecture]] --avoid--> แก้ไฟล์ที่ generate ด้วยมือ (`<ภาษา>/index.html`, `generated/language-accents.css`, ตารางบทใน README) — sync เขียนทับ และ check จะฟ้อง
[[brain-hub-content-pack-architecture]] --verified-with--> 2026-09-26 ภาษาจริงภาษาที่สอง: `npm run new-language -- --id typescript` สร้าง `types-script/` จากทะเบียนเดิม เขียน 23 บทแล้วตั้ง `ready` · Dashboard ขึ้น 2 ภาษา 46 บทโดยไม่แก้ CSS/JS ของหน้าคอร์ส
[[brain-hub-content-pack-architecture]] --produces--> [[course-sidebar-rail-collapse]] และ [[check-typescript-syntax-with-node-strip]] (เพิ่มที่แพลตฟอร์มครั้งเดียว ทุกภาษาได้พร้อมกัน)

## Note

WHY แยกเนื้อหากับแพลตฟอร์ม: ภาษาที่ 2 ถึง 20 ไม่ต้องเขียน CSS/JS เพิ่มเลย แก้หน้าตาครั้งเดียวที่
template แล้ว `sync` กระจายให้ทุกภาษา ภาษาที่ยังไม่มีเนื้อหา (TypeScript) อยู่ในทะเบียนเป็น `planned`
ได้โดยไม่ต้องมีโฟลเดอร์ครบ — `sync` แตะเฉพาะโฟลเดอร์ที่มี `course.json` แล้ว

WHY เป็น JSON ไม่ใช่ JS module: `new-language` ต้องอ่านแก้เขียนทะเบียนได้ด้วยเครื่อง
การแก้ source ของไฟล์ `.js` ด้วยโปรแกรมเปราะกว่ามาก

เปลี่ยนเมื่อ 2026-09-26: เดิม TypeScript อยู่ในทะเบียนเป็น `planned` ยังไม่มีโฟลเดอร์ → ใหม่เป็น `ready` มีคอร์ส 23 บท
(เหตุผล: Guy สั่ง "เพิ่ม TypeScript ต่อได้เลย" และเลือกขอบเขต 23 บท) · สิ่งที่ต้องแก้ที่แพลตฟอร์มมีแค่ตัวอย่างคำค้นที่เคยเขียนตายตัวเป็นของ JS

ข้อสังเกต: หน้าคอร์สทุกภาษาอยู่ลึกหนึ่งชั้นจากราก template จึงอ้าง `../the-brain-hub/` ตายตัว
`check` บังคับให้ `folder` เป็นชื่อชั้นเดียวแบบ kebab-case เพื่อไม่ให้ path นี้พัง
