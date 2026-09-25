# TypeScript — องค์ความรู้การพัฒนาโปรแกรมด้วย TypeScript

> ส่วนหนึ่งของ **The Brain** คลังความรู้การพัฒนาโปรแกรม · เปิดอ่านบนเว็บได้จากการ์ด TypeScript ในหน้า Dashboard

## โฟลเดอร์นี้คืออะไร

โฟลเดอร์นี้คือคลังความรู้การเขียนโปรแกรมด้วย TypeScript ทั้งคอร์ส ต่อยอดจากคอร์ส JavaScript (`../java-script/`) ประกอบด้วย

- **บทเรียน 23 บท** ในรูปแบบ Markdown (`lessons/`) อ่านได้ทั้งบนเว็บ ใน VS Code และบน GitHub
- **หน้าเว็บของคอร์ส** (`index.html`) แสดงบทเรียนพร้อมรายการบทที่หุบเป็นแถบแคบได้ ค้นหาด้วย `Ctrl+K` และจำว่าอ่านบทไหนไปแล้ว

หน้าตาและตัวเล่นบทเรียนอยู่ที่ `../the-brain-hub/` ซึ่งทุกภาษาในคลังใช้ร่วมกัน โฟลเดอร์นี้จึงมีแค่เนื้อหา สีของหน้าเว็บเป็นน้ำเงินตามโลโก้ TypeScript

เนื้อหาอิง **TypeScript 7.0** (คอมไพเลอร์รุ่นใหม่ที่เขียนด้วย Go ออกเมื่อ ก.ค. 2026) และ **Node.js 24 LTS** ที่รันไฟล์ `.ts` ได้เอง

## เหมาะกับใคร

- **คนที่เขียน JavaScript เป็นแล้ว** หรือเรียนคอร์ส JavaScript จบ คอร์สนี้ไม่สอน syntax ของ JavaScript ซ้ำ
- **นักพัฒนาที่ใช้ TypeScript อยู่แล้ว** ใช้ทบทวน หรือเปิดเฉพาะเรื่อง เช่น generics, utility types หรือการตั้งเครื่องมือให้ทำงานกับ TypeScript 7
- **ทีมที่กำลังย้ายโปรเจกต์ JavaScript มาเป็น TypeScript** เริ่มจากบทที่ 22 แล้วย้อนกลับมาเก็บพื้นฐานตามที่ต้องใช้

## สอนอะไรบ้าง

| ระดับ | เรียนอะไร |
|---|---|
| 1 · พื้นฐาน TypeScript | TypeScript ทำงานอย่างไร ตั้งค่าโปรเจกต์ type พื้นฐาน ฟังก์ชัน object, interface, enum และ literal type |
| 2 · ระบบ Type เชิงลึก | union, narrowing, generics, keyof, typeof, satisfies, utility types, mapped และ conditional types |
| 3 · TypeScript ในงานจริง | class, decorator, module, ไฟล์ `.d.ts`, namespace, DOM, fetch กับการตรวจข้อมูลตอนรัน และการจัดการ error |
| 4 · เขียนแบบมืออาชีพ | TypeScript บน Node.js, ตัวเลือกเข้มงวด, ESLint, การเขียนเทสต์ การย้ายจาก JavaScript และแนวปฏิบัติที่ดี |

รายการบททั้งหมด (สร้างจาก `course.json` อัตโนมัติด้วย `npm run sync` ห้ามแก้ตารางนี้มือ)

