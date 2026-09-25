# TypeScript กับ Node.js

> Node.js รันไฟล์ `.ts` ได้เองแล้ว ไม่ต้องแปลงก่อน ไม่ต้องติดตั้งเครื่องมือเสริม บทนี้ดูว่า Node ทำอะไรกับไฟล์ของเราจริง ๆ มีข้อจำกัดตรงไหน ตรวจค่าตั้งค่าตอนเริ่มโปรแกรม และเมื่อไรที่ยังต้อง build เป็น JavaScript

## บทนี้จะได้อะไร

- เข้าใจ type stripping ของ Node และกติกาที่โค้ดต้องทำตาม
- ใช้ API ของ Node แบบมี type และตรวจ `process.env` ตอนเริ่มโปรแกรม
- build เป็น JavaScript พร้อมไฟล์ `.d.ts` เมื่อต้องเผยแพร่เป็นแพ็กเกจ

## Node ทำอะไรกับไฟล์ .ts

เอกสารของ Node.js อธิบายว่า Node แทนที่ syntax ของ TypeScript ด้วยช่องว่าง และไม่ได้ตรวจ type เลย เพราะแทนด้วยช่องว่าง เลขบรรทัดและตำแหน่งใน stack trace จึงตรงกับไฟล์ต้นฉบับโดยไม่ต้องมี source map

| รุ่นของ Node.js | สิ่งที่เปลี่ยน |
|---|---|
| v22.18.0, v23.6.0 | รันไฟล์ `.ts` ได้เองโดยไม่ต้องใส่ flag |
| v22.18.0, v24.3.0 | เลิกแสดงคำเตือนว่าเป็นฟีเจอร์ทดลอง |
| v24.12.0, v25.2.0 | ประกาศเป็นฟีเจอร์ stable |
| v26.0.0 | เอา flag `--experimental-transform-types` (ที่เคยใช้แปลง enum) ออก |

## กติกาที่ต้องทำตาม

- **ใช้ได้เฉพาะ syntax ที่ลบทิ้งได้** enum, namespace ที่มีค่า, parameter properties และ `import x = require()` ใช้ไม่ได้ ส่วน decorator Node ยังอ่านไม่ออกเลย (บทที่ 6, 12, 13, 15) `erasableSyntaxOnly` ใน tsconfig จับให้ตั้งแต่ตอนตรวจ
- **ใส่นามสกุลไฟล์ทุกครั้ง** `import { add } from './math.ts'` ไม่ใช่ `'./math'`
- **import type ต้องมีคำว่า type** ไม่งั้น Node ถือว่าเป็นการ import ค่าแล้วพังตอนรัน (บทที่ 14)
- **Node ไม่อ่าน tsconfig.json** การตั้งค่าอย่าง `paths` จึงใช้ไม่ได้ ทางที่ใกล้เคียงที่สุดคือ subpath imports ใน package.json ที่ต้องขึ้นต้นด้วย `#`
- **ไม่รันไฟล์ `.ts` ใน node_modules** แพ็กเกจที่เผยแพร่ต้องเป็น JavaScript เสมอ
- **ระบบ module ดูจาก `"type"` ใน package.json** เหมือนไฟล์ `.js` (`.mts` เป็น ES module เสมอ `.cts` เป็น CommonJS เสมอ)

tsconfig ที่เอกสารของ Node แนะนำตรงกับที่ตั้งไว้ในบทที่ 2 ทุกข้อ

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

## API ของ Node แบบมี type

`@types/node` มี type ของทุก module ใน Node ใช้ prefix `node:` เวลา import เพื่อให้ชัดว่าเป็น module ในตัวของ Node

```ts
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = await mkdtemp(join(tmpdir(), 'brain-'));
const file = join(dir, 'note.txt');
await writeFile(file, 'TypeScript บน Node', 'utf8');

const text = await readFile(file, 'utf8'); // ชนิด: string
const bytes = await readFile(file); // ชนิด: Buffer<ArrayBuffer>

console.log(text); // → TypeScript บน Node
```

สังเกตว่าการส่ง `'utf8'` ทำให้ได้ `string` แต่ถ้าไม่ส่งจะได้ข้อมูลดิบแบบ Buffer นี่คือ overload (บทที่ 4) ที่ `@types/node` เขียนไว้ให้

## ตรวจ process.env ตอนเริ่มโปรแกรม

ค่าใน `process.env` เป็น `string | undefined` เสมอ และมาจากนอกโปรแกรมเหมือนข้อมูลจาก API ตรวจครั้งเดียวตอนเริ่มโปรแกรม แล้วส่งต่อเป็น object ที่มี type ถูกต้อง ถ้าค่าไหนผิด ให้หยุดตั้งแต่ตอนเริ่ม ดีกว่าไปพังกลางทาง

