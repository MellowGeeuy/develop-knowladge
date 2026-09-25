# Decorators

> decorator คือฟังก์ชันที่ห่อ class หรือเมธอดไว้ เพิ่มพฤติกรรมได้โดยไม่ต้องแก้โค้ดข้างใน เขียนด้วย `@ชื่อ` วางไว้หน้าสิ่งที่ต้องการห่อ TypeScript รองรับ decorator มาตรฐานของ JavaScript ตั้งแต่ 5.0 แต่ Node.js ยังรัน syntax นี้เองไม่ได้ จึงต้องแปลงด้วย `tsc` ก่อนเสมอ

## บทนี้จะได้อะไร

- เขียน decorator ของเมธอดที่มี type ครบ และ decorator แบบรับค่า (factory)
- ใช้ `addInitializer` และเขียน decorator ของ class
- ตั้งค่าโปรเจกต์ให้รันโค้ดที่มี decorator ได้ และแยก decorator มาตรฐานกับ `experimentalDecorators` ออกจากกัน

## ต้องแปลงก่อนรัน

Node.js ที่รันไฟล์ `.ts` ด้วยการลบ type ไม่ได้แปลง syntax อื่นให้ และ Node เองยังไม่รองรับ decorator ลองรันตรง ๆ กับ Node 24 จะได้

```text
SyntaxError: Invalid or unexpected token
```

โปรเจกต์ที่ใช้ decorator จึงต้องให้ `tsc` แปลงเป็น JavaScript ก่อน และต้องตั้ง `target` ไม่เกิน `es2025` เพราะถ้าเป็น `esnext` `tsc` จะปล่อย decorator ไว้ในผลลัพธ์ตามเดิม ซึ่งก็รันไม่ได้อีก

```json file=tsconfig.json
{
  "compilerOptions": {
    "target": "es2025",
    "module": "nodenext",
    "lib": ["esnext"],
    "types": ["node"],
    "strict": true,
    "rootDir": "src",
    "outDir": "dist",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

```bash
npx tsc
node dist/index.js
```

## Decorator ของเมธอด

decorator ของเมธอดได้รับของสองอย่าง คือเมธอดเดิม กับ `context` ที่บอกชื่อและรายละเอียดของเมธอดนั้น แล้วคืนฟังก์ชันใหม่มาแทน type ที่ยาวหน่อยนี้คือรูปแบบมาตรฐานที่ทำให้ decorator ใช้ได้กับเมธอดทุกแบบโดยไม่เสีย type

```ts
function logged<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log(`เรียก ${name}(${args.join(', ')})`);
    return target.call(this, ...args);
  };
}

class Calculator {
  @logged
  add(a: number, b: number): number {
    return a + b;
  }
}

console.log(new Calculator().add(2, 3));
// ผลลัพธ์
// เรียก add(2, 3)
// 5
```

`Args` กับ `Return` ทำให้ฟังก์ชันที่ห่อแล้วยังรับพารามิเตอร์และคืนค่า type เดิมทุกอย่าง `add` ยังเป็น `(a: number, b: number) => number` เหมือนก่อนใส่ decorator

## Decorator ที่รับค่า

ถ้าอยากส่งค่าให้ decorator เขียนฟังก์ชันที่คืน decorator อีกชั้นหนึ่ง (decorator factory) แล้วเรียกพร้อมวงเล็บ

```ts
function deprecated(advice: string) {
  return function <This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ) {
    let warned = false;
    return function (this: This, ...args: Args): Return {
      if (!warned) {
        console.log(`${String(context.name)} เลิกใช้แล้ว ${advice}`);
        warned = true;
      }
      return target.call(this, ...args);
    };
  };
}

class Cart {
  items = [120, 80];

  @deprecated('ให้ใช้ total แทน')
  sum(): number {
    return this.total();
  }

  total(): number {
    return this.items.reduce((sum, price) => sum + price, 0);
  }
}

const cart = new Cart();
cart.sum();
console.log(cart.sum());
// ผลลัพธ์
// sum เลิกใช้แล้ว ให้ใช้ total แทน
// 200
```

## addInitializer: ผูก this ให้เมธอด

`context.addInitializer` สั่งให้ทำงานบางอย่างตอนสร้าง object ตัวอย่างคลาสสิกคือผูก `this` ให้เมธอด เพื่อให้ดึงเมธอดออกไปใช้เป็น callback ได้โดย `this` ไม่หาย

```ts
function bound<This extends object, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  context.addInitializer(function (this: This) {
    Object.defineProperty(this, context.name, { value: target.bind(this) });
  });
}

