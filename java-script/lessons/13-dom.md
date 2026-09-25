# DOM: ควบคุมหน้าเว็บด้วย JavaScript

> เบราว์เซอร์แปลง HTML ทั้งหน้าเป็นต้นไม้ของ object ที่เรียกว่า DOM (Document Object Model) JavaScript แก้หน้าเว็บได้ด้วยการแก้ต้นไม้นี้ บทนี้สอนการเลือก สร้าง และแก้ element อย่างปลอดภัยและเร็ว

## บทนี้จะได้อะไร

- เลือก element ด้วย `querySelector` และเดินในต้นไม้ DOM ได้
- เปลี่ยนข้อความอย่างปลอดภัย และรู้ว่าทำไม `innerHTML` อันตราย
- จัดการ class, attribute และ `data-*` แบบที่ทีมอ่านง่าย
- สร้างรายการจากข้อมูลด้วย `<template>` และ `DocumentFragment`

## HTML ตัวอย่างของบทนี้

```html
<section id="product-list" class="product-list">
  <h2 class="product-list__title">สินค้าแนะนำ</h2>
  <ul class="product-list__items">
    <li class="product-list__item" data-id="1">คีย์บอร์ด</li>
    <li class="product-list__item" data-id="2">เมาส์</li>
  </ul>
</section>
```

## เลือก element

`querySelector` คืน element แรกที่ตรงกับ CSS selector ส่วน `querySelectorAll` คืนทุกตัวเป็น `NodeList`

```js
const section = document.querySelector('#product-list');
const title = section.querySelector('.product-list__title');
const items = section.querySelectorAll('.product-list__item');

console.log(title.textContent); // → สินค้าแนะนำ
console.log(items.length); // → 2
console.log([...items].map((item) => item.dataset.id)); // → ['1', '2']
```

- เริ่มค้นจาก element ที่ใกล้ที่สุด (`section.querySelector`) เร็วกว่าและไม่ไปเจอของชื่อซ้ำในส่วนอื่นของหน้า
- `querySelector` คืน `null` ถ้าไม่เจอ ถ้าเรียก property ต่อทันทีจะได้ `TypeError`
- `NodeList` มี `forEach` แต่ไม่มี `map` ให้แปลงเป็น array ด้วย `[...items]` ก่อน

เดินขึ้นหา element ที่ครอบอยู่ด้วย `closest` ซึ่งใช้บ่อยมากคู่กับ event ([บทถัดไป](14-events.md))

```js
const mouse = document.querySelector('[data-id="2"]');
console.log(mouse.closest('section').id); // → product-list
console.log(mouse.previousElementSibling.textContent); // → คีย์บอร์ด
```

## เปลี่ยนข้อความ: textContent กับ innerHTML

`textContent` ใส่ข้อความตามตัวอักษรเสมอ ส่วน `innerHTML` ให้เบราว์เซอร์แปลความเป็น HTML ซึ่งรวมถึงโค้ดที่ซ่อนมาด้วย

```js
const comment = '<img src="x" onerror="alert(\'ถูกเจาะแล้ว\')">';
const box = document.querySelector('#comment');

box.textContent = comment; // ปลอดภัย: ผู้ใช้เห็นข้อความตามที่พิมพ์
// box.innerHTML = comment; // อันตราย: เบราว์เซอร์รันโค้ดใน onerror ทันที
```

> [!CAUTION]
> ห้ามเอาข้อมูลจากผู้ใช้ จาก URL หรือจาก API ใส่ `innerHTML` ตรง ๆ ช่องโหว่นี้ชื่อ XSS ทำให้ผู้โจมตีรันโค้ดในเบราว์เซอร์ของผู้ใช้คนอื่นได้ รายละเอียดและวิธีป้องกันอยู่ใน [บท Security](22-security-basics.md)

## class, attribute และ data-*

เปลี่ยนหน้าตาด้วยการสลับ class แทนการแก้ style ทีละค่า CSS จะอยู่ที่ไฟล์ CSS ที่เดียว ส่วน JavaScript แค่บอกสถานะ

```js
const button = document.querySelector('#save-button');

button.classList.add('is-loading');
button.classList.toggle('is-active', true); // อาร์กิวเมนต์ที่สองบังคับว่าจะใส่หรือถอด
button.disabled = true;
button.setAttribute('aria-busy', 'true');
button.dataset.state = 'saving'; // กลายเป็น data-state="saving" ใน HTML
```

