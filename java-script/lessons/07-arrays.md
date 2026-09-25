# Array

> array คือรายการของค่าที่เรียงลำดับ ข้อมูลแทบทุกอย่างที่มาจาก API อยู่ในรูป array บทนี้สอนเมธอดที่ใช้ทุกวัน และสิ่งที่ต้องระวังที่สุดคือเมธอดไหน "แก้ของเดิม" และไหน "คืนของใหม่"

## บทนี้จะได้อะไร

- สร้าง เข้าถึง และแก้ array ได้
- แยกเมธอดที่แก้ array เดิมออกจากเมธอดที่คืน array ใหม่
- ใช้ `map`, `filter`, `reduce`, `find`, `some`, `every` แทนลูปได้
- เรียงลำดับตัวเลขและภาษาไทยได้ถูก

## สร้างและเข้าถึง

```js
const scores = [72, 95, 58];
console.log(scores[0]); // → 72
console.log(scores.at(-1)); // → 58
console.log(scores.length); // → 3
console.log(scores[10]); // → undefined
```

`at(-1)` อ่านตัวสุดท้ายได้ตรง ๆ แทน `scores[scores.length - 1]` และการอ่าน index ที่ไม่มีอยู่ได้ `undefined` ไม่ใช่ error

## แก้ของเดิม หรือ คืนของใหม่

| แก้ array เดิม (mutating) | คืน array ใหม่ ต้นฉบับไม่เปลี่ยน |
|---|---|
| `push`, `pop`, `shift`, `unshift` | `concat`, `[...array, item]` |
| `splice` | `slice`, `toSpliced` |
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `array[i] = value` | `with(i, value)` |

```js
const queue = ['A', 'B'];
queue.push('C'); // เพิ่มท้าย
const first = queue.shift(); // เอาตัวแรกออก
console.log(first, queue); // → A ['B', 'C']

const original = [3, 1, 2];
const sorted = original.toSorted((a, b) => a - b);
console.log(original); // → [3, 1, 2]
console.log(sorted); // → [1, 2, 3]
console.log(original.with(0, 99)); // → [99, 1, 2]
```

> [!IMPORTANT]
> ข้อมูลที่หลายส่วนของโปรแกรมใช้ร่วมกัน (เช่น state ของหน้าจอ) ให้ใช้เมธอดฝั่งขวาเสมอ การแก้ array เดิมที่ส่วนอื่นยังถืออยู่ทำให้เกิดบั๊กที่หาต้นเหตุยาก เพราะของเปลี่ยนจากที่ไกลตัว

## map, filter, reduce

สามเมธอดนี้แทนลูปได้เกือบทั้งหมด และอ่านออกทันทีว่ากำลังทำอะไร

```js
const orders = [
  { id: 1, customer: 'Guy', total: 1200, status: 'paid' },
  { id: 2, customer: 'Mint', total: 450, status: 'pending' },
  { id: 3, customer: 'Guy', total: 800, status: 'paid' },
];

// map: แปลงทุกตัว ได้ array ยาวเท่าเดิม
const totals = orders.map((order) => order.total);
console.log(totals); // → [1200, 450, 800]

// filter: เก็บเฉพาะตัวที่ผ่านเงื่อนไข
const paid = orders.filter((order) => order.status === 'paid');
console.log(paid.length); // → 2

// reduce: ยุบทั้ง array เหลือค่าเดียว
const revenue = paid.reduce((sum, order) => sum + order.total, 0);
console.log(revenue); // → 2000

// ต่อกันเป็นสายได้ อ่านจากบนลงล่างเหมือนประโยค
const guyTotal = orders
  .filter((order) => order.customer === 'Guy')
  .map((order) => order.total)
  .reduce((sum, total) => sum + total, 0);
console.log(guyTotal); // → 2000
```

`reduce` ยุบเป็นอะไรก็ได้ ไม่จำเป็นต้องเป็นตัวเลข เช่น จัดกลุ่มเป็น object

```js
const orders = [
  { id: 1, status: 'paid' },
  { id: 2, status: 'pending' },
  { id: 3, status: 'paid' },
];

const idsByStatus = orders.reduce((groups, order) => {
  groups[order.status] ??= [];
  groups[order.status].push(order.id);
  return groups;
}, {});
console.log(idsByStatus); // → { paid: [1, 3], pending: [2] }
```

เบราว์เซอร์รุ่นใหม่และ Node.js 21 ขึ้นไปมี `Object.groupBy` ที่ทำเรื่องนี้ได้ในบรรทัดเดียว

```js
const orders = [{ id: 1, status: 'paid' }, { id: 2, status: 'pending' }];
const grouped = Object.groupBy(orders, (order) => order.status);
// grouped.paid คือ [{ id: 1, status: 'paid' }] และ grouped.pending คือ [{ id: 2, status: 'pending' }]
```

