# การทดสอบด้วย node:test

> เทสต์คือโค้ดที่ตรวจโค้ด ทำให้กล้าแก้และปรับปรุงโค้ดเก่าโดยไม่กลัวว่าจะไปพังตรงอื่น Node.js มีเครื่องมือทดสอบมาในตัวแล้ว ไม่ต้องลงไลบรารีเพิ่มแม้แต่ตัวเดียว

## บทนี้จะได้อะไร

- เขียนและรัน unit test ด้วย `node:test` และ `node:assert`
- จัดเทสต์ให้อ่านง่ายด้วยรูปแบบ Arrange, Act, Assert
- ใช้ mock แทนสิ่งภายนอก เช่น การส่งอีเมล
- ออกแบบโค้ดให้ทดสอบง่ายตั้งแต่แรก

## ทำไมต้องเขียนเทสต์

- **กล้าแก้โค้ด** ปรับปรุงหรือจัดโครงสร้างใหม่แล้วรู้ทันทีว่ายังทำงานถูก
- **จับบั๊กซ้ำ** บั๊กที่เคยแก้แล้วมีเทสต์คุมไว้จะไม่กลับมาเงียบ ๆ
- **เป็นเอกสารที่ไม่ล้าสมัย** อ่านเทสต์แล้วรู้ว่าฟังก์ชันควรทำอะไรในแต่ละกรณี

## เทสต์แรก

```js file=utils/price.js
export function priceWithVat(price, rate = 0.07) {
  if (!Number.isFinite(price) || price < 0) {
    throw new RangeError('ราคาต้องเป็นตัวเลขที่ไม่ติดลบ');
  }
  return Math.round(price * (1 + rate) * 100) / 100;
}
```

```js file=utils/price.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceWithVat } from './price.js';

test('บวก VAT 7% เป็นค่าเริ่มต้น', () => {
  assert.equal(priceWithVat(100), 107);
});

test('ปัดผลเป็นทศนิยม 2 ตำแหน่ง', () => {
  assert.equal(priceWithVat(19.99), 21.39);
});

test('ราคาติดลบต้องโยน RangeError', () => {
  assert.throws(() => priceWithVat(-1), RangeError);
});
```

สั่งรันทุกเทสต์ในโปรเจกต์ (Node.js 20 ขึ้นไป) คำสั่งนี้ค้นหาไฟล์ที่ชื่อลงท้ายด้วย `.test.js` ให้เอง

```bash
node --test
```

```text
✔ บวก VAT 7% เป็นค่าเริ่มต้น (0.6ms)
✔ ปัดผลเป็นทศนิยม 2 ตำแหน่ง (0.1ms)
✔ ราคาติดลบต้องโยน RangeError (0.2ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

ไฟล์ `.js` ที่ใช้ `import` ต้องมี `"type": "module"` ใน `package.json` และตั้งคำสั่งไว้ให้ทีมเรียกเหมือนกันทุกคน

```json
{
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

## รูปแบบ Arrange, Act, Assert

แบ่งเทสต์เป็นสามช่วงเสมอ อ่านแล้วรู้ทันทีว่าเตรียมอะไร ทำอะไร และคาดหวังอะไร

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

test('ยอดรวมตะกร้าคิดจากทุกรายการ', () => {
  // Arrange: เตรียมข้อมูล
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 },
  ];

  // Act: เรียกสิ่งที่ทดสอบ
  const total = cartTotal(items);

  // Assert: ตรวจผล
  assert.equal(total, 250);
});

test('ตะกร้าว่างได้ยอดรวมเป็นศูนย์', () => {
  assert.equal(cartTotal([]), 0);
});
```

ตั้งชื่อเทสต์เป็นประโยคที่บอกพฤติกรรม เวลาเทสต์พังจะอ่านชื่อแล้วรู้เลยว่าอะไรเสีย

## assert ที่ใช้บ่อย

| คำสั่ง | ใช้ตรวจ |
|---|---|
| `assert.equal(actual, expected)` | ค่าเท่ากันแบบ `Object.is` (ตัวเลข ข้อความ) |
| `assert.deepEqual(actual, expected)` | object หรือ array ที่เนื้อหาเหมือนกัน |
| `assert.ok(value)` | ค่าเป็น truthy |
| `assert.match(text, /regex/)` | ข้อความตรงรูปแบบ |
| `assert.throws(fn, ErrorType)` | ฟังก์ชันโยน error ตามชนิดที่ระบุ |
| `await assert.rejects(promise, ErrorType)` | Promise ถูก reject ตามชนิดที่ระบุ |

ใช้ `node:assert/strict` เสมอ ตัวเปรียบเทียบจะเข้มงวดแบบ `===` ไม่แปลงชนิดให้

## Mock: แทนที่สิ่งภายนอก

เทสต์ต้องเร็วและไม่แตะโลกจริง ฟังก์ชันที่ส่งอีเมลหรือเรียก API ให้รับเครื่องมือเข้ามาเป็นพารามิเตอร์ ในเทสต์จะส่งตัวปลอมที่จดว่าถูกเรียกอย่างไรแทน

```js
import { mock, test } from 'node:test';
import assert from 'node:assert/strict';

