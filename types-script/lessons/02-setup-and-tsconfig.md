# ติดตั้งและตั้งค่าโปรเจกต์

> โปรเจกต์ TypeScript ที่ดีเริ่มจากสามอย่าง คือติดตั้ง TypeScript ไว้ในโปรเจกต์ ตั้งค่า `tsconfig.json` ให้เข้มงวด และมีคำสั่งแยกสำหรับตรวจ type กับรันโค้ด บทนี้ตั้งทั้งหมดให้ครบ แล้วใช้เป็นฐานของทุกบทที่เหลือ

## บทนี้จะได้อะไร

- สร้างโปรเจกต์ TypeScript ใหม่ด้วย npm
- เข้าใจตัวเลือกสำคัญใน `tsconfig.json` และใช้ชุดที่คอร์สนี้ใช้ตลอด
- สั่ง `tsc` ตรวจ type อ่าน error ในเทอร์มินัลเป็น และตั้ง npm script

## เตรียมเครื่อง

- **Node.js 24 LTS** เช็กด้วย `node --version` ต้องได้ v24 ขึ้นไป (อย่างน้อย v22.18 ถึงจะรันไฟล์ `.ts` ได้)
- **VS Code** มีตัวตรวจ TypeScript ในตัว เห็น error ตั้งแต่ตอนพิมพ์

## สร้างโปรเจกต์

```bash
mkdir hello-ts
cd hello-ts
npm init -y
npm pkg set type=module
npm install --save-dev typescript @types/node@24
npx tsc --version
```

```text
Version 7.0.2
```

แต่ละบรรทัดทำอะไร

- `npm pkg set type=module` ให้ทุกไฟล์ในโปรเจกต์เป็น ES Modules แบบเดียวกับที่ใช้ในคอร์ส JavaScript
- `typescript` คือตัว `tsc` ส่วน `@types/node` คือ type ของ API ใน Node.js (`process`, `node:fs` และอื่น ๆ) ให้ติดตั้งรุ่นหลักตรงกับ Node ที่ใช้ เช่น Node 24 ใช้ `@types/node@24`
- `--save-dev` เพราะใช้แค่ตอนพัฒนา และ `npx tsc` จะเรียก `tsc` รุ่นที่อยู่ในโปรเจกต์นี้ ทุกคนในทีมจึงใช้รุ่นเดียวกัน

เปิด `package.json` แล้วเพิ่ม `scripts` ให้เป็นแบบนี้ (ตัดช่องที่ `npm init` ใส่มาแต่ไม่เกี่ยวออก)

```json file=package.json
{
  "name": "hello-ts",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.ts",
    "dev": "node --watch src/index.ts",
    "check": "tsc"
  },
  "devDependencies": {
    "@types/node": "^24.13.6",
    "typescript": "^7.0.2"
  }
}
```

## tsconfig.json

`tsconfig.json` บอก `tsc` ว่าตรวจไฟล์ไหน และเข้มงวดแค่ไหน สั่ง `npx tsc --init` จะได้ไฟล์ตั้งต้นที่มีคำอธิบายทุกช่อง ซึ่งเป็นจุดเริ่มที่ดี คอร์สนี้ปรับต่อจากนั้นตามคำแนะนำในเอกสารของ Node.js สำหรับโปรเจกต์ที่รันไฟล์ `.ts` ตรง ๆ

```json file=tsconfig.json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "lib": ["esnext"],
    "types": ["node"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "rewriteRelativeImportExtensions": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

| ตัวเลือก | ทำอะไร |
|---|---|
| `target: "esnext"` | ใช้ syntax ล่าสุดได้ทั้งหมดโดยไม่ต้องแปลงลงรุ่นเก่า เพราะ Node 24 รองรับแล้ว |
| `module: "nodenext"` | ใช้กติกา import/export แบบเดียวกับ Node.js ซึ่งอ่าน `"type"` ใน package.json |
| `lib: ["esnext"]` | type ของ JavaScript มาตรฐาน (Array, Map, Promise) โดยไม่มี DOM เพราะโปรเจกต์นี้รันบน Node |
| `types: ["node"]` | โหลด type ของ Node ตั้งแต่ TypeScript 6.0 ค่าเริ่มต้นเป็น `[]` จึงต้องระบุเอง |
| `strict: true` | เปิดการตรวจเข้มงวดทั้งชุด เป็นค่าเริ่มต้นตั้งแต่ TypeScript 6.0 แต่เขียนไว้ให้เห็นชัด |
| `noUncheckedIndexedAccess` | อ่าน array หรือ object ด้วย index แล้วได้ `T \| undefined` บังคับให้เช็กก่อนใช้ (บทที่ 3) |
| `exactOptionalPropertyTypes` | property ที่ไม่บังคับห้ามใส่ `undefined` ตรง ๆ (บทที่ 5) |
| `noEmit: true` | ให้ `tsc` ตรวจอย่างเดียว ไม่สร้างไฟล์ `.js` เพราะ Node รัน `.ts` ได้เอง |
| `erasableSyntaxOnly` | ห้ามใช้ syntax ที่ลบทิ้งเฉย ๆ ไม่ได้ เช่น `enum` เพราะ Node จะรันไม่ได้ (บทที่ 6) |
| `verbatimModuleSyntax` | บังคับเขียน `import type` เมื่อ import มาแค่ type (บทที่ 14) |
| `rewriteRelativeImportExtensions` | ให้ import ไฟล์ด้วยนามสกุล `.ts` ได้ และแปลงเป็น `.js` ให้เองตอน build |
| `skipLibCheck` | ไม่ตรวจไฟล์ `.d.ts` ของไลบรารีซ้ำ ตรวจเร็วขึ้นมาก |
| `include: ["src"]` | ตรวจทุกไฟล์ในโฟลเดอร์ `src` |

> [!NOTE]
> TypeScript 6.0 เปลี่ยนค่าเริ่มต้นหลายตัว เช่น `strict` เป็น `true` และ `types` เป็น `[]` และ TypeScript 7.0 ใช้ค่าเริ่มต้นชุดเดียวกัน บทความหรือคำตอบเก่าบนเว็บที่เขียนก่อนปี 2026 จึงอาจพูดถึงค่าเริ่มต้นที่ไม่ตรงแล้ว

## เขียนไฟล์แรกแล้วตรวจ

```ts file=src/math.ts
export function add(a: number, b: number): number {
  return a + b;
}
```

```ts file=src/index.ts
import { add } from './math.ts';