> [!WARNING]
> ใส่ค่าเริ่มต้น (อาร์กิวเมนต์ตัวที่สอง) ให้ `reduce` ทุกครั้ง ถ้าไม่ใส่แล้ว array ว่าง จะได้ `TypeError: Reduce of empty array with no initial value`

## ค้นหาและตรวจสอบ

```js
const users = [
  { id: 7, name: 'Guy', active: true },
  { id: 9, name: 'Mint', active: false },
];

console.log(users.find((user) => user.id === 9)?.name); // → Mint
console.log(users.findIndex((user) => user.id === 99)); // → -1
console.log(users.some((user) => !user.active)); // → true
console.log(users.every((user) => user.active)); // → false
console.log(['js', 'ts'].includes('ts')); // → true
```

| อยากรู้ | ใช้ |
|---|---|
| ตัวแรกที่ตรงเงื่อนไข | `find` (ไม่เจอได้ `undefined`) |
| ตำแหน่งของตัวที่ตรงเงื่อนไข | `findIndex` (ไม่เจอได้ `-1`) |
| มีสักตัวไหมที่ตรง | `some` |
| ตรงทุกตัวไหม | `every` |
| มีค่านี้อยู่ไหม (ค่า primitive) | `includes` |

## เรียงลำดับ

`sort` และ `toSorted` แบบไม่ใส่ฟังก์ชันเปรียบเทียบจะแปลงทุกค่าเป็น string ก่อนเรียง ตัวเลขจึงเรียงผิด

```js
console.log([10, 9, 1, 100].toSorted()); // → [1, 10, 100, 9]
console.log([10, 9, 1, 100].toSorted((a, b) => a - b)); // → [1, 9, 10, 100]
```

ข้อความภาษาไทยต้องเรียงด้วย `localeCompare` ที่รู้กติกาพจนานุกรมไทย เช่น สระหน้า (เ แ โ ใ ไ) ไม่ใช้ในการเรียง

```js
const names = ['สมชาย', 'กมล', 'ไพลิน', 'ขวัญ'];
console.log(names.toSorted()); // → ['กมล', 'ขวัญ', 'สมชาย', 'ไพลิน']
console.log(names.toSorted((a, b) => a.localeCompare(b, 'th'))); // → ['กมล', 'ขวัญ', 'ไพลิน', 'สมชาย']
```

เรียงหลายเงื่อนไข ใช้ `||` ต่อกัน ถ้าเงื่อนไขแรกเท่ากัน (ได้ 0) จะไปใช้เงื่อนไขถัดไป

```js
const products = [
  { name: 'B', price: 100 },
  { name: 'A', price: 100 },
  { name: 'C', price: 50 },
];
const ordered = products.toSorted((a, b) => a.price - b.price || a.name.localeCompare(b.name));
console.log(ordered.map((product) => product.name)); // → ['C', 'A', 'B']
```

## Destructuring และ spread

```js
const [first, second, ...rest] = [10, 20, 30, 40];
console.log(first, second, rest); // → 10 20 [30, 40]

const merged = [...[1, 2], ...[3]];
console.log(merged); // → [1, 2, 3]

let left = 1;
let right = 2;
[left, right] = [right, left]; // สลับค่าโดยไม่ต้องมีตัวแปรพัก
console.log(left, right); // → 2 1
```

สร้าง array จากความยาวที่กำหนด และตัดค่าซ้ำ

```js
console.log(Array.from({ length: 5 }, (_, index) => index * 2)); // → [0, 2, 4, 6, 8]
console.log([...new Set([1, 1, 2, 3, 3])]); // → [1, 2, 3]
```

## ข้อผิดพลาดที่พบบ่อย

- เรียงตัวเลขด้วย `sort()` เปล่า ๆ
- ใช้ `sort` หรือ `reverse` กับข้อมูลที่ส่วนอื่นใช้อยู่ ของต้นฉบับเปลี่ยนตามไปด้วย
- ใช้ `map` แค่เพื่อวนทำอะไรสักอย่างโดยไม่ใช้ผลลัพธ์ ให้ใช้ `for...of` แทน
- ลืมค่าเริ่มต้นของ `reduce`
- ใช้ `indexOf` หรือ `includes` หา object ซึ่งเทียบด้วย reference ไม่เจอแม้หน้าตาเหมือนกัน ให้ใช้ `find`

## สรุป

- แยกให้ออกว่าเมธอดไหนแก้ของเดิม และใช้ `toSorted`, `toReversed`, `with` เมื่อไม่อยากกระทบต้นฉบับ
- `map` แปลง `filter` คัด `reduce` ยุบ และต่อเป็นสายได้
- เรียงตัวเลขต้องใส่ `(a, b) => a - b` เรียงภาษาไทยใช้ `localeCompare(b, 'th')`

## อ่านเพิ่ม

- [MDN: Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN: Indexed collections](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections)
- [MDN: Array.prototype.toSorted()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
- [MDN: String.prototype.localeCompare()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)
