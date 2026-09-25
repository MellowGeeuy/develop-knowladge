# Type พื้นฐานและ Type Inference

> TypeScript ไม่ได้ต้องการให้เขียน type ทุกบรรทัด ส่วนใหญ่มันเดา type จากค่าได้เอง (type inference) หน้าที่ของเราคือรู้ว่า type พื้นฐานมีอะไรบ้าง และรู้ว่าตรงไหนควรเขียนเอง

## บทนี้จะได้อะไร

- แยกได้ว่าเมื่อไรควรเขียน type เอง เมื่อไรปล่อยให้ TypeScript เดา
- ใช้ type พื้นฐาน array, tuple และ literal type
- เข้าใจ `any`, `unknown`, `never` และการจัดการ `null` กับ `undefined`

## เขียนเอง กับ ให้ TypeScript เดา

การเขียน type ต่อท้ายชื่อเรียกว่า type annotation แต่ถ้ากำหนดค่าตั้งต้นให้เลย TypeScript จะเดา type จากค่านั้นได้เอง

```ts
let score: number = 0; // เขียนเอง
let level = 1; // ชนิด: number
const siteName = 'The Brain'; // ชนิด: "The Brain"

level = 'สอง'; // ❌ Type 'string' is not assignable to type 'number'.
```

> [!NOTE]
> `// ชนิด:` ในคอร์สนี้คือ type ที่ TypeScript เดาได้ ตรงกับที่เห็นเมื่อเอาเมาส์ชี้ชื่อตัวแปรใน VS Code

แนวทางที่ใช้กันทั่วไปคือ **ปล่อยให้เดาเมื่อค่าบอกชัดอยู่แล้ว** และ **เขียนเองที่ขอบของโค้ด** ได้แก่พารามิเตอร์ของฟังก์ชัน ค่าที่ฟังก์ชัน export คืน และตัวแปรที่ประกาศไว้ก่อนแล้วค่อยใส่ค่าทีหลัง

## Type พื้นฐาน

| type | ตัวอย่างค่า |
|---|---|
| `string` | `'สวัสดี'`, `` `บทที่ ${n}` `` |
| `number` | `42`, `3.14`, `NaN` |
| `boolean` | `true`, `false` |
| `bigint` | `9007199254740993n` |
| `symbol` | `Symbol('id')` |
| `null`, `undefined` | ค่าว่างแบบตั้งใจ และค่าที่ยังไม่ได้กำหนด |

ใช้ชื่อตัวพิมพ์เล็กเสมอ `String` หรือ `Number` ตัวใหญ่คือ type ของ object ห่อ (wrapper) ซึ่งแทบไม่มีใครใช้

## Literal type

`const` เปลี่ยนค่าไม่ได้ TypeScript จึงเดา type เป็นค่านั้นค่าเดียว (literal type) ส่วน `let` ยังเปลี่ยนได้ จึงได้ type ที่กว้างกว่า

```ts
const direction = 'left'; // ชนิด: "left"
let status = 'draft'; // ชนิด: string
```

literal type มีประโยชน์ที่สุดเมื่อเอามารวมกันเป็นชุดค่าที่อนุญาต (union ใช้เครื่องหมาย `|` ละเอียดในบทที่ 7)

```ts
let align: 'left' | 'center' | 'right' = 'left';

align = 'center';
align = 'middle'; // ❌ Type '"middle"' is not assignable to type '"center" | "left" | "right"'.
```

พิมพ์ผิดตัวเดียวก็ถูกจับได้ และ editor เติมค่าที่อนุญาตให้ตอนพิมพ์ สังเกตว่าในข้อความ error ลำดับของค่าไม่ตรงกับที่เราเขียน เพราะ TypeScript 7 เรียงสมาชิกของ union ใหม่ให้คงที่ทุกครั้ง ความหมายเหมือนเดิมทุกอย่าง

## Array และ Tuple

array เขียนได้สองแบบ `number[]` กับ `Array<number>` ความหมายเหมือนกัน

```ts
const scores: number[] = [90, 85, 77];
const names = ['มะลิ', 'ต้นกล้า']; // ชนิด: string[]
const mixed = [1, 'สอง', true]; // ชนิด: (string | number | boolean)[]

scores.push('แปดสิบ'); // ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
```

ถ้าไม่อยากให้ใครแก้ array ใช้ `readonly` นำหน้า เมธอดที่แก้ของเดิมจะหายไปจาก type

```ts
const weekdays: readonly string[] = ['จันทร์', 'อังคาร'];

weekdays.push('พุธ'); // ❌ Property 'push' does not exist on type 'readonly string[]'.
```

tuple คือ array ที่รู้ทั้งจำนวนและ type ของแต่ละช่อง ใช้กับค่าที่มาเป็นคู่หรือเป็นชุดตายตัว ใส่ชื่อให้แต่ละช่องได้เพื่อให้อ่านง่าย

```ts
const point: [x: number, y: number] = [10, 20];
const [x, y] = point;

console.log(x + y); // → 30
const wrong: [number, number] = [10, 20, 30]; // ❌ Type '[number, number, number]' is not assignable to type '[number, number]'.
```

