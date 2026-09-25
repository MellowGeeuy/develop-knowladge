# ตัวดำเนินการและการแปลงชนิดข้อมูล

> JavaScript ยอมให้เอาค่าต่างชนิดมาคำนวณกันได้ โดยแปลงชนิดให้เองเงียบ ๆ ความสะดวกนี้เป็นต้นเหตุของบั๊กจำนวนมาก บทนี้สอนตัวดำเนินการที่ใช้ทุกวัน และวิธีเขียนให้ภาษาไม่ต้องเดาใจเรา

## บทนี้จะได้อะไร

- ใช้ตัวดำเนินการคณิตศาสตร์ การเปรียบเทียบ และตรรกะได้ถูกต้อง
- เข้าใจว่าทำไมต้องใช้ `===` แทน `==`
- ใช้ `??` และ `?.` จัดการค่าที่อาจไม่มีได้อย่างปลอดภัย

## คณิตศาสตร์

```js
console.log(7 + 3); // → 10
console.log(7 - 3); // → 4
console.log(7 * 3); // → 21
console.log(7 / 2); // → 3.5
console.log(7 % 3); // → 1
console.log(2 ** 10); // → 1024
```

ตัวดำเนินการแบบย่อช่วยให้แก้ค่าตัวเองได้สั้นลง

```js
let count = 0;
count += 5; // count = count + 5
count -= 2;
count *= 10;
count++; // เพิ่มทีละ 1
console.log(count); // → 31
```

เครื่องหมาย `+` ทำสองหน้าที่ ถ้ามีฝั่งใดเป็น string จะกลายเป็นการต่อข้อความทันที ส่วน `-`, `*`, `/` พยายามแปลงทุกอย่างเป็นตัวเลข

```js
console.log('10' + 5); // → 105
console.log('10' - 5); // → 5
console.log('10' * '2'); // → 20
console.log(1 + 2 + '3'); // → 33
console.log('1' + 2 + 3); // → 123
```

> [!WARNING]
> ค่าที่อ่านจากช่องกรอกในฟอร์มเป็น string เสมอ แม้ผู้ใช้จะพิมพ์ตัวเลข ต้องแปลงเป็น number ก่อนบวก ไม่งั้น `'10' + 5` ได้ `'105'` แทนที่จะเป็น `15`

## เปรียบเทียบ: `===` กับ `==`

`===` (strict equality) เท่ากันเมื่อชนิดและค่าตรงกันเท่านั้น ส่วน `==` จะแปลงชนิดก่อนเทียบตามกติกาที่ซับซ้อนและจำยาก

```js
console.log(1 === 1); // → true
console.log(1 === '1'); // → false
console.log(1 == '1'); // → true
console.log(0 == ''); // → true
console.log(null == undefined); // → true
console.log(null === undefined); // → false
```

ใช้ `===` และ `!==` เสมอ ข้อยกเว้นเดียวที่หลายทีมยอมรับคือ `value == null` ซึ่งเช็ก `null` และ `undefined` พร้อมกัน แต่เขียนด้วย `??` (หัวข้อถัดไป) มักอ่านง่ายกว่า

`NaN` (Not a Number) เป็นค่าเดียวในภาษาที่ไม่เท่ากับตัวเอง ต้องตรวจด้วย `Number.isNaN`

```js
console.log(NaN === NaN); // → false
console.log(Number.isNaN(NaN)); // → true
console.log(Number.isNaN(Number('abc'))); // → true
```

string เทียบกันทีละตัวอักษรตามรหัส ไม่ได้เทียบเป็นตัวเลข

```js
console.log('apple' < 'banana'); // → true
console.log('10' < '9'); // → true
console.log(10 < 9); // → false
```

## Truthy และ falsy

เวลาเอาค่าไปใช้ในเงื่อนไข JavaScript จะมองค่านั้นเป็น `true` หรือ `false` ค่าที่ถูกมองเป็น `false` มีแค่ 8 ตัว ที่เหลือเป็น truthy ทั้งหมด

| falsy | truthy ที่คนมักเข้าใจผิด |
|---|---|
| `false`, `0`, `-0`, `0n` | `'0'` (string ที่มีเลข 0) |
| `''` (string ว่าง) | `'false'` |
| `null`, `undefined` | `[]` (array ว่าง) |
| `NaN` | `{}` (object ว่าง) |

ปัญหาที่เจอบ่อยคือใช้ความ falsy เช็กว่า "ไม่มีค่า" แล้ว `0` ซึ่งเป็นค่าที่ถูกต้องถูกตีความว่าไม่มีไปด้วย

```js
function showStock(count) {
  if (!count) {
    return 'ไม่มีข้อมูลสต็อก';
  }
  return `เหลือ ${count} ชิ้น`;
}

console.log(showStock(3)); // → เหลือ 3 ชิ้น
console.log(showStock(0)); // → ไม่มีข้อมูลสต็อก
```

สินค้าหมด (0 ชิ้น) กับไม่มีข้อมูล (`undefined`) เป็นคนละเรื่องกัน ควรเช็กให้ตรงความหมาย เช่น `if (count === undefined)`

## ตรรกะ: `&&`, `||`, `!`

