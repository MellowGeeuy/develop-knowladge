# ES Modules และการจัดโครงสร้างไฟล์

> เมื่อโค้ดยาวเกินไฟล์เดียว ต้องแบ่งเป็นหลายไฟล์ที่ส่งของให้กันอย่างเป็นระเบียบ ES Modules คือระบบมาตรฐานของภาษาสำหรับเรื่องนี้ บทนี้สอนทั้งไวยากรณ์ และวิธีจัดชั้นไฟล์ที่ทำให้โปรเจกต์โตได้โดยไม่พันกัน

## บทนี้จะได้อะไร

- ใช้ `export` และ `import` แบ่งโค้ดเป็นไฟล์
- รู้ว่า module ต่างจากสคริปต์แบบเก่าอย่างไร และทำไมต้องเปิดผ่าน http
- จัดโปรเจกต์เป็นสามชั้น `utils` → `modules` → `pages` โดยไม่มี import วนกัน
- ใช้ dynamic import และ `import.meta.url` ได้ถูกที่

## export และ import

ไฟล์หนึ่งไฟล์คือหนึ่ง module ของที่ไม่ได้ `export` จะเป็นของส่วนตัวของไฟล์นั้น

```js file=assets/js/utils/format-price.js
const BAHT = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });

export const VAT_RATE = 0.07;

export function formatPrice(satang) {
  return BAHT.format(satang / 100);
}
```

```js file=assets/js/pages/cart.js
import { formatPrice, VAT_RATE } from '../utils/format-price.js';

console.log(formatPrice(125000)); // → ฿1,250.00
console.log(VAT_RATE); // → 0.07
```

รูปแบบ import ที่ใช้บ่อย

```js
import { formatPrice } from './format-price.js'; // เลือกเฉพาะที่ต้องการ
import { formatPrice as toBaht } from './format-price.js'; // เปลี่ยนชื่อตอนนำเข้า
import * as money from './format-price.js'; // รวมทุก export ไว้ใต้ชื่อเดียว เรียกเป็น money.formatPrice
```

> [!TIP]
> ใช้ **named export** เป็นหลัก ชื่อจะเหมือนกันทุกไฟล์ที่นำเข้า ค้นหาทั้งโปรเจกต์ง่าย และ editor เปลี่ยนชื่อให้อัตโนมัติได้ ส่วน `export default` ปล่อยให้คนนำเข้าตั้งชื่ออะไรก็ได้ จึงมักได้ชื่อไม่ตรงกันในแต่ละไฟล์

## module ต่างจากสคริปต์แบบเก่าอย่างไร

| | `<script type="module">` | `<script>` แบบเก่า |
|---|---|---|
| ตัวแปรระดับบนสุด | อยู่ในไฟล์นั้น ไม่รั่วเป็น global | กลายเป็น global ชนกันได้ทุกไฟล์ |
| strict mode | เปิดให้อัตโนมัติ | ต้องเขียน `'use strict'` เอง |
| จังหวะรัน | รอให้ HTML ถูกสร้างเสร็จก่อน (defer) | รันทันทีที่เจอ บล็อกการสร้างหน้า |
| โหลดซ้ำ | ประเมินครั้งเดียว ทุกไฟล์ได้ของชิ้นเดียวกัน | โหลดกี่ครั้งรันกี่ครั้ง |
| `import`/`export` | ใช้ได้ | ใช้ไม่ได้ |

ในเบราว์เซอร์ที่ไม่มี bundler path ของ import ต้องเป็น relative (`./`, `../`) และมีนามสกุล `.js` เสมอ `import { x } from './utils'` แบบไม่มีนามสกุลจะหาไฟล์ไม่เจอ

## ทำไมต้องเปิดผ่าน http

เบราว์เซอร์โหลด module ตามกฎ CORS ซึ่งต้องรู้ว่าไฟล์มาจาก origin ไหน ไฟล์ที่เปิดแบบ `file://` ไม่มี origin ที่ใช้ได้ module จึงถูกบล็อกทั้งหมด ระหว่างพัฒนาให้เปิดผ่าน local server เสมอ

```bash
npx serve .
python -m http.server 8000
```

## จัดโปรเจกต์เป็นสามชั้น

การแบ่งไฟล์ที่ดีไม่ได้วัดที่จำนวนไฟล์ แต่วัดที่ทิศทางการพึ่งพา ถ้าทุกไฟล์ import หากันได้หมด สุดท้ายจะแก้ไฟล์หนึ่งแล้วพังอีกสิบไฟล์ แนวทางที่ใช้ในเว็บ The Brain นี้เองคือสามชั้นที่พึ่งพาได้ทางเดียว

