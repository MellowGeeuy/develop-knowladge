# ย้ายโปรเจกต์ JavaScript มาเป็น TypeScript

> ไม่ต้องหยุดงานทั้งทีมเพื่อเขียนใหม่หมด TypeScript ออกแบบมาให้อยู่ร่วมกับ JavaScript ได้ ไฟล์ `.js` กับ `.ts` ปนกันในโปรเจกต์เดียวได้ และตรวจ type ในไฟล์ `.js` ได้ด้วย JSDoc บทนี้คือแผนย้ายทีละขั้น ที่ทุกขั้นยังส่งงานได้ตามปกติ

## บทนี้จะได้อะไร

- เพิ่ม TypeScript เข้าโปรเจกต์ JavaScript เดิมโดยไม่ต้องแก้ทุกไฟล์
- ใส่ type ในไฟล์ `.js` ด้วย JSDoc และ `// @ts-check`
- เปลี่ยนไฟล์เป็น `.ts` ทีละไฟล์ และปิดท้ายด้วยการตรวจทั้งโปรเจกต์

## แผนภาพรวม

1. ติดตั้ง TypeScript แล้วเปิด `allowJs` ให้ไฟล์ `.js` กับ `.ts` อยู่ด้วยกันได้
2. ใส่ `// @ts-check` และ JSDoc ให้ไฟล์ `.js` ที่สำคัญก่อน
3. เปลี่ยนนามสกุลเป็น `.ts` ทีละไฟล์ เริ่มจากไฟล์ที่ไม่ได้ import ไฟล์อื่น (เช่น utils)
4. เปิด `checkJs` ตรวจไฟล์ `.js` ที่เหลือ แล้วเปิดตัวเลือกเข้มงวดของบทที่ 20

## ขั้นที่ 1: ให้ .js กับ .ts อยู่ด้วยกัน

```json file=tsconfig.json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "lib": ["esnext"],
    "types": ["node"],
    "allowJs": true,
    "checkJs": false,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

`allowJs` ให้ TypeScript อ่านไฟล์ `.js` ด้วย ไฟล์ `.ts` ที่ import ไฟล์ `.js` จึงได้ type ที่เดาจากโค้ดเดิม ส่วน `checkJs: false` บอกว่ายังไม่ต้องฟ้อง error ในไฟล์ `.js` ทั้งหมด ยกเว้นไฟล์ที่ขอเองด้วย `// @ts-check`

เปิด `strict` ตั้งแต่วันแรกได้เลย เพราะมีผลแค่กับไฟล์ `.ts` ที่เพิ่งย้ายมา ไฟล์ที่ย้ายแล้วจึงเข้มงวดเต็มที่ทันที ส่วนไฟล์ที่ยังไม่ย้ายไม่ถูกรบกวน

## ขั้นที่ 2: JSDoc และ @ts-check

บรรทัด `// @ts-check` บนสุดของไฟล์ `.js` สั่งให้ตรวจไฟล์นั้น แล้วบอก type ด้วยคอมเมนต์ JSDoc โค้ดยังเป็น JavaScript ที่รันได้เหมือนเดิมทุกอย่าง

```js file=src/price.js
// @ts-check

/**
 * @param {number} amount
 * @param {string} [currency]
 * @returns {string}
 */
export function formatPrice(amount, currency = 'บาท') {
  return `${amount.toLocaleString('th-TH')} ${currency}`;
}

console.log(formatPrice(1500)); // → 1,500 บาท
formatPrice('1500'); // ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
```

รูปร่างของ object ประกาศด้วย `@typedef` แล้วใช้ด้วย `@type`

```js file=src/lessons.js
// @ts-check

/**
 * @typedef {object} Lesson
 * @property {string} id
 * @property {string} title
 * @property {number} minutes
 */

/** @type {Lesson[]} */
const lessons = [{ id: 'migrate', title: 'ย้ายโปรเจกต์', minutes: 16 }];

/**
 * @param {readonly Lesson[]} list
 * @returns {number}
 */
export function totalMinutes(list) {
  return list.reduce((sum, lesson) => sum + lesson.minutes, 0);
}

console.log(totalMinutes(lessons)); // → 16
lessons.push({ id: 'draft', title: 'บทใหม่' }); // ❌ Property 'minutes' is missing in type '{ id: string; title: string; }' but required in type 'Lesson'.
```

type ที่ประกาศในไฟล์หนึ่งเอาไปใช้ในอีกไฟล์ได้ด้วย `@import` (มีตั้งแต่ TypeScript 5.5)

