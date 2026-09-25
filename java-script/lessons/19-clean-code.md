# Clean Code และ Naming Convention

> โค้ดถูกอ่านบ่อยกว่าถูกเขียนหลายสิบเท่า และคนที่อ่านบ่อยที่สุดคือเพื่อนร่วมทีม รวมถึงตัวเราเองในอีกหกเดือน บทนี้รวมกติกาที่ทำให้โค้ดอ่านออกได้ทันทีโดยไม่ต้องถามคนเขียน

## บทนี้จะได้อะไร

- ตั้งชื่อตัวแปร ฟังก์ชัน class และไฟล์ตามมาตรฐานเดียวกันทั้งทีม
- แตกฟังก์ชันยาวเป็นฟังก์ชันสั้นที่ทำหน้าที่เดียว
- เลิกใช้ตัวเลขลอย ๆ และเขียนคอมเมนต์ที่อธิบาย "ทำไม" แทน "ทำอะไร"
- ให้เครื่องมือช่วยคุมรูปแบบโค้ดแทนการเถียงกันเรื่องความชอบ

## ตั้งชื่อให้บอกความหมาย

```js
// อ่านไม่ออก
const d = 7;
function calc(a, b) {
  return a * b * 1.07;
}
const list2 = users.filter((u) => u.s === 1);

// อ่านออกทันที
const DAYS_PER_WEEK = 7;
const VAT_RATE = 0.07;
function priceWithVat(unitPrice, quantity) {
  return unitPrice * quantity * (1 + VAT_RATE);
}
const activeUsers = users.filter((user) => user.status === USER_STATUS.ACTIVE);
```

รูปแบบการตั้งชื่อที่ใช้ในคลังความรู้นี้

| สิ่งที่ตั้งชื่อ | รูปแบบ | ตัวอย่าง |
|---|---|---|
| ตัวแปร ฟังก์ชัน | camelCase | `totalPrice`, `fetchUserData()` |
| class | PascalCase | `ShoppingCart`, `ApiClient` |
| ค่าคงที่ระดับการตั้งค่า | UPPER_SNAKE_CASE | `MAX_RETRY`, `API_TIMEOUT_MS` |
| ของภายใน class | private field `#` | `#balance`, `#validateInput()` |
| ชื่อไฟล์ | kebab-case ตัวเล็ก | `auth-handler.js`, `dom-helpers.js` |
| boolean | ขึ้นต้นด้วย is, has, can, should | `isVisible`, `hasAccess` |
| ฟังก์ชัน | ขึ้นต้นด้วยกริยา | `getUser`, `calculateTotal`, `renderList` |
| ตัวจัดการ event | handle หรือ on | `handleSubmit`, `onSaveClick` |

หลักคิดเพิ่มเติม

- ชื่อยาวขึ้นได้ถ้าชัดขึ้น `userIdsWithPendingInvoices` ดีกว่า `ids`
- ชื่อหน่วยไว้ในชื่อเมื่อเป็นตัวเลข `timeoutMs`, `priceInSatang`, `widthPx`
- ใช้คำเดียวกันกับเรื่องเดียวกันทั้งโปรเจกต์ ถ้าใช้ `fetch` ก็อย่าสลับไปใช้ `get`, `load`, `retrieve` กับของประเภทเดียวกัน

## ฟังก์ชันสั้น ทำอย่างเดียว

ฟังก์ชันที่ต้องอธิบายด้วยคำว่า "และ" หลายครั้ง (ตรวจข้อมูล **และ** คำนวณ **และ** จัดรูปแบบ **และ** บันทึก) ควรแตกออก ส่วนที่แตกออกมาได้ชื่อเป็นของตัวเอง ทดสอบแยกได้ และนำไปใช้ที่อื่นได้

```js
const VAT_RATE = 0.07;
const FREE_SHIPPING_MIN = 1000;
const SHIPPING_FEE = 50;

function subtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function shippingFee(amount) {
  return amount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
}

function orderTotal(items) {
  const base = subtotal(items);
  return Math.round((base + shippingFee(base)) * (1 + VAT_RATE));
}

console.log(orderTotal([{ price: 300, quantity: 2 }])); // → 696
console.log(orderTotal([{ price: 600, quantity: 2 }])); // → 1284
```

สังเกตว่าไม่มีตัวเลขลอย ๆ ในฟังก์ชันเลย ถ้าวันหนึ่งค่าส่งเปลี่ยนเป็น 60 บาท แก้บรรทัดเดียวที่ `SHIPPING_FEE`

