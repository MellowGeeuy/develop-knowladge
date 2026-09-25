# การทดสอบโค้ด TypeScript

> type ตรวจว่าโค้ดต่อกันถูก แต่ไม่ได้ตรวจว่าคำนวณถูก ราคาที่คิดส่วนลดผิดก็ยังเป็น `number` ที่ type ถูกต้องทุกประการ บทนี้เขียนเทสต์เป็นไฟล์ `.ts` ด้วย `node:test` ที่มากับ Node.js และทดสอบตัว type เองในโค้ดที่ type คือหัวใจของงาน

## บทนี้จะได้อะไร

- เขียนและรันเทสต์ไฟล์ `.ts` ด้วย `node:test` โดยไม่ต้องติดตั้งอะไรเพิ่ม
- ทดสอบ error, งาน async และใช้ mock แบบมี type
- ทดสอบ type ด้วย `@ts-expect-error` และ type helper

## โค้ดที่จะทดสอบ

```ts file=src/cart.ts
export type CartItem = {
  sku: string;
  price: number;
  quantity: number;
};

export function subtotal(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function applyDiscount(amount: number, percent: number): number {
  if (percent < 0 || percent > 100) {
    throw new RangeError(`ส่วนลดต้องอยู่ระหว่าง 0-100 ได้ ${percent}`);
  }
  return Math.round(amount * (100 - percent)) / 100;
}
```

## เทสต์แรก

ไฟล์เทสต์ตั้งชื่อลงท้ายด้วย `.test.ts` วางไว้ข้างไฟล์ที่ทดสอบ แล้ว import `describe`, `it` จาก `node:test` กับ `assert` แบบเข้มงวดจาก `node:assert/strict`

```ts file=src/cart.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount, subtotal, type CartItem } from './cart.ts';

describe('subtotal', () => {
  it('รวมราคาตามจำนวนชิ้น', () => {
    const items: CartItem[] = [
      { sku: 'A', price: 120, quantity: 2 },
      { sku: 'B', price: 80, quantity: 1 },
    ];
    assert.equal(subtotal(items), 320);
  });

  it('ตะกร้าว่างได้ 0', () => {
    assert.equal(subtotal([]), 0);
  });
});

describe('applyDiscount', () => {
  it('ลด 10% จาก 320 เหลือ 288', () => {
    assert.equal(applyDiscount(320, 10), 288);
  });

  it('ส่วนลดเกิน 100 โยน RangeError', () => {
    assert.throws(() => applyDiscount(320, 120), RangeError);
  });
});
```

สั่ง `node --test` แล้ว Node 24 หาไฟล์ `*.test.ts` ในโปรเจกต์ให้เอง (ตัวเลขเวลาในวงเล็บต่างกันไปทุกครั้ง)

```text
▶ subtotal
  ✔ รวมราคาตามจำนวนชิ้น (0.4827ms)
  ✔ ตะกร้าว่างได้ 0 (0.0968ms)
✔ subtotal (1.2691ms)
▶ applyDiscount
  ✔ ลด 10% จาก 320 เหลือ 288 (0.1313ms)
  ✔ ส่วนลดเกิน 100 โยน RangeError (0.2738ms)
✔ applyDiscount (0.5412ms)
ℹ tests 4
ℹ suites 2
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 99.4992
```

ตัวเทสต์เองก็ผ่าน `tsc` ด้วย ถ้าวันหนึ่ง `CartItem` เปลี่ยนรูปร่าง เทสต์ที่สร้างข้อมูลผิดรูปร่างจะถูกฟ้องก่อนรันเสียอีก

## ทดสอบงาน async ด้วย mock

อย่าให้เทสต์ส่งอีเมลหรือเรียก API จริง ส่งฟังก์ชันปลอม (mock) เข้าไปแทน `mock.fn<Sender>` สร้างฟังก์ชันที่มี type ตรงกับ `Sender` และจำว่าถูกเรียกกี่ครั้งด้วยอะไรบ้าง

```ts file=src/notify.ts
export type Sender = (to: string, message: string) => Promise<boolean>;

export async function notifyReaders(readers: readonly string[], send: Sender): Promise<number> {
  const results = await Promise.all(readers.map((reader) => send(reader, 'มีบทเรียนใหม่')));
  return results.filter(Boolean).length;
}
```

```ts file=src/notify.test.ts
import { it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { notifyReaders, type Sender } from './notify.ts';

it('นับเฉพาะคนที่ส่งสำเร็จ', async () => {
  const send = mock.fn<Sender>(async (to) => to !== 'bounce@example.com');

  const sent = await notifyReaders(['a@example.com', 'bounce@example.com'], send);

  assert.equal(sent, 1);
  assert.equal(send.mock.callCount(), 2);
  assert.deepEqual(send.mock.calls[1]?.arguments, ['bounce@example.com', 'มีบทเรียนใหม่']);
});
```

