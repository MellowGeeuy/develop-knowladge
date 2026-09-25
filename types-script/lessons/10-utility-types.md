# Utility Types

> TypeScript มี type สำเร็จรูปชุดหนึ่งไว้แปลง type ที่มีอยู่แล้วเป็น type ใหม่ เช่น ทำให้ทุก property ไม่บังคับ เลือกบาง property หรือตัดบางค่าออกจาก union ใช้เป็นแล้วแทบไม่ต้องเขียน type ซ้ำอีก

## บทนี้จะได้อะไร

- ใช้ utility type กับ object: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`
- ใช้กับ union: `Exclude`, `Extract`, `NonNullable`
- ดึง type จากฟังก์ชัน: `ReturnType`, `Parameters`, `Awaited`

## Partial และ Required

`Partial<T>` ทำให้ทุก property ไม่บังคับ เหมาะกับฟังก์ชันแก้ไขที่ส่งมาแค่ส่วนที่เปลี่ยน

```ts
type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
};

function updateUser(user: User, changes: Partial<User>): User {
  return { ...user, ...changes };
}

const mali: User = { id: 1, name: 'มะลิ', email: 'mali@example.com', role: 'member' };
const promoted = updateUser(mali, { role: 'admin' });

console.log(promoted.role); // → admin
```

`Required<T>` ทำกลับกัน ใช้บอกว่าหลังเติมค่าเริ่มต้นแล้ว ทุกช่องมีค่าแน่นอน

```ts
type Options = { retries?: number; timeoutMs?: number };

function withDefaults(options: Options): Required<Options> {
  return { retries: 3, timeoutMs: 5000, ...options };
}

const options = withDefaults({ retries: 1 }); // ชนิด: { retries: number; timeoutMs: number; }

console.log(options); // → { retries: 1, timeoutMs: 5000 }
```

ฟังก์ชันนี้ผ่านได้เพราะเปิด `exactOptionalPropertyTypes` ไว้ ค่าที่ส่งมาจึงไม่มีทางเป็น `undefined` มาทับค่าเริ่มต้น

## Readonly

`Readonly<T>` ห้ามแก้ทุก property (ชั้นเดียว) และ `Object.freeze` ก็คืน type นี้ให้เอง

```ts
type Settings = { theme: string; fontSize: number };

const settings: Readonly<Settings> = { theme: 'dark', fontSize: 16 };
settings.fontSize = 18; // ❌ Cannot assign to 'fontSize' because it is a read-only property.

const frozen = Object.freeze({ theme: 'light' }); // ชนิด: { readonly theme: "light"; }
```

## Pick และ Omit

`Pick` เลือกเฉพาะ property ที่ต้องการ `Omit` ตัดที่ไม่ต้องการออก ใช้บ่อยมากตอนส่งข้อมูลออกนอกระบบ เช่น ห้ามส่งรหัสผ่านไปหน้าเว็บ

```ts
type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

type PublicUser = Omit<User, 'passwordHash'>;
type UserPreview = Pick<User, 'id' | 'name'>;

function toPublic(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}

const preview: UserPreview = { id: 1, name: 'มะลิ', email: 'mali@example.com' }; // ❌ Object literal may only specify known properties, and 'email' does not exist in type 'UserPreview'.
```

> [!WARNING]
> `Omit` ไม่ตรวจว่าชื่อ key ที่ตัดมีอยู่จริง `Omit<User, 'pasword'>` พิมพ์ผิดก็ไม่มี error และได้ `User` เต็ม ๆ กลับมา รวมถึง `passwordHash` ที่ตั้งใจจะตัด

## Record

`Record<K, V>` สร้าง object ที่ key เป็น `K` และค่าเป็น `V` ถ้า `K` เป็น union TypeScript บังคับให้มีครบทุก key

```ts
type Role = 'admin' | 'editor' | 'viewer';

