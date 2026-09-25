# Async, Fetch และตรวจข้อมูลตอนรันจริง

> ข้อมูลที่มาจากนอกโปรแกรม ไม่ว่าจะเป็น API ไฟล์ JSON หรือฟอร์ม TypeScript ไม่มีทางรู้ว่าหน้าตาจริงเป็นอย่างไรจนกว่าจะรัน บทนี้ใส่ type ให้งาน async แล้วสร้างด่านตรวจข้อมูลตอนรัน เพื่อให้ type ที่ทั้งโปรแกรมเชื่อกันเป็นความจริง

## บทนี้จะได้อะไร

- ใส่ type ให้ Promise และ async function
- เรียก `fetch` แล้วจัดการผลลัพธ์ที่เป็น `unknown` อย่างปลอดภัย
- ตรวจข้อมูลตอนรันด้วยฟังก์ชันที่เขียนเอง และด้วย schema library อย่าง zod

## Promise และ async

async function คืน `Promise` เสมอ type ของค่าที่คืนจึงเขียนเป็น `Promise<number>` ส่วน `await` แกะ Promise ออกให้เหลือค่าข้างใน

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadCount(): Promise<number> {
  await wait(10);
  return 23;
}

const count = await loadCount(); // ชนิด: number

console.log(count); // → 23
```

ลืม `await` เป็นบั๊กที่เจอบ่อยมากใน JavaScript เพราะได้ Promise ไปใช้แทนค่า แต่ใน TypeScript ถูกจับได้ทันที

```ts
async function loadCount(): Promise<number> {
  return 23;
}

const total = loadCount() + 1; // ❌ Operator '+' cannot be applied to types 'Promise<number>' and '1'.
```

`Promise.all` รู้ type ของผลลัพธ์แต่ละช่องแยกกัน

```ts
async function getUser() {
  return { id: 1, name: 'มะลิ' };
}

async function getLessons() {
  return ['Generics', 'Utility Types'];
}

const [user, lessons] = await Promise.all([getUser(), getLessons()]);

console.log(user.name, lessons.length); // → มะลิ 2
```

## fetch คืน unknown

ในโปรเจกต์ Node (type มาจาก `@types/node`) `response.json()` คืน `Promise<unknown>` ส่วนในโปรเจกต์หน้าเว็บ (lib `dom`) คืน `Promise<any>` ทั้งสองแบบแปลว่า TypeScript ไม่รู้อะไรเลยเกี่ยวกับข้อมูลที่ได้ ต่างกันแค่ `unknown` บังคับให้ตรวจ ส่วน `any` ปล่อยผ่านเงียบ ๆ

```ts
const response = await fetch('https://api.example.com/lessons/async');
const body = await response.json(); // ชนิด: unknown
```

ทางลัดที่เห็นบ่อยคือ generic ที่คืน `as T` ซึ่งดูดีแต่คือการโกหก TypeScript เพราะไม่มีอะไรตรวจเลยว่าข้อมูลจริงเป็น `T`

```ts
async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return (await response.json()) as T;
}
```

## ตรวจเองด้วยฟังก์ชัน parse

ฟังก์ชันที่รับ `unknown` ตรวจทีละช่อง แล้วคืนค่าที่มี type ถูกต้อง เป็นด่านเดียวที่ข้อมูลภายนอกต้องผ่าน หลังจากนั้นทั้งโปรแกรมเชื่อ type ได้จริง (แนวคิด "parse, don't validate")

```ts
type Lesson = { id: string; title: string; minutes: number };

function parseLesson(value: unknown): Lesson {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError('ข้อมูลบทเรียนต้องเป็น object');
  }
  if (!('id' in value) || typeof value.id !== 'string') {
    throw new TypeError('id ต้องเป็นข้อความ');
  }
  if (!('title' in value) || typeof value.title !== 'string') {
    throw new TypeError('title ต้องเป็นข้อความ');
  }
  if (!('minutes' in value) || typeof value.minutes !== 'number') {
    throw new TypeError('minutes ต้องเป็นตัวเลข');
  }
  return { id: value.id, title: value.title, minutes: value.minutes };
}

const lesson = parseLesson(JSON.parse('{"id":"async","title":"Async","minutes":18}'));
console.log(lesson.title); // → Async