แนวตั้งชื่อ class ที่ใช้ในคลังความรู้นี้ (BEM + state)

| ใช้กับ | รูปแบบ | ตัวอย่าง |
|---|---|---|
| component | `block` | `.product-list` |
| ชิ้นส่วนใน component | `block__element` | `.product-list__item` |
| รูปแบบย่อย | `block--modifier` | `.product-list--compact` |
| สถานะที่ JavaScript สลับ | `is-*` | `.is-loading`, `.is-open` |

## สร้างและลบ element

```js
function createBadge(text) {
  const badge = document.createElement('span');
  badge.className = 'badge badge--new';
  badge.textContent = text;
  return badge;
}

const heading = document.querySelector('.product-list__title');
heading.append(createBadge('ใหม่')); // ต่อท้ายข้างใน
heading.before(createBadge('แนะนำ')); // วางไว้ก่อนตัวเอง
document.querySelector('[data-id="1"]').remove(); // ลบทิ้ง
```

เมธอดที่ใช้บ่อย: `append`, `prepend`, `before`, `after`, `replaceWith`, `replaceChildren`, `remove`

## สร้างรายการจากข้อมูลด้วย template

เขียนโครง HTML ของหนึ่งแถวไว้ใน `<template>` (เบราว์เซอร์ไม่แสดงผลจนกว่าจะคัดลอกไปใช้) แล้วเติมข้อมูลด้วย `textContent`

```html
<template id="product-row">
  <li class="product-list__item">
    <span class="product-list__name"></span>
    <span class="product-list__price"></span>
  </li>
</template>
```

```js
const products = [
  { id: 1, name: 'คีย์บอร์ด', price: 1590 },
  { id: 2, name: 'เมาส์', price: 690 },
];

const template = document.querySelector('#product-row');
const list = document.querySelector('.product-list__items');
const baht = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });

const fragment = document.createDocumentFragment();
for (const product of products) {
  const row = template.content.cloneNode(true);
  row.querySelector('.product-list__item').dataset.id = product.id;
  row.querySelector('.product-list__name').textContent = product.name;
  row.querySelector('.product-list__price').textContent = baht.format(product.price);
  fragment.append(row);
}
list.replaceChildren(fragment); // ล้างของเดิมแล้วใส่ของใหม่ในครั้งเดียว
```

วิธีนี้ปลอดภัย (ข้อมูลเข้าผ่าน `textContent` ทั้งหมด) และเร็ว เพราะ `DocumentFragment` รวมทุกแถวไว้นอกหน้าเว็บก่อน แล้วเพิ่มเข้าหน้าในครั้งเดียว เบราว์เซอร์คำนวณหน้าใหม่ครั้งเดียวแทนที่จะคำนวณทุกแถว

## รอให้ DOM พร้อม

script แบบ `type="module"` รอให้ HTML ถูกสร้างเสร็จก่อนรันอยู่แล้ว จึงเลือก element ได้ทันที ถ้าเป็น script แบบเก่าที่วางใน `<head>` ต้องรอ event `DOMContentLoaded` ก่อน ไม่งั้น `querySelector` จะได้ `null`

## ข้อผิดพลาดที่พบบ่อย

- `querySelector` ได้ `null` แล้วเรียก property ต่อ จน `TypeError: Cannot read properties of null`
- ใส่ข้อมูลจากผู้ใช้ด้วย `innerHTML`
- เพิ่ม element เข้าหน้าทีละตัวในลูปใหญ่ ทำให้หน้าเว็บช้า
- แก้ `element.style` ทีละค่าแทนการสลับ class
- เรียก `map` กับ `NodeList` ตรง ๆ

## สรุป

- เลือกด้วย `querySelector` จาก element ที่ใกล้ที่สุด และตรวจ `null` เสมอ
- ข้อความใช้ `textContent` เสมอ `innerHTML` ใช้กับ HTML ที่เราเขียนเองเท่านั้น
- เปลี่ยนหน้าตาด้วย class ชื่อแบบ BEM และสถานะ `is-*`
- สร้างรายการด้วย `<template>` + `DocumentFragment`

## อ่านเพิ่ม

- [MDN: Document Object Model (DOM)](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [MDN: Document.querySelector()](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)
- [MDN: Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
- [MDN: The template element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template)
