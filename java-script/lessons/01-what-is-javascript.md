# JavaScript คืออะไร และรันโค้ดที่ไหน

> JavaScript คือภาษาโปรแกรมที่เบราว์เซอร์ทุกตัวเข้าใจ และรันนอกเบราว์เซอร์ได้ด้วย Node.js บทนี้พาดูว่าโค้ดของเราไปทำงานที่ไหน แล้วเริ่มเขียนบรรทัดแรกด้วย 3 วิธี

## บทนี้จะได้อะไร

- เข้าใจว่า JavaScript, ECMAScript และ engine เกี่ยวข้องกันอย่างไร
- รันโค้ดได้ทั้งใน DevTools ของเบราว์เซอร์ ในไฟล์ HTML และด้วย Node.js
- รู้ว่าทำไมโค้ดสมัยใหม่ควรเป็น ES Module และทำงานใน strict mode

## ภาษา มาตรฐาน และ engine

JavaScript ถูกกำหนดด้วยมาตรฐานชื่อ **ECMAScript** ซึ่งออกเวอร์ชันใหม่ทุกปี เวอร์ชันที่เปลี่ยนภาษาไปมากที่สุดคือ ES2015 (หรือ ES6) ที่เพิ่ม `let`, `const`, arrow function, class และ module หลังจากนั้นแต่ละปีเพิ่มทีละไม่มาก เช่น ES2020 เพิ่ม `?.` และ `??`

ตัวที่อ่านโค้ดแล้วสั่งเครื่องทำงานจริงเรียกว่า **engine** แต่ละค่ายมีของตัวเอง

| Engine | ใช้ใน |
|---|---|
| V8 | Chrome, Edge, Node.js |
| SpiderMonkey | Firefox |
| JavaScriptCore | Safari |

engine เป็นแค่ตัวภาษา ส่วน "ของที่ให้เรียกใช้" มาจากสภาพแวดล้อมที่ engine อยู่ เช่น `document` มีเฉพาะในเบราว์เซอร์ ส่วนการอ่านไฟล์บนดิสก์มีเฉพาะใน Node.js

| | เบราว์เซอร์ | Node.js |
|---|---|---|
| ใช้ทำอะไร | หน้าเว็บ และ UI | เซิร์ฟเวอร์ สคริปต์ เครื่องมือ |
| object ประจำตัว | `window`, `document` | `process`, โมดูล `node:fs` |
| อ่านเขียนไฟล์บนเครื่อง | ไม่ได้ (เพื่อความปลอดภัย) | ได้ |
| ใช้ได้ทั้งคู่ | `console`, `setTimeout`, `fetch`, `JSON`, `Math`, `Promise` | |

## วิธีที่ 1 ลองใน Console ของเบราว์เซอร์

กด `F12` หรือ `Ctrl+Shift+J` แล้วเลือกแท็บ **Console** พิมพ์โค้ดแล้วกด Enter ได้ทันที

```js
console.log('สวัสดี The Brain'); // → สวัสดี The Brain
console.log(1 + 2); // → 3
console.log(typeof 'ข้อความ'); // → string
```

ในบทเรียนทั้งหมดของคอร์สนี้ ผลลัพธ์ที่ console แสดงจะเขียนไว้ท้ายบรรทัดเป็น `// → ค่า` เสมอ

> [!TIP]
> Console เหมาะกับการลองของสั้น ๆ พิมพ์ชื่อตัวแปรแล้วกด Enter ก็เห็นค่าทันที ส่วนโค้ดที่ยาวเกินสองสามบรรทัดให้เขียนเป็นไฟล์

## วิธีที่ 2 เขียนในไฟล์ HTML

โค้ดหน้าเว็บจริงอยู่ในไฟล์ `.js` แยก แล้วให้ HTML โหลดด้วย `<script type="module">`

```html file=index.html
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>บทแรก</title>
  <script type="module" src="main.js"></script>
</head>
<body>
  <h1 id="greeting">กำลังโหลด…</h1>
</body>
</html>
```

```js file=main.js
const heading = document.querySelector('#greeting');
heading.textContent = 'สวัสดีจาก JavaScript';
```