try {
  parseLesson(JSON.parse('{"id":"async","title":"Async","minutes":"18"}'));
} catch (error) {
  console.log(error instanceof Error ? error.message : error); // → minutes ต้องเป็นตัวเลข
}
```

`'id' in value` ทำให้ TypeScript รู้ว่า `value` มี property `id` (type ยังเป็น `unknown`) แล้ว `typeof value.id` จึงแคบลงเป็นข้อความได้ ทั้งหมดนี้ไม่ต้องใช้ `as` สักตัว

## fetch ที่ตรวจข้อมูลทุกครั้ง

รวมทุกอย่างเป็นฟังก์ชันเดียว รับตัว parse เข้ามา ใส่เวลาหมดอายุด้วย `AbortSignal.timeout` และเช็ก `response.ok` ก่อนอ่านข้อมูลเสมอ

```ts
type Lesson = { id: string; title: string; minutes: number };

declare function parseLesson(value: unknown): Lesson;

async function fetchJson<T>(url: string, parse: (value: unknown) => T): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) {
    throw new Error(`เรียก ${url} ไม่สำเร็จ: HTTP ${response.status}`);
  }
  return parse(await response.json());
}

const lesson = await fetchJson('https://api.example.com/lessons/async', parseLesson); // ชนิด: { id: string; title: string; minutes: number; }
```

`declare function` ในตัวอย่างนี้แค่บอกว่ามี `parseLesson` จากหัวข้อก่อนหน้าอยู่แล้ว (บทที่ 14) ตอนใช้จริงให้ import มาจากไฟล์ที่เขียนไว้

ถ้าหมดเวลา `fetch` โยน `DOMException` ชื่อ `TimeoutError` แยกกรณีนี้ออกมาได้แบบนี้

```ts
try {
  await fetch('https://api.example.com/slow', { signal: AbortSignal.timeout(3000) });
} catch (error) {
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    console.log('ใช้เวลานานเกินไป ลองใหม่อีกครั้ง');
  } else {
    throw error;
  }
}
```

## Schema library: zod

เขียนตรวจเองทุกช่องจะยาวขึ้นเรื่อย ๆ ตามขนาดข้อมูล งานจริงจึงนิยมใช้ schema library ที่ตรวจข้อมูลตอนรันและสร้าง type ให้จาก schema เดียวกัน ตัวที่ใช้กันมากคือ zod (ติดตั้งด้วย `npm install zod` มี type มาในตัว)

```ts
import * as z from 'zod';

const LessonSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  minutes: z.number().int().positive(),
});

type Lesson = z.infer<typeof LessonSchema>; // ชนิด: { id: string; title: string; minutes: number; }

const result = LessonSchema.safeParse(JSON.parse('{"id":"async","title":"","minutes":18}'));

console.log(result.success ? result.data.title : result.error.issues[0]?.path.join('.')); // → title
```

schema เป็นทั้งตัวตรวจตอนรันและต้นทางของ type จึงไม่มีทางที่สองอย่างนี้จะไม่ตรงกัน `safeParse` คืน discriminated union (บทที่ 7) ที่ต้องเช็ก `success` ก่อนใช้ข้อมูลเสมอ

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `as` หรือ generic ที่คืน `as T` กับข้อมูลจาก API แทนการตรวจจริง
- ลืมเช็ก `response.ok` ทำให้หน้า error ของเซิร์ฟเวอร์ถูกอ่านเป็นข้อมูล
- ตรวจข้อมูลกระจายไว้หลายที่ แทนที่จะมีด่านเดียวตรงที่ข้อมูลเข้ามา
- ไม่ตั้งเวลาหมดอายุ ทำให้หน้าจอรอค้างเมื่อเซิร์ฟเวอร์ไม่ตอบ

## สรุป

- async function คืน `Promise<T>` และ TypeScript จับการลืม `await` ได้
- ผลจาก `fetch` คือข้อมูลที่ยังไม่รู้หน้าตา ต้องผ่านฟังก์ชัน parse ก่อนเสมอ
- schema library อย่าง zod ให้ทั้งการตรวจตอนรันและ type จากที่เดียว

## อ่านเพิ่ม

- [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN: AbortSignal.timeout()](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)
- [Zod](https://zod.dev/)
- [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