class Counter {
  count = 0;

  @bound
  increment(): number {
    this.count += 1;
    return this.count;
  }
}

const { increment } = new Counter();
increment();

console.log(increment()); // → 2
```

ถ้าไม่มี `@bound` บรรทัด `increment()` จะพังทันที เพราะ `this` ในเมธอดที่ถูกดึงออกมาเป็น `undefined`

## Decorator ของ class

decorator ของ class ได้รับตัว class ทั้งตัว ใช้บ่อยกับการลงทะเบียน class ไว้ในที่เดียว เช่น ช่องทางแจ้งเตือนทั้งหมดของระบบ

```ts
const channels = new Map<string, new () => { send(message: string): string }>();

function channel(name: string) {
  return function (target: new () => { send(message: string): string }, context: ClassDecoratorContext) {
    channels.set(name, target);
  };
}

@channel('email')
class EmailChannel {
  send(message: string): string {
    return `ส่งอีเมล: ${message}`;
  }
}

const Channel = channels.get('email');
if (Channel) {
  console.log(new Channel().send('ยินดีต้อนรับ')); // → ส่งอีเมล: ยินดีต้อนรับ
}
```

## experimentalDecorators: แบบเก่า

ก่อนมีมาตรฐาน TypeScript มี decorator แบบทดลองของตัวเองมานาน เปิดด้วย `experimentalDecorators` (มักคู่กับ `emitDecoratorMetadata`) สองแบบนี้เขียนต่างกันและใช้ปนกันไม่ได้

| | มาตรฐาน (TypeScript 5.0 ขึ้นไป) | `experimentalDecorators` |
|---|---|---|
| เปิดอย่างไร | ไม่ต้องตั้งอะไร | ตั้ง `"experimentalDecorators": true` |
| พารามิเตอร์ของ decorator เมธอด | `(value, context)` | `(target, propertyKey, descriptor)` |
| decorator ที่พารามิเตอร์ของฟังก์ชัน | ไม่มี | มี |
| ใช้กับ | โค้ดใหม่ | framework ที่เกิดก่อนมาตรฐาน เช่น NestJS |

ถ้าใช้ framework ให้ตั้งค่าตามเอกสารของ framework นั้น ตัวอย่างเช่นโปรเจกต์ตั้งต้นของ NestJS เปิดทั้ง `experimentalDecorators` และ `emitDecoratorMetadata` ไว้ ส่วนโค้ดที่เขียนเองใหม่ใช้แบบมาตรฐาน

## ข้อผิดพลาดที่พบบ่อย

- รันไฟล์ที่มี decorator ด้วย `node` ตรง ๆ แล้วเจอ `SyntaxError`
- ตั้ง `target` เป็น `esnext` แล้วงงว่าทำไมผลลัพธ์จาก `tsc` ยังรันไม่ได้
- ก๊อปตัวอย่าง decorator แบบเก่า (`target, propertyKey, descriptor`) มาใช้ในโปรเจกต์ที่ไม่ได้เปิด `experimentalDecorators`
- ใช้ decorator ซ่อนตรรกะสำคัญไว้จนคนอ่านโค้ดไม่รู้ว่าเมธอดทำอะไรจริง

## สรุป

- decorator คือฟังก์ชันที่ห่อ class หรือเมธอด เขียนด้วย `@` และมีแบบรับค่าได้
- ต้องแปลงด้วย `tsc` ที่ตั้ง `target` ไม่เกิน `es2025` ก่อนรัน Node ยังรัน syntax นี้เองไม่ได้
- โค้ดใหม่ใช้ decorator มาตรฐาน ส่วน `experimentalDecorators` ใช้เมื่อ framework บังคับเท่านั้น

## อ่านเพิ่ม

- [TypeScript 5.0: Decorators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)
- [TSConfig: experimentalDecorators](https://www.typescriptlang.org/tsconfig/#experimentalDecorators)
- [TC39: Decorators proposal](https://github.com/tc39/proposal-decorators)
