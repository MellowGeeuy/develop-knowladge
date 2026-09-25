# Promise และ async/await

> งานที่ต้องรอ เช่น เรียก API อ่านไฟล์ หรือรอเวลา ต้องมีวิธีบอกว่า "เสร็จแล้วค่อยทำต่อ" Promise คือคำสัญญาว่าจะได้ผลในอนาคต ส่วน async/await ทำให้โค้ดที่รอหลายขั้นอ่านง่ายเหมือนโค้ดธรรมดา

## บทนี้จะได้อะไร

- เข้าใจว่า Promise แก้ปัญหาอะไรของ callback
- เขียนโค้ดรอผลด้วย async/await และจัดการ error ด้วย try/catch
- รันงานที่ไม่ขึ้นต่อกันพร้อมกันด้วย `Promise.all` และเลือกตัวช่วยให้ถูกงาน

## ปัญหาของ callback

ก่อนมี Promise งานที่ต้องรอส่งผลกลับผ่าน callback ถ้าต้องรอต่อกันหลายขั้น โค้ดจะซ้อนลึกลงเรื่อย ๆ และต้องจัดการ error ทุกชั้นเอง

```js
getUser(userId, (error, user) => {
  if (error) return showError(error);
  getOrders(user.id, (error, orders) => {
    if (error) return showError(error);
    getInvoice(orders[0].id, (error, invoice) => {
      if (error) return showError(error);
      render(invoice); // ลึกขึ้นทุกขั้น
    });
  });
});
```

## Promise

Promise มีสามสถานะ: **pending** (กำลังรอ) → **fulfilled** (สำเร็จ ได้ค่า) หรือ **rejected** (ล้มเหลว ได้ error) และเปลี่ยนสถานะได้ครั้งเดียว

```js
function wait(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

wait(100, 'พร้อม')
  .then((value) => {
    console.log(value); // → พร้อม
    return wait(50, value.length); // คืน Promise ตัวใหม่ then ถัดไปจะรอตัวนี้
  })
  .then((length) => console.log(length)) // → 5
  .catch((error) => console.error(error)) // จับ error ของทุกขั้นด้านบนที่เดียว
  .finally(() => console.log('จบไม่ว่าสำเร็จหรือล้มเหลว')); // → จบไม่ว่าสำเร็จหรือล้มเหลว
```

## async/await

`await` หยุดรอ Promise ภายในฟังก์ชัน `async` โดยไม่ขวางหน้าเว็บ (ระหว่างรอ event loop ไปทำงานอื่นได้) โค้ดจึงเรียงเป็นบรรทัดจากบนลงล่าง

```js
function wait(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function loadProfile() {
  const user = await wait(50, { id: 7, name: 'Guy' });
  const orders = await wait(50, [{ id: 1 }, { id: 2 }]);
  return `${user.name} มี ${orders.length} ออร์เดอร์`;
}

const message = await loadProfile(); // ใน module ใช้ await ที่ระดับบนสุดได้เลย
console.log(message); // → Guy มี 2 ออร์เดอร์

async function answer() {
  return 42;
}
console.log(answer() instanceof Promise); // → true
```

ฟังก์ชัน `async` คืน Promise เสมอ แม้จะ `return` ค่าธรรมดา

## จัดการ error

Promise ที่ถูก reject ทำให้ `await` โยน error ออกมา จับได้ด้วย `try`/`catch` แบบเดียวกับโค้ดปกติ

```js
function fetchStock(sku) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (sku === 'SOLD-OUT') reject(new Error(`สินค้า ${sku} หมด`));
      else resolve(12);
    }, 20);
  });
}

async function describeStock(sku) {
  try {
    const stock = await fetchStock(sku);
    return `คงเหลือ ${stock} ชิ้น`;
  } catch (error) {
    return `แสดงสต็อกไม่ได้: ${error.message}`;
  }
}

console.log(await describeStock('KB-01')); // → คงเหลือ 12 ชิ้น
console.log(await describeStock('SOLD-OUT')); // → แสดงสต็อกไม่ได้: สินค้า SOLD-OUT หมด
```

> [!WARNING]
> Promise ที่ reject แล้วไม่มีใครจับ จะกลายเป็น "Unhandled promise rejection" ในเบราว์เซอร์มีแค่ข้อความใน console แต่ใน Node.js โปรแกรมจะหยุดทำงานทันที ทุก Promise ต้องมี `catch` หรือ `try`/`catch` รออยู่ที่ใดที่หนึ่งเสมอ

## ต่อคิว หรือ รันพร้อมกัน

