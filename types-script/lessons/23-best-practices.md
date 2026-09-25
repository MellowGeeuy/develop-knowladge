# Best Practices และ Anti-patterns

> TypeScript มีค่าเท่ากับความจริงของ type ในโปรแกรม ถ้า type โกหกเพียงจุดเดียว ทุกจุดที่เชื่อ type นั้นก็ผิดตามไปหมด บทสุดท้ายรวมรูปแบบที่ทำให้ type โกหก วิธีออกแบบ type ให้ตรงกับความจริง และข้อตกลงที่ทีมควรใช้ร่วมกัน

## บทนี้จะได้อะไร

- รู้จักสามทางลัดที่ทำให้ type โกหก และสิ่งที่ควรใช้แทน
- ออกแบบ type ที่ไม่มีสถานะที่เป็นไปไม่ได้ ใช้ branded type และ `readonly`
- ข้อตกลงการตั้งชื่อ และรายการตรวจก่อนส่งงาน

## สามทางลัดที่ทำให้ type โกหก

| แทนที่จะใช้ | ให้ใช้ | เพราะ |
|---|---|---|
| `any` | `unknown` แล้วตรวจ | `any` ปิดการตรวจ และลามไปทุกค่าที่แตะมัน |
| `as` | narrowing, `satisfies`, ฟังก์ชัน parse | `as` บอกให้เชื่อโดยไม่มีการตรวจ |
| `!` | เช็กด้วย `if` หรือใส่ค่าสำรองด้วย `??` | `!` ตัด `null` ทิ้งโดยไม่มีการตรวจ |

`any` อันตรายกว่าที่เห็น เพราะทุกอย่างที่ได้จากค่า `any` ก็เป็น `any` ต่อไปเรื่อย ๆ พิมพ์ผิดตรงไหนก็ไม่มีใครเตือน

```ts
const payload: any = JSON.parse('{"name":"มะลิ"}');

const name = payload.name; // ชนิด: any
const upper = payload.nmae?.toUpperCase(); // ชนิด: any

console.log(upper); // → undefined
```

## ให้เดาเมื่อทำได้ เขียนเองที่ขอบ

- ไม่ต้องใส่ type ให้ตัวแปรที่ค่าบอกชัดอยู่แล้ว (`const count = 0` ไม่ต้องเป็น `const count: number = 0`)
- เขียน type ให้พารามิเตอร์เสมอ และเขียน return type ให้ฟังก์ชันที่ export ออกไป (บทที่ 4)
- ใช้ `satisfies` กับค่าตั้งค่าแทนการใส่ type ทับ (บทที่ 9)
- ดึง type จากสิ่งที่มีอยู่แล้วด้วย `typeof`, `ReturnType`, `z.infer` แทนการเขียนซ้ำ (บทที่ 9, 10, 17)

## ไม่มีสถานะที่เป็นไปไม่ได้

type ที่ใช้ boolean และ property ที่ไม่บังคับหลายตัวปล่อยให้เกิดสถานะที่ไม่มีทางถูก เช่น กำลังโหลดแต่มี error ด้วย discriminated union (บทที่ 7) ตัดสถานะพวกนั้นออกตั้งแต่ระดับ type

```ts
type RequestState =
  | { status: 'loading' }
  | { status: 'failed'; error: string }
  | { status: 'loaded'; data: string[] };

const loading: RequestState = { status: 'loading' };
const impossible: RequestState = { status: 'loading', error: 'หมดเวลา' }; // ❌ Object literal may only specify known properties, and 'error' does not exist in type '{ status: "loading"; }'.
```

## Branded type: กันการสลับค่าที่ type เดียวกัน

รหัสผู้ใช้กับรหัสคำสั่งซื้อเป็น `string` ทั้งคู่ ส่งสลับกันก็ไม่มีใครเตือน branded type ติด "ป้าย" ให้ type ที่มีอยู่แค่ตอนตรวจ ทำให้สองอย่างนี้ใช้แทนกันไม่ได้

```ts
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function toUserId(value: string): UserId {
  if (!value.startsWith('u_')) {
    throw new Error(`รหัสผู้ใช้ไม่ถูกต้อง: ${value}`);
  }
  return value as UserId;
}

function cancelOrder(orderId: OrderId): string {
  return `ยกเลิก ${orderId}`;
}

const userId = toUserId('u_1024');
console.log(userId.length); // → 6
cancelOrder(userId); // ❌ Argument of type 'UserId' is not assignable to parameter of type 'OrderId'.
```

