# ตั้งค่าเข้มงวดและ Lint

> `tsc` ตรวจว่า type ถูกต้อง ส่วน linter ตรวจรูปแบบโค้ดที่ type ถูกแต่มักเป็นบั๊ก เช่น เรียก async function แล้วลืม `await` บทนี้ไล่ดูว่า `strict` แต่ละตัวจับอะไร ตัวเลือกที่ควรเปิดเพิ่ม และตั้ง ESLint กับ typescript-eslint ให้ทำงานคู่กับ TypeScript 7

## บทนี้จะได้อะไร

- รู้ว่า `strict` เปิดอะไรบ้าง และแต่ละตัวจับบั๊กแบบไหน
- เปิดตัวเลือกเข้มงวดเพิ่มเติมที่คุ้มค่า และค่อย ๆ เปิดในโปรเจกต์ที่มีอยู่แล้ว
- ตั้ง ESLint + typescript-eslint แบบใช้ข้อมูล type และติดตั้งคู่กับ TypeScript 7 ให้ถูกวิธี

## strict เปิดอะไรบ้าง

`strict: true` คือการเปิดตัวเลือกทั้งตระกูลในครั้งเดียว และ TypeScript รุ่นใหม่อาจเพิ่มการตรวจเข้ามาในชุดนี้อีก

| ตัวเลือก | จับอะไร |
|---|---|
| `noImplicitAny` | ตัวแปรหรือพารามิเตอร์ที่เดา type ไม่ได้แล้วกลายเป็น `any` เงียบ ๆ |
| `strictNullChecks` | ใช้ค่าที่อาจเป็น `null` หรือ `undefined` โดยไม่เช็ก (บทที่ 3) |
| `strictFunctionTypes` | ส่งฟังก์ชันที่รับพารามิเตอร์ไม่ตรงไปเป็น callback |
| `strictBindCallApply` | เรียก `bind`, `call`, `apply` ด้วยพารามิเตอร์ผิด |
| `strictPropertyInitialization` | property ของ class ที่ไม่ได้กำหนดค่า (บทที่ 12) |
| `strictBuiltinIteratorReturn` | ค่าที่ iterator ของ built-in คืนตอนจบเป็น `undefined` ไม่ใช่ `any` |
| `noImplicitThis` | ใช้ `this` ที่ไม่รู้ type |
| `useUnknownInCatchVariables` | ค่าใน `catch` เป็น `unknown` (บทที่ 18) |
| `alwaysStrict` | ทุกไฟล์ทำงานใน strict mode ของ JavaScript (TypeScript 7 ปิดไม่ได้แล้ว) |

สองตัวที่เห็นผลชัดที่สุดในโค้ดทั่วไป

```ts
function double(value) { // ❌ Parameter 'value' implicitly has an 'any' type.
  return value * 2;
}

type Handler = (event: { type: string }) => void;

const showPosition = (event: { type: string; x: number }) => console.log(event.x);
const handler: Handler = showPosition; // ❌ Type '(event: { type: string; x: number; }) => void' is not assignable to type 'Handler'.
```

ตัวอย่างที่สองคือบั๊กจริง `showPosition` ต้องการ `x` แต่ใครก็ตามที่เรียก `Handler` ส่งมาแค่ `type` ถ้าปล่อยผ่าน `event.x` จะเป็น `undefined` ตอนรัน

## ตัวเลือกที่ควรเปิดเพิ่ม

tsconfig ของคอร์สนี้เปิด `noUncheckedIndexedAccess` และ `exactOptionalPropertyTypes` ไว้แล้ว อีกสี่ตัวที่คุ้มค่าจับบั๊กที่ `strict` ไม่ได้ดู

```ts
class Base {
  save(): string {
    return 'base';
  }
}

class Draft extends Base {
  save(): string { // ❌ This member must have an 'override' modifier because it overrides a member in the base class 'Base'.
    return 'draft';
  }
}
```

`noImplicitOverride` บังคับให้เขียน `override` ทุกครั้งที่เขียนทับเมธอดของแม่ ถ้าวันหนึ่งแม่เปลี่ยนชื่อเมธอด ลูกจะถูกฟ้องทันทีแทนที่จะกลายเป็นเมธอดใหม่เงียบ ๆ

```ts
function priceOf(plan: 'free' | 'pro' | 'team'): number {
  let total = 0;
  switch (plan) {
    case 'pro': // ❌ Fallthrough case in switch.
      total += 290;
    case 'team':
      total += 990;
      break;
    case 'free':
      total = 0;
  }
  return total;
}

function labelOf(status: 'draft' | 'published'): string | undefined { // ❌ Not all code paths return a value.
  if (status === 'draft') {
    return 'ฉบับร่าง';
  }
}
```

`noFallthroughCasesInSwitch` จับ `case` ที่ลืม `break` จนไหลลงไปทำ `case` ถัดไป ส่วน `noImplicitReturns` จับฟังก์ชันที่บางทาง `return` ค่าแต่บางทางไม่ได้คืนอะไร แม้ type จะยอมให้เป็น `undefined` ก็ตาม

```ts
const labels: Record<string, string> = { draft: 'ฉบับร่าง' };

console.log(labels.draft); // ❌ Property 'draft' comes from an index signature, so it must be accessed with ['draft'].
console.log(labels['draft']); // → ฉบับร่าง
```