```ts
type AppConfig = {
  port: number;
  databaseUrl: string;
};

function readConfig(env: NodeJS.ProcessEnv): AppConfig {
  const port = Number(env.PORT ?? '3000');
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT ไม่ถูกต้อง: ${env.PORT}`);
  }
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('ยังไม่ได้ตั้ง DATABASE_URL');
  }
  return { port, databaseUrl };
}

const config = readConfig({ PORT: '8080', DATABASE_URL: 'postgres://localhost:5432/brain' });
console.log(config.port); // → 8080

try {
  readConfig({ PORT: '8080' });
} catch (error) {
  console.log(error instanceof Error ? error.message : error); // → ยังไม่ได้ตั้ง DATABASE_URL
}
```

ตอนใช้จริงเรียก `readConfig(process.env)` ส่วนการส่ง object ตรง ๆ แบบในตัวอย่างทำให้ทดสอบฟังก์ชันนี้ได้ง่าย (บทที่ 21) ค่าในไฟล์ `.env` โหลดได้ด้วย Node เองผ่าน `node --env-file=.env src/index.ts` ไม่ต้องลงไลบรารีเพิ่ม

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
|---|---|
| `node src/index.ts` | รันโปรแกรม |
| `node --watch src/index.ts` | รันใหม่เองทุกครั้งที่แก้ไฟล์ |
| `node --env-file=.env src/index.ts` | โหลดค่าจากไฟล์ `.env` เข้า `process.env` ก่อนรัน |
| `node --test` | รันเทสต์ รวมไฟล์ `*.test.ts` (บทที่ 21) |
| `npx tsc` | ตรวจ type ซึ่ง Node ไม่ได้ทำให้ |

## Build เมื่อต้องเผยแพร่

แอปที่รันบนเซิร์ฟเวอร์ของเราเองรันไฟล์ `.ts` ได้เลย แต่แพ็กเกจที่เผยแพร่ให้คนอื่นติดตั้งต้องเป็น JavaScript พร้อมไฟล์ `.d.ts` เพราะ Node ไม่รันไฟล์ `.ts` ใน node_modules ทำ config แยกสำหรับ build ที่ต่อยอดจาก tsconfig หลัก

```json file=tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true
  },
  "exclude": ["src/**/*.test.ts"]
}
```

```json file=package.json
{
  "name": "@brain/lesson-utils",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "check": "tsc"
  }
}
```

`rewriteRelativeImportExtensions` ที่ตั้งไว้ใน tsconfig หลักจะเปลี่ยน `import './math.ts'` เป็น `import './math.js'` ให้ตอน build ไฟล์ใน `dist` จึงรันได้ทันที

> [!TIP]
> ถ้าโปรเจกต์เดิมใช้ enum หรือ decorator อยู่แล้วและยังไม่พร้อมเปลี่ยน ให้ build ด้วย `tsc` แล้วรันไฟล์ใน `dist` หรือใช้ตัวรันที่แปลง syntax ให้อย่าง tsx แทนการรันไฟล์ `.ts` ด้วย Node ตรง ๆ

## ข้อผิดพลาดที่พบบ่อย

- คาดหวังว่า `paths` ใน tsconfig จะใช้ได้ตอนรันด้วย Node
- เผยแพร่แพ็กเกจที่มีแต่ไฟล์ `.ts` แล้วคนติดตั้งเอาไปใช้ไม่ได้
- ใช้ค่าจาก `process.env` กระจายทั่วโปรแกรมโดยไม่ตรวจ แล้วเจอ `undefined` กลางทาง
- ลืมว่า Node ไม่ตรวจ type เลย แล้วไม่ได้สั่ง `tsc` ใน CI

## สรุป

- Node 24 รันไฟล์ `.ts` ด้วยการแทน type ด้วยช่องว่าง ไม่แปลงอะไร และไม่ตรวจ type
- ต้องใช้ syntax ที่ลบทิ้งได้ ใส่นามสกุลไฟล์ เขียน `import type` และไม่พึ่ง `paths`
- ตรวจ `process.env` ครั้งเดียวตอนเริ่มโปรแกรม และ build เป็น JavaScript พร้อม `.d.ts` เมื่อเผยแพร่แพ็กเกจ

## อ่านเพิ่ม

- [Node.js: Modules — TypeScript](https://nodejs.org/api/typescript.html)
- [Node.js: Running TypeScript Natively](https://nodejs.org/learn/typescript/run-natively)
- [Node.js: Packages — Subpath imports](https://nodejs.org/api/packages.html#subpath-imports)
- [TSConfig: rewriteRelativeImportExtensions](https://www.typescriptlang.org/tsconfig/#rewriteRelativeImportExtensions)
