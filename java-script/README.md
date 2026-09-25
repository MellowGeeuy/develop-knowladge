# JavaScript — องค์ความรู้การพัฒนาโปรแกรมด้วย JavaScript

> ส่วนหนึ่งของ **The Brain** คลังความรู้การพัฒนาโปรแกรม · เปิดอ่านบนเว็บได้จากการ์ด JavaScript ในหน้า Dashboard

## โฟลเดอร์นี้คืออะไร

โฟลเดอร์นี้คือคลังความรู้การเขียนโปรแกรมด้วย JavaScript ทั้งคอร์ส ประกอบด้วย

- **บทเรียน 23 บท** ในรูปแบบ Markdown (`lessons/`) อ่านได้ทั้งบนเว็บ ใน VS Code และบน GitHub
- **หน้าเว็บของคอร์ส** (`index.html`) แสดงบทเรียนพร้อมรายการบท ค้นหาด้วย `Ctrl+K` และจำว่าอ่านบทไหนไปแล้ว

หน้าตาและตัวเล่นบทเรียนอยู่ที่ `../the-brain-hub/` ซึ่งทุกภาษาในคลังใช้ร่วมกัน โฟลเดอร์นี้จึงมีแค่เนื้อหา
สีของหน้าเว็บเป็นเหลือง-ดำตามโลโก้ JavaScript

## เหมาะกับใคร

- **มือใหม่** เริ่มจากระดับ 1 แล้วอ่านตามลำดับ ทุกบทต่อยอดจากบทก่อนหน้า
- **นักพัฒนาที่เขียนเป็นแล้ว** ใช้ทบทวน หรือเปิดเฉพาะเรื่องที่ต้องการจากระดับ 3 และ 4
- **ทีม** ใช้เป็นมาตรฐานร่วมกัน เช่น การตั้งชื่อ การแบ่งไฟล์ และการจัดการ error

## สอนอะไรบ้าง

| ระดับ | เรียนอะไร |
|---|---|
| 1 · พื้นฐานภาษา | ภาษาทำงานอย่างไร ตัวแปร ชนิดข้อมูล ตัวดำเนินการ เงื่อนไข ลูป ฟังก์ชัน ข้อความ ตัวเลข วันที่ |
| 2 · ข้อมูลและโครงสร้างโค้ด | Array, Object, Map, Set, JSON, scope, closure, class และการแบ่งโค้ดเป็น module |
| 3 · Browser และงาน Asynchronous | DOM, Event, Event Loop, Promise, async/await, fetch และการเก็บข้อมูลในเบราว์เซอร์ |
| 4 · เขียนแบบมืออาชีพ | clean code, การ debug, การเขียนเทสต์, security และ performance |

รายการบททั้งหมด (สร้างจาก `course.json` อัตโนมัติด้วย `npm run sync` ห้ามแก้ตารางนี้มือ)

