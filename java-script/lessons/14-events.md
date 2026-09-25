# Event และการตอบสนองผู้ใช้

> ทุกการกระทำของผู้ใช้ ทั้งคลิก พิมพ์ เลื่อนจอ หรือส่งฟอร์ม เบราว์เซอร์แจ้งมาเป็น event บทนี้สอนการรับ event ให้ถูกวิธี ใช้ event delegation จัดการของจำนวนมาก และทำฟอร์มที่ไม่รีโหลดหน้า

## บทนี้จะได้อะไร

- ผูกและถอด event listener ได้ถูกต้อง
- เข้าใจว่า event เดินทางผ่าน DOM อย่างไร (bubbling)
- ใช้ event delegation แทนการผูก listener ให้ทุก element
- จัดการฟอร์มด้วย `preventDefault` และ `FormData`

## addEventListener

```js
const likeButton = document.querySelector('#like-button');
let likes = 0;

likeButton.addEventListener('click', () => {
  likes += 1;
  likeButton.textContent = `ถูกใจ ${likes}`;
});
```

ฟังก์ชันที่ผูกไว้จะได้ event object เป็นอาร์กิวเมนต์ ข้อมูลที่ใช้บ่อยคือ

| property / เมธอด | ความหมาย |
|---|---|
| `event.target` | element ที่ถูกกระทำจริง (อาจเป็นลูกข้างใน) |
| `event.currentTarget` | element ที่ผูก listener ไว้ |
| `event.key` | ปุ่มที่กดสำหรับ event คีย์บอร์ด เช่น `'Enter'`, `'Escape'` |
| `event.preventDefault()` | ยกเลิกพฤติกรรมปกติของเบราว์เซอร์ เช่น ส่งฟอร์มหรือเปิดลิงก์ |

### ถอด listener

ต้องส่งฟังก์ชัน **ตัวเดียวกัน** กับที่ผูกไว้ arrow function ที่เขียนใหม่เป็นคนละตัว ถอดไม่ออก วิธีที่สะดวกที่สุดคือใช้ `AbortController` ถอดทีละหลายตัวได้ในคำสั่งเดียว

```js
const controller = new AbortController();

window.addEventListener('resize', () => console.log('ขนาดจอเปลี่ยน'), { signal: controller.signal });
window.addEventListener('keydown', (event) => console.log(event.key), { signal: controller.signal });

// เมื่อไม่ใช้ส่วนนี้ของหน้าแล้ว
controller.abort(); // ถอด listener ทุกตัวที่ผูกกับ signal นี้
```

ถ้าต้องการให้ทำงานครั้งเดียว ใส่ `{ once: true }` แล้ว listener จะถอดตัวเองหลังทำงาน

## event เดินทางอย่างไร (bubbling)

เมื่อคลิกปุ่ม event เกิดที่ปุ่มก่อน แล้ว "ลอยขึ้น" ไปหา element ที่ครอบอยู่ทีละชั้นจนถึง `document`

```text
คลิกที่ <button>  →  <li>  →  <ul>  →  <section>  →  document  →  window
```

```js
document.querySelector('.card').addEventListener('click', () => {
  console.log('card');
});

document.querySelector('.card__button').addEventListener('click', () => {
  console.log('button');
});
// คลิกปุ่มจะเห็น "button" ก่อน แล้วตามด้วย "card"
```

`event.stopPropagation()` หยุดการลอยขึ้นได้ แต่ใช้เท่าที่จำเป็นจริง ๆ เพราะจะทำให้ส่วนอื่นที่รอฟัง event นั้น (เช่น เมนูที่ปิดเมื่อคลิกนอกกรอบ) ไม่ได้รับไปด้วย

## Event delegation

เพราะ event ลอยขึ้นมาถึงตัวที่ครอบ จึงผูก listener ไว้ที่ตัวครอบเพียงตัวเดียว แล้วดูว่าคลิกโดนอะไร วิธีนี้ใช้ listener น้อยกว่า และรองรับรายการที่เพิ่มเข้ามาทีหลังโดยไม่ต้องผูกใหม่

```html
<ul id="todo-list" class="todo">
  <li class="todo__item" data-id="1">
    <span>อ่านบท Event</span>
    <button type="button" data-action="toggle">เสร็จแล้ว</button>
    <button type="button" data-action="delete">ลบ</button>
  </li>
</ul>
```

```js
const list = document.querySelector('#todo-list');

list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || !list.contains(button)) return;

  const item = button.closest('[data-id]');
  if (button.dataset.action === 'delete') {
    item.remove();
  } else if (button.dataset.action === 'toggle') {
    item.classList.toggle('is-done');
  }
});
```