`&&` และ `||` คืน **ค่าหนึ่งในสองฝั่ง** ไม่จำเป็นต้องเป็น `true` หรือ `false` และหยุดประเมินทันทีที่รู้ผล (short-circuit)

```js
console.log(true && 'ผ่าน'); // → ผ่าน
console.log(false && 'ผ่าน'); // → false
console.log('' || 'ค่าเริ่มต้น'); // → ค่าเริ่มต้น
console.log('Guy' || 'ค่าเริ่มต้น'); // → Guy
console.log(!true); // → false
console.log(!!'ข้อความ'); // → true
```

## `??` เลือกค่าเริ่มต้นเฉพาะตอนไม่มีค่าจริง

`||` แทนค่าเมื่อฝั่งซ้ายเป็น falsy ใด ๆ ส่วน `??` (nullish coalescing) แทนเฉพาะเมื่อเป็น `null` หรือ `undefined` จึงไม่ทับค่า `0` หรือ `''` ที่ตั้งใจใส่

```js
const settings = { pageSize: 0, theme: undefined };
console.log(settings.pageSize || 20); // → 20
console.log(settings.pageSize ?? 20); // → 0
console.log(settings.theme ?? 'light'); // → light
```

`??=` กำหนดค่าให้เฉพาะตอนที่ยังไม่มีค่า

```js
const options = { retries: 0 };
options.retries ??= 3;
options.timeout ??= 5000;
console.log(options); // → { retries: 0, timeout: 5000 }
```

## `?.` เข้าถึงข้อมูลที่อาจไม่มี

optional chaining หยุดและคืน `undefined` ทันทีถ้าตัวหน้า `?.` เป็น `null` หรือ `undefined` แทนที่จะโยน error

```js
const order = { customer: { name: 'Guy' } };
console.log(order.customer?.name); // → Guy
console.log(order.shipping?.address); // → undefined
console.log(order.shipping?.address ?? 'ยังไม่ระบุที่อยู่'); // → ยังไม่ระบุที่อยู่
console.log(order.getTotal?.()); // → undefined
```

ถ้าไม่มี `?.` บรรทัด `order.shipping.address` จะได้ `TypeError: Cannot read properties of undefined (reading 'address')`

> [!TIP]
> ใช้ `?.` กับข้อมูลที่ "ไม่มีได้ตามธรรมชาติ" เช่น ที่อยู่จัดส่งที่ลูกค้ายังไม่กรอก อย่าใส่ทุกจุดเพื่อกัน error ไว้ก่อน เพราะจะกลบบั๊กที่ควรพังให้เห็นตั้งแต่แรก

## Ternary

เลือกค่าจากเงื่อนไขในนิพจน์เดียว เหมาะกับการเลือกค่าง่าย ๆ ถ้าต้องซ้อนหลายชั้นให้กลับไปใช้ `if`

```js
const stock = 0;
const label = stock > 0 ? 'มีสินค้า' : 'สินค้าหมด';
console.log(label); // → สินค้าหมด
```

## แปลงชนิดข้อมูลแบบตั้งใจ

แปลงเองให้ชัดเจนดีกว่าปล่อยให้ภาษาแปลงให้

```js
console.log(Number('42')); // → 42
console.log(Number('42px')); // → NaN
console.log(Number.parseInt('42px', 10)); // → 42
console.log(Number.parseFloat('3.75 บาท')); // → 3.75
console.log(Number('')); // → 0
console.log(String(42)); // → 42
console.log(Boolean('')); // → false
```

ระวัง `Number('')` ได้ `0` ช่องกรอกที่ว่างจึงกลายเป็นเลขศูนย์ได้ถ้าไม่ตรวจก่อน

การแปลงอัตโนมัติที่ควรรู้ไว้เพื่อไม่ตกใจเวลาเจอ

| นิพจน์ | ผลลัพธ์ | เหตุผล |
|---|---|---|
| `'5' * 2` | `10` | `*` แปลง string เป็น number |
| `'5' + 2` | `'52'` | `+` เจอ string จึงต่อข้อความ |
| `true + 1` | `2` | `true` ถูกแปลงเป็น `1` |
| `null + 1` | `1` | `null` ถูกแปลงเป็น `0` |
| `undefined + 1` | `NaN` | `undefined` แปลงเป็นตัวเลขไม่ได้ |

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `==` แล้วได้ `true` ในกรณีที่ไม่คาดคิด เช่น `0 == ''`
- ใช้ `||` ตั้งค่าเริ่มต้น แล้ว `0` หรือ `''` ที่ตั้งใจใส่ถูกแทนทิ้ง ให้ใช้ `??`
- บวกค่าจากช่องกรอก (string) กับตัวเลข แล้วได้ข้อความต่อกัน
- ตรวจ `NaN` ด้วย `=== NaN` ซึ่งได้ `false` เสมอ

## สรุป

- เปรียบเทียบด้วย `===` และ `!==` เสมอ
- `??` สำหรับค่าเริ่มต้น `?.` สำหรับข้อมูลที่อาจไม่มี
- แปลงชนิดเองให้ชัดเจนด้วย `Number()`, `String()` แทนการพึ่งการแปลงอัตโนมัติ

## อ่านเพิ่ม

- [MDN: Expressions and operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators)
- [MDN: Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness)
- [MDN: Nullish coalescing operator (??)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- [MDN: Optional chaining (?.)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
