# Scope, Hoisting และ Closure

> scope คือกติกาว่าตัวแปรไหนมองเห็นได้จากตรงไหน hoisting อธิบายว่าทำไมบางอย่างเรียกใช้ก่อนประกาศได้แต่บางอย่างพัง และ closure คือความสามารถของฟังก์ชันที่จำตัวแปรรอบตัวได้ สามเรื่องนี้ต่อกันเป็นเรื่องเดียว

## บทนี้จะได้อะไร

- เข้าใจ scope ระดับ module, ฟังก์ชัน และ block
- รู้ว่าอะไรถูก hoist และ Temporal Dead Zone (TDZ) คืออะไร
- ใช้ closure เก็บสถานะแบบส่วนตัว และเข้าใจบั๊ก `var` ในลูป

## Scope: มองออกได้ มองเข้าไม่ได้

โค้ดด้านในมองเห็นตัวแปรของชั้นที่ครอบอยู่เสมอ แต่ชั้นนอกมองไม่เห็นตัวแปรที่ประกาศข้างใน

```js
const appName = 'The Brain'; // scope ของ module

function describe() {
  const level = 'ฟังก์ชัน'; // scope ของฟังก์ชัน
  if (true) {
    const inner = 'บล็อก'; // scope ของ block
    console.log(appName, level, inner); // → The Brain ฟังก์ชัน บล็อก
  }
  return typeof inner;
}

console.log(describe()); // → undefined
```

เวลาหาตัวแปร JavaScript ค้นจากชั้นในสุดออกไปทีละชั้น (scope chain) ถ้าชั้นในมีชื่อซ้ำกับชั้นนอก ตัวในจะบังตัวนอก (shadowing)

```js
const color = 'แดง';

function paint() {
  const color = 'น้ำเงิน';
  return color;
}

console.log(paint(), color); // → น้ำเงิน แดง
```

scope ถูกกำหนดจาก **ตำแหน่งที่เขียนโค้ด** ไม่ใช่ตำแหน่งที่เรียกใช้ (lexical scope) ฟังก์ชันจึงเห็นตัวแปรรอบตัวตามที่เขียนไว้เสมอ ไม่ว่าจะถูกส่งไปเรียกที่ไหน

## Hoisting

ก่อนรันโค้ดใน scope หนึ่ง JavaScript จะจองชื่อทุกตัวที่ประกาศใน scope นั้นไว้ก่อน แต่แต่ละแบบถูกจองไม่เหมือนกัน

`function` declaration ถูกเตรียมไว้ครบทั้งตัว จึงเรียกก่อนบรรทัดที่ประกาศได้

```js
console.log(double(4)); // → 8

function double(n) {
  return n * 2;
}
```

`var` ถูกจองไว้พร้อมค่า `undefined` จึงอ่านก่อนประกาศได้โดยไม่ error แต่ได้ค่าผิด

```js
console.log(total); // → undefined
var total = 100;
```

`let`, `const` และ `class` ถูกจองชื่อไว้แต่ห้ามแตะจนกว่าจะถึงบรรทัดประกาศ ช่วงนั้นเรียกว่า **Temporal Dead Zone**

```js
try {
  console.log(price);
  const price = 100;
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
// ผลลัพธ์
// ReferenceError: Cannot access 'price' before initialization
```

TDZ เป็นเรื่องดี เพราะเปลี่ยนบั๊กเงียบ (`undefined` ของ `var`) ให้กลายเป็น error ที่ชี้บรรทัดชัดเจน

## Closure

เมื่อฟังก์ชันถูกสร้าง มันจะ **จำตัวแปรในที่ที่มันเกิด** ติดตัวไปด้วย แม้ฟังก์ชันที่ครอบมันจะทำงานจบไปแล้ว

```js
function createCounter() {
  let count = 0; // ข้างนอกเข้าถึงตรง ๆ ไม่ได้ ต้องผ่านเมธอดที่คืนออกไปเท่านั้น

  return {
    increment() {
      count += 1;
      return count;
    },
    reset() {
      count = 0;
    },
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.increment()); // → 3

const another = createCounter(); // เรียกใหม่ได้ closure ใหม่ นับแยกกัน
console.log(another.increment()); // → 1
```

`count` เป็นสถานะส่วนตัวของแต่ละ counter แก้ได้เฉพาะผ่าน `increment` และ `reset` เท่านั้น

### ใช้ closure ทำ cache

```js
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg);
  };
}

let calls = 0;
const slowSquare = (n) => {
  calls += 1; // นับว่าคำนวณจริงกี่ครั้ง
  return n * n;
};

const fastSquare = memoize(slowSquare);
fastSquare(9);
fastSquare(9);
console.log(fastSquare(9), calls); // → 81 1
```

event handler บนหน้าเว็บ ฟังก์ชันที่ส่งให้ `setTimeout` และฟังก์ชันที่คืนจากฟังก์ชันอื่น ล้วนใช้ closure โดยที่เรามักไม่รู้ตัว

## บั๊กคลาสสิก: var ในลูป

```js
const withVar = [];
for (var i = 0; i < 3; i++) {
  withVar.push(() => i);
}
console.log(withVar.map((fn) => fn())); // → [3, 3, 3]

const withLet = [];
for (let j = 0; j < 3; j++) {
  withLet.push(() => j);
}
console.log(withLet.map((fn) => fn())); // → [0, 1, 2]
```

`var` มีตัวแปร `i` ตัวเดียวทั้งลูป ทุกฟังก์ชันจึงจำตัวเดียวกันซึ่งจบที่ 3 ส่วน `let` สร้างตัวแปรใหม่ให้ทุกรอบ แต่ละฟังก์ชันจึงจำค่าของรอบตัวเอง

> [!TIP]
> closure เก็บตัวแปรที่อ้างถึงไว้ในหน่วยความจำตราบที่ฟังก์ชันยังถูกใช้อยู่ ถ้าผูก event listener หรือตั้ง `setInterval` ที่อ้างข้อมูลก้อนใหญ่ ให้ถอดออกเมื่อไม่ใช้แล้ว ไม่งั้นข้อมูลจะค้างในหน่วยความจำ

## ข้อผิดพลาดที่พบบ่อย

- ใช้ตัวแปรก่อนประกาศด้วย `let`/`const` แล้วเจอ `ReferenceError` (ย้ายการประกาศขึ้นไปก่อนใช้)
- ตั้งชื่อตัวแปรข้างในซ้ำกับข้างนอกจนสับสนว่ากำลังแก้ตัวไหน
- ใช้ `var` ในลูปแล้วส่งฟังก์ชันออกไปใช้ทีหลัง
- ปล่อยให้ closure ถือข้อมูลใหญ่ไว้ทั้งที่ไม่ใช้แล้ว

## สรุป

- scope เป็นแบบ lexical ข้างในเห็นข้างนอก ข้างนอกไม่เห็นข้างใน
- `function` ถูก hoist ครบ `var` ได้ `undefined` ส่วน `let`/`const` ติด TDZ
- closure คือฟังก์ชันที่จำตัวแปรในที่ที่มันเกิด ใช้ทำสถานะส่วนตัวและ cache ได้

## อ่านเพิ่ม

- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
- [MDN: Scope](https://developer.mozilla.org/en-US/docs/Glossary/Scope)
- [MDN: Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [MDN: let และ Temporal Dead Zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
