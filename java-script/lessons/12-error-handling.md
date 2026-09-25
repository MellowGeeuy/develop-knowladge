# การจัดการ Error

> โปรแกรมที่ดีไม่ใช่โปรแกรมที่ไม่เคยพัง แต่เป็นโปรแกรมที่พังแล้วบอกได้ชัดว่าพังเพราะอะไร และไม่ทำให้ผู้ใช้ติดอยู่กับหน้าจอที่ค้าง บทนี้สอนเครื่องมือจัดการ error และนิสัยที่ทำให้หาบั๊กเจอเร็ว

## บทนี้จะได้อะไร

- ใช้ `throw`, `try`, `catch`, `finally` ได้ถูกจังหวะ
- สร้าง Error ของตัวเองที่บอกสาเหตุได้ชัด และห่อ error โดยไม่ทิ้งต้นเหตุด้วย `cause`
- รู้ว่าเมื่อไรควรจับ error และเมื่อไรควรปล่อยให้มันลอยขึ้นไป

## Error object

error ที่ดีเป็น object ของ `Error` เสมอ เพราะเก็บทั้งชนิด ข้อความ และ stack trace ที่บอกว่าเกิดที่บรรทัดไหน

```js
const error = new Error('ไม่พบผู้ใช้');
console.log(error.name); // → Error
console.log(error.message); // → ไม่พบผู้ใช้
console.log(typeof error.stack); // → string
```

error ในตัวที่เจอบ่อย

| ชนิด | เกิดเมื่อ |
|---|---|
| `TypeError` | ใช้ค่าผิดชนิด เช่น เรียก property ของ `undefined` หรือเรียกสิ่งที่ไม่ใช่ฟังก์ชัน |
| `ReferenceError` | ใช้ตัวแปรที่ไม่มีอยู่ หรือใช้ก่อนประกาศ |
| `RangeError` | ค่าอยู่นอกช่วงที่ยอมรับ |
| `SyntaxError` | เขียนผิดไวยากรณ์ หรือ `JSON.parse` ข้อความที่ไม่ใช่ JSON |

## throw และ try/catch/finally

```js
function withdraw(balance, amount) {
  if (amount > balance) {
    throw new RangeError(`ยอดเงินไม่พอ ต้องการ ${amount} แต่มี ${balance}`);
  }
  return balance - amount;
}

try {
  withdraw(100, 500);
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
} finally {
  console.log('บันทึก log ของรายการแล้ว');
}
// ผลลัพธ์
// RangeError: ยอดเงินไม่พอ ต้องการ 500 แต่มี 100
// บันทึก log ของรายการแล้ว
```

`finally` ทำงานเสมอไม่ว่าจะสำเร็จหรือพัง เหมาะกับงานเก็บกวาด เช่น ปิดสถานะกำลังโหลด หรือปลดล็อกปุ่ม

> [!WARNING]
> throw เฉพาะ object ของ `Error` อย่า `throw 'ผิดพลาด'` เป็น string เพราะจะไม่มี stack trace ให้ตามรอยว่าเกิดที่ไหน

## Error ของตัวเอง

สร้าง class ที่สืบทอดจาก `Error` เพื่อแยกชนิดของปัญหา ส่วนที่จับ error จะตัดสินใจได้ว่าจัดการเองหรือส่งต่อ

```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function validateEmail(email) {
  if (!email.includes('@')) {
    throw new ValidationError('email', 'รูปแบบอีเมลไม่ถูกต้อง');
  }
  return email;
}

try {
  validateEmail('guy-at-loxbit');
} catch (error) {
  if (!(error instanceof ValidationError)) throw error; // ไม่ใช่ปัญหาที่เรารู้จัก ส่งต่อขึ้นไป
  console.log(`${error.field}: ${error.message}`); // → email: รูปแบบอีเมลไม่ถูกต้อง
}
```

## ห่อ error โดยไม่ทิ้งต้นเหตุ

เมื่อต้องแปลง error ระดับล่างให้มีความหมายกับชั้นบน ให้ส่งตัวเดิมไปใน `cause` คนอ่าน log จะเห็นทั้งสองชั้น

```js
function loadConfig(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('อ่านไฟล์ตั้งค่าไม่ได้', { cause: error });
  }
}

try {
  loadConfig('{ oops }');
} catch (error) {
  console.log(error.message); // → อ่านไฟล์ตั้งค่าไม่ได้
  console.log(error.cause.name); // → SyntaxError
}
```

## อย่ากลืน error

catch ที่ว่างเปล่าคือบั๊กที่ร้ายที่สุด เพราะโปรแกรมทำเหมือนสำเร็จทั้งที่ไม่สำเร็จ

```js
async function saveOrder(order) {
  try {
    await api.save(order);
  } catch (error) {
    // ห้ามปล่อยว่างแบบนี้ ผู้ใช้จะคิดว่าบันทึกแล้ว
  }
}
```

ทุก `catch` ต้องทำอย่างใดอย่างหนึ่ง

1. **จัดการได้จริง** เช่น ลองใหม่ ใช้ค่าสำรอง หรือแสดงข้อความที่บอกผู้ใช้ว่าต้องทำอะไรต่อ
2. **บันทึกพร้อมบริบท** แล้ว throw ต่อ เพื่อให้ชั้นที่รู้วิธีจัดการเป็นคนจัดการ

ถ้าทำไม่ได้ทั้งสองอย่าง อย่าจับ ปล่อยให้ error ลอยขึ้นไปดีกว่า

## Fail fast: ตรวจตั้งแต่ทางเข้า

ตรวจข้อมูลตั้งแต่ต้นฟังก์ชันแล้ว throw ทันทีที่ผิด error จะเกิดใกล้ต้นเหตุที่สุด ดีกว่าปล่อยค่าผิดไหลไปพังที่อื่นแบบงง ๆ

```js
function createInvoice({ customer, items }) {
  if (!customer) throw new TypeError('ต้องระบุลูกค้า');
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError('ใบแจ้งหนี้ต้องมีรายการอย่างน้อย 1 รายการ');
  }
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return { customer, items, total };
}

console.log(createInvoice({ customer: 'Guy', items: [{ price: 120 }, { price: 80 }] }).total); // → 200
```

error จากงาน asynchronous เช่น การเรียก API จับด้วย `try`/`catch` คู่กับ `await` ได้เหมือนกัน รายละเอียดอยู่ใน [บท Promise และ async/await](16-promises-async-await.md)

## ข้อผิดพลาดที่พบบ่อย

- `throw` เป็น string แทน `Error`
- `catch` แล้วไม่ทำอะไร
- ครอบ `try` ใหญ่ทั้งฟังก์ชันจนไม่รู้ว่าบรรทัดไหนพัง
- ใช้ error เป็นทางเดินปกติของโปรแกรม เช่น throw เพื่อบอกว่า "ไม่พบข้อมูล" ทั้งที่เป็นกรณีปกติ ให้คืน `null` แทน

## สรุป

- throw เฉพาะ `Error` และใช้ชนิดที่สื่อความหมาย
- สร้าง Error ของตัวเองเพื่อแยกปัญหาที่รู้จัก และใช้ `cause` เก็บต้นเหตุ
- จับเฉพาะ error ที่จัดการได้ ที่เหลือให้ลอยขึ้นไป
- ตรวจข้อมูลตั้งแต่ทางเข้าแล้วพังให้เร็ว

## อ่านเพิ่ม

- [MDN: Control flow and error handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: Error: cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- [MDN: try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
