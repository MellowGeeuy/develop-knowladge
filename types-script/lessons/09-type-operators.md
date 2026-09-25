# keyof, typeof, as const และ satisfies

> แทนที่จะเขียน type ซ้ำกับค่าที่มีอยู่แล้ว TypeScript ดึง type ออกมาจากค่าได้ตรง ๆ แก้ค่าที่เดียวแล้ว type ตามไปเอง บทนี้รวมเครื่องมือที่ทำให้ type มีแหล่งความจริงเดียว และเครื่องมือที่ควรใช้อย่างระวัง

## บทนี้จะได้อะไร

- ดึง type จากค่าด้วย `typeof` และดึงชื่อ key ด้วย `keyof`
- ดึง type ย่อยด้วย indexed access รวมถึงรูปแบบ `(typeof list)[number]`
- ใช้ `satisfies` ตรวจค่าโดยไม่เสีย type ที่ละเอียด
- รู้ว่า `as` และ `!` อันตรายตรงไหน

## typeof: type จากค่า

`typeof` ที่อยู่ในตำแหน่งของ type ไม่ใช่ `typeof` ของ JavaScript ที่คืนข้อความ แต่คือ "ขอ type ของตัวแปรนี้"

```ts
const defaultSettings = {
  theme: 'dark',
  fontSize: 16,
  showLineNumbers: true,
};

type Settings = typeof defaultSettings; // ชนิด: { theme: string; fontSize: number; showLineNumbers: boolean; }

function applySettings(settings: Settings): string {
  return `${settings.theme} ${settings.fontSize}px`;
}

console.log(applySettings({ ...defaultSettings, fontSize: 18 })); // → dark 18px
```

เพิ่มค่าตั้งต้นใหม่เมื่อไร type `Settings` ก็มี property นั้นเพิ่มเองทันที

## keyof: ชื่อ key ทั้งหมด

`keyof` ได้ union ของชื่อ key ทุกตัวใน type นั้น (เอาเมาส์ชี้ `SettingKey` ใน VS Code จะเห็นแค่ `keyof Settings` แต่ความหมายคือ union ตามคอมเมนต์)

```ts
type Settings = { theme: string; fontSize: number; showLineNumbers: boolean };
type SettingKey = keyof Settings; // เท่ากับ "fontSize" | "showLineNumbers" | "theme"

function resetSetting(key: SettingKey): string {
  return `รีเซ็ต ${key} แล้ว`;
}

console.log(resetSetting('fontSize')); // → รีเซ็ต fontSize แล้ว
resetSetting('color'); // ❌ Argument of type '"color"' is not assignable to parameter of type 'keyof Settings'.
```

## Indexed access: type ย่อยข้างใน

ใช้วงเล็บเหลี่ยมกับ type เพื่อดึง type ของ property ตัวใดตัวหนึ่ง และ `[number]` ดึง type ของสมาชิกใน array

```ts
type Lesson = {
  id: string;
  level: 'foundations' | 'type-system';
  tags: string[];
};

type LessonLevel = Lesson['level']; // ชนิด: "foundations" | "type-system"
type Tag = Lesson['tags'][number]; // ชนิด: string
```

## as const + typeof + [number]

สามอย่างรวมกันคือวิธีมาตรฐานในการมีรายการค่าที่ใช้ตอนรันด้วย และเป็น type ด้วย โดยเขียนรายการแค่ที่เดียว

```ts
const PLANS = ['free', 'pro', 'team'] as const;

type Plan = (typeof PLANS)[number]; // ชนิด: "free" | "pro" | "team"

function isPlan(value: string): value is Plan {
  return PLANS.some((plan) => plan === value);
}

console.log(isPlan('pro'), isPlan('gold')); // → true false
```

ข้อควรรู้คือ `PLANS.includes(value)` ใช้ตรง ๆ ไม่ได้ เพราะ `includes` ของ array นี้รับได้แค่ค่าที่เป็น `Plan` อยู่แล้ว ทั้งที่เรากำลังจะเช็กว่าใช่หรือเปล่า

```ts
const PLANS = ['free', 'pro', 'team'] as const;

function isPlanWrong(value: string): boolean {
  return PLANS.includes(value); // ❌ Argument of type 'string' is not assignable to parameter of type '"free" | "pro" | "team"'.
}
```

## satisfies: ตรวจแต่ไม่ทับ type

ถ้าใส่ type ให้ตัวแปรตรง ๆ TypeScript จะลืมรายละเอียดของค่าจริงไปใช้ type ที่เราบอกแทน ตัวอย่างนี้พิมพ์ชื่อ key ผิดก็ไม่มีใครเตือน

