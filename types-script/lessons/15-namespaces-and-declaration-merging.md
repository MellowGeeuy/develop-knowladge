# Namespace และ Declaration Merging

> ก่อน JavaScript จะมี ES Modules TypeScript มี namespace ไว้จัดโค้ดเป็นกลุ่ม วันนี้โค้ดใหม่ไม่ต้องใช้แล้ว แต่ยังเจอในไลบรารีและไฟล์ `.d.ts` ทั่วไป บทนี้สอนให้อ่านออก และสอนเรื่องที่ยังใช้ทุกวัน คือ declaration merging การรวม declaration ชื่อเดียวกันเข้าด้วยกัน ซึ่งเป็นวิธีเพิ่ม type ให้โค้ดที่เราไม่ได้เขียนเอง

## บทนี้จะได้อะไร

- อ่าน namespace ออก และรู้ว่าทำไมโค้ดใหม่ใช้ ES Modules แทน
- เข้าใจว่า interface ชื่อซ้ำกันถูกรวมเป็นอันเดียว แต่ type alias ไม่ใช่
- เพิ่ม type ให้ของที่มีอยู่แล้วด้วย `declare global` และ module augmentation

## Namespace

namespace รวมโค้ดไว้ใต้ชื่อเดียว สิ่งที่ `export` เท่านั้นที่เรียกจากข้างนอกได้

```ts
namespace Validation {
  const EMAIL = /^[^@\s]+@[^@\s]+$/;

  export function isEmail(value: string): boolean {
    return EMAIL.test(value);
  }
}

console.log(Validation.isEmail('mali@example.com')); // → true
```

`tsc` แปลง namespace เป็นฟังก์ชันที่เรียกตัวเองทันที (IIFE) ที่ใส่ของลงใน object ตัวหนึ่ง

```js
var Validation;
(function (Validation) {
    const EMAIL = /^[^@\s]+@[^@\s]+$/;
    function isEmail(value) {
        return EMAIL.test(value);
    }
    Validation.isEmail = isEmail;
})(Validation || (Validation = {}));
```

เพราะต้องสร้างโค้ดแบบนี้ Node.js ที่รันไฟล์ `.ts` ด้วยการลบ type จึงรัน namespace ที่มีค่าอยู่ข้างในไม่ได้ และ `erasableSyntaxOnly` จับให้ตั้งแต่ตอนตรวจเหมือน enum

```text
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript namespace declaration is not supported in strip-only mode
```

ส่วน namespace ที่มีแต่ type ข้างใน ลบทิ้งได้ทั้งก้อน จึงใช้ได้ทุกที่ รูปแบบนี้เจอบ่อยในไฟล์ `.d.ts`

```ts
namespace Shapes {
  export interface Circle {
    radius: number;
  }
}

const circle: Shapes.Circle = { radius: 2 };

console.log(circle.radius); // → 2
```

โค้ดเก่ามากบางที่ใช้คำว่า `module` แทน `namespace` ตั้งแต่ TypeScript 6.0 เขียนแบบนั้นไม่ได้แล้ว

```ts
module Legacy { // ❌ A 'namespace' declaration should not be declared using the 'module' keyword. Please use the 'namespace' keyword instead.
  export const version = 1;
}
```

> [!TIP]
> โค้ดใหม่ใช้ ES Modules เสมอ ไฟล์หนึ่งคือ module หนึ่ง มี scope ของตัวเอง import อะไรเห็นชัดทุกบรรทัด และเครื่องมือ build ตัดโค้ดที่ไม่ได้ใช้ออกได้ ส่วน namespace เก็บไว้สำหรับอ่านไฟล์ `.d.ts` และโค้ดเก่า

## Declaration merging

interface ที่ชื่อซ้ำกันในที่เดียวกันจะถูกรวมเป็นอันเดียว property ของทุกอันมารวมกัน

```ts
interface Settings {
  theme: string;
}

interface Settings {
  fontSize: number;
}

const settings: Settings = { theme: 'dark' }; // ❌ Property 'fontSize' is missing in type '{ theme: string; }' but required in type 'Settings'.
```

type alias ทำแบบนี้ไม่ได้ ประกาศชื่อซ้ำแล้วฟ้องทั้งสองที่

```ts
type Theme = { mode: string }; // ❌ Duplicate identifier 'Theme'.
type Theme = { accent: string }; // ❌ Duplicate identifier 'Theme'.
```

