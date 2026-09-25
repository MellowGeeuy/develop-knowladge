# DOM และ Event แบบมี Type

> TypeScript มี type ของ DOM มาให้ครบใน lib `dom` ทุก element และทุก event รู้ type ของตัวเอง งานของเราเหลือสองเรื่อง คือรับมือกับ `null` ที่ `querySelector` อาจคืนมา และบอก TypeScript ให้ชัดว่า element ที่ได้เป็นแบบไหน

## บทนี้จะได้อะไร

- ตั้งค่าโปรเจกต์หน้าเว็บให้มี type ของ DOM
- เลือก element ให้ได้ type ที่ถูก และจัดการ `null` อย่างปลอดภัย
- ใส่ type ให้ event และฟอร์ม และสร้าง CustomEvent ที่มี type

## ตั้งค่าสำหรับหน้าเว็บ

โปรเจกต์หน้าเว็บส่วนใหญ่ใช้ bundler อย่าง Vite แปลงไฟล์ `.ts` ให้เบราว์เซอร์ ส่วน `tsc` มีหน้าที่ตรวจอย่างเดียว tsconfig จึงต่างจากโปรเจกต์ Node ตรง `lib` ที่มี `dom` และ module แบบ bundler

```json file=tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["es2022", "dom"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

ตั้งแต่ TypeScript 6.0 lib `dom` รวม `dom.iterable` ไว้ในตัวแล้ว วนลูป `for...of` กับ `NodeList` ได้เลยโดยไม่ต้องเพิ่มอะไร

## เลือก element

`querySelector` ที่ใช้ชื่อแท็กรู้ type ของ element เอง แต่ถ้าเลือกด้วย class หรือ id TypeScript รู้แค่ว่าเป็น element สักอย่าง และทุกแบบอาจได้ `null` เมื่อหาไม่เจอ

```ts
const button = document.querySelector('button'); // ชนิด: HTMLButtonElement | null
const heading = document.querySelector('h1'); // ชนิด: HTMLHeadingElement | null
const card = document.querySelector('.lesson-card'); // ชนิด: Element | null
const field = document.getElementById('email'); // ชนิด: HTMLElement | null
```

ถ้ารู้ว่า element ที่ได้เป็นแบบไหน มีสองทางให้บอก TypeScript ทางที่ปลอดภัยคือเช็กด้วย `instanceof` ซึ่งตรวจจริงตอนรัน ส่วนการใส่ type ใน `<>` คือการบอกให้เชื่อ เหมือน `as` ถ้า element จริงเป็นอย่างอื่นก็จะพังทีหลัง

```ts
const email = document.querySelector('#email');

if (email instanceof HTMLInputElement) {
  email.value = 'mali@example.com';
}

const search = document.querySelector<HTMLInputElement>('#search'); // ชนิด: HTMLInputElement | null
```

## จัดการ null ครั้งเดียว

ฟังก์ชันเล็ก ๆ ที่หา element แล้วตรวจ type ให้ ช่วยให้โค้ดที่เหลือไม่ต้องเช็ก `null` ซ้ำทุกบรรทัด และถ้า HTML เปลี่ยนจน element หายไป error จะบอกชัดว่าตัวไหน

```ts
function requireElement<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) {
    throw new Error(`ไม่พบ ${selector} หรือไม่ใช่ ${type.name}`);
  }
  return element;
}

const signupForm = requireElement('#signup', HTMLFormElement); // ชนิด: HTMLFormElement
const nameInput = requireElement('#name', HTMLInputElement); // ชนิด: HTMLInputElement
```

## Event

`addEventListener` รู้ type ของ event จากชื่อ event เอง `click` ได้ `PointerEvent` (type ลูกของ `MouseEvent` ตามมาตรฐานปัจจุบันที่ให้ click มาจาก pointer ได้ทั้งเมาส์ นิ้ว และปากกา) ส่วน `keydown` ได้ `KeyboardEvent` จึงใช้ property ผิดประเภทไม่ได้

```ts
const button = document.querySelector('button');

button?.addEventListener('click', (event) => {
  console.log(event.clientX, event.clientY);
  console.log(event.key); // ❌ Property 'key' does not exist on type 'PointerEvent'.
});

window.addEventListener('keydown', (event) => {
  const key = event.key; // ชนิด: string
  if (key === 'Escape') {
    console.log('ปิดหน้าต่าง');
  }
});
```

`event.target` คือ element ที่ถูกกดจริง ซึ่งอาจเป็นอะไรก็ได้ในหน้า TypeScript จึงให้ type กว้างที่สุดคือ `EventTarget | null` ต้องเช็กก่อนใช้ รูปแบบนี้เจอบ่อยกับ event delegation (บทที่ 14 ของคอร์ส JavaScript)

```ts
const list = document.querySelector('ul');

