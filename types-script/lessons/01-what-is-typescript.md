# TypeScript คืออะไร และทำงานอย่างไร

> TypeScript คือ JavaScript ที่เพิ่มระบบ type เข้าไป ตัวตรวจ type จะอ่านโค้ดแล้วบอกจุดที่ผิดตั้งแต่ก่อนรัน และเมื่อถึงเวลารันจริง type ทั้งหมดจะถูกลบทิ้งจนเหลือ JavaScript ธรรมดา

## บทนี้จะได้อะไร

- เห็นว่า TypeScript จับบั๊กแบบไหนได้ก่อนรัน
- เข้าใจว่าการตรวจ type กับการรันโค้ดเป็นสองขั้นตอนที่แยกกัน
- รู้จักเครื่องมือหลักคือ `tsc` (TypeScript 7) และการรันไฟล์ `.ts` บน Node.js

## ปัญหาที่ TypeScript แก้

JavaScript ไม่รู้ว่าข้อมูลหน้าตาเป็นอย่างไรจนกว่าจะรันถึงบรรทัดนั้น พิมพ์ชื่อ property ผิดตัวเดียวก็ได้ผลลัพธ์เพี้ยนโดยไม่มี error สักบรรทัด

```js
function getTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

console.log(getTotal([{ price: 100 }, { prise: 50 }])); // → NaN
```

บั๊กแบบนี้หลุดไปถึงผู้ใช้ได้ง่ายมาก เพราะโค้ดรันผ่าน ไม่มีอะไรฟ้อง แค่ตัวเลขผิด

TypeScript ให้เราบอกรูปร่างของข้อมูลไว้ แล้วตรวจทุกจุดที่ใช้ข้อมูลนั้นให้

```ts
type CartItem = { price: number };

function getTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

getTotal([{ price: 100 }, { prise: 50 }]); // ❌ Object literal may only specify known properties, but 'prise' does not exist in type 'CartItem'. Did you mean to write 'price'?
```

error นี้ขึ้นใน editor ทันทีที่พิมพ์ (ขีดเส้นแดงใต้ `prise`) ไม่ต้องรอรัน และไม่ต้องรอให้ผู้ใช้เจอ

> [!NOTE]
> ในคอร์สนี้ บรรทัดที่มี `// ❌` คือบรรทัดที่ TypeScript ฟ้อง ข้อความหลังเครื่องหมายคัดลอกมาจาก `tsc` ตรงตัว (TypeScript แสดง error เป็นภาษาอังกฤษ) ส่วน `// →` คือผลที่ได้เมื่อรันจริง เหมือนคอร์ส JavaScript

## JavaScript ที่มี type

ทุกอย่างที่เรียนในคอร์ส JavaScript ยังใช้ได้เหมือนเดิม TypeScript แค่เพิ่มที่ให้เขียน type ต่อท้ายตัวแปร พารามิเตอร์ และค่าที่ฟังก์ชันคืน ด้วยรูปแบบ `ชื่อ: type`

```ts
const siteName: string = 'The Brain';
let lessonCount: number = 23;
const isReady: boolean = true;

lessonCount = 'ยี่สิบสาม'; // ❌ Type 'string' is not assignable to type 'number'.
```

เมื่อ TypeScript รู้ type ของทุกอย่าง editor ก็ช่วยได้มากขึ้นด้วย ทั้งเติมชื่อ property ให้อัตโนมัติ เอาเมาส์ชี้แล้วเห็น type เปลี่ยนชื่อตัวแปรทั้งโปรเจกต์ในครั้งเดียว และกระโดดไปดูว่าฟังก์ชันประกาศไว้ที่ไหน

## Type หายไปก่อนรัน

type มีไว้ให้ตัวตรวจอ่านเท่านั้น ก่อนรันจริงจะถูกลบทิ้งทั้งหมด (เรียกว่า type erasure) โค้ดนี้

```ts
function greet(name: string): string {
  return `สวัสดี ${name}`;
}

console.log(greet('สมชาย')); // → สวัสดี สมชาย
```

พอลบ type ออก สิ่งที่รันจริงคือ JavaScript ธรรมดาแบบนี้

```js
function greet(name) {
  return `สวัสดี ${name}`;
}

console.log(greet('สมชาย'));
```

ผลที่ตามมามีสองข้อที่ต้องจำ ข้อแรก TypeScript ไม่ได้ตรวจอะไรตอนรันเลย ข้อมูลที่มาจากนอกโปรแกรม (API, ไฟล์ JSON, ฟอร์ม) จึงต้องตรวจเองตอนรัน (บทที่ 17) ข้อสอง error ของ type ไม่ได้หยุดโค้ดไม่ให้รัน

```ts
const price: number = '100'; // ❌ Type 'string' is not assignable to type 'number'.
console.log(price + 1); // → 1001
```

`tsc` ฟ้องว่าผิด แต่ถ้าสั่งรันไฟล์นี้ก็ยังรันได้ และได้ `1001` แทนที่จะเป็น `101` เพราะตอนรันไม่มี type เหลืออยู่แล้ว

