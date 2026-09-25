# this, Prototype และ Class

> `this` เป็นเรื่องที่คนสับสนมากที่สุดเรื่องหนึ่งของ JavaScript เพราะค่าของมันขึ้นกับ "วิธีเรียก" ไม่ใช่ "ที่เขียน" บทนี้ไล่กฎของ `this` ให้ครบ แล้วต่อไปยัง prototype ซึ่งเป็นกลไกจริงเบื้องหลัง `class`

## บทนี้จะได้อะไร

- บอกค่าของ `this` ได้ในทุกสถานการณ์ และแก้ปัญหา `this` หายด้วย `bind` หรือ arrow function
- เข้าใจ prototype chain ว่า object ได้เมธอดมาจากไหน
- เขียน class สมัยใหม่ด้วย private field, getter, static และการสืบทอด

## กฎของ this

| วิธีเรียก | ค่าของ `this` |
|---|---|
| `object.method()` | `object` ตัวหน้าจุด |
| `fn()` เรียกเปล่า ๆ | `undefined` (ใน module และ strict mode) |
| `new Fn()` | object ใหม่ที่กำลังสร้าง |
| `fn.call(x)`, `fn.apply(x)`, `fn.bind(x)` | `x` ที่ส่งให้ |
| arrow function | ใช้ `this` ของ scope ที่ครอบอยู่ ไม่มีเป็นของตัวเอง |

```js
const account = {
  owner: 'Guy',
  describe() {
    return `บัญชีของ ${this.owner}`;
  },
};

console.log(account.describe());

const detached = account.describe; // หยิบเมธอดออกมา ไม่มี "ตัวหน้าจุด" แล้ว
try {
  detached();
} catch (error) {
  console.log(error.message);
}

const bound = account.describe.bind(account); // ผูก this ไว้ถาวร
console.log(bound());
// ผลลัพธ์
// บัญชีของ Guy
// Cannot read properties of undefined (reading 'owner')
// บัญชีของ Guy
```

ข้อความ error ด้านบนมาจาก Chrome และ Node.js เบราว์เซอร์อื่นใช้ข้อความต่างออกไป แต่สาเหตุเดียวกัน ปัญหานี้เจอบ่อยที่สุดตอนส่งเมธอดไปเป็น callback เช่น `button.addEventListener('click', account.describe)`

`call` และ `apply` เรียกฟังก์ชันทันทีพร้อมกำหนด `this` ต่างกันแค่วิธีส่งอาร์กิวเมนต์

```js
function introduce(greeting, punctuation) {
  return `${greeting} ฉันคือ ${this.name}${punctuation}`;
}

const person = { name: 'Friday' };
console.log(introduce.call(person, 'สวัสดี', '!')); // → สวัสดี ฉันคือ Friday!
console.log(introduce.apply(person, ['หวัดดี', '.'])); // → หวัดดี ฉันคือ Friday.
```

### arrow function กับ this

arrow function ใช้ `this` ของที่ที่มันถูกเขียน จึงเหมาะกับ callback ที่อยู่ในเมธอด แต่ไม่เหมาะเป็นเมธอดของ object เอง

```js
const timer = {
  seconds: 0,
  run() {
    const tick = () => {
      this.seconds += 1; // this ของ run() ซึ่งคือ timer
    };
    tick();
    tick();
    return this.seconds;
  },
};
console.log(timer.run()); // → 2

const broken = {
  count: 0,
  read: () => typeof this, // this ของ module ซึ่งเป็น undefined ไม่ใช่ broken
};
console.log(broken.read()); // → undefined
```

## Prototype

ทุก object มีลิงก์ลับไปหา object อีกตัวที่เรียกว่า prototype ถ้าหา property ในตัวเองไม่เจอ JavaScript จะไปหาต่อที่ prototype และต่อขึ้นไปเรื่อย ๆ (prototype chain)

```js
const animal = {
  speak() {
    return `${this.name} ส่งเสียง`;
  },
};

const dog = Object.create(animal); // สร้าง object ที่มี animal เป็น prototype
dog.name = 'บราวนี่';

console.log(dog.speak()); // → บราวนี่ ส่งเสียง
console.log(Object.getPrototypeOf(dog) === animal); // → true
console.log(Object.hasOwn(dog, 'speak')); // → false
console.log(Object.getPrototypeOf([]) === Array.prototype); // → true
```

นี่คือเหตุผลที่ array ทุกตัวเรียก `map` ได้ เมธอดไม่ได้อยู่ในตัว array แต่อยู่ที่ `Array.prototype` ที่ทุก array ใช้ร่วมกัน