list?.addEventListener('click', (event) => {
  const target = event.target; // ชนิด: EventTarget | null
  if (target instanceof HTMLElement) {
    const lessonId = target.dataset.lessonId; // ชนิด: string | undefined
    if (lessonId) {
      console.log(`เลือกบท ${lessonId}`);
    }
  }
});
```

## ฟอร์ม

ค่าจาก `FormData` เป็น `FormDataEntryValue | null` คือเป็นข้อความ เป็นไฟล์ หรือไม่มีเลยก็ได้ ต้องเช็กทุกครั้งก่อนใช้เป็นข้อความ

```ts
const form = document.querySelector('form');
if (!form) {
  throw new Error('ไม่พบฟอร์มสมัครสมาชิก');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const email = data.get('email'); // ชนิด: FormDataEntryValue | null

  if (typeof email !== 'string' || !email.includes('@')) {
    console.log('อีเมลไม่ถูกต้อง');
    return;
  }
  console.log(`สมัครด้วย ${email}`);
});
```

เช็ก `form` ก่อนแล้ว `throw` ทำให้ทั้งไฟล์หลังจากนั้นรู้ว่า `form` ไม่ใช่ `null` รวมถึงในฟังก์ชันที่ส่งให้ `addEventListener` ด้วย

## CustomEvent ที่มี type

event ที่เราสร้างเองส่งข้อมูลไปกับ `detail` ได้ ประกาศชื่อ event ลงใน `DocumentEventMap` ครั้งเดียว ทุกที่ที่ฟัง event นั้นจะรู้ type ของ `detail` เอง เว็บ The Brain ที่ใช้อ่านคอร์สนี้ก็ใช้ event แบบนี้แจ้งทุกส่วนของหน้าเมื่อกดอ่านจบ

```ts
type LessonReadDetail = { lessonId: string; read: boolean };

declare global {
  interface DocumentEventMap {
    'lesson-read': CustomEvent<LessonReadDetail>;
  }
}

document.addEventListener('lesson-read', (event) => {
  const detail = event.detail; // ชนิด: { lessonId: string; read: boolean; }
  console.log(`${detail.lessonId}: ${detail.read ? 'อ่านแล้ว' : 'ยังไม่อ่าน'}`);
});

document.dispatchEvent(new CustomEvent('lesson-read', { detail: { lessonId: 'dom-and-events', read: true } }));
```

## รันบนเบราว์เซอร์

เบราว์เซอร์รันไฟล์ `.ts` ไม่ได้ ต้องแปลงเป็น `.js` ก่อน ถ้าใช้ Vite ตอนพัฒนาอ้างไฟล์ `.ts` ใน HTML ได้เลยเพราะ Vite แปลงให้ทันที ถ้าไม่ใช้ bundler ให้ปิด `noEmit` ตั้ง `outDir` แล้วให้ `tsc` สร้างไฟล์ `.js` ไว้ให้ HTML โหลดด้วย `<script type="module">` และไม่ว่าแบบไหนก็ยังต้องสั่ง `tsc` ตรวจ type แยกเสมอ

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `querySelector<HTMLInputElement>` หรือ `as` กับทุก element แทนการเช็กด้วย `instanceof`
- ใส่ `!` หลัง `querySelector` เพื่อปิด error แล้วพังเมื่อ HTML เปลี่ยน
- ใช้ `event.target` เหมือนเป็น element ที่ผูก listener ไว้ ทั้งที่อาจเป็นลูกข้างในตัวไหนก็ได้
- ลืมว่าค่าจาก `FormData` อาจเป็นไฟล์ ไม่ใช่ข้อความเสมอไป

## สรุป

- ใส่ `dom` ใน `lib` แล้ว element และ event ทุกตัวมี type ให้ครบ
- `querySelector` อาจคืน `null` เสมอ เช็กด้วย `instanceof` ปลอดภัยกว่าการบอกให้เชื่อ
- `event.target` และค่าจากฟอร์มต้องตรวจก่อนใช้ และ event ของเราเองใส่ type ได้ผ่าน `DocumentEventMap`

## อ่านเพิ่ม

- [TypeScript: DOM Manipulation](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html)
- [MDN: Document.querySelector()](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)
- [Vite: TypeScript](https://vite.dev/guide/features.html#typescript)
