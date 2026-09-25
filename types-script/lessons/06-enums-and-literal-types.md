# Enum และ Literal Type

> ชุดค่าคงที่อย่างสถานะคำสั่งซื้อหรือทิศทาง เขียนได้สองแบบใน TypeScript คือ `enum` ที่มีมาตั้งแต่แรก กับ union ของ literal type ที่เบากว่า บทนี้เทียบทั้งสองแบบ และอธิบายว่าทำไมโปรเจกต์สมัยใหม่หันมาใช้แบบหลัง

## บทนี้จะได้อะไร

- ใช้ union ของ literal type เป็นชุดค่าคงที่
- เข้าใจว่า `enum` ทำงานอย่างไร และกลายเป็นโค้ดอะไรตอนรัน
- สร้างชุดค่าคงที่ที่ใช้ได้ทั้งเป็นค่าตอนรันและเป็น type ด้วย object `as const`

## Union ของ literal type

วิธีที่เบาที่สุดคือบอกว่าค่านี้เป็นได้แค่ข้อความไม่กี่แบบ ตอนรันเป็นสตริงธรรมดา อ่านง่ายทั้งใน log, JSON และฐานข้อมูล

```ts
type OrderStatus = 'pending' | 'paid' | 'shipped';

function describe(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'รอชำระเงิน';
    case 'paid':
      return 'ชำระแล้ว';
    case 'shipped':
      return 'จัดส่งแล้ว';
  }
}

console.log(describe('paid')); // → ชำระแล้ว
describe('cancelled'); // ❌ Argument of type '"cancelled"' is not assignable to parameter of type 'OrderStatus'.
```

สังเกตว่าฟังก์ชันไม่ต้องมี `return` ท้ายสุด เพราะ TypeScript รู้ว่า `switch` ครอบคลุมครบทุกค่าแล้ว (เทคนิคตรวจว่าครบอยู่ในบทที่ 7)

## Enum

`enum` ตั้งชื่อให้ชุดค่า ถ้าไม่กำหนดค่าเองจะได้ตัวเลขเรียงจาก 0

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

function move(direction: Direction): string {
  return `เดินไปทาง ${Direction[direction]}`;
}

console.log(Direction.Left); // → 2
console.log(move(Direction.Up)); // → เดินไปทาง Up
const wrong: Direction = 7; // ❌ Type '7' is not assignable to type 'Direction'.
```

enum แบบข้อความกำหนดค่าให้ทุกตัว ข้อควรรู้คือ enum ไม่รับสตริงตรง ๆ แม้ข้อความจะตรงกันทุกตัวอักษร ข้อมูลที่มาจาก API จึงต้องแปลงก่อนเสมอ

```ts
enum OrderStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
}

const status: OrderStatus = OrderStatus.Paid;
const fromApi: OrderStatus = 'PAID'; // ❌ Type '"PAID"' is not assignable to type 'OrderStatus'.

console.log(status); // → PAID
```

## Enum กลายเป็นอะไรตอนรัน

enum เป็นหนึ่งในไม่กี่อย่างของ TypeScript ที่ไม่ได้เป็นแค่ type แต่ต้องสร้างโค้ด JavaScript เพิ่มให้ด้วย นี่คือสิ่งที่ `tsc` สร้างจาก `Direction` (สองค่าแรก) และ `OrderStatus`

```js
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
})(Direction || (Direction = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Pending"] = "PENDING";
    OrderStatus["Paid"] = "PAID";
})(OrderStatus || (OrderStatus = {}));
```

enum ตัวเลขได้ key ย้อนกลับ (`Direction[0]` คือ `"Up"`) มาด้วย ทำให้ `Object.values(Direction)` ได้ `['Up', 'Down', 0, 1]` ทั้งชื่อและตัวเลขปนกัน ต้องระวังเวลาวนลูป

## ทำไม Node.js รัน enum ไม่ได้

Node รันไฟล์ `.ts` ด้วยการลบ type ทิ้งเฉย ๆ แต่ enum ต้องสร้างโค้ดใหม่ขึ้นมา Node จึงหยุดตั้งแต่ก่อนรัน

```text
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode
```

`erasableSyntaxOnly` ใน tsconfig ของคอร์สนี้มีไว้จับเรื่องนี้ตั้งแต่ตอนตรวจ (`const enum` ก็โดนเหมือนกัน)

```text
src/status.ts:1:6 - error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

