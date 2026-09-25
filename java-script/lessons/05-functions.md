# ฟังก์ชัน

> ฟังก์ชันคือโค้ดที่ตั้งชื่อไว้เรียกใช้ซ้ำได้ ใน JavaScript ฟังก์ชันยังเป็น "ค่า" แบบหนึ่ง ส่งเข้าออกฟังก์ชันอื่นได้เหมือนตัวเลขหรือข้อความ ความสามารถนี้คือหัวใจของโค้ด JavaScript สมัยใหม่

## บทนี้จะได้อะไร

- ประกาศฟังก์ชันได้ 3 แบบ และรู้ว่าแบบไหนเหมาะกับตอนไหน
- ใช้พารามิเตอร์ค่าเริ่มต้น rest และ object ที่ตั้งชื่อได้
- ส่งฟังก์ชันเป็นค่า และเขียนฟังก์ชันบริสุทธิ์ (pure function) ที่ทดสอบง่าย

## ประกาศฟังก์ชัน 3 แบบ

```js
// 1) function declaration — เรียกก่อนบรรทัดที่ประกาศได้
function add(a, b) {
  return a + b;
}

// 2) function expression — เก็บฟังก์ชันไว้ในตัวแปร
const subtract = function (a, b) {
  return a - b;
};

// 3) arrow function — สั้นที่สุด ถ้าเนื้อในเป็นนิพจน์เดียวไม่ต้องเขียน return
const multiply = (a, b) => a * b;

console.log(add(2, 3), subtract(5, 1), multiply(4, 2)); // → 5 4 8
```

แนวที่ใช้กันแพร่หลาย: ฟังก์ชันหลักของไฟล์ใช้ `function` declaration เพราะชื่อเห็นชัดและอ่านง่าย ส่วนฟังก์ชันสั้นที่ส่งเข้าไปในฟังก์ชันอื่นใช้ arrow

arrow function ที่คืน object ต้องครอบด้วยวงเล็บ ไม่งั้น `{ }` จะถูกอ่านเป็นบล็อกของฟังก์ชัน

```js
const toUser = (name) => ({ name, role: 'member' });
console.log(toUser('Guy')); // → { name: 'Guy', role: 'member' }
```

arrow function ไม่มี `this` เป็นของตัวเอง ซึ่งเป็นทั้งข้อดีและกับดัก รายละเอียดอยู่ใน [บท this, Prototype และ Class](10-this-prototype-class.md)

## พารามิเตอร์

### ค่าเริ่มต้น

```js
function greet(name = 'ผู้เรียน', greeting = 'สวัสดี') {
  return `${greeting} ${name}`;
}

console.log(greet()); // → สวัสดี ผู้เรียน
console.log(greet('Guy')); // → สวัสดี Guy
console.log(greet(undefined, 'หวัดดี')); // → หวัดดี ผู้เรียน
console.log(greet(null)); // → สวัสดี null
```

ค่าเริ่มต้นทำงานเฉพาะตอนได้รับ `undefined` ถ้าส่ง `null` มา ฟังก์ชันจะใช้ `null` ตามที่ได้รับ

### Rest: รับกี่ตัวก็ได้

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3, 4)); // → 10
console.log(sum()); // → 0
```

### Object parameter: ตั้งชื่อให้อาร์กิวเมนต์

เมื่อพารามิเตอร์เกิน 3 ตัวหรือมีตัวเลือกเสริม ให้รับเป็น object แล้วแตกค่าออก (destructuring) คนเรียกจะเห็นชัดว่าแต่ละค่าคืออะไร และสลับลำดับได้

```js
function createButton({ label, variant = 'primary', disabled = false }) {
  const state = disabled ? ', ปิดอยู่' : '';
  return `${label} (${variant}${state})`;
}

console.log(createButton({ label: 'บันทึก' })); // → บันทึก (primary)
console.log(createButton({ label: 'ลบ', variant: 'danger', disabled: true })); // → ลบ (danger, ปิดอยู่)
```

เทียบกับ `createButton('ลบ', 'danger', true)` ที่อ่านแล้วไม่รู้ว่า `true` หมายถึงอะไร

## return

ฟังก์ชันที่ไม่ได้ `return` จะคืน `undefined` เสมอ

```js
function logOnly(message) {
  console.log(message);
}

