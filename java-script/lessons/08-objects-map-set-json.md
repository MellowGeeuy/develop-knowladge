# Object, Map, Set และ JSON

> object คือโครงสร้างข้อมูลหลักของ JavaScript ส่วน Map และ Set คือเครื่องมือเฉพาะทางที่เหมาะกว่าในบางงาน และ JSON คือรูปแบบที่ข้อมูลใช้เดินทางระหว่างระบบ บทนี้รวมวิธีใช้ทั้งสี่อย่างให้ถูกงาน

## บทนี้จะได้อะไร

- เขียน object แบบสมัยใหม่ แตกค่าด้วย destructuring และรวม object ด้วย spread
- คัดลอก object ได้ถูกแบบ (shallow กับ deep)
- รู้ว่าเมื่อไรควรใช้ Map และ Set แทน object และ array
- แปลงข้อมูลไปกลับกับ JSON และรู้ว่าอะไรหายไประหว่างทาง

## เขียน object แบบสมัยใหม่

```js
const name = 'Guy';
const role = 'admin';
const field = 'email';

const user = {
  name, // ย่อจาก name: name
  role,
  [field]: 'guy@loxbit.com', // ชื่อ key มาจากตัวแปร
  greet() {
    return `สวัสดี ${this.name}`;
  },
};

console.log(user.email); // → guy@loxbit.com
console.log(user['role']); // → admin
console.log(user.greet()); // → สวัสดี Guy
console.log(Object.hasOwn(user, 'email')); // → true
```

ใช้จุด (`user.email`) เป็นหลัก ใช้วงเล็บ (`user[key]`) เมื่อชื่อ key อยู่ในตัวแปร

## Destructuring

แตกค่าที่ต้องการออกจาก object ในบรรทัดเดียว เปลี่ยนชื่อ ใส่ค่าเริ่มต้น และแตกชั้นในได้

```js
const product = { id: 42, title: 'คีย์บอร์ด', price: 1590, stock: { warehouse: 12 } };

const { title, price: cost, discount = 0, stock: { warehouse } } = product;
console.log(title, cost, discount, warehouse); // → คีย์บอร์ด 1590 0 12

const { id, ...details } = product;
console.log(id); // → 42
console.log(details); // → { title: 'คีย์บอร์ด', price: 1590, stock: { warehouse: 12 } }
```

## รวมและอัปเดตด้วย spread

key ที่มาทีหลังชนะ จึงใช้ทำ "ค่าเริ่มต้น + ค่าที่ผู้ใช้ตั้ง" ได้สวยงาม

```js
const defaults = { theme: 'light', fontSize: 16, notify: true };
const saved = { theme: 'dark' };

const settings = { ...defaults, ...saved };
console.log(settings); // → { theme: 'dark', fontSize: 16, notify: true }

const bigger = { ...settings, fontSize: 18 }; // อัปเดตโดยไม่แตะของเดิม
console.log(settings.fontSize, bigger.fontSize); // → 16 18
```

## คัดลอกแบบตื้นกับแบบลึก

spread คัดลอกแค่ชั้นแรก ชั้นในยังเป็นของชิ้นเดียวกันกับต้นฉบับ ถ้าต้องการสำเนาแยกขาดทุกชั้นใช้ `structuredClone`

```js
const original = { team: 'หน้าบ้าน', members: ['Guy'] };
const shallow = { ...original };
const deep = structuredClone(original);

shallow.members.push('Mint');
console.log(original.members); // → ['Guy', 'Mint']
console.log(deep.members); // → ['Guy']
```

> [!WARNING]
> ท่าเก่า `JSON.parse(JSON.stringify(data))` ทำ deep copy ได้ก็จริง แต่ทำ `Date` กลายเป็น string และทิ้ง `undefined`, `Map`, `Set` ไปเงียบ ๆ ใช้ `structuredClone` แทน

## วนผ่าน object

```js
const stock = { apple: 12, mango: 0, durian: 3 };

console.log(Object.keys(stock)); // → ['apple', 'mango', 'durian']
console.log(Object.values(stock)); // → [12, 0, 3]
console.log(Object.entries(stock)[0]); // → ['apple', 12]

// entries → กรอง → กลับเป็น object
const available = Object.fromEntries(
  Object.entries(stock).filter(([, quantity]) => quantity > 0),
);
console.log(available); // → { apple: 12, durian: 3 }
```

## Map

Map เก็บคู่ key และค่าเหมือน object แต่ key เป็นอะไรก็ได้ (รวมถึง object) มี `size` ในตัว และรักษาลำดับที่ใส่เสมอ

