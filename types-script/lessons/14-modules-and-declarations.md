# Modules และ Declaration Files

> TypeScript ใช้ ES Modules แบบเดียวกับ JavaScript แต่เพิ่มมาสองเรื่อง คือการ import เฉพาะ type และไฟล์ `.d.ts` ที่บอก type ของโค้ด JavaScript โดยไม่มีตัวโค้ดจริง สองเรื่องนี้คือเหตุผลที่เราใช้ไลบรารี JavaScript ทั้งหมดบน npm จาก TypeScript ได้

## บทนี้จะได้อะไร

- export และ import ทั้งค่าและ type ระหว่างไฟล์
- เข้าใจ `import type` และทำไม `verbatimModuleSyntax` บังคับให้เขียน
- อ่านและเขียนไฟล์ `.d.ts` ใช้ `declare` และใช้ type ของไลบรารีจาก `@types`

## export และ import

export type ได้เหมือน export ค่า ส่วนตอน import ถ้าเป็น type ให้ใส่คำว่า `type` นำหน้าชื่อนั้น

```ts file=src/lesson.ts
export type Lesson = {
  id: string;
  title: string;
  minutes: number;
};

export function totalMinutes(lessons: readonly Lesson[]): number {
  return lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
}
```

```ts file=src/index.ts
import { totalMinutes, type Lesson } from './lesson.ts';

const lessons: Lesson[] = [
  { id: 'modules', title: 'Modules', minutes: 17 },
  { id: 'classes', title: 'Class', minutes: 16 },
];

console.log(totalMinutes(lessons)); // → 33
```

ชื่อไฟล์ต้องมีนามสกุลครบ (`./lesson.ts`) เพราะ Node.js ไม่เดานามสกุลให้ ถ้าเป็นโปรเจกต์ที่ใช้ bundler อย่าง Vite ตั้ง `"moduleResolution": "bundler"` แล้วเขียนแบบไม่มีนามสกุลได้

## ทำไมต้องมี import type

ตอนรัน type หายไปหมด เครื่องมือที่ลบ type (Node.js, Vite, `tsc`) จึงต้องรู้ว่า import ตัวไหนเป็นแค่ type จะได้ลบทิ้งทั้งบรรทัด เอกสารของ Node.js เขียนไว้ชัดว่าถ้าไม่มีคำว่า `type` Node จะถือว่าเป็นการ import ค่า แล้วพังตอนรัน เพราะไฟล์ปลายทางไม่มีค่าชื่อนั้นอยู่จริง

`verbatimModuleSyntax` ใน tsconfig ของคอร์สนี้จับให้ตั้งแต่ตอนตรวจ

```ts file=src/report.ts
import { Lesson } from './lesson.ts'; // ❌ 'Lesson' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.

export function describe(lesson: Lesson): string {
  return `${lesson.title} (${lesson.minutes} นาที)`;
}
```

เขียนได้สองแบบ คือ `import type { Lesson } from './lesson.ts'` เมื่อทั้งบรรทัดเป็น type และ `import { totalMinutes, type Lesson }` เมื่อมีทั้งค่าและ type ปนกัน

## Declaration file (.d.ts)

ไฟล์ `.d.ts` มีแต่ type ไม่มีโค้ดที่ทำงานจริง มาได้จากสามทาง

- **มากับ TypeScript** เช่น type ของ `Array`, `Promise` และ DOM (`lib.dom.d.ts`)
- **มากับไลบรารี** ผู้เขียนไลบรารีสร้างจาก TypeScript ด้วย `declaration: true` แล้วแนบมาในแพ็กเกจ
- **มาจาก DefinitelyTyped** ไลบรารีที่ไม่มี type ของตัวเอง มีคนเขียนแยกไว้ ติดตั้งเป็นแพ็กเกจ `@types/ชื่อไลบรารี`

ถ้าสั่ง `npx tsc --declaration --emitDeclarationOnly` กับ `src/lesson.ts` จะได้ไฟล์นี้ คือทุกอย่างที่ไฟล์อื่นต้องรู้ โดยตัดโค้ดข้างในฟังก์ชันออกหมด

