# Event Loop

> JavaScript ทำงานได้ทีละอย่าง แต่หน้าเว็บกลับรอข้อมูลจากเซิร์ฟเวอร์ นับเวลา และรับคลิกไปพร้อมกันได้ ความลับอยู่ที่ event loop บทนี้อธิบายลำดับการทำงานจริง ซึ่งเป็นกุญแจของบทถัดไปเรื่อง Promise

## บทนี้จะได้อะไร

- เข้าใจ call stack และเหตุผลที่ JavaScript ทำงานทีละอย่าง
- บอกลำดับการทำงานของโค้ด sync, microtask และ task ได้
- รู้ว่าทำไมหน้าเว็บค้าง และแบ่งงานหนักไม่ให้ขวางหน้าจอ

## ทำงานทีละอย่างบน call stack

JavaScript มีเส้นทางทำงานเส้นเดียว (single thread) ทุกการเรียกฟังก์ชันถูกวางซ้อนบน **call stack** ฟังก์ชันบนสุดต้องทำเสร็จก่อน ตัวที่อยู่ข้างล่างถึงจะได้ทำต่อ

```js
function third() {
  console.log('3: ชั้นในสุดทำงาน แล้วคืนค่ากลับลงไป');
}
function second() {
  third();
}
function first() {
  second();
}
first();
```

```text
เรียก first()   →  [first]
เรียก second()  →  [first, second]
เรียก third()   →  [first, second, third]   ← บนสุดทำงานอยู่
third จบ        →  [first, second]
second จบ       →  [first]
first จบ        →  []                        ← stack ว่าง
```

## รอได้โดยไม่หยุดทั้งหน้า

งานที่ต้องรอ เช่น นับเวลาหรือโหลดข้อมูล ไม่ได้รอบน stack แต่ถูกฝากไว้กับเบราว์เซอร์ (Web APIs) เมื่อถึงเวลา เบราว์เซอร์จะเอา callback ไปต่อคิว แล้ว event loop จะหยิบเข้า stack **เมื่อ stack ว่างเท่านั้น**

```js
console.log('เริ่ม');
setTimeout(() => console.log('timeout 0ms'), 0);
console.log('จบ');
// ผลลัพธ์
// เริ่ม
// จบ
// timeout 0ms
```

แม้จะตั้งเวลา 0 มิลลิวินาที callback ก็ต้องรอให้โค้ดที่กำลังรันอยู่จบก่อนเสมอ

## คิวสองแบบ: microtask มาก่อน task

| คิว | มาจาก | กติกา |
|---|---|---|
| microtask | `Promise.then`, `await`, `queueMicrotask` | ทำ **จนหมดทุกตัว** ทันทีที่ stack ว่าง |
| task | `setTimeout`, `setInterval`, event จากผู้ใช้ | ทำ **ทีละตัว** แล้ววนกลับไปเช็ก microtask ใหม่ |

```js
console.log('A: sync');
setTimeout(() => console.log('E: task'), 0);
Promise.resolve().then(() => console.log('C: microtask'));
queueMicrotask(() => console.log('D: microtask'));
console.log('B: sync');
// ผลลัพธ์
// A: sync
// B: sync
// C: microtask
// D: microtask
// E: task
```

```text
┌────────────── Call Stack ──────────────┐
│  รันโค้ด sync ให้จบก่อนเสมอ               │
└───────────────────┬────────────────────┘
                    ▼ stack ว่าง
┌──────────── Microtask Queue ───────────┐
│  Promise.then · await · queueMicrotask  │  ทำจนหมดทุกตัว
└───────────────────┬────────────────────┘
                    ▼
          วาดหน้าจอใหม่ (ถ้าถึงรอบ)
                    ▼
┌────────────── Task Queue ──────────────┐
│  setTimeout · คลิก · พิมพ์ · ข้อความ      │  หยิบทีละ 1 ตัว แล้ววนกลับขึ้นไป
└────────────────────────────────────────┘
```

## ทำไมหน้าเว็บค้าง

ระหว่างที่โค้ด sync ทำงานยาว event loop ไม่มีโอกาสวาดหน้าจอหรือรับคลิกเลย

```js
function blockFor(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // วนเปล่า ๆ ระหว่างนี้คลิกอะไรก็ไม่ตอบสนอง
  }
}

const statusText = document.querySelector('#status');
document.querySelector('#run-report').addEventListener('click', () => {
  statusText.textContent = 'กำลังคำนวณ…';
  blockFor(3000); // ข้อความด้านบนไม่ขึ้น เพราะยังไม่ถึงรอบวาดจอ
  statusText.textContent = 'เสร็จแล้ว'; // ผู้ใช้เห็นแค่ข้อความนี้หลังหน้าค้าง 3 วินาที
});
```

ทางแก้คือแบ่งงานเป็นก้อนเล็ก แล้วคืนจังหวะให้เบราว์เซอร์ระหว่างก้อน

```js
function yieldToBrowser() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function processInChunks(items, handle, chunkSize = 500) {
  for (let start = 0; start < items.length; start += chunkSize) {
    items.slice(start, start + chunkSize).forEach(handle);
    await yieldToBrowser(); // เบราว์เซอร์วาดจอและรับคลิกได้ระหว่างก้อน
  }
}

let processed = 0;
await processInChunks(Array.from({ length: 2000 }, (_, index) => index), () => {
  processed += 1;
});
console.log(processed); // → 2000
```

งานคำนวณที่หนักมากจริง ๆ ให้ย้ายไปทำใน Web Worker ซึ่งมีเส้นทางทำงานแยกของตัวเอง (ดู [บท Performance](23-performance.md))

## setTimeout ไม่ได้การันตีเวลาที่แน่นอน

ตัวเลขใน `setTimeout` คือ "อย่างน้อยเท่านี้" ไม่ใช่ "ตรงเวลานี้" ถ้า stack ยังไม่ว่าง callback ก็ต้องรอต่อ และแท็บที่ผู้ใช้ไม่ได้เปิดดูอยู่ เบราว์เซอร์จะหน่วงตัวจับเวลาให้ช้าลงเพื่อประหยัดแบตเตอรี่

```js
const startedAt = Date.now();
setTimeout(() => {
  console.log(Date.now() - startedAt >= 100); // → true
}, 100);
```

> [!WARNING]
> อย่าใช้ `setInterval` นับเวลาจริง เช่น นาฬิกาจับเวลา เพราะคลาดสะสมไปเรื่อย ๆ ให้เก็บเวลาเริ่มไว้ แล้วคำนวณจาก `Date.now() - startedAt` ทุกครั้งที่แสดงผล

## ข้อผิดพลาดที่พบบ่อย

- คิดว่า `setTimeout(fn, 0)` ทำงานทันที
- ทำงานหนักแบบ sync ใน event handler จนหน้าค้าง
- คาดลำดับของ `Promise.then` กับ `setTimeout` ผิด (microtask มาก่อนเสมอ)
- สร้าง microtask ต่อกันไม่รู้จบ ทำให้เบราว์เซอร์ไม่ได้วาดจอเลย

## สรุป

- JavaScript ทำงานทีละอย่างบน call stack งานที่ต้องรอถูกฝากไว้กับเบราว์เซอร์
- เมื่อ stack ว่าง: ทำ microtask ให้หมดก่อน แล้วค่อยหยิบ task ทีละตัว
- งานยาวต้องแบ่งก้อนหรือย้ายไป Worker ไม่งั้นหน้าเว็บค้าง

## อ่านเพิ่ม

- [MDN: JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model)
- [MDN: Using microtasks](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)
- [MDN: setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
