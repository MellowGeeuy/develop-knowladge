---
name: markdown-subset-renderer
type: decision
agent: friday
date: 2026-09-25
---

## Triple

[[markdown-subset-renderer]] --is--> ตัวแปลง Markdown ที่เขียนเอง (`the-brain-hub/assets/js/utils/markdown.js`) รองรับเฉพาะที่บทเรียนใช้ และหน้าเว็บกับ `npm run check` ใช้ตัวเดียวกัน
[[markdown-subset-renderer]] --solves--> ไฟล์บทเรียนฝัง HTML หรือสคริปต์ลงหน้าเว็บไม่ได้ เพราะ HTML ดิบถูก escape ทุกกรณี และลิงก์ scheme อื่นนอกจาก http(s)/mailto/relative ถูกตัดเป็นข้อความ
[[markdown-subset-renderer]] --solves--> ลิงก์ไปไฟล์ `.md` ของบทอื่นใช้ได้ทั้งบน GitHub และบนเว็บ (resolveLink แปลงเป็น `#<lesson-id>`)
[[markdown-subset-renderer]] --uses--> callout แบบ GitHub `> [!NOTE|TIP|IMPORTANT|WARNING|CAUTION]` · code fence `js file=path` และ flag `nocheck`
[[markdown-subset-renderer]] --avoid--> ใช้ id หัวข้อเป็น slug เปล่า — ชนกับ id ของบท (#modules, #event-loop) แล้วเบราว์เซอร์กระโดดไปหาหัวข้อในบทปัจจุบันก่อน router เปลี่ยนบท จึงขึ้นต้นด้วย `h-` เสมอ
[[markdown-subset-renderer]] --avoid--> ขึ้นบรรทัดใหม่กลางย่อหน้าภาษาไทย — soft break กลายเป็นช่องว่างบนหน้าเว็บ จึงเขียนหนึ่งย่อหน้าต่อบรรทัด
[[markdown-subset-renderer]] --verified-with--> smoke test 34/34 (round-trip ทุก grammar, `<img onerror>` ถูก escape, `javascript:` ถูกตัด, ตารางมี `\|`, list ซ้อน, หัวข้อไทยซ้ำได้ id `-2`) · check parse 190 code block ใน 23 บท · audit เปิดครบ 23 บทไม่มี error
[[markdown-subset-renderer]] --documented-in--> `C:\Users\loxbit\Desktop\develop-knowladge\the-brain-hub\README.md` หัวข้อ "Markdown ที่รองรับ"
[[markdown-subset-renderer]] --part-of--> [[brain-hub-content-pack-architecture]]

## Note

WHY ไม่ใช้ marked/markdown-it: ต้อง vendor ลง `libs/` แล้วยังต้องตั้ง sanitizer เอง ขณะที่ไวยากรณ์ที่บทเรียน
ใช้จริงมีไม่กี่อย่าง และต้องการ callout กับการแปลงลิงก์ที่ไลบรารีไม่มีให้ โปรเจกต์นี้จึงไม่มี dependency เลย

ไฮไลต์โค้ดแยกเป็น engine (`highlight.js`) กับ grammar (`grammars.js`) template literal ที่ซ้อน `${}` และ
template ชั้นในถูกไล่ด้วยมือ เพราะ regex ตัดสตริงผิดที่ backtick ชั้นใน (เจอบ่อยในบท DOM)
