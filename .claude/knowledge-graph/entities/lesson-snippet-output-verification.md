---
name: lesson-snippet-output-verification
type: pattern
agent: friday
date: 2026-09-25
---

## Triple

[[lesson-snippet-output-verification]] --is--> วิธียืนยันว่าผลลัพธ์ที่เขียนในบทเรียน (`console.log(x); // → ค่า`) ตรงกับที่โค้ดให้จริง โดยรันทุก code block แล้วเทียบอัตโนมัติ
[[lesson-snippet-output-verification]] --requires--> ข้อตกลงการเขียน: ผลอยู่ท้ายบรรทัด console.log เดียวกัน · โค้ดที่ลำดับผลไม่ตรงลำดับบรรทัด (ลูป, async, event loop) เขียนท้ายบล็อกเป็น `// ผลลัพธ์` แล้วตามด้วย `// ค่า` ทีละบรรทัด · ทุกบล็อกต้องรันได้ในตัวเอง ไม่พึ่งตัวแปรจากบล็อกก่อน
[[lesson-snippet-output-verification]] --uses--> `extractCodeBlocks()` จาก `the-brain-hub/assets/js/utils/markdown.js` (ตัว parse เดียวกับหน้าเว็บ)
[[lesson-snippet-output-verification]] --verified-with--> 2026-09-25 รันใน Node (ไฟล์ .mjs แยก + prelude ที่แทน console.log ด้วย util.formatWithOptions) 117 ก้อน ผลตรงทุกก้อน · บล็อกที่ใช้ document/localStorage/fetch ข้าม 6 ก้อน
[[lesson-snippet-output-verification]] --verified-with--> รันใน Chrome ผ่าน Playwright (`addScriptTag type=module` ต่อบล็อก, route หน้าเปล่าบน origin เดียวกันเพื่อให้มี localStorage, ใส่ HTML ตัวอย่างของบทก่อนรันบท DOM) 18 ก้อน ตรงทุกก้อน
[[lesson-snippet-output-verification]] --verified-with--> ผล Intl ภาษาไทยของ Node 20.18 กับ Chrome ตรงกันทุกตัวที่ใช้ในบท: `฿1,234,567.50` · `1.5 ล้าน` · `๒,๕๖๙` · `25 กันยายน 2569` · `25 ก.ย. 2569 10:30` · `25 กันยายน ค.ศ. 2026` · `เมื่อวาน` · `ในอีก 3 ชั่วโมง` · Segmenter ตัด "เรียนภาษาไทย" เป็น เรียน/ภาษา/ไทย
[[lesson-snippet-output-verification]] --avoid--> เขียนผลของบรรทัดที่ขึ้นกับสภาพเครื่อง (เวลาปัจจุบัน, จำนวน key ใน localStorage) — ให้ปล่อยบรรทัดนั้นไม่มี `// →` หรือเปลี่ยนเป็นค่าที่แน่นอน
[[lesson-snippet-output-verification]] --documented-in--> `C:\Users\loxbit\Desktop\develop-knowladge\Updates\Update v.0001.md` หัวข้อ "ตรวจแล้ว" · กฎการเขียนอยู่ใน `GRules.md` หัวข้อ "กฎเนื้อหาบทเรียน"

## Note

สคริปต์ตรวจรอบแรกอยู่ใน scratchpad ของ session (ไม่ได้เก็บในโปรเจกต์ตามแผน) ใช้ triple ด้านบนสร้างใหม่ได้
หลักสำคัญของการจับคู่: ถ้าไม่มีบล็อก `// ผลลัพธ์` ให้จับผลลัพธ์กับบรรทัด console.log ตามลำดับที่อยู่ในโค้ด
บรรทัดที่ไม่มี `// →` ยังนับตำแหน่งแต่ไม่เทียบค่า และเทียบแบบตัดช่องว่างทั้งหมดกับแปลง `"` เป็น `'`
เพราะ Node พิมพ์ `[ 1, 2 ]` ส่วนบทเขียน `[1, 2]`

ข้อสังเกต: `npm run check` ตรวจแค่ syntax (vm.Script แล้วค่อย `node --check` แบบ module เมื่อไม่ผ่าน)
top-level await ในวงเล็บ เช่น `console.log(await x)` ได้ error ของ script เป็น "missing ) after argument list"
จึงห้ามตัดสินว่าเป็นโค้ด module จากข้อความ error ต้องลองแบบ module ทุกครั้งที่ script ไม่ผ่าน