const permissions: Record<Role, string[]> = { // ❌ Property 'viewer' is missing in type '{ admin: string[]; editor: string[]; }' but required in type 'Record<Role, string[]>'.
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
};
```

เพิ่ม role ใหม่เมื่อไร ทุก `Record<Role, ...>` ในโปรเจกต์จะฟ้องจนกว่าจะเพิ่มค่าให้ครบ

## Exclude, Extract และ NonNullable

สามตัวนี้ทำงานกับ union `Exclude` ตัดสมาชิกออก `Extract` เก็บเฉพาะที่ตรงเงื่อนไข `NonNullable` ตัด `null` กับ `undefined` ออก

```ts
type Status = 'draft' | 'published' | 'archived' | 'deleted';

type VisibleStatus = Exclude<Status, 'deleted'>; // เท่ากับ "archived" | "draft" | "published"
type ClosedStatus = Extract<Status, 'archived' | 'deleted'>; // เท่ากับ "archived" | "deleted"
type Name = NonNullable<string | null | undefined>; // ชนิด: string
```

`Extract` ใช้กับ discriminated union ได้ด้วย ดึงเฉพาะแบบที่ต้องการออกมาเป็น type ของตัวเอง

```ts
type AppEvent =
  | { type: 'click'; x: number; y: number }
  | { type: 'keydown'; key: string };

type ClickEvent = Extract<AppEvent, { type: 'click' }>; // ชนิด: { type: "click"; x: number; y: number; }
```

## ReturnType, Parameters และ Awaited

ดึง type จากฟังก์ชันที่มีอยู่แล้ว ไม่ต้องเขียน type ของผลลัพธ์แยกไว้อีกที่

```ts
function createLesson(title: string, minutes: number) {
  return { id: title.toLowerCase().replaceAll(' ', '-'), title, minutes };
}

type Lesson = ReturnType<typeof createLesson>; // ชนิด: { id: string; title: string; minutes: number; }
type LessonArgs = Parameters<typeof createLesson>; // ชนิด: [title: string, minutes: number]

async function loadLesson(): Promise<Lesson> {
  return createLesson('Utility Types', 15);
}

type Loaded = Awaited<ReturnType<typeof loadLesson>>; // ชนิด: { id: string; title: string; minutes: number; }

const lesson = await loadLesson();
console.log(lesson.id); // → utility-types
```

`ReturnType` ของ async function ได้ `Promise<...>` เสมอ `Awaited` แกะ Promise ออกให้เหลือค่าข้างใน แบบเดียวกับที่ `await` ทำตอนรัน

## สรุปทั้งชุด

| Utility | ได้อะไร |
|---|---|
| `Partial<T>` | ทุก property ไม่บังคับ |
| `Required<T>` | ทุก property บังคับ |
| `Readonly<T>` | ทุก property ห้ามแก้ (ชั้นเดียว) |
| `Pick<T, K>` | เก็บเฉพาะ key ที่ระบุ |
| `Omit<T, K>` | ตัด key ที่ระบุออก (ไม่ตรวจว่า key มีจริง) |
| `Record<K, V>` | object ที่ key เป็น `K` และค่าเป็น `V` |
| `Exclude<U, X>` | ตัดสมาชิกที่เข้ากับ `X` ออกจาก union |
| `Extract<U, X>` | เก็บเฉพาะสมาชิกที่เข้ากับ `X` |
| `NonNullable<T>` | ตัด `null` และ `undefined` ออก |
| `ReturnType<F>` | type ที่ฟังก์ชันคืน |
| `Parameters<F>` | tuple ของพารามิเตอร์ |
| `Awaited<T>` | type หลัง `await` (แกะ Promise ออก) |

## ข้อผิดพลาดที่พบบ่อย

- เขียน type ใหม่ทั้งก้อนทั้งที่เป็นแค่ type เดิมที่ตัดหรือเลือกบาง property
- คิดว่า `Readonly` กันการแก้ object ที่ซ้อนอยู่ข้างในด้วย
- พิมพ์ชื่อ key ใน `Omit` ผิดแล้วไม่รู้ตัว
- ใช้ `Record<string, T>` ทั้งที่รู้ชื่อ key ครบ ทำให้เสียการตรวจว่ามีครบทุก key

## สรุป

- utility types สร้าง type ใหม่จาก type เดิม แก้ต้นทางที่เดียว type ปลายทางตามไปเอง
- กลุ่ม object: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`
- กลุ่ม union และฟังก์ชัน: `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`

## อ่านเพิ่ม

- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
