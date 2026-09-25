# Mapped, Conditional และ Template Literal Types

> utility types ในบทที่แล้วสร้างขึ้นจากเครื่องมือสามอย่างของบทนี้ คือ mapped type ที่วนทุก key, conditional type ที่เลือก type ตามเงื่อนไข และ template literal type ที่ประกอบข้อความเป็น type เข้าใจสามอย่างนี้แล้วจะอ่าน type ของไลบรารีออก และสร้าง type ของตัวเองได้

## บทนี้จะได้อะไร

- เขียน mapped type และเปลี่ยนชื่อ key ด้วย `as`
- เขียน conditional type และดึง type ข้างในออกมาด้วย `infer`
- ประกอบ type จากข้อความด้วย template literal type
- รู้ว่าเมื่อไรควรหยุดเขียน type ให้ซับซ้อน

## Mapped type

`[K in keyof T]` คือการวนทุก key ของ `T` แล้วกำหนดว่าแต่ละ key ในผลลัพธ์จะเป็น type อะไร `T[K]` คือ type เดิมของ key นั้น

```ts
type Settings = { theme: string; fontSize: number; autosave: boolean };

type SettingFlags = { [K in keyof Settings]: boolean }; // ชนิด: { theme: boolean; fontSize: boolean; autosave: boolean; }
```

`Partial`, `Readonly` ที่ใช้ในบทที่แล้วเขียนแบบนี้เอง เครื่องหมาย `?` และ `readonly` ใส่เพิ่มได้ และใส่ `-` นำหน้าเพื่อเอาออก

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

type Draft = MyPartial<{ title: string; published: boolean }>; // ชนิด: { title?: string; published?: boolean; }
type Editable = Mutable<{ readonly id: string }>; // ชนิด: { id: string; }
```

## เปลี่ยนชื่อ key ด้วย as

ใส่ `as` หลังการวนเพื่อตั้งชื่อ key ใหม่ ตัวอย่างนี้สร้างชื่อเมธอด `get...` จากทุก property

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type User = { name: string; age: number };
type UserGetters = Getters<User>; // ชนิด: { getAge: () => number; getName: () => string; }
```

ถ้าให้ `as` ได้ `never` key นั้นจะหายไป ใช้กรองเฉพาะ property ที่ต้องการ

```ts
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type TextFields = OnlyStrings<{ id: number; name: string; email: string }>; // ชนิด: { name: string; email: string; }
```

## Conditional type

`A extends B ? X : Y` อ่านว่า "ถ้า A เข้ากับ B ได้ ให้เป็น X ไม่งั้นเป็น Y" เหมือน ternary แต่ทำงานกับ type

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // ชนิด: true
type B = IsString<42>; // ชนิด: false
```

ถ้าใส่ union เข้าไป conditional type จะแยกทำทีละสมาชิกแล้วรวมผลกลับ (distributive) ถ้าไม่อยากให้แยก ห่อด้วยวงเล็บเหลี่ยมทั้งสองฝั่ง

```ts
type ToArray<T> = T extends unknown ? T[] : never;
type ToArrayTogether<T> = [T] extends [unknown] ? T[] : never;

type Separate = ToArray<string | number>; // เท่ากับ string[] | number[]
type Together = ToArrayTogether<string | number>; // ชนิด: (string | number)[]
```

## infer: ดึง type ที่อยู่ข้างใน

ใน conditional type ใช้ `infer` ประกาศช่องไว้ แล้ว TypeScript จะเติม type ที่ตรงตำแหน่งนั้นให้ นี่คือวิธีที่ `ReturnType` และ `Awaited` ทำงาน

```ts
type ElementOf<T> = T extends readonly (infer Item)[] ? Item : never;
type Unwrap<T> = T extends Promise<infer Value> ? Value : T;
type MyReturnType<T> = T extends (...args: never[]) => infer Result ? Result : never;

type Tag = ElementOf<string[]>; // ชนิด: string
type Data = Unwrap<Promise<{ id: number }>>; // ชนิด: { id: number; }
type Plain = Unwrap<number>; // ชนิด: number
type Total = MyReturnType<(items: number[]) => number>; // ชนิด: number
```

## Template literal type

เขียน type ด้วย backtick เหมือน template literal ของ JavaScript ถ้าใส่ union เข้าไป จะได้ทุกชุดที่เป็นไปได้

```ts
type Size = 'sm' | 'md' | 'lg';
type Tone = 'primary' | 'danger';

type ButtonClass = `btn--${Size}` | `btn--${Tone}`; // เท่ากับ "btn--danger" | "btn--lg" | "btn--md" | "btn--primary" | "btn--sm"
```

TypeScript มี type สำหรับแปลงตัวพิมพ์มาให้ในตัว คือ `Uppercase`, `Lowercase`, `Capitalize` และ `Uncapitalize`

```ts
type EventName = 'click' | 'focus';
type HandlerName = `on${Capitalize<EventName>}`; // เท่ากับ "onClick" | "onFocus"
```

## รวมทุกอย่าง: พารามิเตอร์ใน URL

ตัวอย่างจากงานจริงแบบที่ไลบรารี router ใช้ คือดึงชื่อพารามิเตอร์ออกจาก path อย่าง `/lessons/:lessonId` แล้วบังคับให้ส่งค่าครบทุกตัว ใช้ template literal กับ `infer` และเรียกตัวเองซ้ำ (recursive)

```ts
type RouteParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? Param | RouteParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = RouteParams<'/lessons/:lessonId/sections/:sectionId'>; // เท่ากับ "lessonId" | "sectionId"

function buildPath<Path extends string>(path: Path, params: Record<RouteParams<Path>, string>): string {
  let result: string = path;
  for (const [name, value] of Object.entries(params)) {
    result = result.replace(`:${name}`, String(value));
  }
  return result;
}

console.log(buildPath('/lessons/:lessonId', { lessonId: 'generics' })); // → /lessons/generics
buildPath('/lessons/:lessonId', { id: 'generics' }); // ❌ Object literal may only specify known properties, and 'id' does not exist in type 'Record<"lessonId", string>'.
```

> [!WARNING]
> type ระดับนี้อ่านยาก debug ยาก และทำให้ `tsc` ช้าลงเมื่อซับซ้อนมาก ใช้เมื่อช่วยตัดโค้ดซ้ำหรือจับบั๊กได้จริงเท่านั้น งานส่วนใหญ่ใช้ utility types สำเร็จรูปกับ type ธรรมดาก็พอ

## ข้อผิดพลาดที่พบบ่อย

- ลืมว่า conditional type แยกทำทีละสมาชิกของ union จนได้ผลไม่ตรงที่คิด
- เขียน `Capitalize<K>` ตรง ๆ ทั้งที่ key อาจเป็น `number` หรือ `symbol` ต้องเขียน `string & K`
- เขียน type ซับซ้อนเกินจนคนในทีมอ่านไม่ออก ทั้งที่ type ธรรมดาทำได้เหมือนกัน
- คิดว่า type เหล่านี้ตรวจอะไรตอนรัน ทั้งที่หายไปหมดเหมือน type อื่น

## สรุป

- mapped type วนทุก key (`[K in keyof T]`) และเปลี่ยนชื่อหรือกรอง key ได้ด้วย `as`
- conditional type เลือก type ตามเงื่อนไข และ `infer` ดึง type ที่ซ่อนอยู่ข้างในออกมา
- template literal type ประกอบข้อความเป็น type และทำงานร่วมกับ union ได้ทุกชุด

## อ่านเพิ่ม

- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