const result = logOnly('บันทึกแล้ว');
console.log(result); // → undefined
```

arrow function ที่ใส่ `{ }` ต้องเขียน `return` เอง ลืมเมื่อไรได้ `undefined` ทันที

```js
const squareWrong = (n) => { n * n; };
const square = (n) => n * n;
console.log(squareWrong(4)); // → undefined
console.log(square(4)); // → 16
```

## ฟังก์ชันเป็นค่า

ส่งฟังก์ชันเข้าไปในฟังก์ชันอื่นเพื่อบอกว่า "ให้ทำอะไร" เรียกว่า callback

```js
function applyDiscount(price, rule) {
  return rule(price);
}

const tenPercentOff = (price) => price * 0.9;
const minus50 = (price) => price - 50;

console.log(applyDiscount(1000, tenPercentOff)); // → 900
console.log(applyDiscount(1000, minus50)); // → 950
```

ฟังก์ชันยังสร้างและคืนฟังก์ชันใหม่ได้ด้วย ฟังก์ชันที่รับหรือคืนฟังก์ชันเรียกว่า **higher-order function**

```js
function makeMultiplier(factor) {
  return (value) => value * factor;
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);
console.log(double(5), triple(5)); // → 10 15
```

ฟังก์ชันที่ถูกคืนออกมายังจำค่า `factor` ได้แม้ `makeMultiplier` จะทำงานจบไปแล้ว กลไกนี้ชื่อ closure อธิบายเต็ม ๆ ใน [บท Scope และ Closure](09-scope-and-closures.md)

เมธอดของ array ส่วนใหญ่เป็น higher-order function เช่น `map` รับฟังก์ชันที่บอกว่าจะแปลงแต่ละค่าอย่างไร

```js
const prices = [100, 250, 80];
const withVat = prices.map((price) => Math.round(price * 1.07));
console.log(withVat); // → [107, 268, 86]
```

## Pure function

ฟังก์ชันบริสุทธิ์คือฟังก์ชันที่ (1) ได้ผลเหมือนเดิมทุกครั้งเมื่อรับค่าเดิม และ (2) ไม่แก้อะไรนอกตัวเอง ทดสอบง่าย นำไปใช้ซ้ำง่าย และไม่สร้างบั๊กที่ขึ้นกับลำดับการเรียก

```js
let taxRate = 0.07;
const cart = [];

// ไม่บริสุทธิ์: ผลขึ้นกับตัวแปรข้างนอก และแก้ array ข้างนอก
function addItemImpure(item) {
  cart.push(item);
  return item.price * (1 + taxRate);
}

// บริสุทธิ์: ทุกอย่างมาจากพารามิเตอร์ และคืนของใหม่แทนการแก้ของเดิม
function addItem(items, item) {
  return [...items, item];
}

function priceWithTax(price, rate) {
  return price * (1 + rate);
}

const nextCart = addItem([], { name: 'ปากกา', price: 20 });
console.log(nextCart.length, priceWithTax(100, 0.07)); // → 1 107
```

> [!TIP]
> ไม่จำเป็นต้องบริสุทธิ์ทุกฟังก์ชัน โปรแกรมต้องแตะโลกภายนอกเสมอ (บันทึกข้อมูล แสดงผล) แต่ให้แยกส่วนคำนวณออกมาเป็นฟังก์ชันบริสุทธิ์ แล้วให้ส่วนที่แตะโลกภายนอกบางที่สุด

## ข้อผิดพลาดที่พบบ่อย

- ลืม `return` ใน arrow function ที่มี `{ }`
- เรียกฟังก์ชันโดยไม่ใส่ `()` เลยได้ตัวฟังก์ชันแทนผลลัพธ์ เช่น `const total = getTotal;`
- พารามิเตอร์ยาวเป็นแถวจนคนเรียกสลับลำดับผิด ให้เปลี่ยนเป็น object parameter
- แก้ object หรือ array ที่รับเข้ามาโดยคนเรียกไม่รู้ตัว

## สรุป

- ฟังก์ชันหลักใช้ `function` ฟังก์ชันสั้นที่ส่งต่อใช้ arrow
- ใช้ค่าเริ่มต้น rest และ object parameter ให้การเรียกใช้อ่านง่าย
- ฟังก์ชันเป็นค่า ส่งเข้า คืนออก และเก็บในตัวแปรได้
- แยกส่วนคำนวณเป็น pure function ให้มากที่สุด

## อ่านเพิ่ม

- [MDN: Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [MDN: Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [MDN: Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)
- [MDN: Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