`noPropertyAccessFromIndexSignature` บังคับให้ key ที่ไม่ได้ประกาศไว้ชัด (มาจาก index signature) เขียนด้วยวงเล็บเหลี่ยม คนอ่านจะรู้ทันทีว่า key นี้อาจไม่มีอยู่จริง

tsconfig ที่เปิดครบทั้งหมด

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
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "noEmit": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "rewriteRelativeImportExtensions": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

> [!TIP]
> โปรเจกต์ที่มีอยู่แล้วอย่าเปิดทุกตัวพร้อมกัน เปิดทีละตัว แก้ error จนหมด แล้ว commit ก่อนค่อยเปิดตัวถัดไป error หลักร้อยจุดจะกลายเป็นงานชิ้นเล็กที่รีวิวได้

## Lint ด้วย ESLint และ typescript-eslint

typescript-eslint ทำให้ ESLint อ่านโค้ด TypeScript ได้ และมีกฎที่ใช้ข้อมูล type มาช่วยตรวจ (typed linting) จับบั๊กที่ `tsc` ไม่ถือว่าผิด เช่น promise ที่ไม่มีใคร `await` หรือ `catch`

```bash
npm install --save-dev eslint @eslint/js typescript-eslint
```

ข้อควรรู้ของเดือนกันยายน 2026 คือ typescript-eslint รุ่นล่าสุด (8.70) รองรับ TypeScript ต่ำกว่า 6.1 เท่านั้น เพราะ TypeScript 7.0 ยังไม่มี API ให้เครื่องมืออื่นเรียกใช้ ทีม TypeScript จึงแนะนำให้ติดตั้งสองรุ่นคู่กัน ให้ชื่อ `typescript` เป็นรุ่น 6 สำหรับเครื่องมือ และรุ่น 7 อยู่ในชื่อ `@typescript/native` สำหรับ `tsc`

```bash
npm install --save-dev "@typescript/native@npm:typescript@^7.0.2" "typescript@npm:@typescript/typescript6@^6.0.2"
```

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

หลังติดตั้ง `npx tsc` ยังเป็น TypeScript 7 เหมือนเดิม ส่วนรุ่น 6 เรียกได้ด้วย `npx tsc6` เมื่อ typescript-eslint รองรับ API ของ TypeScript 7.1 แล้วค่อยกลับไปติดตั้ง `typescript` ชื่อเดียว

ตั้งค่า ESLint ด้วยไฟล์ `eslint.config.js` ตัวอย่างนี้ใช้ชุดกฎ `strictTypeChecked` ที่เข้มงวดที่สุด (เริ่มจาก `recommendedTypeChecked` ก่อนก็ได้)

```js file=eslint.config.js
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig({
  files: ['src/**/*.ts'],
  extends: [js.configs.recommended, tseslint.configs.strictTypeChecked],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
});
```

โค้ดนี้ผ่าน `tsc` ทุกบรรทัด

```ts file=src/progress.ts
async function saveProgress(lessonId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  console.log(`บันทึก ${lessonId} แล้ว`);
}

export function markRead(lessonId: string): void {
  saveProgress(lessonId);
}

export function parse(text: string): any {
  return JSON.parse(text);
}
```

แต่ `npx eslint .` เจอสองจุด

```text
src/progress.ts
   7:3   error  Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
  10:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 2 problems (2 errors, 0 warnings)
```

จุดแรกคือบั๊กจริง ถ้าการบันทึกล้มเหลว error จะหายไปโดยไม่มีใครรู้ ตั้ง npm script ให้รันทั้งสองอย่างก่อน commit และใน CI

```json
{
  "scripts": {
    "check": "tsc",
    "lint": "eslint ."
  }
}
```

## ข้อผิดพลาดที่พบบ่อย

- ปิด `strict` เพื่อให้โปรเจกต์เดิมผ่าน แล้วไม่เคยเปิดกลับ
- เปิดตัวเลือกเข้มงวดทุกตัวพร้อมกันในโปรเจกต์ใหญ่ จน error ท่วมแล้วเลิกกลางทาง
- ใช้ `eslint-disable` หรือ `@ts-ignore` ปิดปัญหาโดยไม่เขียนเหตุผลไว้
- อัปเกรดเป็น TypeScript 7 แล้ว typescript-eslint พัง เพราะไม่ได้ติดตั้งรุ่น 6 คู่ไว้

## สรุป

- `strict` เปิดการตรวจ 9 ตัวในครั้งเดียว และควรเปิดตัวเลือกเข้มงวดอีก 6 ตัวที่คอร์สนี้แนะนำ
- เปิดทีละตัวในโปรเจกต์เดิม แก้ให้หมดก่อนค่อยเปิดตัวถัดไป
- typed linting จับบั๊กที่ `tsc` ไม่ถือว่าผิด และตอนนี้ต้องติดตั้ง TypeScript 6 คู่กับ 7 ให้ typescript-eslint

## อ่านเพิ่ม

- [TSConfig: strict](https://www.typescriptlang.org/tsconfig/#strict)
- [typescript-eslint: Getting Started](https://typescript-eslint.io/getting-started/)
- [typescript-eslint: Linting with Type Information](https://typescript-eslint.io/getting-started/typed-linting/)
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