```text
project/
├── index.html
└── assets/js/
    ├── utils/     ของพื้นฐานที่ไม่ผูกกับหน้าจอใด ส่วนใหญ่เป็นฟังก์ชันบริสุทธิ์ import ได้แค่ utils ด้วยกัน
    ├── modules/   ฟีเจอร์ของหน้าเว็บ (ตาราง ฟอร์ม เมนู) import จาก utils เท่านั้น
    └── pages/     จุดเริ่มของแต่ละหน้า ประกอบ modules กับ utils เข้าด้วยกัน
```

| ชั้น | ตัวอย่าง | import ได้จาก |
|---|---|---|
| `utils/` | `format-price.js`, `escape-html.js` | utils อื่น |
| `modules/` | `cart.js`, `search-dialog.js` | utils |
| `pages/` | `checkout.js`, `dashboard.js` | utils และ modules |

ถ้า module สองตัวต้องคุยกัน ให้หน้า (pages) เป็นคนเชื่อม เช่น ส่ง callback ให้ หรือใช้ event แทนการ import กันเอง

```js file=assets/js/pages/checkout.js
import { formatPrice } from '../utils/format-price.js';
import { initCart } from '../modules/cart.js';
import { initSummary } from '../modules/summary.js';

function init() {
  const summary = initSummary(document.querySelector('#summary'), { format: formatPrice });
  initCart(document.querySelector('#cart'), {
    onChange: (items) => summary.update(items), // pages เชื่อมสอง modules เข้าหากัน
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

ชื่อไฟล์ใช้ kebab-case ตัวพิมพ์เล็กเสมอ (`format-price.js`) เพราะเซิร์ฟเวอร์ส่วนใหญ่แยกตัวพิมพ์ใหญ่เล็ก ไฟล์ที่เปิดได้บน Windows อาจหาไม่เจอเมื่อขึ้นเซิร์ฟเวอร์จริง

## Dynamic import: โหลดเมื่อต้องใช้

`import()` แบบฟังก์ชันโหลด module ตอนรันจริง เหมาะกับฟีเจอร์หนักที่ผู้ใช้ส่วนน้อยกดใช้ เช่น กราฟหรือตัวแก้ไขรูป

```js
const button = document.querySelector('#show-chart');

button.addEventListener('click', async () => {
  const { renderChart } = await import('./modules/chart.js');
  renderChart(document.querySelector('#chart'));
});
```

## import.meta.url: path ที่ไม่พังเมื่อหน้าอยู่คนละชั้น

`fetch('data/items.json')` resolve path จากที่อยู่ของ **หน้าเว็บ** ไม่ใช่ของไฟล์ JS ถ้า module เดียวกันถูกใช้ในหน้าที่อยู่คนละความลึก path จะชี้ผิดไฟล์ ให้ผูก path กับตัว module เองด้วย `import.meta.url`

```js file=assets/js/modules/catalog.js
const DATA_URL = new URL('../../data/items.json', import.meta.url);

export async function loadItems() {
  const response = await fetch(DATA_URL);
  return response.json();
}
```

## CommonJS ของเก่าใน Node.js

โค้ด Node.js รุ่นเก่าใช้ `require()` และ `module.exports` ซึ่งเป็นระบบก่อนมี ES Modules โค้ดใหม่ให้ใช้ `import`/`export` แล้วตั้ง `"type": "module"` ใน `package.json` หรือใช้นามสกุล `.mjs`

```js nocheck
// CommonJS (เก่า) — ใช้ได้เฉพาะใน Node.js
const { readFile } = require('node:fs/promises');
module.exports = { readFile };
```

## ข้อผิดพลาดที่พบบ่อย

- ลืมนามสกุล `.js` ใน path ของ import
- เปิดหน้าเว็บแบบ `file://` แล้ว module ไม่ทำงาน
- module สองไฟล์ import กันไปมา (circular) จนได้ค่า `undefined` ตอนโหลด
- ใช้ path แบบ relative กับ `fetch` ใน module ที่หลายหน้าใช้ร่วมกัน
- ไฟล์เดียวทำทุกอย่างจนยาวหลายพันบรรทัด ให้แตกตามหน้าที่

## สรุป

- หนึ่งไฟล์คือหนึ่ง module ใช้ named export เป็นหลัก
- module มี scope ของตัวเอง เปิด strict mode และต้องเปิดผ่าน http
- จัดชั้น `utils` → `modules` → `pages` ให้พึ่งพากันทางเดียว
- path ที่ module ใช้ fetch ให้ผูกกับ `import.meta.url`

## อ่านเพิ่ม

- [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MDN: import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- [MDN: export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
- [MDN: import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)
