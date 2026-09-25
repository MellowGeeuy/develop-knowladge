# Performance พื้นฐาน

> หน้าเว็บที่ช้าทำให้ผู้ใช้เลิกใช้ก่อนเห็นว่ามันดีแค่ไหน แต่การเร่งความเร็วโดยไม่วัดก่อน มักได้โค้ดที่ซับซ้อนขึ้นโดยไม่ได้เร็วขึ้นจริง บทนี้เริ่มจากการวัด แล้วค่อยใช้เทคนิคที่ได้ผลคุ้มที่สุด

## บทนี้จะได้อะไร

- วัดความเร็วด้วย `performance.now()` และเครื่องมือใน DevTools
- ลดงานจาก event ที่เกิดถี่ด้วย debounce และ throttle
- เลี่ยง layout thrashing และทำแอนิเมชันที่ลื่น
- โหลดเท่าที่จำเป็น และย้ายงานหนักไปที่ Web Worker

## วัดก่อนแก้

```js
const startedAt = performance.now();

const primes = [];
for (let n = 2; primes.length < 1000; n++) {
  if (primes.every((prime) => n % prime !== 0)) primes.push(n);
}

const elapsed = performance.now() - startedAt;
console.log(primes.length); // → 1000
console.log(`ใช้เวลา ${elapsed.toFixed(1)} ms`);
```

ในเบราว์เซอร์ใช้แท็บ **Performance** ของ DevTools บันทึกการใช้งานจริง แล้วดูว่าเวลาหมดไปกับอะไร ส่วน **Lighthouse** ให้คะแนนภาพรวมพร้อมคำแนะนำ ตัวชี้วัดที่ Google ใช้วัดประสบการณ์ผู้ใช้ (Core Web Vitals) มีสามตัว

| ตัวชี้วัด | วัดอะไร | เป้าหมาย |
|---|---|---|
| LCP (Largest Contentful Paint) | เนื้อหาหลักแสดงเร็วแค่ไหน | ไม่เกิน 2.5 วินาที |
| INP (Interaction to Next Paint) | กดแล้วหน้าจอตอบสนองเร็วแค่ไหน | ไม่เกิน 200 มิลลิวินาที |
| CLS (Cumulative Layout Shift) | หน้าขยับเองระหว่างโหลดมากแค่ไหน | ไม่เกิน 0.1 |

## Debounce และ Throttle

event อย่าง `input`, `scroll`, `resize` เกิดได้หลายสิบครั้งต่อวินาที ถ้าทุกครั้งเรียก API หรือคำนวณหนัก หน้าเว็บจะหน่วงทันที

- **debounce** รอให้หยุดเกิดสักพักก่อนค่อยทำครั้งเดียว เหมาะกับช่องค้นหา
- **throttle** ทำได้ไม่เกินหนึ่งครั้งต่อช่วงเวลา เหมาะกับการตอบสนองระหว่างเลื่อนจอ

```js
function debounce(fn, waitMs) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}

function throttle(fn, intervalMs) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= intervalMs) {
      last = now;
      fn(...args);
    }
  };
}

const searched = [];
const search = debounce((query) => searched.push(query), 50);
search('j');
search('ja');
search('jav');
setTimeout(() => console.log(searched), 100); // → ['jav']
```

ใช้กับ event จริง

```js
const input = document.querySelector('#search-input');
input.addEventListener('input', debounce((event) => runSearch(event.target.value), 300));

window.addEventListener('scroll', throttle(updateReadingProgress, 100), { passive: true });
```

`{ passive: true }` บอกเบราว์เซอร์ว่า listener นี้จะไม่เรียก `preventDefault` เบราว์เซอร์จึงเลื่อนจอได้ทันทีโดยไม่ต้องรอ

## Layout thrashing

เมื่ออ่านขนาดหรือตำแหน่งของ element (`offsetWidth`, `getBoundingClientRect`) หลังจากเพิ่งแก้ style เบราว์เซอร์ต้องคำนวณ layout ใหม่ทันทีเพื่อตอบให้ถูก ถ้าอ่านสลับกับเขียนในลูป จะต้องคำนวณใหม่ทุกรอบ

```js
const cards = [...document.querySelectorAll('.card')];

// ช้า: อ่านสลับเขียน เบราว์เซอร์คำนวณ layout ใหม่ทุกรอบ
for (const card of cards) {
  card.style.height = `${card.offsetWidth * 0.75}px`;
}

// เร็ว: อ่านทั้งหมดก่อน แล้วค่อยเขียนทั้งหมด
const widths = cards.map((card) => card.offsetWidth);
cards.forEach((card, index) => {
  card.style.height = `${widths[index] * 0.75}px`;
});
```