<!-- brain:lessons:start -->
| # | บทเรียน | เรียนอะไร | เวลา |
|---|---|---|---:|
| | **ระดับ 1 · พื้นฐาน TypeScript** | | |
| 01 | [TypeScript คืออะไร และทำงานอย่างไร](lessons/01-what-is-typescript.md) | TypeScript เพิ่มอะไรให้ JavaScript ตรวจโค้ดก่อนรันอย่างไร และทำไม type ถึงหายไปตอนโค้ดทำงานจริง | 12 นาที |
| 02 | [ติดตั้งและตั้งค่าโปรเจกต์](lessons/02-setup-and-tsconfig.md) | สร้างโปรเจกต์ด้วย npm ตั้งค่า tsconfig.json ให้เข้มงวด ใช้ tsc ตรวจ type และให้ Node.js รันไฟล์ .ts | 16 นาที |
| 03 | [Type พื้นฐานและ Type Inference](lessons/03-basic-types.md) | ใส่ type เองกับให้ TypeScript เดาเองต่างกันอย่างไร type พื้นฐาน array tuple literal และ any, unknown, never | 16 นาที |
| 04 | [ฟังก์ชัน](lessons/04-functions.md) | ใส่ type ให้พารามิเตอร์และค่าที่คืน พารามิเตอร์ที่ไม่บังคับ ค่าเริ่มต้น rest, function type, callback และ overload | 15 นาที |
| 05 | [Object, Type Alias และ Interface](lessons/05-objects-and-interfaces.md) | กำหนดรูปร่างของ object ด้วย type และ interface property ที่ไม่บังคับ readonly, index signature และ structural typing | 18 นาที |
| 06 | [Enum และ Literal Type](lessons/06-enums-and-literal-types.md) | สร้างชุดค่าคงที่ด้วย enum หรือ union ของ literal type ข้อดีข้อเสียของแต่ละแบบ และทำไม Node.js รันไฟล์ที่มี enum ตรง ๆ ไม่ได้ | 14 นาที |
| | **ระดับ 2 · ระบบ Type เชิงลึก** | | |
| 07 | [Union และ Narrowing](lessons/07-union-and-narrowing.md) | รวมหลาย type ด้วย union แล้วแยกกรณีด้วย typeof, in, instanceof, discriminated union และตรวจครบทุกกรณีด้วย never | 18 นาที |
| 08 | [Generics](lessons/08-generics.md) | เขียนฟังก์ชันและ type ที่ใช้ได้กับข้อมูลหลายชนิดโดยไม่เสีย type ด้วย type parameter, constraint และค่าเริ่มต้น | 18 นาที |
| 09 | [keyof, typeof, as const และ satisfies](lessons/09-type-operators.md) | สร้าง type จากค่าที่มีอยู่แล้ว ดึง type ย่อยด้วย indexed access และตรวจค่าด้วย satisfies โดยไม่เสีย type ที่ละเอียด | 16 นาที |
| 10 | [Utility Types](lessons/10-utility-types.md) | แปลง type เดิมเป็น type ใหม่ด้วย Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract, ReturnType และ Awaited | 15 นาที |
| 11 | [Mapped, Conditional และ Template Literal Types](lessons/11-mapped-and-conditional-types.md) | สร้าง type ด้วยการวนทุก key แยก type ตามเงื่อนไขด้วย extends กับ infer และประกอบชื่อด้วย template literal type | 18 นาที |
| | **ระดับ 3 · TypeScript ในงานจริง** | | |
| 12 | [Class และ OOP](lessons/12-classes.md) | ใส่ type ให้ class เลือกระหว่าง private กับ #private ใช้ readonly, implements, abstract และ override | 16 นาที |
| 13 | [Decorators](lessons/13-decorators.md) | decorator มาตรฐานของ JavaScript ใน TypeScript เขียน decorator ของ method, class และ field ต่างจาก experimentalDecorators อย่างไร และทำไมต้องแปลงก่อนรัน | 15 นาที |
| 14 | [Modules และ Declaration Files](lessons/14-modules-and-declarations.md) | import และ export แบบมี type ใช้ import type กับ verbatimModuleSyntax เขียนไฟล์ .d.ts และใช้ type ของไลบรารีจาก @types | 17 นาที |
| 15 | [Namespace และ Declaration Merging](lessons/15-namespaces-and-declaration-merging.md) | namespace คืออะไร ทำไมโค้ดใหม่ใช้ ES Modules แทน การรวม interface ที่ชื่อซ้ำ และการเพิ่ม type ให้โค้ดที่มีอยู่แล้ว | 13 นาที |
| 16 | [DOM และ Event แบบมี Type](lessons/16-dom-and-events.md) | เลือก element ให้ได้ type ที่ถูก จัดการค่า null ใส่ type ให้ event และฟอร์ม และสร้าง CustomEvent ที่มี type | 16 นาที |
| 17 | [Async, Fetch และตรวจข้อมูลตอนรันจริง](lessons/17-async-and-fetch.md) | ใส่ type ให้ Promise และ async function เรียก API ด้วย fetch แล้วตรวจข้อมูลที่ได้ตอนรันจริง เพราะ type ไม่ได้ตรวจอะไรตอนรัน | 18 นาที |
| 18 | [การจัดการ Error แบบปลอดภัย](lessons/18-error-handling.md) | error ใน catch เป็น unknown แยกชนิดด้วย instanceof สร้าง Error class ของตัวเอง และคืนผลแบบ Result แทนการโยน error | 15 นาที |
| | **ระดับ 4 · เขียนแบบมืออาชีพ** | | |
| 19 | [TypeScript กับ Node.js](lessons/19-typescript-with-nodejs.md) | รันไฟล์ .ts บน Node.js โดยตรง ข้อจำกัดของ type stripping ใส่ type ให้ process.env และ build เป็น JavaScript ก่อนเผยแพร่ | 16 นาที |
| 20 | [ตั้งค่าเข้มงวดและ Lint](lessons/20-strict-and-linting.md) | ตัวเลือก strict แต่ละตัวจับบั๊กอะไร ตัวเลือกเข้มงวดที่ควรเปิดเพิ่ม และตั้ง ESLint กับ typescript-eslint | 15 นาที |
| 21 | [การทดสอบโค้ด TypeScript](lessons/21-testing.md) | เขียนเทสต์เป็นไฟล์ .ts ด้วย node:test โดยไม่ต้องลงเครื่องมือเพิ่ม ทดสอบ type ด้วย @ts-expect-error และให้ tsc เป็นด่านแรก | 16 นาที |
| 22 | [ย้ายโปรเจกต์ JavaScript มาเป็น TypeScript](lessons/22-migrate-from-javascript.md) | ย้ายทีละไฟล์ด้วย allowJs และ checkJs บอก type ในไฟล์ .js ด้วย JSDoc แล้วเปิดความเข้มงวดทีละขั้น | 16 นาที |
| 23 | [Best Practices และ Anti-patterns](lessons/23-best-practices.md) | รูปแบบที่ทำให้ type โกหกอย่าง any, as และ ! ออกแบบ type ให้ตรงกับความจริง branded type และการตั้งชื่อ | 15 นาที |

