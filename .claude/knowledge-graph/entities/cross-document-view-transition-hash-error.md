---
name: cross-document-view-transition-hash-error
type: research
agent: friday
date: 2026-09-25
---

## Triple

[[cross-document-view-transition-hash-error]] --is--> หน้าที่เปิด `@view-transition { navigation: auto }` ทั้งสองฝั่ง เมื่อนำทางไป URL ที่มี #fragment หรือไปหน้าเดิมที่ตัด hash ออก Chrome โยน pageerror "Transition was aborted because of invalid state. ViewTransition opt-in disabled" ในหน้าใหม่
[[cross-document-view-transition-hash-error]] --breaks--> เว็บที่ route ด้วย hash เช่นหน้าคอร์สของ The Brain (`/java-script/#closures`) — ลิงก์เข้าบท ปุ่มอ่านต่อ และผลค้นหาข้ามหน้าพังเกือบทั้งหมด
[[cross-document-view-transition-hash-error]] --verified-with--> Playwright + Chrome 2026-09-25: คลิกลิงก์ไป `/the-brain-hub/dashboard/` ไม่ error · คลิกจริงแล้ว location.href ไป `/java-script/#closures` error · Ctrl+K แล้ว Enter ไป `/java-script/#scope-and-closures` error · คลิก breadcrumb `./` จากหน้า `#arrays` error · breadcrumb แบบ `#` ไม่ error
[[cross-document-view-transition-hash-error]] --verified-with--> ดัก promise ของ `event.viewTransition` ใน pageswap และ pagereveal (ready, finished, updateCallbackDone) ด้วย addInitScript แล้ว error ยังขึ้นเหมือนเดิม จึงไม่ใช่ unhandled rejection ที่ดักได้
[[cross-document-view-transition-hash-error]] --solves--> ตัด `@view-transition` และ `view-transition-name` ออกทั้งเว็บ หลังแก้ probe ทั้ง 4 แบบไม่มี error และ audit ผ่าน 80/80
[[cross-document-view-transition-hash-error]] --avoid--> ใช้ cross-document view transition กับเว็บที่ลิงก์ภายในส่วนใหญ่มี #fragment
[[cross-document-view-transition-hash-error]] --documented-in--> `C:\Users\loxbit\Desktop\develop-knowladge\Updates\Update v.0001.md` หัวข้อ "สิ่งที่เปลี่ยนจากแผน" · คอมเมนต์หัวไฟล์ `the-brain-hub\assets\css\design-system.css`
[[cross-document-view-transition-hash-error]] --part-of--> [[brain-hub-content-pack-architecture]]

## Note

ยังไม่ยืนยัน: สาเหตุภายในของ Chrome — ข้อความบอกแค่ "opt-in disabled" ทั้งที่หน้าปลายทางมี `@view-transition`
อยู่ใน stylesheet ที่ block การ render แล้ว ไม่ได้ทดสอบใน Safari (ซึ่งรองรับ cross-document VT เช่นกัน)
และไม่ได้ทดสอบกับ Chrome รุ่นอื่น ถ้าจะนำกลับมาใช้ ให้รัน probe ชุดเดิมซ้ำก่อน

ข้อสังเกต: error ไม่ทำให้หน้าพังหรือเห็นผิดปกติ แต่ขึ้นสีแดงใน Console ทุกครั้ง ซึ่งรับไม่ได้สำหรับเว็บที่สอนให้ผู้เรียน
เปิด Console ดู error ของตัวเอง