```js file=src/summary.js
// @ts-check

/** @import { Lesson } from './lessons.js' */

/**
 * @param {Lesson} lesson
 * @returns {string}
 */
export function describe(lesson) {
  return `${lesson.title} (${lesson.minutes} นาที)`;
}
```

> [!WARNING]
> TypeScript 7 ปรับการตรวจ JSDoc ให้ใกล้กับไฟล์ `.ts` มากขึ้น รูปแบบเก่าบางอย่างใช้ไม่ได้แล้ว เช่น `@enum` (ให้ใช้ `@typedef`) การเอาชื่อค่ามาใช้เป็น type ตรง ๆ (ให้เขียน `typeof ชื่อ`) เครื่องหมาย `!` ต่อท้าย type และ `?` ที่ใช้แทน `any` ถ้าโค้ดเดิมใช้รูปแบบเหล่านี้ให้แก้ก่อนอัปเกรด

## ขั้นที่ 3: เปลี่ยนเป็น .ts ทีละไฟล์

เริ่มจากไฟล์ที่ไม่ได้ import ไฟล์อื่น แล้วค่อยขยับไปไฟล์ที่ใช้ไฟล์เหล่านั้น type จาก JSDoc ย้ายมาเป็น type ของ TypeScript ได้ตรงตัว นี่คือ `src/price.js` หลังเปลี่ยนชื่อเป็น `src/price.ts`

```ts
export function formatPrice(amount: number, currency = 'บาท'): string {
  return `${amount.toLocaleString('th-TH')} ${currency}`;
}
```

เปลี่ยนนามสกุลแล้วอย่าลืมแก้ import ของไฟล์ที่เรียกใช้ให้ชี้ไปที่ `./price.ts` และเมื่อเจอ error จำนวนมากหลังย้าย ใช้หลักเหล่านี้

- ข้อมูลที่ยังไม่รู้รูปร่างให้เป็น `unknown` แล้วตรวจ (บทที่ 17) อย่าใช้ `any` เพื่อให้ผ่านไปก่อน
- จุดที่ต้องพักไว้จริง ๆ ใช้ `// @ts-expect-error` พร้อมเหตุผล พอแก้ต้นเหตุแล้ว directive จะถูกฟ้องเองว่าไม่จำเป็นแล้ว (บทที่ 21)
- ตั้งกฎ `no-explicit-any` ของ typescript-eslint (บทที่ 20) ไว้เป็นคำเตือน จะได้เห็นว่ายังเหลือ `any` กี่จุด

## ขั้นที่ 4: ตรวจทั้งโปรเจกต์

เมื่อไฟล์ส่วนใหญ่ย้ายแล้ว เปลี่ยน `checkJs` เป็น `true` ให้ไฟล์ `.js` ที่เหลือถูกตรวจทั้งหมดโดยไม่ต้องใส่ `// @ts-check` ทีละไฟล์ จากนั้นเปิดตัวเลือกเข้มงวดของบทที่ 20 ทีละตัว จนได้ tsconfig ชุดเดียวกับที่คอร์สนี้ใช้

> [!TIP]
> ทุกขั้นในบทนี้ commit แยกกันและส่งงานได้ โปรเจกต์ไม่เคยอยู่ในสภาพที่ใช้งานไม่ได้ระหว่างย้าย ทีมจึงย้ายไปพร้อมกับทำงานปกติได้

## ข้อผิดพลาดที่พบบ่อย

- พยายามย้ายทุกไฟล์ในครั้งเดียว แล้วติดอยู่กับ error หลายร้อยจุด
- ใช้ `any` เพื่อให้ผ่านไปก่อนแล้วไม่เคยกลับมาแก้
- ใช้ `@ts-ignore` ปิด error โดยไม่มีเหตุผล แทนที่จะใช้ `@ts-expect-error`
- อัปเกรดเป็น TypeScript 7 ทั้งที่ไฟล์ JavaScript ยังใช้ JSDoc รูปแบบเก่าที่ไม่รองรับแล้ว

## สรุป

- `allowJs` ให้ `.js` กับ `.ts` อยู่ด้วยกัน และ `// @ts-check` กับ JSDoc ตรวจ type ในไฟล์ `.js` ได้
- ย้ายทีละไฟล์จากไฟล์ที่ไม่ import อะไร ไฟล์ที่ย้ายแล้วเข้มงวดเต็มที่ทันที
- ปิดท้ายด้วย `checkJs: true` และตัวเลือกเข้มงวดของบทที่ 20

## อ่านเพิ่ม

- [TypeScript Handbook: Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
- [TypeScript Handbook: JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [TypeScript Handbook: Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