## สองงานที่แยกกัน: ตรวจ type กับรันโค้ด

| งาน | ใช้อะไร | ตัวอย่างคำสั่ง |
|---|---|---|
| ตรวจ type ทั้งโปรเจกต์ | `tsc` จากแพ็กเกจ `typescript` | `npx tsc` |
| รันไฟล์ `.ts` | Node.js 22.18 ขึ้นไป (แนะนำ 24 LTS) | `node src/index.ts` |
| แปลงเป็น `.js` ให้เบราว์เซอร์หรือเผยแพร่ | `tsc` หรือ bundler อย่าง Vite | `npx tsc -p tsconfig.build.json` |

Node.js รันไฟล์ `.ts` ได้เองตั้งแต่ v22.18 และ v23.6 และประกาศเป็นฟีเจอร์ stable ตั้งแต่ v24.12 วิธีที่ Node ใช้คือลบ type ทิ้งเฉย ๆ (type stripping) ไม่ได้ตรวจอะไรเลย

> [!IMPORTANT]
> `node app.ts` รันผ่านไม่ได้แปลว่า type ถูก ต้องสั่ง `npx tsc` ตรวจเสมอ บทถัดไปจะตั้งให้สั่งทั้งสองอย่างได้ด้วย npm script

## TypeScript 7: คอมไพเลอร์รุ่นใหม่

- TypeScript 7.0 ออกเมื่อ 8 ก.ค. 2026 เป็นคอมไพเลอร์ที่เขียนใหม่ด้วยภาษา Go ทีม TypeScript วัดได้ว่า build ทั้งโปรเจกต์เร็วขึ้นประมาณ 8–12 เท่า
- กติกาการตรวจ type ยกมาจาก TypeScript 6.0 แบบคงโครงเดิม error และ type ที่เห็นในคอร์สนี้จึงเหมือนกันทั้งสองรุ่น
- คำสั่งยังเป็น `tsc` และติดตั้งด้วย `npm install --save-dev typescript` เหมือนเดิม
- 7.0 ยังไม่มี API ให้โปรแกรมอื่นเรียกใช้ (ทีม TypeScript บอกว่าจะมาใน 7.1) เครื่องมือที่ต้องใช้ API อย่าง typescript-eslint จึงยังต้องติดตั้ง TypeScript 6 คู่ไว้ก่อน (บทที่ 20)

## ลองเขียนบรรทัดแรก

ถ้ายังไม่อยากติดตั้งอะไร เปิด [TypeScript Playground](https://www.typescriptlang.org/play/) พิมพ์โค้ดแล้วเห็นทั้ง error และ JavaScript ที่ได้ทันที

ถ้ามี Node.js 24 อยู่แล้ว สร้างไฟล์นี้แล้วสั่งรันได้เลย

```ts file=hello.ts
const language: string = 'TypeScript';
const lessons: number = 23;

console.log(`เรียน ${language} ทั้งหมด ${lessons} บท`); // → เรียน TypeScript ทั้งหมด 23 บท
```

```bash
node hello.ts
```

> [!TIP]
> เช็กรุ่นด้วย `node --version` ถ้าต่ำกว่า v22.18 ให้ติดตั้งรุ่น LTS จาก nodejs.org (ตอนเขียนบทนี้ ก.ย. 2026 คือ Node 24) รุ่นเก่ากว่านั้นรันไฟล์ `.ts` ไม่ได้ จะเจอ `SyntaxError` ตรงบรรทัดแรกที่มี type หรือ `Unknown file extension ".ts"` ในโปรเจกต์ที่ตั้ง `"type": "module"`

## ข้อผิดพลาดที่พบบ่อย

- คิดว่า TypeScript ตรวจข้อมูลตอนรัน แล้วเชื่อข้อมูลจาก API โดยไม่ตรวจ
- รันด้วย `node` ผ่านแล้วคิดว่า type ถูก ทั้งที่ยังไม่ได้สั่ง `tsc`
- ใส่ `any` เพื่อหนี error ทุกครั้ง ซึ่งเท่ากับปิดการตรวจไปเลย (บทที่ 3)
- ติดตั้ง TypeScript แบบทั้งเครื่อง (`npm install -g`) ทำให้แต่ละโปรเจกต์ใช้รุ่นไม่ตรงกัน

## สรุป

- TypeScript คือ JavaScript ที่มี type ตรวจตอนเขียนโค้ด ไม่ใช่ตอนรัน
- type ถูกลบก่อนรันเสมอ โค้ดที่ type ผิดก็ยังรันได้ จึงต้องสั่งตรวจแยกทุกครั้ง
- เครื่องมือหลักคือ `tsc` (TypeScript 7) และ Node.js 22.18 ขึ้นไปรันไฟล์ `.ts` ได้เอง

## อ่านเพิ่ม

- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [TypeScript Handbook: The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Node.js: Modules — TypeScript](https://nodejs.org/api/typescript.html)
