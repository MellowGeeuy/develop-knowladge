# Class และ OOP

> class ใน TypeScript คือ class ของ JavaScript (บทที่ 10 ของคอร์ส JavaScript) บวก type ให้ property และเมธอด กับคำสำคัญสำหรับควบคุมการเข้าถึง บทนี้เน้นจุดที่ TypeScript ต่างจาก JavaScript และกับดักที่คนสับสนบ่อย

## บทนี้จะได้อะไร

- ใส่ type ให้ property และ constructor ของ class
- เลือกระหว่าง `private` ของ TypeScript กับ `#private` ของ JavaScript
- ใช้ `readonly`, `implements`, `abstract`, `override` และ generic class

## Property ต้องมีค่าตั้งแต่สร้าง

เมื่อเปิด `strict` ทุก property ต้องได้ค่าตั้งแต่ประกาศหรือใน constructor ไม่งั้น TypeScript ฟ้อง เพราะจะได้ `undefined` ทั้งที่ type บอกว่าเป็นตัวเลข

```ts
class Account {
  owner: string;
  balance: number; // ❌ Property 'balance' has no initializer and is not definitely assigned in the constructor.

  constructor(owner: string) {
    this.owner = owner;
  }
}
```

แก้โดยใส่ค่าเริ่มต้นให้ property นั้น ไม่ต้องเขียน type เพราะเดาจากค่าได้

```ts
class Account {
  owner: string;
  balance = 0;

  constructor(owner: string) {
    this.owner = owner;
  }

  deposit(amount: number): number {
    this.balance += amount;
    return this.balance;
  }
}

const account = new Account('มะลิ');
console.log(account.deposit(500)); // → 500
```

## private หรือ #private

| เขียนแบบ | ใครเข้าถึงได้ | กันตอนรันจริงไหม |
|---|---|---|
| ไม่เขียน หรือ `public` | ทุกที่ | - |
| `protected` | class นั้นและ class ลูก | ไม่ กันแค่ตอนตรวจ type |
| `private` | เฉพาะใน class | ไม่ กันแค่ตอนตรวจ type |
| `#ชื่อ` | เฉพาะใน class | กันจริง เป็นความสามารถของ JavaScript |

`private` เป็นแค่คำสั่งให้ตัวตรวจ พอรันจริงก็คือ property ธรรมดาที่ใครจะอ่านก็ได้ ส่วน `#` ซ่อนอยู่จริงตอนรัน

```ts
class WalletA {
  private balance = 100;
}

class WalletB {
  #balance = 100;
}

const a = new WalletA();
const b = new WalletB();

console.log(JSON.stringify(a)); // → {"balance":100}
console.log(JSON.stringify(b)); // → {}
a.balance; // ❌ Property 'balance' is private and only accessible within class 'WalletA'.
```

> [!TIP]
> ถ้าต้องการความเป็นส่วนตัวจริง เช่น ค่าที่ห้ามหลุดออกไปใน log หรือ JSON ใช้ `#` ส่วน `private` เหมาะกับการบอกเจตนาในทีมเท่านั้น

## readonly

```ts
class Lesson {
  readonly id: string;
  title: string;

  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
  }
}

const lesson = new Lesson('classes', 'Class และ OOP');
lesson.title = 'Class ใน TypeScript';
lesson.id = 'oop'; // ❌ Cannot assign to 'id' because it is a read-only property.
```

## Parameter properties และทำไมคอร์สนี้ไม่ใช้

TypeScript มีทางลัดประกาศ property ไปพร้อมพารามิเตอร์ของ constructor ได้ในบรรทัดเดียว เจอบ่อยในโค้ดเก่าและใน Angular

```ts
class User {
  constructor(public readonly id: number, private name: string) {}
}
```

แต่ทางลัดนี้ต้องให้ TypeScript สร้างโค้ดเพิ่ม (คำสั่ง `this.id = id`) Node.js ที่รันไฟล์ `.ts` ด้วยการลบ type เฉย ๆ จึงรันไม่ได้

```text
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript parameter property is not supported in strip-only mode
```

`erasableSyntaxOnly` จับเรื่องนี้ให้ตั้งแต่ตอนตรวจ (error `TS1294` แบบเดียวกับ enum ในบทที่ 6) ในโค้ดใหม่ให้ประกาศ property แล้วกำหนดค่าใน constructor ตามปกติ

## implements

`implements` สั่งให้ TypeScript ตรวจว่า class มีทุกอย่างที่ interface ต้องการ ถ้าขาดจะฟ้องตรงบรรทัดประกาศ class