## ออกให้เร็ว (early return)

จัดการกรณีผิดก่อนแล้วออกทันที กรณีปกติจะไม่ถูกซ้อนอยู่ในวงเล็บหลายชั้น (รายละเอียดใน [บทเงื่อนไขและการวนซ้ำ](04-control-flow.md))

```js
function discountFor(member) {
  if (!member) return 0;
  if (member.isSuspended) return 0;
  if (member.years >= 5) return 0.15;
  return 0.05;
}

console.log(discountFor({ years: 6, isSuspended: false })); // → 0.15
console.log(discountFor(null)); // → 0
```

## คอมเมนต์อธิบาย "ทำไม" ไม่ใช่ "ทำอะไร"

โค้ดที่ตั้งชื่อดีบอก "ทำอะไร" ได้เองอยู่แล้ว คอมเมนต์มีไว้บอกสิ่งที่อ่านจากโค้ดไม่ได้ เช่น เหตุผล ข้อจำกัดจากภายนอก หรือกับดักที่เคยเจอ

```js
// ไม่มีประโยชน์: พูดซ้ำสิ่งที่โค้ดบอกอยู่แล้ว
// เพิ่ม retries ขึ้น 1
retries += 1;

// มีประโยชน์: บอกเหตุผลที่ไม่มีทางรู้จากการอ่านโค้ด
// API ของบริษัทขนส่งตอบ 429 ถ้าเรียกถี่กว่า 1 ครั้งต่อวินาที จึงต้องรอก่อนลองใหม่
await wait(1000);
```

โค้ดที่ไม่ใช้แล้วให้ลบทิ้ง อย่าคอมเมนต์เก็บไว้ ประวัติทั้งหมดอยู่ใน git อยู่แล้ว

## ไม่แก้ของที่รับเข้ามา

ฟังก์ชันที่แก้ object หรือ array ที่รับเข้ามาสร้างผลข้างเคียงที่คนเรียกไม่คาดคิด ให้คืนของใหม่แทน

```js
// แก้ของเดิม: order ของคนเรียกเปลี่ยนไปด้วย
function markPaidInPlace(order) {
  order.status = 'paid';
  return order;
}

// คืนของใหม่: ของเดิมไม่เปลี่ยน
function markPaid(order) {
  return { ...order, status: 'paid', paidAt: new Date().toISOString() };
}

const order = { id: 1, status: 'pending' };
const paid = markPaid(order);
console.log(order.status, paid.status); // → pending paid
```

## ให้เครื่องมือคุมรูปแบบ

เรื่องเว้นวรรค เครื่องหมาย `;` หรือ quote แบบไหน ไม่ควรเสียเวลาถกกันในการ review ให้ formatter จัดให้อัตโนมัติ และให้ linter จับบั๊กที่พบบ่อย เช่น ตัวแปรที่ไม่ได้ใช้ หรือ `==` ที่หลุดมา

```bash
npm install --save-dev eslint prettier
npx eslint .
npx prettier --check .
```

ตั้งให้ editor จัดรูปแบบตอนบันทึกไฟล์ และให้ CI รัน lint ทุกครั้งที่มีการส่งโค้ด

## ข้อผิดพลาดที่พบบ่อย

- ชื่อย่อที่รู้กันแค่คนเขียน เช่น `usrLst`, `tmp2`, `flag`
- ฟังก์ชันยาวหลายร้อยบรรทัดที่ทำทุกอย่าง
- ตัวเลขและข้อความสำคัญกระจายอยู่ในโค้ดหลายจุด
- คอมเมนต์ที่ล้าสมัย บอกไม่ตรงกับโค้ดปัจจุบัน แย่กว่าไม่มีคอมเมนต์
- เก็บโค้ดเก่าไว้ในคอมเมนต์ "เผื่อใช้"

## สรุป

- ชื่อที่ดีคือเอกสารที่ดีที่สุด ใช้รูปแบบเดียวกันทั้งทีม
- ฟังก์ชันสั้นทำอย่างเดียว ไม่มีตัวเลขลอย ออกให้เร็ว
- คอมเมนต์บอก "ทำไม" และลบโค้ดที่ไม่ใช้
- ให้ formatter และ linter ทำงานน่าเบื่อแทนคน

## อ่านเพิ่ม

- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [MDN: JavaScript code style guide](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Code_style_guide/JavaScript)
- [ESLint: Getting Started](https://eslint.org/docs/latest/use/getting-started)
