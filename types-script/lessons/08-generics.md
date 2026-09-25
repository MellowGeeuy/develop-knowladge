# Generics

> generics คือการเขียนฟังก์ชันหรือ type ที่เว้นช่องไว้ให้ใส่ type ภายหลัง (type parameter) ฟังก์ชันเดียวจึงใช้ได้กับข้อมูลหลายชนิด โดยที่ TypeScript ยังรู้ type ที่แท้จริงทุกครั้งที่เรียกใช้

## บทนี้จะได้อะไร

- เข้าใจว่าทำไม `any` ไม่ใช่คำตอบของโค้ดที่ใช้ซ้ำได้
- เขียนฟังก์ชันและ type แบบ generic
- จำกัด type parameter ด้วย `extends` และ `keyof` ใส่ค่าเริ่มต้น และรู้ว่าเมื่อไรไม่ต้องใช้ generics

## ปัญหาที่ generics แก้

ฟังก์ชันที่อยากให้รับ array อะไรก็ได้ ถ้าใช้ `any` type จะหายไปทันทีที่ค่าออกจากฟังก์ชัน โค้ดหลังจากนั้นพิมพ์อะไรผิดก็ไม่มีใครเตือน

```ts
function firstAny(items: any[]): any {
  return items[0];
}

const value = firstAny(['TypeScript', 'JavaScript']); // ชนิด: any
```

## Generic function

`<T>` หลังชื่อฟังก์ชันประกาศ type parameter ชื่อ `T` แล้วใช้ `T` แทน type ตรงไหนก็ได้ในฟังก์ชัน ตอนเรียกใช้ TypeScript เดา `T` จากค่าที่ส่งเข้ามาเอง

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

const language = first(['TypeScript', 'JavaScript']); // ชนิด: string | undefined
const score = first([90, 85]); // ชนิด: number | undefined

console.log(language, score); // → TypeScript 90
```

มีได้หลายตัว และ type ที่ TypeScript คุ้นเคยอย่าง `Array<T>`, `Map<K, V>`, `Set<T>`, `Promise<T>` ก็คือ generics แบบเดียวกัน

```ts
function pair<A, B>(left: A, right: B): [A, B] {
  return [left, right];
}

const entry = pair('บทที่', 8); // ชนิด: [string, number]

const views = new Map<string, number>();
views.set('generics', 120);

const count = views.get('generics'); // ชนิด: number | undefined
```

ส่วนใหญ่ไม่ต้องระบุ type เองเพราะเดาได้ ยกเว้นกรณีที่ไม่มีค่าให้เดา เช่น `new Map<string, number>()` ที่ยังว่างอยู่

## จำกัดด้วย extends

`T extends { length: number }` แปลว่า `T` เป็นอะไรก็ได้ที่มี `length` เป็นตัวเลข ข้างในฟังก์ชันจึงใช้ `.length` ได้ และคนเรียกส่งค่าที่ไม่มี `length` ไม่ได้

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log(longest('TypeScript', 'JS')); // → TypeScript
console.log(longest([1, 2], [1, 2, 3])); // → [1, 2, 3]
longest(10, 20); // ❌ Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
```

## จำกัดด้วย keyof

รูปแบบที่เจอบ่อยมาก คือรับ object กับชื่อ key แล้วคืน type ของค่าตาม key นั้นได้ถูกต้อง `K extends keyof T` บังคับว่า key ต้องมีอยู่จริงใน `T` และ `T[K]` คือ type ของค่าที่ key นั้น

```ts
type User = { id: number; name: string; email: string };

function getProp<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

const user: User = { id: 1, name: 'มะลิ', email: 'mali@example.com' };
const userName = getProp(user, 'name'); // ชนิด: string
const userId = getProp(user, 'id'); // ชนิด: number

getProp(user, 'nmae'); // ❌ Argument of type '"nmae"' is not assignable to parameter of type 'keyof User'.
```

## Generic type

type alias และ interface มี type parameter ได้เหมือนกัน ตัวอย่างนี้คือผลลัพธ์ของการเรียก API ที่ใช้ได้กับข้อมูลทุกแบบ

```ts
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type Lesson = { id: string; title: string };

function success<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

const result = success<Lesson[]>([{ id: 'generics', title: 'Generics' }]);

if (result.ok) {
  console.log(result.data[0]?.title); // → Generics
}
```

type parameter มีค่าเริ่มต้นได้ ใช้ตอนที่ส่วนใหญ่ใช้ type เดิม

```ts
type Page<T = string> = {
  items: T[];
  page: number;
  total: number;
};

const tags: Page = { items: ['ts', 'generics'], page: 1, total: 2 };
const scores: Page<number> = { items: [90, 85], page: 1, total: 2 };
```

## const type parameter

ปกติ TypeScript เดา array เป็น `string[]` ถ้าอยากได้ค่าที่ละเอียดถึงระดับ literal โดยคนเรียกไม่ต้องพิมพ์ `as const` เอง ใส่ `const` หน้า type parameter (มีตั้งแต่ TypeScript 5.0)

```ts
function defineRoutes<const T extends readonly string[]>(routes: T): T {
  return routes;
}

const routes = defineRoutes(['/', '/lessons', '/about']); // ชนิด: readonly ["/", "/lessons", "/about"]
```

## เมื่อไรไม่ต้องใช้ generics

หลักจาก TypeScript Handbook คือ type parameter ควรโผล่อย่างน้อยสองที่ เพื่อเชื่อมความสัมพันธ์ เช่น input กับ output ถ้าโผล่แค่ที่เดียว ใช้ type ธรรมดาก็พอ

```ts
function printLength<T extends { length: number }>(value: T): void {
  console.log(value.length);
}

function printLengthSimple(value: { length: number }): void {
  console.log(value.length);
}
```

สองฟังก์ชันนี้ทำงานเหมือนกันทุกอย่าง แต่แบบที่สองอ่านง่ายกว่า

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `any` แทน generics แล้ว type หายหลังออกจากฟังก์ชัน
- ใส่ type parameter ที่ใช้แค่ครั้งเดียว ทำให้โค้ดซับซ้อนโดยไม่ได้อะไร
- ระบุ type เองทุกครั้ง (`first<string>(names)`) ทั้งที่ TypeScript เดาได้
- ตั้งชื่อ type parameter เป็นตัวอักษรเดียวทั้งที่มีหลายตัว ควรใช้ชื่อสื่อความหมาย เช่น `TKey`, `TValue`

## สรุป

- generics คือ type parameter ที่ถูกเติมตอนเรียกใช้ ส่วนใหญ่ TypeScript เดาให้เอง
- `extends` จำกัดสิ่งที่รับได้ และ `K extends keyof T` คู่กับ `T[K]` คือรูปแบบที่ใช้บ่อยที่สุด
- ใช้เมื่อต้องเชื่อม type ระหว่าง input กับ output ถ้าไม่มีความสัมพันธ์แบบนั้นไม่ต้องใช้

## อ่านเพิ่ม

- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook: Guidelines for Writing Good Generic Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#guidelines-for-writing-good-generic-functions)
- [TypeScript 5.0: const Type Parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)
