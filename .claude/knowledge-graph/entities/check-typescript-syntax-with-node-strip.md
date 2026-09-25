---
name: check-typescript-syntax-with-node-strip
type: decision
agent: friday
date: 2026-09-26
---

## Triple

[[check-typescript-syntax-with-node-strip]] --is--> `npm run check` ตรวจ syntax ของ code fence `ts` ด้วย `module.stripTypeScriptTypes` ที่มากับ Node แทนการติดตั้ง typescript
[[check-typescript-syntax-with-node-strip]] --part-of--> [[brain-hub-content-pack-architecture]]
[[check-typescript-syntax-with-node-strip]] --documented-in--> `C:\Users\loxbit\Desktop\develop-knowladge\the-brain-hub\tools\check.mjs` หัวข้อ "TypeScript syntax" · `the-brain-hub\README.md` ตารางคำสั่ง
[[check-typescript-syntax-with-node-strip]] --requires--> Node 22.13 ขึ้นไป (มี stripTypeScriptTypes) รุ่นเก่ากว่าข้ามส่วนนี้พร้อมคำเตือน 1 ข้อ check ยังผ่าน
[[check-typescript-syntax-with-node-strip]] --avoid--> นับ `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` เป็น error เพราะ enum, namespace และ parameter property เขียนถูก แค่ลบทิ้งเฉย ๆ ไม่ได้ และบทเรียนตั้งใจสอน
[[check-typescript-syntax-with-node-strip]] --avoid--> ส่งผลที่ลบ type แล้วไปตรวจต่อด้วย V8 เพราะ decorator ผ่านตัวลบ type ของ Node แต่ V8 ยังรันไม่ได้ จะฟ้องผิด
[[check-typescript-syntax-with-node-strip]] --verified-with--> 2026-09-26 Node 24.21: TypeScript 198 ก้อน ตรวจ 183 ผ่าน · สำเนาที่แก้ `= 0;` เป็น `= ;` ฟ้อง `Expression expected` ที่ `03-basic-types.md:15` exit 1 · Node 20.18: ผ่านพร้อมคำเตือนข้าม 164 ก้อน

## Note

WHY ไม่เพิ่ม typescript เป็น devDependency: แพลตฟอร์มตั้งใจไม่มี dependency ([[brain-hub-content-pack-architecture]])
การตรวจ type เต็มรูปแบบทำแยกตาม [[typescript-lesson-verification]]

WHY กรอง ExperimentalWarning: Node 24.21 เตือนทุกครั้งที่เรียก stripTypeScriptTypes · กรองใน `process.emitWarning`
เฉพาะข้อความที่มีชื่อฟังก์ชันนี้ คำเตือนอื่นยังแสดงตามปกติ