`closest` สำคัญมากตรงนี้ เพราะ `event.target` อาจเป็นไอคอนหรือข้อความที่อยู่ข้างในปุ่ม ไม่ใช่ตัวปุ่มเอง

## ฟอร์ม: preventDefault และ FormData

ฟังที่ event `submit` ของฟอร์ม ไม่ใช่ `click` ของปุ่ม เพราะผู้ใช้ส่งฟอร์มด้วยการกด Enter ในช่องกรอกได้ด้วย

```html
<form id="signup-form" class="form" novalidate>
  <label class="form__field">อีเมล <input name="email" type="email" required></label>
  <label class="form__field">ชื่อที่แสดง <input name="displayName" required minlength="2"></label>
  <label class="form__field"><input name="newsletter" type="checkbox"> รับข่าวสาร</label>
  <button type="submit">สมัครสมาชิก</button>
  <p class="form__error" id="signup-error" role="alert" hidden></p>
</form>
```

```js
const form = document.querySelector('#signup-form');
const errorBox = document.querySelector('#signup-error');

form.addEventListener('submit', (event) => {
  event.preventDefault(); // ไม่ให้เบราว์เซอร์ส่งฟอร์มแล้วโหลดหน้าใหม่

  if (!form.checkValidity()) {
    errorBox.textContent = 'กรุณากรอกอีเมลและชื่อที่แสดงให้ครบ';
    errorBox.hidden = false;
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  data.newsletter = data.newsletter === 'on'; // checkbox ที่ไม่ได้ติ๊กจะไม่อยู่ใน FormData เลย
  errorBox.hidden = true;
  console.log(data); // เช่น { email: 'guy@loxbit.com', displayName: 'Guy', newsletter: true }
});
```

`FormData` อ่านค่าจากทุกช่องที่มี `name` ให้เอง ไม่ต้อง `querySelector` ทีละช่อง และ `checkValidity()` ใช้กติกา `required`, `type="email"`, `minlength` ที่เขียนไว้ใน HTML ได้ทันที

## คีย์บอร์ดและการเข้าถึง

```js
document.addEventListener('keydown', (event) => {
  const isTyping = event.target.closest('input, textarea, select, [contenteditable]');
  if (event.key === '/' && !isTyping) {
    event.preventDefault();
    document.querySelector('#search').focus();
  }
});
```

- ใช้ `event.key` (`keyCode` เลิกใช้แล้ว)
- อย่าแย่งปุ่มลัดตอนผู้ใช้กำลังพิมพ์ในช่องกรอก
- สิ่งที่กดได้ให้ใช้ `<button>` เสมอ ไม่ใช้ `<div>` ผูก click เพราะปุ่มจริงได้การโฟกัสด้วยแป้น Tab และกดด้วย Enter หรือ Space มาให้ฟรี

## input กับ change

| event | เกิดเมื่อ | เหมาะกับ |
|---|---|---|
| `input` | ทุกครั้งที่ค่าเปลี่ยน รวมทุกการพิมพ์ | ค้นหาทันที ตรวจความยาว นับตัวอักษร |
| `change` | ผู้ใช้ยืนยันค่าแล้ว เช่น ออกจากช่อง หรือเลือกตัวเลือก | select, checkbox, บันทึกอัตโนมัติ |

event ที่เกิดถี่มาก (`input`, `scroll`, `resize`) ควรหน่วงด้วย debounce หรือ throttle ดูวิธีทำใน [บท Performance](23-performance.md)

## ข้อผิดพลาดที่พบบ่อย

- ผูก listener ให้ทุก element ในลูปแทนการใช้ delegation
- ลืม `preventDefault` ตอน submit จนหน้ารีโหลดและข้อมูลที่กรอกหายหมด
- ใช้ `<div>` เป็นปุ่ม ผู้ใช้คีย์บอร์ดกดไม่ได้
- `removeEventListener` ด้วย arrow function ตัวใหม่ ซึ่งถอดไม่ออก
- ใช้ `stopPropagation` จนส่วนอื่นของหน้าไม่ได้รับ event

## สรุป

- `addEventListener` คู่กับ `AbortController` ผูกง่าย ถอดง่าย
- event ลอยขึ้นจากตัวที่ถูกคลิกไปหาตัวครอบ จึงใช้ delegation ได้
- ฟอร์มฟังที่ `submit` เรียก `preventDefault` แล้วอ่านค่าด้วย `FormData`

## อ่านเพิ่ม

- [MDN: EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [MDN: Event bubbling](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling)
- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [MDN: Event.preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