`type="module"` ให้ประโยชน์สามอย่างพร้อมกัน

1. รอให้ HTML ถูกสร้างเสร็จก่อนค่อยรัน จึงหา `#greeting` เจอแม้วาง script ไว้ใน `<head>`
2. เปิด strict mode ให้อัตโนมัติ
3. ตัวแปรในไฟล์ไม่รั่วไปเป็นตัวแปร global และใช้ `import` กับ `export` ได้ (รายละเอียดใน [บท ES Modules](11-modules.md))

> [!WARNING]
> ดับเบิลคลิกเปิดไฟล์ HTML ตรง ๆ (URL ขึ้นต้นด้วย `file://`) แล้ว module จะไม่ทำงาน เพราะเบราว์เซอร์บล็อกด้วยนโยบายความปลอดภัย ให้เปิดผ่าน local server เสมอ เช่น ส่วนขยาย Live Server ของ VS Code หรือคำสั่งด้านล่าง

```bash
npx serve .
python -m http.server 8000
```

## วิธีที่ 3 รันด้วย Node.js

ติดตั้ง Node.js รุ่น LTS จาก nodejs.org แล้วตรวจว่าใช้งานได้

```bash
node --version
```

สร้างไฟล์ `hello.mjs` แล้วสั่ง `node hello.mjs` ในโฟลเดอร์เดียวกัน

```js file=hello.mjs
const name = 'The Brain';
console.log(`สวัสดี ${name}`); // → สวัสดี The Brain
console.log(`ตอนนี้ ${new Date().toLocaleTimeString('th-TH')}`);
```

นามสกุล `.mjs` บอก Node.js ว่าไฟล์นี้เป็น ES Module ถ้าใช้ `.js` ต้องมี `"type": "module"` ใน `package.json` ของโปรเจกต์ ไม่งั้น Node.js จะอ่านเป็นระบบเก่า (CommonJS) แล้ว `import` ใช้ไม่ได้

## Strict mode

strict mode ทำให้ความผิดพลาดที่เคยเงียบกลายเป็น error ที่เห็นทันที module และ class เปิดโหมดนี้ให้เอง ส่วนสคริปต์แบบเก่าต้องเขียน `'use strict';` ไว้บรรทัดแรก

```js
'use strict';

function addTax(price) {
  totl = price * 1.07; // พิมพ์ชื่อตัวแปรผิด
  return totl;
}

addTax(100); // ReferenceError: totl is not defined
```

ถ้าไม่มี strict mode โค้ดนี้จะสร้างตัวแปร global ชื่อ `totl` ขึ้นมาเงียบ ๆ แล้วทำงานต่อได้เหมือนไม่มีอะไรผิด บั๊กแบบนี้หายากมากในโปรเจกต์ใหญ่

## ข้อผิดพลาดที่พบบ่อย

- เปิดไฟล์ HTML แบบ `file://` แล้วโค้ดไม่ทำงาน ให้เปิดผ่าน local server
- ใช้ `<script>` แบบธรรมดาใน `<head>` แล้วหา element ไม่เจอ เพราะโค้ดรันก่อน HTML ถูกสร้าง ใช้ `type="module"` แทน
- เรียก `document` ใน Node.js ซึ่งไม่มีหน้าเว็บให้ควบคุม
- ไม่เปิดดู Console ตอนโค้ดพัง ทั้งที่ข้อความสีแดงบอกชื่อไฟล์และบรรทัดที่ผิดไว้แล้ว

## สรุป

- JavaScript เป็นภาษาตามมาตรฐาน ECMAScript และทำงานบน engine เช่น V8
- เบราว์เซอร์กับ Node.js ใช้ภาษาเดียวกัน แต่มีของให้เรียกใช้ต่างกัน
- เขียนโค้ดใหม่เป็น ES Module เสมอ (`type="module"` หรือ `.mjs`) และเปิดหน้าเว็บผ่าน http

## อ่านเพิ่ม

- [MDN: JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [MDN: Strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)
- [Node.js: Introduction to Node.js](https://nodejs.org/learn/getting-started/introduction-to-nodejs)
