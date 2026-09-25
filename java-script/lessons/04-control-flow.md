# เงื่อนไขและการวนซ้ำ

> โปรแกรมตัดสินใจด้วยเงื่อนไข และทำงานซ้ำด้วยลูป บทนี้ครอบคลุมทุกรูปแบบที่ใช้จริง พร้อมวิธีเขียนเงื่อนไขให้แบนและอ่านง่ายด้วย guard clause

## บทนี้จะได้อะไร

- เขียน `if`, `switch` และ ternary ให้เหมาะกับสถานการณ์
- ลดเงื่อนไขที่ซ้อนกันหลายชั้นด้วย guard clause
- เลือกลูปให้ถูกกับข้อมูล และรู้ว่าทำไมไม่ใช้ `for...in` กับ array

## if, else if, else

```js
function gradeOf(score) {
  if (score >= 80) {
    return 'A';
  } else if (score >= 70) {
    return 'B';
  } else if (score >= 60) {
    return 'C';
  }
  return 'F';
}

console.log(gradeOf(85)); // → A
console.log(gradeOf(65)); // → C
console.log(gradeOf(40)); // → F
```

ใส่ `{ }` ทุกครั้งที่เงื่อนไขมีหลายบรรทัด การละวงเล็บเป็นต้นเหตุของบั๊กคลาสสิกที่เพิ่มบรรทัดใหม่แล้วบรรทัดนั้นหลุดออกนอกเงื่อนไขโดยไม่รู้ตัว

## Guard clause: จัดการกรณีผิดก่อนแล้วออกทันที

เงื่อนไขที่ซ้อนลึกทำให้ต้องจำว่าตอนนี้อยู่ใน `if` ชั้นไหน ลองเทียบสองแบบนี้ที่ให้ผลเหมือนกัน

```js
function checkoutNested(cart, user) {
  if (user) {
    if (user.isVerified) {
      if (cart.items.length > 0) {
        return 'ชำระเงินได้';
      } else {
        return 'ตะกร้าว่าง';
      }
    } else {
      return 'ยืนยันอีเมลก่อน';
    }
  } else {
    return 'กรุณาเข้าสู่ระบบ';
  }
}

function checkout(cart, user) {
  if (!user) return 'กรุณาเข้าสู่ระบบ';
  if (!user.isVerified) return 'ยืนยันอีเมลก่อน';
  if (cart.items.length === 0) return 'ตะกร้าว่าง';
  return 'ชำระเงินได้';
}

console.log(checkout({ items: [] }, { isVerified: true })); // → ตะกร้าว่าง
console.log(checkout({ items: ['หนังสือ'] }, null)); // → กรุณาเข้าสู่ระบบ
console.log(checkoutNested({ items: ['หนังสือ'] }, { isVerified: true })); // → ชำระเงินได้
```

แบบที่สองอ่านจากบนลงล่างได้เหมือนเช็กลิสต์ และกรณีปกติอยู่บรรทัดสุดท้ายโดยไม่มีอะไรครอบ

## switch และตารางค้นหา

`switch` เหมาะกับการเทียบค่าเดียวกับหลายกรณี (เทียบด้วย `===`)

```js
function statusLabel(status) {
  switch (status) {
    case 'pending':
      return 'รอดำเนินการ';
    case 'shipped':
      return 'จัดส่งแล้ว';
    case 'delivered':
    case 'completed':
      return 'ส่งถึงแล้ว';
    default:
      return 'ไม่ทราบสถานะ';
  }
}

console.log(statusLabel('shipped')); // → จัดส่งแล้ว
console.log(statusLabel('completed')); // → ส่งถึงแล้ว
console.log(statusLabel('lost')); // → ไม่ทราบสถานะ
```

> [!WARNING]
> ถ้า `case` ไม่ได้ `return` ต้องปิดด้วย `break` เสมอ ไม่งั้นโค้ดจะไหลต่อไปทำ `case` ถัดไปด้วย (fall-through) ยกเว้นตั้งใจรวมหลาย case ไว้ด้วยกันแบบ `'delivered'` กับ `'completed'` ด้านบน

ถ้าแต่ละกรณีแค่ "แปลงค่าหนึ่งเป็นอีกค่า" ตารางค้นหาด้วย object สั้นและแก้ง่ายกว่า

