# ตัวแปรและชนิดข้อมูล

> ตัวแปรคือชื่อที่ผูกไว้กับค่า JavaScript มีวิธีประกาศตัวแปร 3 แบบและชนิดข้อมูล 8 ชนิด เข้าใจสองเรื่องนี้ให้แม่นแล้วบั๊กของมือใหม่จะหายไปเกือบครึ่ง

## บทนี้จะได้อะไร

- เลือกใช้ `const` กับ `let` ได้ถูก และรู้ว่าทำไมเลิกใช้ `var`
- รู้จักชนิดข้อมูลพื้นฐาน 7 ชนิดกับ object และตรวจชนิดด้วย `typeof`
- เข้าใจค่าแบบ value กับ reference ต้นเหตุของบั๊ก "แก้ตรงนี้แต่ไปเปลี่ยนตรงโน้น"

## const, let และ var

```js
const siteName = 'The Brain'; // ผูกครั้งเดียว เปลี่ยนไม่ได้
let score = 0; // เปลี่ยนค่าได้
score = score + 10;
console.log(siteName, score); // → The Brain 10
```

หลักที่ใช้ได้เกือบทุกสถานการณ์คือ **เริ่มด้วย `const` เสมอ** ถ้าต้องเปลี่ยนค่าจริงค่อยใช้ `let` และไม่ใช้ `var` ในโค้ดใหม่

`const` ห้ามผูกชื่อกับค่าใหม่ แต่ไม่ได้ทำให้ของข้างใน object แก้ไม่ได้

```js
const user = { name: 'Guy' };
user.name = 'Friday'; // ได้ เพราะแก้ของข้างใน ไม่ได้เปลี่ยนว่า user ชี้ไปที่ object ไหน
console.log(user.name); // → Friday
// user = {}; จะได้ TypeError: Assignment to constant variable.
```

`var` มาจากยุคแรกของภาษาและมีพฤติกรรมที่ทำให้เกิดบั๊กง่าย เช่น มองไม่เห็นขอบเขตของ `{ }`

```js
if (true) {
  var leaked = 'หลุดออกมานอก if';
  let contained = 'อยู่ใน if เท่านั้น';
}
console.log(leaked); // → หลุดออกมานอก if
console.log(typeof contained); // → undefined
```

| | `const` | `let` | `var` |
|---|---|---|---|
| ขอบเขต | block `{ }` | block `{ }` | ทั้งฟังก์ชัน |
| ผูกค่าใหม่ | ไม่ได้ | ได้ | ได้ |
| ประกาศชื่อซ้ำ | ไม่ได้ | ไม่ได้ | ได้ (อันตราย) |
| ใช้ก่อนประกาศ | error | error | ได้ค่า `undefined` เงียบ ๆ |

> [!TIP]
> โค้ดที่ดีส่วนใหญ่มีแต่ `const` เกือบทั้งไฟล์ เพราะค่าที่ไม่เปลี่ยนอ่านง่ายกว่า ผู้อ่านไม่ต้องไล่หาว่าบรรทัดไหนแก้ค่าไปบ้าง

## ตั้งชื่อตัวแปร

- ตัวแปรและฟังก์ชันใช้ **camelCase** เช่น `userName`, `totalPrice`
- ค่าคงที่ระดับการตั้งค่าใช้ **UPPER_SNAKE_CASE** เช่น `MAX_RETRY`, `API_TIMEOUT_MS`
- class ใช้ **PascalCase** เช่น `ShoppingCart`
- ค่า boolean ขึ้นต้นด้วย `is`, `has`, `can` เช่น `isLoggedIn`, `hasPermission`

ชื่อภาษาไทยใช้เป็นชื่อตัวแปรได้จริงตามมาตรฐาน แต่ไม่ควรใช้ในงานทีม เพราะต้องสลับภาษาแป้นพิมพ์ตลอดและค้นหาในโค้ดยาก รายละเอียดเรื่องการตั้งชื่ออยู่ใน [บท Clean Code](19-clean-code.md)

## ชนิดข้อมูล 8 ชนิด

JavaScript มีค่าพื้นฐาน (primitive) 7 ชนิด และทุกอย่างที่เหลือคือ object รวมถึง array, function และ date

```js
console.log(typeof 'สวัสดี'); // → string
console.log(typeof 42); // → number
console.log(typeof 3.14); // → number
console.log(typeof 10n); // → bigint
console.log(typeof true); // → boolean
console.log(typeof undefined); // → undefined
console.log(typeof Symbol('id')); // → symbol
console.log(typeof { a: 1 }); // → object
console.log(typeof [1, 2, 3]); // → object
console.log(typeof null); // → object
console.log(typeof function greet() {}); // → function
```