```ts
type Route = { path: string; auth: boolean };

const routes: Record<string, Route> = {
  home: { path: '/', auth: false },
  dashboard: { path: '/dashboard', auth: true },
};

const settings = routes.settings; // ชนิด: Route | undefined
```

`satisfies` (มีตั้งแต่ TypeScript 4.9) ตรวจว่าค่าเข้ากับ type ที่ต้องการ แต่ยังเก็บ type ที่ละเอียดของค่าจริงไว้ key ที่ไม่มีจึงถูกจับได้

```ts
type Route = { path: string; auth: boolean };

const routes = {
  home: { path: '/', auth: false },
  dashboard: { path: '/dashboard', auth: true },
} satisfies Record<string, Route>;

console.log(routes.dashboard.path); // → /dashboard
routes.settings; // ❌ Property 'settings' does not exist on type '{ home: { path: string; auth: false; }; dashboard: { path: string; auth: true; }; }'.
```

ข้อความ error ยังบอกด้วยว่า TypeScript จำค่าจริงไว้ละเอียดแค่ไหน เช่น `auth` ของ `home` เป็น `false` ไม่ใช่แค่ `boolean`

และถ้าค่าผิดรูปร่าง ก็ถูกจับตรงจุดที่ผิดเหมือนการใส่ type ปกติ

```ts
type Route = { path: string; auth: boolean };

const routes = {
  home: { path: '/', auth: 'no' }, // ❌ Type 'string' is not assignable to type 'boolean'.
} satisfies Record<string, Route>;
```

## as: บอกว่า "เชื่อฉัน"

`as` (type assertion) คือการบอก TypeScript ให้เชื่อว่าค่านี้เป็น type ที่เราบอก โดยไม่มีการตรวจอะไรเลย ถ้าเราผิด โปรแกรมพังตอนรัน

```ts
type User = { id: number; name: string };

const user = JSON.parse('{"id":1}') as User;

try {
  user.name.toUpperCase();
} catch (error) {
  console.log(String(error)); // → TypeError: Cannot read properties of undefined (reading 'toUpperCase')
}
```

TypeScript ยังกันกรณีที่ผิดชัด ๆ ไว้ให้บ้าง เช่นแปลงระหว่าง type ที่ไม่เกี่ยวกันเลย

```ts
const count = 'สิบ' as number; // ❌ Conversion of type 'string' to type 'number' may be a mistake because neither type sufficiently overlaps with the other.
```

ข้อมูลจากภายนอกให้ตรวจจริงด้วย type predicate (บทที่ 7) หรือ schema (บทที่ 17) แทนการใช้ `as`

## `!`: บอกว่า "ไม่ใช่ null แน่นอน"

`!` ต่อท้ายค่าเป็นการบอกว่าไม่ใช่ `null` หรือ `undefined` แน่นอน ตัด type ออกให้ แต่ตอนรันไม่ได้ตรวจอะไรให้เลยเหมือน `as`

```ts
const lessons = ['Generics'];
const firstLesson = lessons[0]!; // ชนิด: string
```

ใช้ได้เมื่อรู้แน่จริง ๆ ว่ามีค่า ถ้าไม่แน่ใจให้เช็กด้วย `if` หรือใช้ `??` ใส่ค่าสำรองแทน

## ข้อผิดพลาดที่พบบ่อย

- เขียน type ซ้ำกับรายการค่าคงที่ แก้ที่หนึ่งแล้วลืมอีกที่
- ใส่ type ให้ object ตั้งค่าตรง ๆ แล้วเสียชื่อ key ที่ละเอียด ทั้งที่ใช้ `satisfies` ได้
- ใช้ `as` กับข้อมูลที่มาจากภายนอก
- ใช้ `!` เพื่อปิด error โดยไม่ได้เช็กจริง

## สรุป

- `typeof`, `keyof` และ indexed access ดึง type จากสิ่งที่มีอยู่แล้ว ให้มีแหล่งความจริงเดียว
- `as const` + `(typeof list)[number]` คือรายการค่าที่เป็นทั้งข้อมูลตอนรันและ type
- `satisfies` ตรวจโดยไม่ทับ type ส่วน `as` และ `!` คือการบอกให้เชื่อโดยไม่ตรวจ ใช้ให้น้อยที่สุด

## อ่านเพิ่ม

- [TypeScript Handbook: Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)
- [TypeScript Handbook: Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)
- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [TypeScript 4.9: The satisfies Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