ถ้าเขียนเองในไฟล์เดียวกัน การรวมแบบนี้มักทำให้งง ประโยชน์จริงของมันคือการเพิ่ม type ให้สิ่งที่คนอื่นประกาศไว้ ดังสองหัวข้อถัดไป

## declare global: type ของ process.env

`@types/node` ประกาศ `process.env` ไว้ใน namespace ชื่อ `NodeJS` เป็น interface `ProcessEnv` เราจึงเพิ่มชื่อตัวแปรของโปรเจกต์เข้าไปได้ด้วยการประกาศ interface ชื่อเดียวกันใน `declare global`

```ts file=src/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      PORT?: string;
    }
  }
}

export {};
```

```ts file=src/config.ts
const databaseUrl = process.env.DATABASE_URL; // ชนิด: string
const port = process.env.PORT; // ชนิด: string | undefined
const other = process.env.SOMETHING_ELSE; // ชนิด: string | undefined
```

`export {}` ท้ายไฟล์ทำให้ไฟล์เป็น module ซึ่ง `declare global` ต้องการ

> [!CAUTION]
> นี่คือการบอก TypeScript ว่าเชื่อเราเถอะ ไม่ใช่การตรวจ ถ้าลืมตั้ง `DATABASE_URL` จริง ค่าตอนรันคือ `undefined` ทั้งที่ type บอกว่าเป็น `string` จึงต้องตรวจค่าเหล่านี้ตอนเริ่มโปรแกรมเสมอ (บทที่ 19)

## Module augmentation

เพิ่ม property ให้ interface ที่อยู่ในไฟล์หรือไลบรารีอื่นได้ด้วย `declare module 'ชื่อ module'` ไลบรารีหลายตัวเปิดทางให้ปลั๊กอินเพิ่มความสามารถด้วยวิธีนี้

```ts file=src/app-config.ts
export interface AppConfig {
  siteName: string;
}

export const config: AppConfig = { siteName: 'The Brain' };
```

```ts file=src/analytics.ts
import type { AppConfig } from './app-config.ts';

declare module './app-config.ts' {
  interface AppConfig {
    analytics?: boolean;
  }
}

export function isTracking(config: AppConfig): boolean {
  return config.analytics ?? false;
}
```

การเพิ่มแบบนี้มีผลทั้งโปรเจกต์ ถ้าเพิ่ม `analytics` เป็นแบบบังคับ `config` ใน `app-config.ts` จะถูกฟ้องทันทีว่าขาด property นี้ จึงมักเพิ่มเป็นแบบไม่บังคับ

## ฟังก์ชันที่มี property

JavaScript ติด property ให้ฟังก์ชันได้ และ TypeScript เข้าใจรูปแบบนี้ (โค้ดเก่าทำเรื่องเดียวกันด้วยการรวมฟังก์ชันกับ namespace ชื่อเดียวกัน)

```ts
function greet(name: string): string {
  return `สวัสดี ${name}`;
}
greet.defaultName = 'ผู้มาเยือน';

console.log(greet(greet.defaultName)); // → สวัสดี ผู้มาเยือน
```

## ข้อผิดพลาดที่พบบ่อย

- ใช้ namespace จัดโค้ดใหม่ ทั้งที่ ES Modules ทำได้ดีกว่า
- เขียน `module` แทน `namespace` ตามโค้ดเก่า แล้วเจอ error ใน TypeScript 6 ขึ้นไป
- ลืม `export {}` ในไฟล์ที่มี `declare global`
- ประกาศ type ของ `process.env` แล้วเชื่อว่ามีค่าจริงโดยไม่ตรวจตอนรัน

## สรุป

- namespace คือวิธีจัดโค้ดยุคก่อน ES Modules อ่านให้ออก แต่โค้ดใหม่ไม่ต้องใช้
- interface ชื่อซ้ำถูกรวมกัน type alias ชื่อซ้ำเป็น error
- `declare global` และ `declare module` ใช้เพิ่ม type ให้ของที่มีอยู่แล้ว เป็นคำสัญญากับ TypeScript ไม่ใช่การตรวจ

## อ่านเพิ่ม

- [TypeScript Handbook: Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html)
- [TypeScript Handbook: Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [TypeScript Handbook: Namespaces and Modules](https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html)