```js
const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  shipped: 'จัดส่งแล้ว',
  delivered: 'ส่งถึงแล้ว',
};

const status = 'pending';
console.log(STATUS_LABELS[status] ?? 'ไม่ทราบสถานะ'); // → รอดำเนินการ
```

## ลูป for แบบนับรอบ

ใช้เมื่อต้องการตัวนับหรือกำหนดจังหวะการเพิ่มเอง

```js
for (let i = 1; i <= 3; i++) {
  console.log(`รอบที่ ${i}`);
}
// ผลลัพธ์
// รอบที่ 1
// รอบที่ 2
// รอบที่ 3
```

## while

ใช้เมื่อไม่รู้ล่วงหน้าว่าต้องวนกี่รอบ แต่รู้ว่าจะหยุดเมื่อไร

```js
let balance = 1000;
let months = 0;
while (balance < 2000) {
  balance *= 1.1;
  months++;
}
console.log(months); // → 8
```

> [!CAUTION]
> ทุก `while` ต้องมีบรรทัดที่ทำให้เงื่อนไขเป็นเท็จได้ในที่สุด ลืมบรรทัด `months++` หรือเงื่อนไขไม่มีวันเปลี่ยน แท็บเบราว์เซอร์จะค้างทั้งแท็บ

## for...of กับ for...in

`for...of` วนผ่าน **ค่า** ของสิ่งที่วนได้ เช่น array, string, Map ใช้เป็นลูปหลักได้เลย

```js
const fruits = ['มะม่วง', 'ทุเรียน'];
for (const fruit of fruits) {
  console.log(fruit);
}
// ผลลัพธ์
// มะม่วง
// ทุเรียน
```

`for...in` วนผ่าน **ชื่อ key** ของ object ถ้าต้องการทั้ง key และค่าของ object ให้ใช้ `Object.entries` คู่กับ `for...of` จะอ่านง่ายกว่า

```js
const prices = { mango: 40, durian: 250 };
for (const [name, price] of Object.entries(prices)) {
  console.log(`${name}: ${price} บาท`);
}
// ผลลัพธ์
// mango: 40 บาท
// durian: 250 บาท
```

อย่าใช้ `for...in` กับ array เพราะได้ index ออกมาเป็น string และยังวนไปเจอ property อื่นที่ถูกเพิ่มเข้าไปได้ด้วย

```js
for (const index in ['a', 'b']) {
  console.log(index, typeof index);
}
// ผลลัพธ์
// 0 string
// 1 string
```

## break และ continue

`continue` ข้ามไปรอบถัดไป ส่วน `break` หยุดทั้งลูป

```js
const numbers = [3, 8, -1, 5, 12, 4];
let total = 0;
for (const number of numbers) {
  if (number < 0) continue; // ข้ามค่าติดลบ
  if (number > 10) break; // เจอค่าเกินสิบให้หยุดทั้งลูป
  total += number;
}
console.log(total); // → 16
```

## เลือกลูปแบบไหน

| ต้องการ | ใช้ |
|---|---|
| ทำอะไรกับทุกค่าใน array | `for...of` หรือเมธอดของ array ([บท Array](07-arrays.md)) |
| ต้องใช้ index หรือเดินข้ามทีละหลายช่อง | `for` แบบนับรอบ |
| วนจนกว่าเงื่อนไขจะเปลี่ยน ไม่รู้จำนวนรอบ | `while` |
| วนผ่าน key และค่าของ object | `for...of` กับ `Object.entries()` |

## ข้อผิดพลาดที่พบบ่อย

- ลืมอัปเดตตัวแปรในเงื่อนไขของ `while` จนวนไม่รู้จบ
- ใช้ `for...in` กับ array
- ลืม `break` ใน `switch` แล้วโค้ดไหลไปทำ case ถัดไป
- เงื่อนไขซ้อนลึกสามชั้นขึ้นไป ให้แตกด้วย guard clause หรือแยกเป็นฟังก์ชัน

## สรุป

- จัดการกรณีผิดก่อนด้วย guard clause แล้วให้กรณีปกติอยู่ท้ายสุด
- `switch` สำหรับหลายกรณีที่มีงานต่างกัน object สำหรับแปลงค่าตรง ๆ
- `for...of` เป็นลูปหลัก และไม่ใช้ `for...in` กับ array

## อ่านเพิ่ม

- [MDN: Control flow and error handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MDN: Loops and iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [MDN: switch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)
