# Object, Type Alias และ Interface

> ข้อมูลส่วนใหญ่ในโปรแกรมจริงเป็น object บทนี้ใช้ type alias และ interface บอกรูปร่างของ object ว่ามี property อะไร เป็น type อะไร อันไหนไม่บังคับ อันไหนห้ามแก้ แล้ว TypeScript จะตรวจให้ทุกที่ที่สร้างหรือใช้ object นั้น

## บทนี้จะได้อะไร

- เขียน type ของ object ด้วย type alias และ interface และเลือกใช้ให้เหมาะ
- ใช้ property ที่ไม่บังคับ `readonly` และ index signature
- เข้าใจ structural typing และการตรวจ property เกินของ object literal

## Type alias

`type` ตั้งชื่อให้รูปร่างของ object แล้วเอาชื่อนั้นไปใช้ซ้ำได้ทุกที่ ขาด property ไหน TypeScript ฟ้องทันที

```ts
type User = {
  id: number;
  name: string;
  email: string;
};

const user: User = { id: 1, name: 'มะลิ', email: 'mali@example.com' };
const broken: User = { id: 2, name: 'ต้นกล้า' }; // ❌ Property 'email' is missing in type '{ id: number; name: string; }' but required in type 'User'.
```

## Property ที่ไม่บังคับ

ใส่ `?` หลังชื่อ property ที่ไม่มีก็ได้ ตอนอ่านค่าจะได้ type ที่มี `undefined` พ่วงมา จึงต้องจัดการกรณีที่ไม่มีเสมอ

```ts
type Profile = {
  name: string;
  nickname?: string;
};

const mali: Profile = { name: 'มะลิ' };
const tonkla: Profile = { name: 'ต้นกล้า', nickname: 'กล้า' };

function displayName(profile: Profile): string {
  return profile.nickname ?? profile.name;
}

console.log(displayName(mali), displayName(tonkla)); // → มะลิ กล้า
```

คอร์สนี้เปิด `exactOptionalPropertyTypes` (บทที่ 2) ซึ่งแยก "ไม่มี property นี้" ออกจาก "มี property แต่ค่าเป็น `undefined`" เพราะสองแบบนี้ต่างกันจริงตอนรัน เช่น `'nickname' in profile` และ `Object.keys` ให้ผลไม่เหมือนกัน

```ts
type Profile = {
  name: string;
  nickname?: string;
};

const fah: Profile = { name: 'ฟ้า', nickname: undefined }; // ❌ Type '{ name: string; nickname: undefined; }' is not assignable to type 'Profile' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
```

ถ้าตั้งใจให้ใส่ `undefined` ได้จริง ให้เขียนไว้ใน type ตรง ๆ เป็น `nickname?: string | undefined`

## readonly

`readonly` ห้ามแก้ property หลังสร้าง object เหมาะกับค่าที่ไม่ควรเปลี่ยน เช่น id

```ts
type Lesson = {
  readonly id: string;
  title: string;
};

const lesson: Lesson = { id: 'functions', title: 'ฟังก์ชัน' };
lesson.title = 'ฟังก์ชันใน TypeScript';
lesson.id = 'fn'; // ❌ Cannot assign to 'id' because it is a read-only property.
```

> [!WARNING]
> `readonly` ตรวจแค่ตอนเขียนโค้ด และกันแค่ชั้นเดียว (property ข้างใน object ลูกยังแก้ได้) ตอนรันจริงไม่มีอะไรกันไว้ ถ้าต้องการกันตอนรันด้วยให้ใช้ `Object.freeze`

## Interface

`interface` เป็นอีกวิธีบอกรูปร่างของ object และต่อยอดจาก interface อื่นด้วย `extends`

```ts
interface Product {
  sku: string;
  name: string;
  price: number;
}

interface DigitalProduct extends Product {
  downloadUrl: string;
}

const ebook: DigitalProduct = {
  sku: 'EB-001',
  name: 'TypeScript ฉบับพกพา',
  price: 299,
  downloadUrl: 'https://example.com/ebook.pdf',
};

console.log(`${ebook.name} ${ebook.price} บาท`); // → TypeScript ฉบับพกพา 299 บาท
```

ถ้าใช้ type alias การต่อยอดทำด้วย `&` (intersection) ได้ผลใกล้เคียงกัน

```ts
type Product = { sku: string; name: string; price: number };
type DigitalProduct = Product & { downloadUrl: string };
```