```js
const visits = new Map();
visits.set('/home', 3);
visits.set('/about', 1);
visits.set('/home', visits.get('/home') + 1);

console.log(visits.get('/home')); // → 4
console.log(visits.size); // → 2
console.log(visits.has('/contact')); // → false
console.log([...visits]); // → [['/home', 4], ['/about', 1]]
```

ใช้ object เป็น key ได้ เหมาะกับการผูกข้อมูลเพิ่มเติมกับของที่เราไม่อยากแก้ เช่น element บนหน้าเว็บ

```js
const clickCounts = new Map();
const saveButton = { id: 'save' }; // สมมติว่าเป็น element

clickCounts.set(saveButton, 0);
clickCounts.set(saveButton, clickCounts.get(saveButton) + 1);
console.log(clickCounts.get(saveButton)); // → 1
```

| เลือกใช้ | เมื่อ |
|---|---|
| object | ข้อมูลที่มีรูปร่างคงที่ รู้ชื่อ field ล่วงหน้า และต้องแปลงเป็น JSON |
| Map | key เพิ่มลดบ่อย key ไม่ใช่ string หรือ key มาจากผู้ใช้ |

## Set

Set เก็บค่าที่ไม่ซ้ำกัน ตรวจว่ามีค่าอยู่ไหมได้เร็วกว่า `array.includes` มากเมื่อข้อมูลเยอะ

```js
const tags = new Set(['js', 'web', 'js']);
tags.add('node');
console.log(tags.size); // → 3
console.log(tags.has('web')); // → true
console.log([...tags]); // → ['js', 'web', 'node']

const frontend = new Set(['js', 'ts', 'css']);
const backend = new Set(['ts', 'go']);
const shared = [...frontend].filter((skill) => backend.has(skill));
console.log(shared); // → ['ts']
```

เบราว์เซอร์รุ่นใหม่ (ตั้งแต่ปี 2024) และ Node.js 22 ขึ้นไปมีเมธอดของเซตในตัว เช่น `frontend.intersection(backend)` และ `frontend.union(backend)`

## JSON

JSON คือข้อความที่หน้าตาเหมือน object ใช้ส่งข้อมูลระหว่างระบบ `JSON.stringify` แปลงเป็นข้อความ `JSON.parse` แปลงกลับ

```js
const payload = {
  id: 1,
  name: 'Guy',
  joinedAt: new Date(Date.UTC(2026, 0, 15)),
  note: undefined,
};

const text = JSON.stringify(payload);
console.log(text); // → {"id":1,"name":"Guy","joinedAt":"2026-01-15T00:00:00.000Z"}

const parsed = JSON.parse(text);
console.log(typeof parsed.joinedAt); // → string
```

สิ่งที่เปลี่ยนไประหว่างทาง

| ค่า | หลัง `JSON.stringify` |
|---|---|
| `undefined`, function | หายไปจาก object |
| `Date` | กลายเป็น string แบบ ISO ต้องแปลงกลับเอง |
| `Map`, `Set` | กลายเป็น `{}` |
| `NaN`, `Infinity` | กลายเป็น `null` |
| `bigint` | โยน `TypeError` |

ข้อความจากภายนอกอาจเป็น JSON ที่เสีย ครอบ `JSON.parse` ด้วย try/catch เสมอ

```js
function safeParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

console.log(safeParse('{"ok":true}', null)); // → { ok: true }
console.log(safeParse('{ok:true}', null)); // → null
```

`JSON.stringify(data, null, 2)` จัดย่อหน้าให้อ่านง่าย เหมาะกับเขียนไฟล์ตั้งค่าหรือดูข้อมูลตอน debug

## ข้อผิดพลาดที่พบบ่อย

- คัดลอกด้วย spread แล้วแก้ข้อมูลชั้นใน ต้นฉบับเปลี่ยนตาม
- ใช้ object เก็บ key ที่มาจากผู้ใช้ แล้วไปชนชื่อพิเศษอย่าง `__proto__` ให้ใช้ Map
- ส่ง `Date` ผ่าน JSON แล้วลืมว่าอีกฝั่งได้ string
- `JSON.parse` ข้อความจากภายนอกโดยไม่มี try/catch

## สรุป

- destructuring แตกค่า spread รวมค่า และทั้งคู่ทำงานแค่ชั้นแรก
- deep copy ใช้ `structuredClone`
- Map สำหรับ key ที่เปลี่ยนบ่อยหรือไม่ใช่ string และ Set สำหรับค่าที่ไม่ซ้ำ
- JSON ทิ้ง `undefined` และเปลี่ยน `Date` เป็น string เสมอ

## อ่านเพิ่ม

- [MDN: Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
- [MDN: Keyed collections (Map และ Set)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections)
- [MDN: structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
- [MDN: JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