<!-- brain:lessons:start -->
| # | บทเรียน | เรียนอะไร | เวลา |
|---|---|---|---:|
| | **ระดับ 1 · พื้นฐานภาษา** | | |
| 01 | [JavaScript คืออะไร และรันโค้ดที่ไหน](lessons/01-what-is-javascript.md) | ภาษานี้ทำงานอย่างไร รันในเบราว์เซอร์และ Node.js ได้อย่างไร และเริ่มเขียนโค้ดบรรทัดแรก | 12 นาที |
| 02 | [ตัวแปรและชนิดข้อมูล](lessons/02-variables-and-types.md) | let, const, var ต่างกันอย่างไร ชนิดข้อมูลพื้นฐาน 7 ชนิด และค่าแบบ value กับ reference | 15 นาที |
| 03 | [ตัวดำเนินการและการแปลงชนิดข้อมูล](lessons/03-operators-and-coercion.md) | === กับ == ต่างกันตรงไหน ค่า truthy/falsy และตัวดำเนินการสมัยใหม่อย่าง ?? และ ?. | 15 นาที |
| 04 | [เงื่อนไขและการวนซ้ำ](lessons/04-control-flow.md) | if, switch, ลูปแบบต่าง ๆ และเขียนเงื่อนไขให้อ่านง่ายด้วย guard clause | 14 นาที |
| 05 | [ฟังก์ชัน](lessons/05-functions.md) | ประกาศฟังก์ชันสามแบบ พารามิเตอร์ default และ rest ฟังก์ชันบริสุทธิ์ และฟังก์ชันที่รับฟังก์ชัน | 16 นาที |
| 06 | [String, Number และ Date](lessons/06-strings-numbers-dates.md) | จัดการข้อความ เลขทศนิยมที่คลาดเคลื่อน จัดรูปแบบเงินบาทและวันที่ภาษาไทยด้วย Intl | 16 นาที |
| | **ระดับ 2 · ข้อมูลและโครงสร้างโค้ด** | | |
| 07 | [Array](lessons/07-arrays.md) | เมธอดที่แก้ของเดิมกับที่คืนของใหม่ map, filter, reduce และกับดักของ sort | 16 นาที |
| 08 | [Object, Map, Set และ JSON](lessons/08-objects-map-set-json.md) | ทำงานกับ object อย่างปลอดภัย คัดลอกแบบตื้นและลึก เลือกใช้ Map/Set และกับดักของ JSON | 18 นาที |
| 09 | [Scope, Hoisting และ Closure](lessons/09-scope-and-closures.md) | ตัวแปรมองเห็นกันได้แค่ไหน ทำไมเรียกใช้ก่อนประกาศแล้วพัง และ closure ใช้เก็บสถานะได้อย่างไร | 15 นาที |
| 10 | [this, Prototype และ Class](lessons/10-this-prototype-class.md) | กฎของ this ที่คนสับสนบ่อย prototype chain เบื้องหลัง class และฟีเจอร์ของ class สมัยใหม่ | 18 นาที |
| 11 | [ES Modules และการจัดโครงสร้างไฟล์](lessons/11-modules.md) | import/export แบ่งโค้ดเป็นไฟล์ จัดชั้น utils, modules, pages และทำไมต้องเปิดผ่าน http | 15 นาที |
| 12 | [การจัดการ Error](lessons/12-error-handling.md) | throw, try/catch/finally สร้าง Error ของตัวเอง และไม่กลืน error ทิ้งจนหาบั๊กไม่เจอ | 13 นาที |
| | **ระดับ 3 · Browser และงาน Asynchronous** | | |
| 13 | [DOM: ควบคุมหน้าเว็บด้วย JavaScript](lessons/13-dom.md) | เลือก สร้าง และแก้ element อย่างปลอดภัย textContent กับ innerHTML และ template | 16 นาที |
| 14 | [Event และการตอบสนองผู้ใช้](lessons/14-events.md) | addEventListener, bubbling, event delegation, preventDefault และฟอร์มด้วย FormData | 15 นาที |
| 15 | [Event Loop](lessons/15-event-loop.md) | JavaScript ทำงานทีละอย่างแต่รอหลายเรื่องพร้อมกันได้อย่างไร task กับ microtask และทำไมหน้าเว็บค้าง | 14 นาที |
| 16 | [Promise และ async/await](lessons/16-promises-async-await.md) | จาก callback สู่ Promise และ async/await จัดการ error และรันงานพร้อมกันด้วย Promise.all | 18 นาที |
| 17 | [Fetch API: คุยกับ Server](lessons/17-fetch-api.md) | ขอและส่งข้อมูล JSON เช็ก response.ok ตั้ง timeout ด้วย AbortController และจัดการสถานะหน้าจอ | 15 นาที |
| 18 | [เก็บข้อมูลในเบราว์เซอร์](lessons/18-web-storage.md) | localStorage และ sessionStorage ใช้อย่างไรให้ไม่พัง และอะไรที่ห้ามเก็บเด็ดขาด | 12 นาที |
| | **ระดับ 4 · เขียนแบบมืออาชีพ** | | |
| 19 | [Clean Code และ Naming Convention](lessons/19-clean-code.md) | ตั้งชื่อให้สื่อความหมาย ฟังก์ชันสั้นที่ทำอย่างเดียว early return และคอมเมนต์ที่อธิบายว่าทำไม | 15 นาที |
| 20 | [Debugging ด้วย DevTools](lessons/20-debugging.md) | ใช้ console ให้เกินกว่า log ตั้ง breakpoint อ่าน stack trace และดูคำขอในแท็บ Network | 14 นาที |
| 21 | [การทดสอบด้วย node:test](lessons/21-testing.md) | เขียน unit test ด้วยเครื่องมือที่มากับ Node.js แบบไม่ต้องลงไลบรารี และออกแบบโค้ดให้ทดสอบง่าย | 16 นาที |
| 22 | [Security พื้นฐานสำหรับ Frontend](lessons/22-security-basics.md) | กัน XSS ไม่ใช้ eval ไม่ฝังความลับในโค้ดหน้าเว็บ ตรวจข้อมูลเข้า และดูแล dependency | 15 นาที |
| 23 | [Performance พื้นฐาน](lessons/23-performance.md) | วัดก่อนแก้ debounce และ throttle เลี่ยง layout thrashing และโหลดเท่าที่จำเป็น | 15 นาที |

รวม 23 บท · 4 ระดับ · ประมาณ 5.8 ชั่วโมง
<!-- brain:lessons:end -->

## เปิดอ่าน

**บนเว็บ** ในโฟลเดอร์ `the-brain-hub` สั่ง

```bash
npm start
```

แล้วเปิด `http://127.0.0.1:8765/` กด "เข้าสู่ The Brain" แล้วเลือกการ์ด JavaScript
หรือเข้าตรงที่ `http://127.0.0.1:8765/java-script/`

**อ่านไฟล์ตรง ๆ** เปิดไฟล์ใน `lessons/` ด้วย VS Code แล้วกด `Ctrl+Shift+V` เพื่อดูแบบ preview

## ข้อตกลงในบทเรียน

- ผลลัพธ์ที่ console แสดงเขียนไว้ท้ายบรรทัดเป็น `// → ค่า`
- โค้ดตัวอย่างใช้ `const` เป็นหลัก เปรียบเทียบด้วย `===` แบ่งไฟล์ด้วย ES Modules และตั้งชื่อแบบ camelCase
- กล่องเน้นมี 5 แบบ: หมายเหตุ · เคล็ดลับ · สำคัญ · ข้อควรระวัง · อันตราย
- ทุกบทปิดท้ายด้วย "อ่านเพิ่ม" ที่ลิงก์ไปเอกสารของ MDN

## โครงสร้างไฟล์

```text
java-script/
├── README.md      ไฟล์นี้
├── index.html     หน้าเว็บของคอร์ส สร้างจาก template ของ the-brain-hub (ห้ามแก้มือ)
├── course.json    ระดับและรายการบท (ลำดับในไฟล์ = ลำดับบนเว็บ)
└── lessons/       เนื้อหา 23 บท
```

## แก้หรือเพิ่มบทเรียน

1. เขียนไฟล์ใน `lessons/` ตามโครงของ `../the-brain-hub/templates/lesson.md`
2. เพิ่มหรือแก้รายการใน `course.json` (`id` เป็น kebab-case และหัวเรื่อง `#` ในไฟล์ต้องตรงกับ `title`)
3. ในโฟลเดอร์ `the-brain-hub` สั่ง `npm run sync` แล้ว `npm run check` จนขึ้นว่าผ่าน
