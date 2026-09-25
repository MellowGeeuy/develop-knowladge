---
name: single-column-grid-expands-with-code
type: pattern
agent: friday
date: 2026-09-25
---

## Triple

[[single-column-grid-expands-with-code]] --is--> container ที่เป็น `display: grid` แต่ไม่ได้กำหนด `grid-template-columns` มี track อัตโนมัติที่ขยายตาม min-content ของลูก เมื่อข้างในมี `<pre>` บรรทัดยาวหรือตารางที่ `white-space: nowrap` ทั้งคอลัมน์จะกว้างเกินจอ
[[single-column-grid-expands-with-code]] --caused-by--> grid item มี `min-width: auto` เป็นค่าเริ่มต้น จึงไม่ยอมเล็กกว่าเนื้อหาข้างใน แม้กล่องโค้ดจะมี `overflow-x: auto` ของตัวเองแล้ว
[[single-column-grid-expands-with-code]] --breaks--> หน้าบทเรียนบนมือถือ: วัดได้ scrollWidth 580px บนจอ 390px ข้อความทุกบรรทัดถูกตัดขอบขวา
[[single-column-grid-expands-with-code]] --solves--> ใส่ `grid-template-columns: minmax(0, 1fr)` ให้กริดคอลัมน์เดียวทุกตัวที่อาจมีโค้ดหรือตาราง (`.lesson`, `.lesson__header`, `.lesson__footer`, `.callout`, `.course-home`, `.course-section`, `.roadmap`, `.dashboard`, `.dash-library`)
[[single-column-grid-expands-with-code]] --verified-with--> หลังแก้ 2026-09-25 เปิดครบ 23 บทที่ 390×844 scrollWidth ไม่เกิน 390 ทุกบท
[[single-column-grid-expands-with-code]] --relates--> [[uxui-theory:grid-auto-column-does-not-shrink]]
[[single-column-grid-expands-with-code]] --source--> `C:\Users\loxbit\Desktop\develop-knowladge\the-brain-hub\assets\css\page-specific\course.css` คอมเมนต์เหนือกฎ `.lesson, .lesson__header, ...`

## Note

ใช้ `relates` กับ grid-auto-column-does-not-shrink ของ ColorLab เพราะรากเดียวกัน (track แบบ auto ยึดขนาดเนื้อหา)
แต่ต่างกันตรงจุดเกิด: ของ ColorLab คือ track `auto` ที่เขียนเองใน `grid-template-columns`
ส่วนของที่นี่คือ track โดยนัยของกริดคอลัมน์เดียวที่ไม่ได้เขียนอะไรเลย ทางแก้คนละรูป (`minmax(0, 1fr)`)

ต่างจากของ ColorLab อีกข้อ: ที่นี่หน้าเอกสารเลื่อนได้ปกติ `scrollWidth > innerWidth` จึงจับได้ตรง ๆ
(ของ ColorLab มี `overflow: hidden` ครอบ ต้องหา element ที่ right เกิน viewport แทน)