```ts file=dist/lesson.d.ts
export type Lesson = {
    id: string;
    title: string;
    minutes: number;
};
export declare function totalMinutes(lessons: readonly Lesson[]): number;
```

## ใช้ไลบรารีจาก npm

- ไลบรารีส่วนใหญ่ในวันนี้แนบ type มาเอง (เช่น zod) ติดตั้งแล้วใช้ได้เลย หน้าแพ็กเกจบน npmjs.com จะมีป้าย TS ให้เห็น
- ไลบรารีที่ไม่มี type ของตัวเอง (เช่น lodash) ติดตั้ง type เพิ่มจาก DefinitelyTyped ด้วย `npm install --save-dev @types/lodash`
- `"types": ["node"]` ใน tsconfig มีผลแค่กับ type ที่เป็นของส่วนกลาง (global) อย่าง `process` ของ Node ส่วน `@types` ของแพ็กเกจที่เรา `import` เข้ามาเอง TypeScript หาให้ตามปกติ ไม่ต้องเพิ่มชื่อลงใน `types`

## declare: บอกว่ามีอยู่แล้วจากที่อื่น

`declare` บอก TypeScript ว่าของสิ่งนี้มีอยู่จริงตอนรัน แต่ไม่ได้ประกาศในโค้ด TypeScript ของเรา เช่น ค่าที่เครื่องมือ build ใส่มาให้

```ts file=src/env.d.ts
declare const __APP_VERSION__: string;
```

```ts file=src/about.ts
export function aboutText(): string {
  return `The Brain เวอร์ชัน ${__APP_VERSION__}`;
}
```

TypeScript เชื่อ `declare` ทันทีโดยไม่ตรวจ ถ้าเครื่องมือ build ไม่ได้ใส่ค่านั้นมาจริง โปรแกรมจะพังด้วย `ReferenceError` ตอนรัน

## เขียน type ให้ไลบรารีที่ไม่มี

ไลบรารีเก่าที่ไม่มี type และไม่มีใน DefinitelyTyped เขียน `declare module` บอก type เองได้ เขียนเฉพาะส่วนที่ใช้จริงก็พอ

```ts file=src/types/legacy-slugify.d.ts
declare module 'legacy-slugify' {
  export default function slugify(text: string, separator?: string): string;
}
```

```ts file=src/slug.ts
import slugify from 'legacy-slugify';

export const lessonSlug = slugify('Modules และ Declaration Files', '-');
```

ถ้ายังไม่มีเวลาเขียน type เลย ใส่แค่ `declare module 'legacy-slugify';` บรรทัดเดียวก็ import ได้ แต่ทุกอย่างจากไลบรารีจะเป็น `any` จึงควรเป็นแค่ทางผ่านชั่วคราว

## ข้อผิดพลาดที่พบบ่อย

- import type โดยไม่มีคำว่า `type` แล้วโค้ดพังตอนรันด้วย Node
- ลืมนามสกุลไฟล์ใน import ในโปรเจกต์ที่รันด้วย Node
- ติดตั้ง `@types/ชื่อ` ให้ไลบรารีที่แนบ type มาเองอยู่แล้ว ทำให้มี type สองชุดชนกัน
- ใช้ `declare module` แบบบรรทัดเดียวถาวรจนทั้งไลบรารีเป็น `any`

## สรุป

- export และ import type ได้เหมือนค่า แต่ต้องมีคำว่า `type` กำกับ ให้เครื่องมือรู้ว่าลบทิ้งได้
- `.d.ts` มีแต่ type มาจาก TypeScript เอง จากไลบรารี หรือจาก `@types`
- `declare` บอกว่าของบางอย่างมีอยู่แล้วตอนรัน TypeScript เชื่อทันทีจึงต้องใช้ให้ตรงกับความจริง

## อ่านเพิ่ม

- [TypeScript Handbook: Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)
- [TypeScript Handbook: Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [TSConfig: verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
