---
name: brain-hub-alignment-audit
type: pattern
agent: friday
date: 2026-09-25
---

## Triple

[[brain-hub-alignment-audit]] --is--> ชุดตรวจหน้าตาแบบวัดเป็นตัวเลขด้วย Playwright (Chrome จริง) ที่ใช้ยืนยัน alignment, คอนทราสต์ และการทำงานของ The Brain ก่อนส่งงาน
[[brain-hub-alignment-audit]] --uses--> [[uxui-theory:measurable-alignment-rules]] (ระยะพหุคูณ 4, line-height หาร 4, subgrid)
[[brain-hub-alignment-audit]] --uses--> [[uxui-theory:ua-default-margin-breaks-block-alignment]] (นับขอบซ้าย-ขวาของทุกบล็อกในคอลัมน์ต้องได้ค่าเดียว)
[[brain-hub-alignment-audit]] --uses--> [[uxui-theory:control-height-token-scale]] (ความสูง control ชุดปิด)
[[brain-hub-alignment-audit]] --uses--> [[part-and-repair:ui-card-typography-system]] (อ่าน getBoundingClientRect ของการ์ดทุกใบแทนการดูด้วยตา)
[[brain-hub-alignment-audit]] --uses--> [[uxui-theory:self-audit-contrast-composite-alpha]] (composite พื้นโปร่งใสทุกชั้นก่อนคำนวณคอนทราสต์)
[[brain-hub-alignment-audit]] --verified-with--> 2026-09-25 ผ่าน 80/80 ที่ 1440×900 และ 390×844 ทั้งสองธีม: container ทุกตัวขอบซ้าย/ขวา 1 ค่า · บล็อกในคอลัมน์เนื้อหาของ 23 บทขอบซ้าย/ขวา 1 ค่า · การ์ดในแถวเดียวกันสูงเท่ากันและแถวย่อยทั้ง 5 เริ่มที่ y เดียวกัน · control สูง {32,40,48} · line-height หาร 4 ทุกจุด · ชิ้นใน Intro จุดกึ่งกลางต่างไม่เกิน 1px · คอนทราสต์ผ่านทุกจุด
[[brain-hub-alignment-audit]] --verified-with--> Dashboard 14 ภาษา (สำเนาใน scratchpad) การ์ดทุกแถวตรงที่ 1440, 768, 390px
[[brain-hub-alignment-audit]] --relates--> [[single-column-grid-expands-with-code]]
[[brain-hub-alignment-audit]] --documented-in--> `C:\Users\loxbit\Desktop\develop-knowladge\Updates\Update v.0001.md` หัวข้อ "ตรวจแล้ว"

## Note

ใช้ `relates` กับ single-column-grid-expands-with-code เพราะชุดตรวจนี้เป็นตัวที่จับบั๊กนั้นได้ ไม่ใช่ส่วนหนึ่งของกัน

ข้อค้นพบที่ตอบคำถามค้างของ ColorLab: `[[uxui-theory:self-audit-contrast-composite-alpha]]` จดว่า
"ธีมมืดตรวจด้วยสคริปต์เดียวกันไม่ได้" — ในโปรเจกต์นี้ token เขียนด้วย `light-dark()` และเปิดหน้าด้วย
Playwright `colorScheme: 'dark'` แล้ว `getComputedStyle` คืนสีของธีมมืดถูกต้อง ตรวจธีมมืดได้ครบ 4 หน้า
(ยังไม่ยืนยันว่าใช้ได้กับแบบ `[data-theme]` ของ ColorLab ต้องลองที่โปรเจกต์นั้น)

ภาพหน้าจอที่ถ่ายทันทีหลังผลค้นหาขึ้น ไอคอนจาก sprite ภายนอก (`<use href="sprite.svg#id">`) ยังไม่ถูกวาด
เห็นเป็นช่องว่าง รอราว 1 เฟรมแล้วแสดงครบ — ไม่ใช่บั๊ก ให้รอก่อนถ่ายภาพเสมอ
