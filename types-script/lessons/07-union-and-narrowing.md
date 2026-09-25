# Union และ Narrowing

> union บอกว่าค่านี้เป็นได้หลาย type ส่วน narrowing คือการที่ TypeScript อ่านเงื่อนไข `if`, `switch` และ `return` ของเรา แล้วรู้ว่าในแต่ละช่วงของโค้ด ค่านั้นเป็น type ไหนแน่ ๆ สองเรื่องนี้รวมกันคือหัวใจของ TypeScript ในงานจริง

## บทนี้จะได้อะไร

- รวม type ด้วย union และ intersection
- แยก type ด้วย `typeof`, ค่า truthy, `in` และ `instanceof`
- ออกแบบข้อมูลด้วย discriminated union และตรวจว่าจัดการครบทุกกรณีด้วย `never`
- เขียน type predicate และ assertion function

## Union

ค่าที่เป็น union ใช้ได้เฉพาะสิ่งที่ทุก type ในนั้นมีร่วมกัน เพราะ TypeScript ยังไม่รู้ว่าตอนนี้เป็นแบบไหน

```ts
function formatId(id: string | number): string {
  return id.toUpperCase(); // ❌ Property 'toUpperCase' does not exist on type 'string | number'.
}
```

## แยก type ด้วย typeof

พอเช็ก `typeof` แล้ว ในบล็อกนั้น TypeScript รู้ว่าเหลือ type เดียว และหลัง `return` ก็รู้ว่าที่เหลือคืออีกแบบ

```ts
function formatId(id: string | number): string {
  if (typeof id === 'string') {
    return id.toUpperCase();
  }
  return id.toFixed(0).padStart(6, '0');
}

console.log(formatId('ab-12')); // → AB-12
console.log(formatId(42)); // → 000042
```

## เช็กด้วยค่า truthy

`if (!name)` ตัด `null`, `undefined` และข้อความว่างออกในครั้งเดียว สะดวกกับข้อความ

```ts
function greet(name: string | null | undefined): string {
  if (!name) {
    return 'สวัสดีผู้มาเยือน';
  }
  return `สวัสดี ${name}`;
}

console.log(greet(null)); // → สวัสดีผู้มาเยือน
console.log(greet('มะลิ')); // → สวัสดี มะลิ
```

แต่กับตัวเลขต้องระวัง เพราะ `0` ก็เป็นค่า falsy เหมือนกัน

```ts
function describeStock(count: number | undefined): string {
  if (!count) {
    return 'ไม่ทราบจำนวน';
  }
  return `เหลือ ${count} ชิ้น`;
}

console.log(describeStock(0)); // → ไม่ทราบจำนวน
```

สินค้าหมดกลายเป็น "ไม่ทราบจำนวน" ที่ถูกคือเช็กตรง ๆ ว่า `count === undefined`

## `in` และ `instanceof`

`in` เช็กว่า object มี property นี้ไหม เหมาะกับ union ของ object ที่รูปร่างต่างกัน ส่วน `instanceof` ใช้กับค่าที่สร้างจาก class เช่น `Date` และ `Error`

```ts
type Cat = { meow: () => string };
type Dog = { bark: () => string };

function speak(animal: Cat | Dog): string {
  if ('meow' in animal) {
    return animal.meow();
  }
  return animal.bark();
}

function formatDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

console.log(speak({ bark: () => 'โฮ่ง' })); // → โฮ่ง
console.log(formatDate(new Date(Date.UTC(2026, 8, 26)))); // → 2026-09-26
```

## Discriminated union

รูปแบบที่ใช้บ่อยที่สุดในงานจริง ทุกแบบของ union มี property ร่วมกันหนึ่งตัวที่เป็น literal type (มักชื่อ `status`, `type` หรือ `kind`) พอเช็กค่านั้น TypeScript รู้ทันทีว่ามี property อื่นอะไรบ้าง

```ts
type LoadState =
  | { status: 'loading' }
  | { status: 'success'; lessons: string[] }
  | { status: 'error'; message: string };

function render(state: LoadState): string {
  switch (state.status) {
    case 'loading':
      return 'กำลังโหลด...';
    case 'success':
      return `มี ${state.lessons.length} บท`;
    case 'error':
      return `โหลดไม่สำเร็จ: ${state.message}`;
  }
}

console.log(render({ status: 'success', lessons: ['ตัวแปร', 'ฟังก์ชัน'] })); // → มี 2 บท
console.log(render({ status: 'error', message: 'หมดเวลา' })); // → โหลดไม่สำเร็จ: หมดเวลา
```

`lessons` มีอยู่เฉพาะตอนสำเร็จ ถ้าอ่านโดยไม่เช็ก `status` ก่อน TypeScript ไม่ยอม

```ts
type LoadState =
  | { status: 'loading' }
  | { status: 'success'; lessons: string[] }
  | { status: 'error'; message: string };

function countLessons(state: LoadState): number {
  return state.lessons.length; // ❌ Property 'lessons' does not exist on type 'LoadState'.
}
```