ตัวอย่างนี้ทำได้ดีที่สุดด้วย CSS ล้วน `aspect-ratio: 4 / 3` โดยไม่ต้องใช้ JavaScript เลย งานหน้าตาให้ถาม CSS ก่อนเสมอ

แอนิเมชันให้เปลี่ยนเฉพาะ `transform` และ `opacity` ซึ่งเบราว์เซอร์ทำได้โดยไม่คำนวณ layout ใหม่ หลีกเลี่ยงการเคลื่อนไหวด้วย `top`, `left`, `width`, `height`

## โหลดเท่าที่จำเป็น

```html
<img src="product-640.webp" alt="คีย์บอร์ดไร้สายสีดำ" width="640" height="480" loading="lazy" decoding="async">
```

- รูปที่อยู่นอกจอตอนแรกใส่ `loading="lazy"` และใส่ `width`/`height` เสมอ ให้เบราว์เซอร์จองพื้นที่ไว้ หน้าจะไม่กระโดด (ลด CLS)
- ใช้รูปแบบ WebP หรือ AVIF และขนาดพอดีกับที่แสดงจริง
- ฟีเจอร์หนักที่ใช้ไม่บ่อย โหลดเมื่อกดใช้ด้วย `import()` ([บท ES Modules](11-modules.md))
- รายการหลายพันแถว แบ่งหน้า หรือแสดงเฉพาะส่วนที่อยู่บนจอ และสร้าง element ด้วย `DocumentFragment` ([บท DOM](13-dom.md))

## ย้ายงานหนักไป Web Worker

Worker รัน JavaScript บนเส้นทางแยกจากหน้าเว็บ งานคำนวณหนักจึงไม่ทำให้หน้าจอค้าง แต่ Worker แตะ DOM ไม่ได้ ต้องคุยกับหน้าเว็บผ่านข้อความ

```js file=assets/js/workers/report-worker.js
self.addEventListener('message', (event) => {
  const total = event.data.reduce((sum, row) => sum + row.amount, 0);
  self.postMessage(total);
});
```

```js file=assets/js/pages/report.js
const rows = Array.from({ length: 200000 }, (_, index) => ({ amount: index % 100 }));
const summary = document.querySelector('#summary');

const worker = new Worker(new URL('../workers/report-worker.js', import.meta.url), { type: 'module' });
worker.addEventListener('message', (event) => {
  summary.textContent = `ยอดรวม ${event.data.toLocaleString('th-TH')}`;
});
worker.postMessage(rows);
```

## อย่าให้หน่วยความจำรั่ว

หน้าเว็บที่เปิดทิ้งไว้นาน ๆ (เช่น Dashboard) จะช้าลงเรื่อย ๆ ถ้าสร้าง listener และตัวจับเวลาแล้วไม่เคยเก็บ

- `clearInterval` ทุก `setInterval` เมื่อไม่ใช้แล้ว
- ถอด listener ด้วย `AbortController` ([บท Event](14-events.md))
- อย่าเก็บ element ที่ถูกลบออกจากหน้าแล้วไว้ในตัวแปรหรือ Map ที่อยู่ตลอดอายุของหน้า

## ข้อผิดพลาดที่พบบ่อย

- ปรับแต่งจากความรู้สึก โดยไม่เคยวัดก่อนและหลัง
- ผูก `scroll`, `resize`, `input` โดยไม่ debounce หรือ throttle
- อ่านสลับเขียน layout ในลูป
- โหลดทุกอย่างตั้งแต่เปิดหน้า รวมถึงรูปขนาดใหญ่เกินที่แสดง
- ทำแอนิเมชันด้วยการเปลี่ยน `width` หรือ `top`

## สรุป

- วัดก่อนแก้ด้วย `performance.now()`, แท็บ Performance และ Lighthouse
- debounce สำหรับรอให้หยุด throttle สำหรับจำกัดความถี่
- อ่าน layout ให้หมดก่อนค่อยเขียน และเคลื่อนไหวด้วย `transform`
- โหลดเท่าที่จำเป็น และย้ายงานคำนวณหนักไป Web Worker

## อ่านเพิ่ม

- [MDN: Web performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [web.dev: Web Vitals](https://web.dev/articles/vitals)
- [MDN: Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [Chrome DevTools: Analyze runtime performance](https://developer.chrome.com/docs/devtools/performance)