`as` ใน `toUserId` คือจุดเดียวที่ยอมให้ใช้ เพราะอยู่หลังการตรวจจริง ส่วนอื่นของโปรแกรมได้ `UserId` จากฟังก์ชันนี้ทางเดียว

## รับ input เป็น readonly

ฟังก์ชันที่รับ array มาอ่านอย่างเดียวให้รับเป็น `readonly` เป็นการสัญญากับคนเรียกว่าจะไม่แก้ข้อมูลของเขา และ TypeScript คอยกันไม่ให้เราเผลอผิดสัญญา

```ts
function median(scores: readonly number[]): number {
  scores.sort(); // ❌ Property 'sort' does not exist on type 'readonly number[]'.
  const sorted = scores.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted[middle] ?? 0;
}
```

`sort` แก้ array เดิม (บทที่ 7 ของคอร์ส JavaScript) ส่วน `toSorted` คืน array ใหม่ จึงใช้กับ `readonly` ได้

## ข้อตกลงการตั้งชื่อ

| สิ่งที่ตั้งชื่อ | รูปแบบ | ตัวอย่าง |
|---|---|---|
| type, interface, class, enum | PascalCase ไม่ต้องมี `I` นำหน้า | `User`, `LessonProgress` |
| type parameter | `T` ตัวเดียว หรือขึ้นต้นด้วย `T` เมื่อมีหลายตัว | `T`, `TKey`, `TValue` |
| ตัวแปรและฟังก์ชัน | camelCase | `totalMinutes`, `parseLesson` |
| ค่าคงที่ของทั้งโปรแกรม | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| ค่า boolean | ขึ้นต้นด้วย is, has, can, should | `isRead`, `hasAccess` |
| ชื่อไฟล์ | kebab-case | `lesson-progress.ts` |

## อย่าเขียน type ให้ฉลาดเกินจำเป็น

type ที่อ่านง่ายดีกว่า type ที่ฉลาดแต่ไม่มีใครในทีมอ่านออก เริ่มจาก type ธรรมดาเสมอ ใช้ generics เมื่อต้องเชื่อม input กับ output จริง (บทที่ 8) และใช้ mapped หรือ conditional type เมื่อช่วยตัดโค้ดซ้ำหรือจับบั๊กได้จริงเท่านั้น (บทที่ 11) ถ้า error message ยาวจนอ่านไม่ออก นั่นคือสัญญาณว่า type ซับซ้อนเกินไปแล้ว

## ตรวจก่อนส่งงาน

| ตรวจ | ผ่านเมื่อ |
|---|---|
| `npm run check` | `tsc` ไม่มี error |
| `npm run lint` | ไม่มี error และไม่มี `any` เพิ่มขึ้น |
| `npm test` | เทสต์ผ่านทั้งหมด |
| ข้อมูลจากภายนอก | ผ่านฟังก์ชัน parse หรือ schema ก่อนใช้ทุกครั้ง |
| `as`, `!`, `@ts-expect-error` | ทุกจุดมีเหตุผลเขียนกำกับไว้ |

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `any` หรือ `as` เพื่อให้ผ่านไปก่อน แล้วไม่เคยกลับมาแก้
- ออกแบบ type เป็น boolean หลายตัวจนเกิดสถานะที่เป็นไปไม่ได้
- ส่งค่าที่ type เหมือนกันแต่ความหมายต่างกันสลับกันได้ เพราะไม่ได้ใช้ branded type ในจุดสำคัญ
- เขียน type ซับซ้อนเพื่อโชว์ ทั้งที่ type ธรรมดาทำงานได้เท่ากัน

## สรุป

- `unknown` แทน `any`, การตรวจจริงแทน `as` และการเช็กแทน `!` ทำให้ type ตรงกับความจริงตลอด
- ออกแบบ type ให้สถานะที่เป็นไปไม่ได้เขียนไม่ได้ และใช้ branded type กับ `readonly` ในจุดที่พลาดง่าย
- ทีมใช้ข้อตกลงเดียวกันทั้งการตั้งชื่อและรายการตรวจก่อนส่งงาน

## อ่านเพิ่ม

- [TypeScript Handbook: Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [typescript-eslint: Rules](https://typescript-eslint.io/rules/)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