## Class

`class` คือวิธีเขียน prototype ที่อ่านง่ายขึ้น พร้อมฟีเจอร์ที่ prototype แบบเดิมทำได้ยาก

```js
class BankAccount {
  static #nextId = 1; // ของ class ทั้งคลาส ไม่ใช่ของแต่ละบัญชี
  #balance = 0; // private field แตะจากนอก class ไม่ได้เลย

  constructor(owner) {
    this.id = BankAccount.#nextId++;
    this.owner = owner;
  }

  deposit(amount) {
    if (amount <= 0) {
      throw new RangeError('จำนวนเงินต้องมากกว่า 0');
    }
    this.#balance += amount;
    return this; // คืนตัวเองเพื่อให้เรียกต่อกันเป็นสายได้
  }

  get balance() {
    return this.#balance;
  }

  static fromJSON(data) {
    return new BankAccount(data.owner).deposit(data.balance);
  }
}

const saving = new BankAccount('Guy').deposit(500).deposit(250);
console.log(saving.balance); // → 750
console.log(saving.id); // → 1
console.log(Object.keys(saving)); // → ['id', 'owner']

const restored = BankAccount.fromJSON({ owner: 'Mint', balance: 100 });
console.log(restored.id, restored.balance); // → 2 100
```

`#balance` ต่างจากการตั้งชื่อ `_balance` ตรงที่ภาษาบังคับจริง โค้ดนอก class ที่เขียน `saving.#balance` จะเป็น `SyntaxError` ตั้งแต่ตอนโหลดไฟล์

### สืบทอดด้วย extends

```js
class Shape {
  constructor(name) {
    this.name = name;
  }

  area() {
    return 0;
  }

  describe() {
    return `${this.name} พื้นที่ ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super('วงกลม'); // ต้องเรียกก่อนใช้ this ใน class ลูก
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }
}

const circle = new Circle(2);
console.log(circle.describe()); // → วงกลม พื้นที่ 12.57
console.log(circle instanceof Shape); // → true
console.log(typeof Circle); // → function
console.log(Object.getPrototypeOf(Circle.prototype) === Shape.prototype); // → true
```

สองบรรทัดสุดท้ายยืนยันว่า class ยังเป็นฟังก์ชันกับ prototype อยู่เบื้องหลังเหมือนเดิม

## ประกอบดีกว่าสืบทอดลึก

การสืบทอดหลายชั้นทำให้ class ลูกผูกติดกับรายละเอียดของ class แม่ทุกชั้น ทางเลือกที่ยืดหยุ่นกว่าคือประกอบความสามารถเข้าด้วยกัน (composition)

```js
const canFly = (entity) => ({ ...entity, fly: () => `${entity.name} บินได้` });
const canSwim = (entity) => ({ ...entity, swim: () => `${entity.name} ว่ายน้ำได้` });

const duck = canSwim(canFly({ name: 'เป็ด' }));
console.log(duck.fly(), duck.swim()); // → เป็ด บินได้ เป็ด ว่ายน้ำได้
```

> [!TIP]
> ใช้ class เมื่อมีสถานะภายในที่ต้องปกป้องและมีหลาย instance เช่น ตะกร้าสินค้าหรือการเชื่อมต่อ ส่วนงานแปลงข้อมูลทั่วไป ฟังก์ชันธรรมดามักเรียบง่ายกว่า

## ข้อผิดพลาดที่พบบ่อย

- ส่งเมธอดไปเป็น callback แล้ว `this` หาย ให้ใช้ `bind` หรือห่อด้วย arrow `() => account.describe()`
- ใช้ arrow function เป็นเมธอดของ object แล้ว `this` ไม่ใช่ object นั้น
- ลืม `super()` ใน constructor ของ class ลูก ได้ `ReferenceError` ทันทีที่ใช้ `this`
- สืบทอดต่อกันหลายชั้นจนแก้ class แม่ทีไรกระทบทุกคลาส

## สรุป

- `this` ขึ้นกับวิธีเรียก ยกเว้น arrow function ที่ยืม `this` จากข้างนอก
- object หาของที่ตัวเองไม่มีต่อที่ prototype และ class ก็ทำงานบนกลไกเดียวกัน
- class สมัยใหม่มี private field (`#`), getter, static และ `extends`

## อ่านเพิ่ม

- [MDN: this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [MDN: Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)
- [MDN: Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [MDN: Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