เทียบกับการเก็บสถานะด้วย `{ loading: boolean; error?: string; lessons?: string[] }` ที่ปล่อยให้เกิดสถานะที่เป็นไปไม่ได้ เช่น กำลังโหลดแต่มี error ไปพร้อมกัน discriminated union ตัดสถานะพวกนั้นทิ้งตั้งแต่ระดับ type

## ตรวจว่าจัดการครบทุกกรณีด้วย never

ถ้าวันหนึ่งเพิ่มสถานะใหม่ เราอยากให้ TypeScript ชี้ทุกจุดที่ลืมจัดการ ทำได้ด้วยฟังก์ชันที่รับ `never` ใส่ไว้ใน `default` เพราะถ้าจัดการครบแล้ว ค่าที่ตกมาถึง `default` ต้องเป็น `never` เสมอ

```ts
type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; lessons: string[] }
  | { status: 'error'; message: string };

function assertNever(value: never): never {
  throw new Error(`ยังไม่ได้จัดการกรณี ${JSON.stringify(value)}`);
}

function render(state: LoadState): string {
  switch (state.status) {
    case 'loading':
      return 'กำลังโหลด...';
    case 'success':
      return `มี ${state.lessons.length} บท`;
    case 'error':
      return `โหลดไม่สำเร็จ: ${state.message}`;
    default:
      return assertNever(state); // ❌ Argument of type '{ status: "idle"; }' is not assignable to parameter of type 'never'.
  }
}
```

ข้อความ error บอกตรง ๆ ว่ากรณี `idle` ยังไม่ถูกจัดการ

## Type predicate

ฟังก์ชันที่คืน `value is Lesson` บอก TypeScript ว่า "ถ้าคืน `true` ให้ถือว่าค่านี้เป็น `Lesson`" ใช้ตรวจข้อมูลที่ไม่รู้ที่มา แล้วนำกลับมาใช้ได้หลายที่

```ts
type Lesson = { id: string; title: string };

function isLesson(value: unknown): value is Lesson {
  return typeof value === 'object'
    && value !== null
    && 'id' in value && typeof value.id === 'string'
    && 'title' in value && typeof value.title === 'string';
}

const raw: unknown = JSON.parse('{"id":"generics","title":"Generics"}');

if (isLesson(raw)) {
  console.log(raw.title); // → Generics
}
```

ตั้งแต่ TypeScript 5.5 ฟังก์ชันง่าย ๆ อย่างใน `filter` ถูกเดาเป็น type predicate ให้เอง array ที่ได้จึงไม่มี `undefined` ปนแล้ว

```ts
const titles = ['Union', undefined, 'Generics', undefined];
const defined = titles.filter((title) => title !== undefined); // ชนิด: string[]

console.log(defined); // → ['Union', 'Generics']
```

> [!CAUTION]
> TypeScript เชื่อ type predicate ทันทีโดยไม่ตรวจซ้ำว่าข้างในเช็กถูกไหม ถ้าเขียนตรวจไม่ครบ type จะโกหกทั้งโปรแกรม ฟังก์ชันพวกนี้จึงควรมีเทสต์ (บทที่ 21)

## Assertion function

แบบที่ใช้ `asserts` ไม่คืนค่า แต่ถ้าข้อมูลไม่ผ่านจะโยน error บรรทัดหลังจากเรียกจึงถือว่าผ่านการตรวจแล้ว เหมาะกับการตรวจตอนเริ่มโปรแกรม

```ts
function assertString(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError(`${name} ต้องเป็นข้อความ`);
  }
}

const input: unknown = 'hello';
assertString(input, 'input');

console.log(input.toUpperCase()); // → HELLO
```

## Intersection

`&` รวมหลาย type เป็น type เดียวที่ต้องมีครบทุกส่วน ใช้ประกอบ type จากชิ้นเล็กที่ใช้ซ้ำได้

```ts
type WithId = { id: string };
type WithTimestamps = { createdAt: Date; updatedAt: Date };
type Note = WithId & WithTimestamps & { text: string };

const note: Note = {
  id: 'n-1',
  text: 'ทบทวนบท narrowing',
  createdAt: new Date(2026, 8, 26),
  updatedAt: new Date(2026, 8, 26),
};

console.log(note.text); // → ทบทวนบท narrowing
```

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `if (!value)` กับตัวเลขหรือข้อความ ทั้งที่ `0` และ `''` เป็นค่าที่ถูกต้อง
- ลืมว่า `typeof null === 'object'` จึงต้องเช็ก `!== null` คู่กันเสมอ
- เก็บสถานะด้วย boolean หลายตัวแทน discriminated union
- เขียน type predicate ตรวจไม่ครบ แล้ว TypeScript เชื่อตามโดยไม่รู้

## สรุป

- union ใช้ได้เฉพาะสิ่งที่ทุก type มีร่วมกัน ต้อง narrowing ก่อนถึงจะใช้ส่วนเฉพาะได้
- `typeof`, `in`, `instanceof`, `===` และ `return` ล้วนทำให้ TypeScript รู้ type ที่แคบลง
- discriminated union คู่กับ `assertNever` ทำให้ไม่มีกรณีไหนหลุด

## อ่านเพิ่ม

- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript 5.5: Inferred Type Predicates](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)