| ชนิด | ตัวอย่าง | หมายเหตุ |
|---|---|---|
| string | `'สวัสดี'`, `` `ราคา ${price}` `` | ข้อความ ใช้ `'` หรือ `` ` `` ก็ได้ |
| number | `42`, `3.14`, `-7`, `NaN` | จำนวนเต็มและทศนิยมเป็นชนิดเดียวกัน |
| bigint | `10n` | จำนวนเต็มขนาดใหญ่เกิน 2^53 |
| boolean | `true`, `false` | |
| undefined | `undefined` | ยังไม่มีค่า |
| null | `null` | ตั้งใจให้ว่าง |
| symbol | `Symbol('id')` | ค่าที่ไม่ซ้ำกับอะไรเลย ใช้เป็น key พิเศษ |

สองจุดที่คนพลาดบ่อย

- `typeof null` ได้ `'object'` เป็นบั๊กเก่าตั้งแต่ภาษาเกิดที่แก้ไม่ได้แล้ว ให้เช็ก `value === null` ตรง ๆ
- `typeof` บอกไม่ได้ว่าเป็น array ให้ใช้ `Array.isArray()`

```js
console.log(Array.isArray([1, 2])); // → true
console.log(Array.isArray({ length: 2 })); // → false
```

### undefined กับ null ต่างกันอย่างไร

`undefined` คือ "ยังไม่มีใครให้ค่า" เช่น ตัวแปรที่ประกาศแล้วไม่ได้กำหนดค่า หรือ property ที่ไม่มีอยู่ ส่วน `null` คือ "ตั้งใจบอกว่าว่าง" ใช้เวลาเราต้องการสื่อว่าไม่มีค่าอย่างชัดเจน

```js
let selectedUser;
console.log(selectedUser); // → undefined
selectedUser = null; // ผู้ใช้กดยกเลิกการเลือก
console.log(selectedUser); // → null
```

## ค่าแบบ value กับ reference

ค่า primitive ถูก **คัดลอกทั้งค่า** เวลากำหนดให้ตัวแปรอื่น แก้ตัวหนึ่งไม่กระทบอีกตัว

```js
let a = 10;
let b = a;
b = 20;
console.log(a, b); // → 10 20
```

แต่ object ถูกส่งต่อเป็น **ที่อยู่ (reference)** ตัวแปรสองตัวจึงชี้ไปที่ของชิ้นเดียวกัน

```js
const original = { tags: ['js'] };
const copy = original;
copy.tags.push('web');
console.log(original.tags); // → ['js', 'web']
console.log(copy === original); // → true
```

ด้วยเหตุผลเดียวกัน การเปรียบเทียบ object ด้วย `===` คือถามว่า "เป็นชิ้นเดียวกันไหม" ไม่ใช่ "หน้าตาเหมือนกันไหม"

```js
console.log({ a: 1 } === { a: 1 }); // → false
```

> [!IMPORTANT]
> ถ้าต้องการสำเนาที่แก้ได้โดยไม่กระทบต้นฉบับ ต้องคัดลอกจริง เช่น `{ ...original }` หรือ `structuredClone(original)` ความต่างของสองวิธีนี้อยู่ใน [บท Object, Map, Set และ JSON](08-objects-map-set-json.md)

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `var` แล้วตัวแปรหลุดออกนอก `if` หรือ `for`
- คิดว่า `const` ทำให้ object แก้ไม่ได้ (ถ้าต้องการจริงใช้ `Object.freeze`)
- ตรวจ array ด้วย `typeof` ซึ่งได้ `'object'` เหมือน object ทั่วไป
- คัดลอก object ด้วย `=` แล้วแก้ตัวใหม่ จนต้นฉบับเปลี่ยนตามไปด้วย

## สรุป

- ใช้ `const` เป็นค่าเริ่มต้น ใช้ `let` เมื่อต้องเปลี่ยนค่า และเลิกใช้ `var`
- มี primitive 7 ชนิด นอกนั้นเป็น object ทั้งหมด
- primitive คัดลอกทั้งค่า ส่วน object ส่งต่อเป็น reference

## อ่านเพิ่ม

- [MDN: Grammar and types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types)
- [MDN: JavaScript data types and data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures)
- [MDN: typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