console.log(add(2, 3)); // → 5
```

```bash
npm run check
npm start
```

`npm run check` เรียก `tsc` ถ้าไม่มีอะไรแสดงเลยแปลว่าผ่าน ส่วน `npm start` รันไฟล์ด้วย Node แล้วได้ `5`

ลองเปลี่ยนเป็น `add(2, '3')` แล้วสั่ง `npm run check` อีกครั้ง จะเห็นแบบนี้

```text
src/index.ts:3:20 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.

3 console.log(add(2, '3'));
                     ~~~

Found 1 error in src/index.ts:3
```

อ่านจากซ้ายไปขวา: ไฟล์ `src/index.ts` บรรทัด 3 ตัวอักษรที่ 20 · รหัส `TS2345` (เอาไปค้นเว็บได้) · ข้อความบอกว่าส่ง `string` ไปให้พารามิเตอร์ที่ต้องเป็น `number` · เส้น `~~~` ชี้จุดที่ผิด

## คำสั่งที่ใช้ทุกวัน

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run check` | ตรวจ type ทั้งโปรเจกต์ครั้งเดียว ใช้ก่อน commit และใน CI |
| `npx tsc --watch` | ตรวจซ้ำอัตโนมัติทุกครั้งที่บันทึกไฟล์ |
| `npm start` | รันโปรแกรม |
| `npm run dev` | รันแล้วเริ่มใหม่เองทุกครั้งที่แก้ไฟล์ (`node --watch`) |

> [!TIP]
> VS Code ตรวจ type ให้ขณะพิมพ์ก็จริง แต่ให้ถือว่า `npm run check` เป็นคำตัดสินสุดท้าย เพราะ editor อาจใช้ TypeScript คนละรุ่นกับในโปรเจกต์ และตรวจเฉพาะไฟล์ที่เปิดอยู่

## ถ้าเป็นโปรเจกต์หน้าเว็บ

โค้ดที่รันในเบราว์เซอร์ต้องแปลงเป็น `.js` ก่อนเสมอ งานจริงนิยมใช้ bundler อย่าง Vite ซึ่งแปลง TypeScript ได้เอง แต่ Vite แค่ลบ type ไม่ได้ตรวจ จึงยังต้องสั่ง `tsc` ตรวจแยกเหมือนเดิม และใน `tsconfig.json` ให้ใส่ `"dom"` ไว้ใน `lib` แทนการโหลด type ของ Node (บทที่ 16)

## ข้อผิดพลาดที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| `Cannot find name 'process'` | ไม่ได้โหลด type ของ Node | ติดตั้ง `@types/node` แล้วใส่ `"types": ["node"]` |
| `Cannot find name 'console'` | `lib` ไม่มี DOM และไม่ได้โหลด type ของ Node | แก้แบบข้อบน หรือถ้าเป็นเว็บให้ใส่ `"dom"` ใน `lib` |
| `Relative import paths need explicit file extensions...` | import โดยไม่ใส่นามสกุลไฟล์ | เขียน `./math.ts` ให้ครบ |
| `node` รันผ่าน แต่ `tsc` มี error | Node ไม่ได้ตรวจ type เลย | สั่ง `npm run check` ทุกครั้งก่อนถือว่าเสร็จ |

## สรุป

- ติดตั้ง `typescript` และ `@types/node` ในโปรเจกต์ด้วย `--save-dev` แล้วเรียกผ่าน `npx`
- `tsconfig.json` ของคอร์สนี้เปิดความเข้มงวดเต็มที่ และตั้งให้เข้ากับการรันไฟล์ `.ts` บน Node
- แยกคำสั่งตรวจ (`npm run check`) กับคำสั่งรัน (`npm start`) และตรวจก่อนถือว่างานเสร็จทุกครั้ง

## อ่านเพิ่ม

- [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [Node.js: Modules — TypeScript](https://nodejs.org/api/typescript.html)
- [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [npm Docs: npm pkg](https://docs.npmjs.com/cli/commands/npm-pkg/)
