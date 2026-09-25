# String, Number และ Date

> ข้อความ ตัวเลข และวันที่ มีอยู่ในทุกหน้าจอ และมีกับดักเฉพาะตัวทั้งสามอย่าง โดยเฉพาะเมื่อข้อมูลเป็นภาษาไทย เป็นเงินบาท หรือต้องแสดงปี พ.ศ. บทนี้รวมวิธีจัดการที่ใช้ได้จริง

## บทนี้จะได้อะไร

- จัดการข้อความด้วยเมธอดที่ใช้บ่อย และรู้ว่าทำไม `length` ของข้อความไทยไม่ตรงกับที่ตาเห็น
- เข้าใจว่าทำไม `0.1 + 0.2` ไม่เท่ากับ `0.3` และคำนวณเงินอย่างปลอดภัย
- จัดรูปแบบตัวเลข เงินบาท และวันที่ภาษาไทยด้วย `Intl`

## String

string แก้ไขในที่ไม่ได้ ทุกเมธอดคืน string ใหม่เสมอ

```js
const email = '  Guy@Loxbit.com ';
const clean = email.trim();
console.log(clean.toLowerCase()); // → guy@loxbit.com
console.log(clean.includes('@')); // → true
console.log(clean.startsWith('Guy')); // → true
console.log(clean.split('@')); // → ['Guy', 'Loxbit.com']
console.log(clean.slice(0, 3)); // → Guy
console.log(clean.replaceAll('o', '0')); // → Guy@L0xbit.c0m
console.log('7'.padStart(3, '0')); // → 007
```

template literal (backtick) แทรกค่าด้วย `${ }` และเขียนหลายบรรทัดได้

```js
const product = 'กาแฟ';
const quantity = 2;
const price = 45;
console.log(`${product} ${quantity} แก้ว รวม ${quantity * price} บาท`); // → กาแฟ 2 แก้ว รวม 90 บาท
```

### ความยาวของข้อความภาษาไทย

`length` นับหน่วยรหัส (code unit) ไม่ได้นับตัวอักษรที่ตาเห็น สระบนล่างและวรรณยุกต์ของไทยถูกนับแยกเป็นหนึ่งหน่วยด้วย

```js
console.log('ไม้'.length); // → 3
const graphemes = new Intl.Segmenter('th', { granularity: 'grapheme' });
console.log([...graphemes.segment('ไม้')].length); // → 2
```

ถ้าต้องจำกัดความยาวที่ผู้ใช้เห็น เช่น ตัดข้อความให้ไม่เกิน 20 ตัวอักษร ให้นับด้วย `Intl.Segmenter` ไม่งั้นอาจตัดกลางระหว่างพยัญชนะกับวรรณยุกต์

`Intl.Segmenter` ยังตัดคำภาษาไทยที่เขียนติดกันได้ด้วย

```js
const words = new Intl.Segmenter('th', { granularity: 'word' });
const tokens = [...words.segment('เรียนภาษาไทย')]
  .filter((part) => part.isWordLike)
  .map((part) => part.segment);
console.log(tokens); // → ['เรียน', 'ภาษา', 'ไทย']
```

## Number

ตัวเลขทุกตัวใน JavaScript เป็นทศนิยมแบบ 64 บิต (IEEE 754) ทศนิยมบางค่าจึงเก็บได้ไม่ตรงเป๊ะ

```js
console.log(0.1 + 0.2); // → 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // → false
```

> [!IMPORTANT]
> อย่าคำนวณเงินด้วยทศนิยมตรง ๆ ให้เก็บเป็นหน่วยย่อยที่เป็นจำนวนเต็ม (สตางค์) คำนวณให้เสร็จ แล้วค่อยแปลงกลับตอนแสดงผล

```js
const priceInSatang = 1999; // 19.99 บาท
const quantity = 3;
const totalSatang = priceInSatang * quantity;
console.log(totalSatang); // → 5997
console.log(totalSatang / 100); // → 59.97
```

การปัดเศษมีหลายแบบ และ `toFixed` ปัดจากค่าที่เก็บจริง ซึ่งอาจต่ำกว่าที่ตาเห็นเล็กน้อย

```js
console.log((1.005).toFixed(2)); // → 1.00
console.log(Math.round(2.5), Math.round(-2.5)); // → 3 -2
console.log(Math.floor(9.99), Math.ceil(9.01), Math.trunc(-4.7)); // → 9 10 -4
```

จำนวนเต็มที่เก็บได้แม่นยำมีขีดจำกัด เกินกว่านั้นต้องใช้ `bigint`

```js
console.log(Number.MAX_SAFE_INTEGER); // → 9007199254740991
console.log(9007199254740993 === 9007199254740992); // → true
console.log(2n ** 64n); // → 18446744073709551616n
```

## จัดรูปแบบตัวเลขด้วย Intl.NumberFormat

อย่าต่อคอมมาหรือสัญลักษณ์เงินเอง ใช้ `Intl.NumberFormat` ซึ่งรู้กติกาของแต่ละภาษาอยู่แล้ว