`await` ทีละบรรทัดคือต่อคิว ถ้างานไม่ได้ขึ้นต่อกัน ให้เริ่มทุกงานพร้อมกันแล้วรอทีเดียวด้วย `Promise.all`

```js
const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

let startedAt = Date.now();
const first = await wait(100, 'A');
const second = await wait(100, 'B');
console.log(first, second, Date.now() - startedAt >= 200); // → A B true

startedAt = Date.now();
const [third, fourth] = await Promise.all([wait(100, 'C'), wait(100, 'D')]);
console.log(third, fourth, Date.now() - startedAt < 190); // → C D true
```

แบบแรกใช้เวลาราว 200 มิลลิวินาที แบบที่สองราว 100 เพราะรอพร้อมกัน ถ้าหน้าเว็บต้องเรียก API สามตัวที่ไม่เกี่ยวกันตอนเปิด ความต่างนี้ผู้ใช้รู้สึกได้ทันที

## เลือกตัวช่วยให้ถูกงาน

| ใช้ | เมื่อ | ถ้ามีตัวที่ล้มเหลว |
|---|---|---|
| `Promise.all` | ต้องได้ผลครบทุกตัว | reject ทันทีด้วย error ตัวแรก |
| `Promise.allSettled` | อยากรู้ผลทุกตัว แม้บางตัวล้มเหลว | ไม่ reject ได้สถานะของทุกตัว |
| `Promise.race` | เอาตัวที่เสร็จก่อน ไม่ว่าสำเร็จหรือล้มเหลว | ถ้าล้มเหลวก่อนก็ reject |
| `Promise.any` | เอาตัวแรกที่สำเร็จ | reject เมื่อทุกตัวล้มเหลว (`AggregateError`) |

```js
const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const fail = (ms, message) => new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

const results = await Promise.allSettled([wait(30, 'ข่าว'), fail(10, 'พยากรณ์อากาศล่ม'), wait(20, 'หุ้น')]);
console.log(results.map((result) => result.status)); // → ['fulfilled', 'rejected', 'fulfilled']

const fastest = await Promise.race([wait(50, 'ช้า'), wait(10, 'เร็ว')]);
console.log(fastest); // → เร็ว

const firstSuccess = await Promise.any([fail(10, 'เซิร์ฟเวอร์ 1 ล่ม'), wait(30, 'เซิร์ฟเวอร์ 2')]);
console.log(firstSuccess); // → เซิร์ฟเวอร์ 2
```

`allSettled` เหมาะกับหน้า Dashboard ที่มีหลายกล่องข้อมูล กล่องไหนโหลดไม่ได้ก็แสดงข้อความเฉพาะกล่องนั้น กล่องอื่นยังแสดงผลได้ตามปกติ

## await ในลูป

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const saved = [];

async function save(id) {
  await wait(10);
  saved.push(id);
}

[1, 2, 3].forEach(async (id) => {
  await save(id); // forEach ไม่รอ async callback
});
console.log(saved.length); // → 0

await wait(50); // รอให้งานที่ forEach ปล่อยไว้เสร็จก่อน แล้วเริ่มนับใหม่
saved.length = 0;

for (const id of [1, 2, 3]) {
  await save(id); // ต่อคิวทีละตัวจริง บรรทัดถัดไปรอจนครบ
}
console.log(saved); // → [1, 2, 3]
```

บรรทัดที่พิมพ์ `0` ทำงานก่อนที่งานจาก `forEach` จะเสร็จแม้แต่ตัวเดียว เพราะ `forEach` แค่เรียก callback แล้วเดินต่อทันที

ต้องการทำพร้อมกันให้ใช้ `await Promise.all(ids.map((id) => save(id)))` ต้องการทำทีละตัวให้ใช้ `for...of` อย่าใช้ `forEach` กับ async

## ข้อผิดพลาดที่พบบ่อย

- ลืม `await` เลยได้ Promise แทนค่า เช่น `const user = getUser()` แล้ว `user.name` เป็น `undefined`
- `await` งานที่ไม่ขึ้นต่อกันทีละบรรทัด ทำให้หน้าเว็บช้าโดยไม่จำเป็น
- ใช้ `forEach` กับ async callback
- ไม่มีที่จับ error ของ Promise

## สรุป

- Promise แทนผลในอนาคต และมีสามสถานะ
- async/await ทำให้โค้ดที่ต้องรออ่านเป็นลำดับ และจับ error ด้วย `try`/`catch`
- งานอิสระต่อกันให้รันพร้อมกันด้วย `Promise.all` หรือ `Promise.allSettled`

## อ่านเพิ่ม

- [MDN: Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [MDN: async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [MDN: Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