การรับ `send` เป็นพารามิเตอร์แทนการ import ตัวส่งจริงเข้ามาตรง ๆ คือสิ่งที่ทำให้โค้ดนี้ทดสอบง่าย

## ทดสอบตัว type

ถ้า type คือส่วนสำคัญของงาน เช่น ไลบรารีหรือฟังก์ชันที่ต้องปฏิเสธข้อมูลผิดรูปร่าง ทดสอบได้ด้วย `// @ts-expect-error` ซึ่งแปลว่า "บรรทัดถัดไปต้องมี error" ใส่เหตุผลต่อท้ายได้ ไฟล์แบบนี้ตรวจด้วย `tsc` อย่างเดียว ไม่ต้องรัน

```ts file=src/cart.types.ts
import { applyDiscount, subtotal } from './cart.ts';

// @ts-expect-error ราคาต้องเป็นตัวเลข ไม่ใช่ข้อความ
subtotal([{ sku: 'A', price: '120', quantity: 1 }]);

// @ts-expect-error ต้องส่งเปอร์เซ็นต์ส่วนลดมาด้วย
applyDiscount(320);

// @ts-expect-error บรรทัดถัดไปไม่มี error จริง directive นี้จึงถูกฟ้องแทน // ❌ Unused '@ts-expect-error' directive.
subtotal([]);
```

ถ้าวันหนึ่งมีคนแก้จน `subtotal` รับราคาเป็นข้อความได้ บรรทัด `@ts-expect-error` บรรทัดแรกจะกลายเป็น error ทันที เหมือนตัวอย่างสุดท้าย

ถ้าอยากตรวจว่า type ที่ได้ตรงกับที่ต้องการทุกตัวอักษร ใช้ type helper สองตัวนี้ (รูปแบบที่ใช้กันทั่วไปในไลบรารี)

```ts file=src/cart.return-types.ts
import { subtotal } from './cart.ts';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

type SubtotalIsNumber = Expect<Equal<ReturnType<typeof subtotal>, number>>;
type SubtotalIsString = Expect<Equal<ReturnType<typeof subtotal>, string>>; // ❌ Type 'false' does not satisfy the constraint 'true'.
```

## ลำดับการตรวจ

| คำสั่ง | ตรวจอะไร |
|---|---|
| `npm run check` (`tsc`) | type ถูกทั้งโปรเจกต์ รวมไฟล์เทสต์และไฟล์ทดสอบ type |
| `npm run lint` | รูปแบบที่มักเป็นบั๊ก (บทที่ 20) |
| `npm test` (`node --test`) | พฤติกรรมถูกต้องตอนรันจริง |

ให้ CI สั่งตามลำดับนี้ ด่านแรกเร็วที่สุดและจับปัญหาได้มากที่สุด

> [!TIP]
> ถ้าต้องการ watch mode ที่เลือกรันเฉพาะเทสต์ที่เกี่ยวข้อง coverage หรือ snapshot แบบพร้อมใช้ Vitest เป็นทางเลือกยอดนิยม รันไฟล์ `.ts` ได้เอง และมี `expectTypeOf` สำหรับทดสอบ type ในตัว

## ข้อผิดพลาดที่พบบ่อย

- คิดว่าผ่าน `tsc` แล้วไม่ต้องมีเทสต์ ทั้งที่ type ไม่ได้ตรวจตรรกะการคำนวณ
- ใช้ `as` สร้างข้อมูลในเทสต์จนเทสต์ผ่านทั้งที่ข้อมูลผิดรูปร่าง
- ใช้ `@ts-ignore` แทน `@ts-expect-error` ทำให้ไม่รู้ตัวเมื่อ error หายไปแล้ว
- ให้เทสต์เรียกบริการจริง (อีเมล API) แทนการส่ง mock เข้าไป

## สรุป

- Node 24 รันเทสต์ไฟล์ `.ts` ได้ด้วย `node --test` และ `node:test` ใช้ได้เลยโดยไม่ต้องติดตั้งอะไร
- `mock.fn<Type>` สร้าง mock ที่มี type ตรงกับของจริงและจำการเรียกทุกครั้ง
- `@ts-expect-error` กับ `Expect<Equal<...>>` ทดสอบตัว type และ `tsc` คือด่านแรกของการทดสอบเสมอ

## อ่านเพิ่ม

- [Node.js: Test runner](https://nodejs.org/api/test.html)
- [TypeScript 3.9: // @ts-expect-error Comments](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html)
- [Vitest: Testing Types](https://vitest.dev/guide/testing-types.html)