```ts
interface Notifier {
  send(to: string, message: string): boolean;
}

class EmailNotifier implements Notifier {
  send(to: string, message: string): boolean {
    console.log(`อีเมลถึง ${to}: ${message}`);
    return true;
  }
}

class SmsNotifier implements Notifier { // ❌ Class 'SmsNotifier' incorrectly implements interface 'Notifier'.
  sendSms(phone: string): void {
    console.log(phone);
  }
}

const notifier: Notifier = new EmailNotifier();
notifier.send('mali@example.com', 'บทเรียนใหม่มาแล้ว');
// ผลลัพธ์
// อีเมลถึง mali@example.com: บทเรียนใหม่มาแล้ว
```

`implements` ไม่ได้เพิ่มอะไรให้ class ตอนรัน และเพราะ TypeScript ดูที่รูปร่าง (บทที่ 5) object ที่มี `send` ครบก็ใช้เป็น `Notifier` ได้แม้ไม่เขียน `implements` คำนี้มีไว้ให้ error ขึ้นตรงที่ class ไม่ใช่ตรงที่เอาไปใช้

## abstract และ override

`abstract class` สร้างเป็น object ตรง ๆ ไม่ได้ ใช้เป็นแม่แบบที่บังคับให้ class ลูกเขียนเมธอดที่ขาดให้ครบ `override` บอกว่าตั้งใจเขียนทับเมธอดของแม่ ถ้าแม่ไม่มีเมธอดชื่อนั้น TypeScript ฟ้อง ช่วยจับการพิมพ์ชื่อผิดหรือเมธอดของแม่ที่ถูกเปลี่ยนชื่อไปแล้ว

```ts
abstract class Shape {
  abstract area(): number;

  describe(): string {
    return `พื้นที่ ${this.area().toFixed(2)} ตารางหน่วย`;
  }
}

class Circle extends Shape {
  readonly radius: number;

  constructor(radius: number) {
    super();
    this.radius = radius;
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
  }

  override perimeter(): number { // ❌ This member cannot have an 'override' modifier because it is not declared in the base class 'Shape'.
    return 2 * Math.PI * this.radius;
  }
}

console.log(new Circle(2).describe()); // → พื้นที่ 12.57 ตารางหน่วย
const shape = new Shape(); // ❌ Cannot create an instance of an abstract class.
```

## Static และ generic class

class มี type parameter ได้เหมือนฟังก์ชัน (บทที่ 8) และเมธอด `static` เรียกผ่านชื่อ class ใช้บ่อยเป็นทางสร้าง object แบบอื่นนอกจาก `new`

```ts
class Stack<T> {
  #items: T[] = [];

  static from<U>(items: readonly U[]): Stack<U> {
    const stack = new Stack<U>();
    for (const item of items) {
      stack.push(item);
    }
    return stack;
  }

  push(item: T): void {
    this.#items.push(item);
  }

  pop(): T | undefined {
    return this.#items.pop();
  }

  get size(): number {
    return this.#items.length;
  }
}

const history = Stack.from(['บทที่ 1', 'บทที่ 2']);
history.push('บทที่ 3');

console.log(history.pop(), history.size); // → บทที่ 3 2
history.push(4); // ❌ Argument of type 'number' is not assignable to parameter of type 'string'.
```

## ใช้ class เมื่อไร

- ใช้ class เมื่อมีทั้งสถานะและพฤติกรรมที่ต้องคุมให้ถูกเสมอ เช่น บัญชีที่ห้ามยอดติดลบ หรือเมื่อ framework บังคับ
- ข้อมูลล้วน ๆ ที่ส่งไปมาระหว่างระบบ (API, JSON) ใช้ `type` คู่กับฟังก์ชันธรรมดาจะง่ายกว่า เพราะ object ธรรมดาแปลงเป็น JSON และกลับมาได้ครบ ส่วน class instance ที่ผ่าน JSON แล้วจะเหลือแค่ข้อมูล ไม่มีเมธอดติดมา

## ข้อผิดพลาดที่พบบ่อย

- คิดว่า `private` กันการเข้าถึงตอนรัน แล้วเก็บข้อมูลลับไว้ในนั้น
- ใช้ parameter properties ในโปรเจกต์ที่รันไฟล์ `.ts` ด้วย Node ตรง ๆ
- ลืมเรียก `super()` ก่อนใช้ `this` ใน class ลูก
- ทำทุกอย่างเป็น class ทั้งที่ข้อมูลล้วน ๆ ใช้ `type` กับฟังก์ชันก็พอ

## สรุป

- property ของ class ต้องมีค่าตั้งแต่สร้าง และ `readonly` ห้ามแก้หลังจากนั้น
- `private` กันแค่ตอนตรวจ type ส่วน `#` กันจริงตอนรัน
- `implements` ตรวจรูปร่าง `abstract` บังคับให้ลูกเขียนให้ครบ และ `override` กันเขียนทับเมธอดที่ไม่มีอยู่จริง

## อ่านเพิ่ม

- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [MDN: Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
