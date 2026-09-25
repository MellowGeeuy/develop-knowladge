# {{name}} — องค์ความรู้การพัฒนาโปรแกรมด้วย {{name}}

> ส่วนหนึ่งของ **The Brain** คลังความรู้การพัฒนาโปรแกรม · เปิดอ่านบนเว็บได้จากการ์ด {{name}} ในหน้า Dashboard

## โฟลเดอร์นี้คืออะไร

คลังความรู้ {{name}} ในรูปแบบบทเรียน Markdown ทุกบทอ่านได้ทั้งบนเว็บของ The Brain และเปิดไฟล์ตรง ๆ ใน VS Code หรือ GitHub

## สอนอะไรบ้าง

ตารางด้านล่างสร้างจาก `course.json` อัตโนมัติด้วย `npm run sync` ห้ามแก้มือ

<!-- brain:lessons:start -->
<!-- brain:lessons:end -->

## โครงสร้างไฟล์

```text
{{folder}}/
├── README.md       ไฟล์นี้
├── index.html      หน้าเว็บของคอร์ส สร้างจาก template ของ the-brain-hub (ห้ามแก้มือ)
├── course.json     รายการระดับและบทเรียน (ลำดับในไฟล์ = ลำดับบนเว็บ)
└── lessons/        เนื้อหาแต่ละบท เป็น Markdown
```

## เพิ่มหรือแก้บทเรียน

1. เขียนไฟล์ใหม่ใน `lessons/` ตามโครงของ `the-brain-hub/templates/lesson.md`
2. เพิ่มรายการใน `course.json` (id เป็น kebab-case และหัวเรื่อง `#` ในไฟล์ต้องตรงกับ `title`)
3. ในโฟลเดอร์ `the-brain-hub` สั่ง `npm run sync` แล้ว `npm run check` จนผ่าน