enum ยังใช้ได้ในโปรเจกต์ที่ให้ `tsc` หรือ bundler แปลงเป็น JavaScript ก่อนรัน (ต้องปิด `erasableSyntaxOnly`) และจะเจอบ่อยในโค้ดเก่าหรือไลบรารีที่มีอยู่แล้ว

## ทางเลือก: object `as const`

ถ้าต้องการทั้งค่าที่ใช้ตอนรัน (เช่น เอาไปวนสร้างตัวเลือกบนหน้าจอ) และ type ในชื่อเดียวกัน ใช้ object คู่กับ `as const` แล้วดึง type ของค่าออกมา

```ts
const OrderStatus = {
  Pending: 'PENDING',
  Paid: 'PAID',
  Shipped: 'SHIPPED',
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]; // ชนิด: "PAID" | "PENDING" | "SHIPPED"

function isPaid(status: OrderStatus): boolean {
  return status === OrderStatus.Paid;
}

console.log(isPaid('PAID')); // → true
console.log(Object.values(OrderStatus)); // → ['PENDING', 'PAID', 'SHIPPED']
```

อ่าน type บรรทัดนั้นจากในออกนอก `typeof OrderStatus` คือ type ของ object · `keyof` คือชื่อ key ทั้งหมด · `[...]` ดึง type ของค่าตาม key เหล่านั้น (ละเอียดในบทที่ 9) ชื่อ `OrderStatus` ใช้ได้ทั้งเป็นค่าและเป็น type เพราะ TypeScript แยกสองโลกนี้ออกจากกัน

## เปรียบเทียบ

| | union ของ literal | `enum` | object `as const` |
|---|---|---|---|
| มีค่าให้ใช้ตอนรัน | ไม่มี มีแค่ type | มี | มี |
| Node รันไฟล์ `.ts` ตรง ๆ ได้ | ได้ | ไม่ได้ | ได้ |
| รับสตริงจาก API ได้ตรง ๆ | ได้ | ไม่ได้ ต้องแปลง | ได้ |
| วนดูค่าทั้งหมด | ไม่ได้ | ได้ แต่ enum ตัวเลขมี key ย้อนกลับปน | ได้ |

> [!TIP]
> โค้ดใหม่ใช้ union ของ literal เป็นค่าเริ่มต้น ถ้าต้องใช้ค่าตอนรันด้วยค่อยเปลี่ยนเป็น object `as const` ส่วน enum เก็บไว้สำหรับอ่านและดูแลโค้ดเดิม

## ข้อผิดพลาดที่พบบ่อย

- เอาสตริงจาก API ใส่ enum ตรง ๆ แล้วงงว่าทำไม TypeScript ไม่ยอม
- วนลูป `Object.values` ของ enum ตัวเลขแล้วได้ทั้งชื่อและตัวเลขปนกัน
- ใช้ enum ในโปรเจกต์ที่รันไฟล์ `.ts` ด้วย Node ตรง ๆ แล้วเจอ `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`
- เขียนชุดค่าคงที่ซ้ำสองที่ (ทั้ง array และ union) แทนที่จะดึง type จากค่าที่มีอยู่แล้ว

## สรุป

- union ของ literal type เบาที่สุดและเป็นสตริงธรรมดาตอนรัน
- enum สร้างโค้ดจริงตอนรัน รับสตริงตรง ๆ ไม่ได้ และ Node รันแบบลบ type เฉย ๆ ไม่ได้
- object `as const` ให้ทั้งค่าตอนรันและ type ในชื่อเดียว เป็นทางเลือกแทน enum ในโค้ดใหม่

## อ่านเพิ่ม

- [TypeScript Handbook: Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [TypeScript Handbook: Literal Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)
- [TSConfig: erasableSyntaxOnly](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly)