function notifyWhenPaid(order, sendEmail) {
  if (order.status === 'paid') {
    sendEmail(order.customerEmail, 'ขอบคุณสำหรับการสั่งซื้อ');
  }
}

test('ส่งอีเมลเฉพาะออร์เดอร์ที่จ่ายเงินแล้ว', () => {
  const sendEmail = mock.fn();

  notifyWhenPaid({ status: 'paid', customerEmail: 'guy@loxbit.com' }, sendEmail);
  notifyWhenPaid({ status: 'pending', customerEmail: 'mint@loxbit.com' }, sendEmail);

  assert.equal(sendEmail.mock.callCount(), 1);
  assert.deepEqual(sendEmail.mock.calls[0].arguments, ['guy@loxbit.com', 'ขอบคุณสำหรับการสั่งซื้อ']);
});
```

## เขียนโค้ดให้ทดสอบง่าย

โค้ดที่ทดสอบยากมักมีลักษณะร่วมกันคือ ดึงของจากภายนอกเข้ามาเองข้างใน เช่น อ่านเวลาปัจจุบัน เรียก `fetch` หรือแตะ DOM ตรง ๆ วิธีแก้คือรับสิ่งเหล่านั้นเข้ามาเป็นพารามิเตอร์

```js
// ทดสอบยาก: ผลเปลี่ยนตามวันที่รันเทสต์
function isExpiredHard(expiresAt) {
  return new Date() >= new Date(expiresAt);
}

// ทดสอบง่าย: ส่งเวลาที่ต้องการเข้าไปได้ ค่าเริ่มต้นยังเป็นเวลาปัจจุบันเหมือนเดิม
function isExpired(expiresAt, now = new Date()) {
  return now >= new Date(expiresAt);
}

console.log(isExpired('2026-01-01', new Date('2026-06-01'))); // → true
console.log(isExpired('2026-12-31', new Date('2026-06-01'))); // → false
```

หลักเดียวกับ pure function ใน [บทฟังก์ชัน](05-functions.md) ยิ่งแยกส่วนคำนวณออกจากส่วนที่แตะโลกภายนอกได้มาก ยิ่งทดสอบได้มาก

## ทดสอบอะไรบ้าง

- **logic สำคัญทางธุรกิจ** การคำนวณเงิน ส่วนลด สิทธิ์การเข้าถึง
- **ขอบของข้อมูล** ค่าว่าง ศูนย์ ติดลบ ค่าที่อยู่ตรงเส้นแบ่งพอดี เช่น ยอด 999 กับ 1000 บาทที่ค่าส่งต่างกัน
- **บั๊กที่เคยเจอ** ทุกบั๊กที่แก้ ให้เขียนเทสต์ที่จำลองบั๊กนั้นก่อน ดูให้มันพัง แล้วค่อยแก้ให้ผ่าน

ไม่ต้องทดสอบรายละเอียดภายในที่เปลี่ยนได้โดยไม่กระทบผลลัพธ์ ให้ทดสอบ "สิ่งที่ผู้เรียกใช้เห็น" ไม่ใช่ "วิธีที่ข้างในทำงาน"

## ข้อผิดพลาดที่พบบ่อย

- เทสต์ที่พึ่งเวลาจริงหรือเครือข่ายจริง ผ่านบ้างพังบ้าง (flaky)
- เทสต์หนึ่งตัวตรวจหลายพฤติกรรมจนพังแล้วไม่รู้ว่าเรื่องไหนเสีย
- ใช้ `assert.equal` เทียบ object ซึ่งเทียบ reference ต้องใช้ `deepEqual`
- เขียนเทสต์ทีหลังโดยดูจากผลที่โค้ดคืนมา แล้วเทสต์ไปยืนยันบั๊กแทนที่จะจับบั๊ก

## สรุป

- `node:test` กับ `node:assert/strict` มากับ Node.js ไม่ต้องลงอะไรเพิ่ม สั่งรันด้วย `node --test`
- จัดเทสต์เป็น Arrange, Act, Assert และตั้งชื่อเป็นพฤติกรรม
- รับสิ่งภายนอกเป็นพารามิเตอร์ แล้วส่ง mock เข้าไปตอนทดสอบ

## อ่านเพิ่ม

- [Node.js: Test runner](https://nodejs.org/api/test.html)
- [Node.js: Assert](https://nodejs.org/api/assert.html)
- [Node.js Learn: Using Node.js's test runner](https://nodejs.org/learn/test-runner/using-test-runner)