```js
const baht = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });
console.log(baht.format(1234567.5)); // → ฿1,234,567.50

const compact = new Intl.NumberFormat('th-TH', { notation: 'compact', compactDisplay: 'long' });
console.log(compact.format(1500000)); // → 1.5 ล้าน

const percent = new Intl.NumberFormat('th-TH', { style: 'percent', maximumFractionDigits: 1 });
console.log(percent.format(0.256)); // → 25.6%

const thaiDigits = new Intl.NumberFormat('th-TH-u-nu-thai');
console.log(thaiDigits.format(2569)); // → ๒,๕๖๙
```

สร้าง formatter ครั้งเดียวแล้วใช้ซ้ำ เพราะการสร้างใหม่ทุกครั้งที่แสดงผลช้ากว่ามากเมื่อต้องจัดรูปแบบข้อมูลหลายพันแถว

## Date

`Date` เก็บเวลาเป็นจำนวนมิลลิวินาทีนับจาก 1 มกราคม 1970 (UTC) และมีกับดักสำคัญสองข้อ

**เดือนเริ่มนับจาก 0** มกราคมคือ 0 และธันวาคมคือ 11

```js
const release = new Date(2026, 8, 25); // 25 กันยายน 2026 เพราะเดือน 8 คือกันยายน
console.log(release.getMonth()); // → 8
console.log(release.getDate()); // → 25
console.log(release.getDay()); // → 5
```

**string แบบวันที่อย่างเดียวถูกอ่านเป็น UTC** แต่ถ้ามีเวลาด้วยจะถูกอ่านเป็นเวลาท้องถิ่นของเครื่อง

```js
const utcMidnight = new Date('2026-09-25');
console.log(utcMidnight.toISOString()); // → 2026-09-25T00:00:00.000Z
```

ผลต่างของวันที่คือผลต่างของมิลลิวินาที

```js
const start = new Date('2026-09-01');
const end = new Date('2026-09-25');
const MS_PER_DAY = 24 * 60 * 60 * 1000;
console.log((end - start) / MS_PER_DAY); // → 24
```

### แสดงวันที่ภาษาไทยด้วย Intl.DateTimeFormat

locale `th-TH` ใช้ปฏิทินพุทธ (พ.ศ.) ให้อัตโนมัติ ระบุ `timeZone` ทุกครั้งเพื่อให้ผลเหมือนกันไม่ว่าเครื่องผู้ใช้จะตั้งเขตเวลาไว้ที่ไหน

```js
const moment = new Date(Date.UTC(2026, 8, 25, 3, 30)); // 10:30 เวลาไทย

const longDate = new Intl.DateTimeFormat('th-TH', { dateStyle: 'long', timeZone: 'Asia/Bangkok' });
console.log(longDate.format(moment)); // → 25 กันยายน 2569

const dateTime = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' });
console.log(dateTime.format(moment)); // → 25 ก.ย. 2569 10:30

const gregorian = new Intl.DateTimeFormat('th-TH-u-ca-gregory', { dateStyle: 'long', timeZone: 'Asia/Bangkok' });
console.log(gregorian.format(moment)); // → 25 กันยายน ค.ศ. 2026
```

ข้อความแบบ "เมื่อวาน" หรือ "อีก 3 ชั่วโมง" ใช้ `Intl.RelativeTimeFormat`

```js
const relative = new Intl.RelativeTimeFormat('th', { numeric: 'auto' });
console.log(relative.format(-1, 'day')); // → เมื่อวาน
console.log(relative.format(3, 'hour')); // → ในอีก 3 ชั่วโมง
```

> [!NOTE]
> ส่งวันที่ระหว่างระบบ (API ฐานข้อมูล) เป็นรูปแบบ ISO 8601 ใน UTC เช่น `2026-09-25T03:30:00.000Z` เสมอ แล้วค่อยแปลงเป็นภาษาไทยตอนแสดงผลเท่านั้น

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `length` นับตัวอักษรภาษาไทย แล้วตัดข้อความกลางวรรณยุกต์
- คำนวณเงินด้วยทศนิยมจนยอดรวมคลาดไปหนึ่งสตางค์
- ลืมว่าเดือนของ `Date` เริ่มจาก 0 เลยได้เดือนถัดไป
- จัดรูปแบบวันที่โดยไม่ระบุ `timeZone` แล้วผู้ใช้ต่างประเทศเห็นวันที่คลาดไปหนึ่งวัน

## สรุป

- string แก้ในที่ไม่ได้ และ `length` ไม่ใช่จำนวนตัวอักษรที่เห็นเสมอไป
- เงินให้คำนวณเป็นจำนวนเต็มในหน่วยสตางค์
- ใช้ `Intl.NumberFormat` และ `Intl.DateTimeFormat` สำหรับเงินบาท ตัวเลข และวันที่ พ.ศ.

## อ่านเพิ่ม

- [MDN: String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [MDN: Numbers and strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Numbers_and_strings)
- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [MDN: Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