รวม 23 บท · 4 ระดับ · ประมาณ 6.1 ชั่วโมง
<!-- brain:lessons:end -->

## ก่อนเริ่ม

- **Node.js 24 LTS** ขึ้นไป (อย่างน้อย 22.18 ถึงจะรันไฟล์ `.ts` ได้) เช็กด้วย `node --version`
- **VS Code** มีตัวตรวจ TypeScript ในตัว
- ตั้งโปรเจกต์ตามบทที่ 2 ครั้งเดียว แล้วใช้ลองโค้ดของทุกบท

## เปิดอ่าน

**บนเว็บ** ในโฟลเดอร์ `the-brain-hub` สั่ง

```bash
npm start
```

แล้วเปิด `http://127.0.0.1:8765/` กด "เข้าสู่ The Brain" แล้วเลือกการ์ด TypeScript
หรือเข้าตรงที่ `http://127.0.0.1:8765/types-script/`

**อ่านไฟล์ตรง ๆ** เปิดไฟล์ใน `lessons/` ด้วย VS Code แล้วกด `Ctrl+Shift+V` เพื่อดูแบบ preview

## ข้อตกลงในบทเรียน

- `// → ค่า` คือผลที่ได้เมื่อรันจริง
- `// ❌ ข้อความ` คือบรรทัดที่ `tsc` ฟ้อง ข้อความคัดลอกจาก TypeScript 7 ตรงตัว (เป็นภาษาอังกฤษตามที่ TypeScript แสดง)
- `// ชนิด: T` คือ type ที่ TypeScript เดาได้ ตรงกับที่เห็นเมื่อเอาเมาส์ชี้ใน VS Code ส่วน `// เท่ากับ ...` คือ type เดียวกันที่คลี่ออกให้อ่านง่าย
- ทุกบล็อกโค้ดคัดลอกไปวางในโปรเจกต์จากบทที่ 2 แล้วตรวจและรันได้ทันที บล็อกที่มีชื่อไฟล์ (เช่น `src/lesson.ts`) คือไฟล์ที่อยู่ในโปรเจกต์เดียวกันของบทนั้น
- tsconfig ของทุกบทคือชุดในบทที่ 2 ยกเว้นบทที่บอกไว้ในตัวบทเอง (13 decorator, 16 หน้าเว็บ, 20 ตัวเลือกเข้มงวดเพิ่ม)
- ตัวอย่างทั้งหมดตรวจกับ TypeScript 7.0.2 และ Node.js 24.21 เมื่อ ก.ย. 2026 ทั้ง error, type ที่เขียนไว้ และผลที่ได้จากการรัน

## โครงสร้างไฟล์

```text
types-script/
├── README.md      ไฟล์นี้
├── index.html     หน้าเว็บของคอร์ส สร้างจาก template ของ the-brain-hub (ห้ามแก้มือ)
├── course.json    ระดับและรายการบท (ลำดับในไฟล์ = ลำดับบนเว็บ)
└── lessons/       เนื้อหา 23 บท
```

## แก้หรือเพิ่มบทเรียน

1. เขียนไฟล์ใน `lessons/` ตามโครงของ `../the-brain-hub/templates/lesson.md` และข้อตกลงด้านบน
2. เพิ่มหรือแก้รายการใน `course.json` (`id` เป็น kebab-case และหัวเรื่อง `#` ในไฟล์ต้องตรงกับ `title`)
3. ในโฟลเดอร์ `the-brain-hub` สั่ง `npm run sync` แล้ว `npm run check` จนขึ้นว่าผ่าน
