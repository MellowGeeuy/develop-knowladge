---
name: course-sidebar-rail-collapse
type: decision
agent: friday
date: 2026-09-26
---

## Triple

[[course-sidebar-rail-collapse]] --is--> เมนูซ้ายของหน้าคอร์สที่หุบเหลือแถบ 32px (rail) มีปุ่มกาง วงความคืบหน้า ภาพรวม ชิประดับ และจุดของทุกบทต่อกันเป็นเส้นแบบ stepper (ถูก = อ่านแล้ว · เรืองแสง = บทที่เปิด · เลข = ยังไม่อ่าน)
[[course-sidebar-rail-collapse]] --source--> Guy 2026-09-26 "ช่วยปรับให้ตัว Left Navbar มันหุบเข้าไป เอาแบบ Modern ดูมี Design ดูมีอะไร" แล้วเลือกตัวเลือก "Rail + เส้นทาง node"
[[course-sidebar-rail-collapse]] --part-of--> [[brain-hub-content-pack-architecture]] (อยู่ใน template และ module กลาง ทุกภาษาได้พร้อมกัน)
[[course-sidebar-rail-collapse]] --uses--> [[uxui-theory:control-height-token-scale]] (ทุกชิ้นบนแกนซ้าย = --control-sm 32px)
[[course-sidebar-rail-collapse]] --uses--> [[uxui-theory:measurable-alignment-rules]]
[[course-sidebar-rail-collapse]] --documented-in--> `C:\Users\loxbit\Desktop\develop-knowladge\the-brain-hub\assets\js\modules\course-nav.js` · `assets\css\page-specific\course.css` หัวข้อ "Sidebar" และ "Sidebar ตอนหุบ" · `Updates\Update v.0002.md`
[[course-sidebar-rail-collapse]] --solves--> ชิ้นบนแกนซ้ายไม่ขยับแนวนอนระหว่างกางกับหุบ เพราะทุกชิ้นกว้าง 32 และวางที่ x เดียวกับโลโก้ The Brain บนแถบบน
[[course-sidebar-rail-collapse]] --verified-with--> Playwright 2026-09-26 (192/192): แกนซ้าย 18–19 ชิ้น left 68 กว้าง 32 เท่าโลโก้ ทั้งกาง หุบ และกางกลับ · หุบที่ 1440 = `32px 952px 224px` ที่ 1280 = `32px 1152px` · บทความอยู่กลางคอลัมน์ ต่างซ้ายขวา 0px ทั้ง 46 บท · บรรทัดแรกของชื่อบทตรงกลางจุด ≤ 0.5px
[[course-sidebar-rail-collapse]] --verified-with--> คีย์ `[` ดูจาก `event.code === 'BracketLeft'` · KeyboardEvent key "บ" code BracketLeft สลับได้ · พิมพ์ `[` ในช่องค้นหาไม่สลับ · reduced motion สลับทันที · CLS ตอนโหลดแบบหุบ 0.0071–0.0082 เท่ากับแบบกาง (0.0071–0.0089)
[[course-sidebar-rail-collapse]] --avoid--> ปุ่มลัดที่ดู `event.key` เพราะตอนเปิดแป้นไทย ปุ่ม `[` ให้ key เป็น "บ"
[[course-sidebar-rail-collapse]] --avoid--> tooltip แบบ `position: absolute` ในกล่องเมนู เพราะ `overflow-y: auto` ตัดของที่ล้นออกด้านข้างด้วย ใช้ element เดียวแบบ fixed ที่ JS วางตาม getBoundingClientRect
[[course-sidebar-rail-collapse]] --avoid--> ปล่อยคอลัมน์ชื่อบทเป็น `1fr` ระหว่างคอลัมน์หด ชื่อจะตัดบรรทัดใหม่ทุกเฟรม จึงตรึง `--label-w` เป็นค่า px ระหว่างอนิเมชัน

## Note

WHY จางออก → สลับโครง → จางเข้า แทนการเลื่อนจุดตามกัน: แถวที่ชื่อบทยาวสองบรรทัดสูง 64px แต่ในแถบแคบทุกแถวสูง 40px
จุดจึงต้องขยับขึ้นลงอยู่ดี การสลับโครงตอนเมนูโปร่งใส (120ms) แล้วจางเข้า (180ms) ขณะคอลัมน์หดใน 260ms ซ่อนการกระโดดนั้นได้
และทุกช่วงสั้นกว่า 300ms ตาม GRules

WHY stepper (เครื่องหมายถูกแทนเลขบท) แทนป้ายถูกที่มุมจุด: ลองแล้วป้าย 16px ทับเลขบทจน "01" อ่านเหมือน "0" (ดูจากภาพหน้าจอ 2026-09-26)

ข้อสังเกต: layout shift ~0.007 ตอนโหลดมาจาก footer ถูกดันลงตอนเนื้อหาบทโหลดเสร็จ ไม่เกี่ยวกับเมนู มีมาตั้งแต่ v.0001 ยังไม่ได้แก้