## อ่าน array ด้วย index

คอร์สนี้เปิด `noUncheckedIndexedAccess` (บทที่ 2) การอ่านด้วย index จึงได้ `undefined` พ่วงมาด้วย เพราะ index นั้นอาจไม่มีอยู่จริง

```ts
const lessons = ['ตัวแปร', 'ฟังก์ชัน'];
const first = lessons[0]; // ชนิด: string | undefined

console.log(first.length); // ❌ 'first' is possibly 'undefined'.

if (first !== undefined) {
  console.log(first.length); // → 6
}
```

ดูน่ารำคาญตอนแรก แต่คือบั๊กที่เจอบ่อยที่สุดตัวหนึ่ง (อ่าน array ว่างแล้วพัง) ถ้าแน่ใจจริง ๆ ว่ามีค่า ใช้ลูป `for...of` หรือ `.at()` คู่กับการเช็กค่าแทน

## `as const`

`as const` บอก TypeScript ว่าค่านี้จะไม่เปลี่ยนเลย ทุกช่องกลายเป็น `readonly` และเป็น literal type

```ts
const levels = ['พื้นฐาน', 'กลาง', 'สูง'] as const; // ชนิด: readonly ["พื้นฐาน", "กลาง", "สูง"]
const theme = { mode: 'dark', size: 16 } as const; // ชนิด: { readonly mode: "dark"; readonly size: 16; }
```

ใช้บ่อยมากกับค่าคงที่ของโปรแกรม และเป็นฐานของเทคนิคในบทที่ 6 และ 9

## `any` กับ `unknown`

`any` คือการปิดการตรวจ ทำอะไรกับค่านั้นก็ได้ TypeScript ไม่ฟ้องเลย `JSON.parse` คืนค่าเป็น `any` จึงเป็นทางที่บั๊กเล็ดลอดเข้ามาบ่อยที่สุด

```ts
const data = JSON.parse('{"name":"มะลิ"}'); // ชนิด: any

try {
  data.nmae.toUpperCase();
} catch (error) {
  console.log(String(error)); // → TypeError: Cannot read properties of undefined (reading 'toUpperCase')
}
```

พิมพ์ `nmae` ผิดแต่ไม่มีใครฟ้อง ไปพังตอนรัน `unknown` คือทางเลือกที่ปลอดภัยกว่า มันแปลว่า "ยังไม่รู้" จึงห้ามใช้จนกว่าจะตรวจให้แน่ก่อน

```ts
const data: unknown = JSON.parse('{"name":"มะลิ"}');

console.log(data.name); // ❌ 'data' is of type 'unknown'.

if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log(data.name); // → มะลิ
}
```

วิธีตรวจ `unknown` ให้กลายเป็น type ที่ใช้ได้อยู่ในบทที่ 7 และ 17

## `null` และ `undefined`

เมื่อเปิด `strict` ค่า `null` และ `undefined` ไม่ได้แอบอยู่ในทุก type อีกต่อไป ถ้าค่าไหนว่างได้ต้องเขียนไว้ใน type ให้เห็น แล้ว TypeScript จะบังคับให้เช็กก่อนใช้

```ts
function shout(name: string | null): string {
  return name.toUpperCase(); // ❌ 'name' is possibly 'null'.
}

function shoutSafely(name: string | null): string {
  return name?.toUpperCase() ?? 'ไม่มีชื่อ';
}

console.log(shoutSafely(null)); // → ไม่มีชื่อ
```

## `never`

`never` คือ type ที่ไม่มีค่าไหนเป็นได้เลย เจอบ่อยในสองที่ คือฟังก์ชันที่ไม่มีวันคืนค่า (โยน error เสมอ) และการตรวจว่าจัดการครบทุกกรณี (บทที่ 7)

```ts
function fail(message: string): never {
  throw new Error(message);
}

try {
  fail('ข้อมูลไม่ครบ');
} catch (error) {
  console.log(error instanceof Error ? error.message : error); // → ข้อมูลไม่ครบ
}
```

## ข้อผิดพลาดที่พบบ่อย

- ใส่ type ให้ทุกตัวแปรทั้งที่ค่าบอกชัดอยู่แล้ว โค้ดรกโดยไม่ได้อะไรเพิ่ม
- ใช้ `String`, `Number`, `Boolean` ตัวใหญ่แทนตัวเล็ก
- ใช้ `any` เพื่อหนี error ทั้งที่ควรเป็น `unknown` แล้วตรวจก่อนใช้
- ลืมว่า `let` ได้ type กว้างกว่า `const` แล้วเอาไปใส่ในที่ที่ต้องการ literal type

## สรุป

- ปล่อยให้ TypeScript เดาเมื่อค่าบอกชัด และเขียน type เองที่ขอบของโค้ด
- literal type กับ `as const` ทำให้ type ละเอียดถึงระดับค่า
- `unknown` ปลอดภัยกว่า `any` เสมอ และเมื่อเปิด `strict` ค่าว่างต้องเขียนไว้ใน type ให้เห็น

## อ่านเพิ่ม

- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook: Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [TSConfig: noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess)