## type หรือ interface

| | type alias | interface |
|---|---|---|
| บอกรูปร่าง object | ได้ | ได้ |
| union, tuple, literal, function type | ได้ | ไม่ได้ |
| ต่อยอด | `&` | `extends` (ถ้า property ชนกันจะฟ้องตรงที่ประกาศ) |
| ประกาศชื่อซ้ำแล้วรวมกัน | ไม่ได้ ฟ้องว่าชื่อซ้ำ | ได้ (declaration merging บทที่ 15) |

TypeScript Handbook ให้หลักคร่าว ๆ ว่าใช้ `interface` ไปจนกว่าจะต้องใช้ความสามารถที่มีแค่ใน `type` สิ่งที่สำคัญกว่าคือทั้งโปรเจกต์ตกลงใช้แบบเดียวกัน ตัวอย่างในคอร์สนี้ใช้ `type` เป็นส่วนใหญ่เพราะมักต้องรวมกับ union ในบทถัด ๆ ไป

## Structural typing

TypeScript ตรวจว่ารูปร่างตรงกันไหม ไม่ได้ดูว่าชื่อ type ตรงกัน object ไหนมี property ที่ต้องการครบก็ใช้ได้ แม้จะมี property อื่นเกินมา

```ts
type Point = { x: number; y: number };

function distanceFromOrigin(point: Point): number {
  return Math.hypot(point.x, point.y);
}

const home = { x: 3, y: 4, label: 'บ้าน' };

console.log(distanceFromOrigin(home)); // → 5
```

ข้อยกเว้นคือ object ที่เขียนสดตรงจุดที่ใช้ (object literal) ถ้ามี property เกิน TypeScript จะฟ้อง เพราะเกือบทุกครั้งคือการพิมพ์ชื่อผิด

```ts
type Point = { x: number; y: number };

function distanceFromOrigin(point: Point): number {
  return Math.hypot(point.x, point.y);
}

distanceFromOrigin({ x: 3, y: 4, label: 'บ้าน' }); // ❌ Object literal may only specify known properties, and 'label' does not exist in type 'Point'.
```

## Index signature และ Record

ถ้าไม่รู้ชื่อ key ล่วงหน้า เช่น คะแนนแยกตามวิชา ใช้ `Record<string, number>` (เขียนแบบเต็มคือ `{ [subject: string]: number }`)

```ts
type Scores = Record<string, number>;

const scores: Scores = { math: 90, science: 85 };
scores.english = 80;

const art = scores.art; // ชนิด: number | undefined

for (const [subject, score] of Object.entries(scores)) {
  console.log(`${subject}: ${score}`);
}
// ผลลัพธ์
// math: 90
// science: 85
// english: 80
```

`scores.art` ได้ `number | undefined` เพราะ key ที่ไม่มีอยู่จริงอ่านแล้วได้ `undefined` (ผลของ `noUncheckedIndexedAccess`) ถ้ารู้ชื่อ key ครบทุกตัวอยู่แล้ว เขียนเป็น property ธรรมดาดีกว่า

## ข้อผิดพลาดที่พบบ่อย

- ตั้งชื่อ interface ขึ้นต้นด้วย `I` (`IUser`) ซึ่งไม่ใช่ธรรมเนียมของ TypeScript ใช้ `User` เฉย ๆ
- ใช้ `{}` หรือ `object` เป็น type ทั้งที่ `{}` แปลว่าค่าอะไรก็ได้ที่ไม่ใช่ `null` หรือ `undefined`
- ทำให้ทุก property เป็น optional จน type แทบไม่บอกอะไร
- คิดว่า `readonly` กันการแก้ค่าตอนรันได้

## สรุป

- `type` และ `interface` บอกรูปร่างของ object ได้ทั้งคู่ เลือกแบบเดียวให้ทั้งโปรเจกต์
- `?` คือไม่บังคับ `readonly` คือห้ามแก้ (ตอนเขียนโค้ด) และ `Record` ใช้เมื่อไม่รู้ชื่อ key ล่วงหน้า
- TypeScript ดูที่รูปร่าง ไม่ใช่ชื่อ และตรวจ property เกินเฉพาะ object literal ที่เขียนสด

## อ่านเพิ่ม

- [TypeScript Handbook: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript Handbook: Differences Between Type Aliases and Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- [TSConfig: exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes)
