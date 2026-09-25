# ฟังก์ชัน

> ฟังก์ชันคือจุดที่ type คุ้มค่าที่สุด เพราะเป็นสัญญาระหว่างคนเขียนกับคนเรียกใช้ ใส่ type ให้พารามิเตอร์ครั้งเดียว ทุกที่ที่เรียกใช้ถูกตรวจทันที และค่าที่คืนก็ถูกตรวจว่าตรงกับที่สัญญาไว้

## บทนี้จะได้อะไร

- ใส่ type ให้พารามิเตอร์และค่าที่คืน และรู้ว่าทำไมควรเขียน return type เอง
- ใช้พารามิเตอร์ที่ไม่บังคับ ค่าเริ่มต้น rest และ object parameter
- เขียน function type กับ callback และรู้ว่าเมื่อไรควรใช้ overload

## พารามิเตอร์และค่าที่คืน

พารามิเตอร์ต้องมี type เสมอ เพราะ TypeScript ไม่มีค่าไหนให้เดา ส่วน type ของค่าที่คืนเขียนต่อท้ายวงเล็บ

```ts
function formatPrice(amount: number, currency: string): string {
  return `${amount.toLocaleString('th-TH')} ${currency}`;
}

console.log(formatPrice(1500, 'บาท')); // → 1,500 บาท
formatPrice(1500); // ❌ Expected 2 arguments, but got 1.
formatPrice('1500', 'บาท'); // ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
```

## ทำไมควรเขียน return type เอง

TypeScript เดา return type ได้ แต่มันเดาจากสิ่งที่เราเขียน ไม่ใช่สิ่งที่เราตั้งใจ ฟังก์ชันนี้ลืมจัดการกรณี `silver` จึงคืน `undefined` ได้โดยไม่มีใครเตือน และ type ที่เดาได้ก็แคบกว่าที่ตั้งใจไว้ด้วย

```ts
function getRate(level: 'gold' | 'silver') {
  if (level === 'gold') {
    return 0.2;
  }
}

const rate = getRate('silver'); // ชนิด: 0.2 | undefined
```

พอเขียน return type ไว้ TypeScript ตรวจให้ว่าทุกทางคืนค่าครบ

```ts
function getRate(level: 'gold' | 'silver'): number { // ❌ Function lacks ending return statement and return type does not include 'undefined'.
  if (level === 'gold') {
    return 0.2;
  }
}
```

แนวทางที่ดีคือเขียน return type ให้ฟังก์ชันที่ export ออกไปให้ไฟล์อื่นใช้ ส่วนฟังก์ชันเล็ก ๆ ข้างในปล่อยให้เดาได้

## พารามิเตอร์ที่ไม่บังคับและค่าเริ่มต้น

ใส่ `?` หลังชื่อเพื่อบอกว่าไม่ส่งมาก็ได้ ข้างในฟังก์ชันค่านั้นจะเป็น `string | undefined` ส่วนพารามิเตอร์ที่มีค่าเริ่มต้นไม่ต้องเขียน type เพราะเดาจากค่าเริ่มต้นได้

```ts
function greet(name: string, greeting?: string): string {
  return `${greeting ?? 'สวัสดี'} ${name}`;
}

function welcome(name: string, greeting = 'ยินดีต้อนรับ'): string {
  return `${greeting} ${name}`;
}

console.log(greet('มะลิ')); // → สวัสดี มะลิ
console.log(welcome('มะลิ', 'หวัดดี')); // → หวัดดี มะลิ
```

พารามิเตอร์ที่ไม่บังคับต้องอยู่ท้ายสุด

```ts
function label(prefix?: string, text: string): string { // ❌ A required parameter cannot follow an optional parameter.
  return `${prefix ?? ''}${text}`;
}
```

## Rest parameter

```ts
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

const values = [4, 5, 6];

console.log(sum(1, 2, 3)); // → 6
console.log(sum(...values)); // → 15
```

## Object parameter

ฟังก์ชันที่รับค่าหลายตัว รับเป็น object ตัวเดียวจะอ่านง่ายกว่า และไม่ต้องจำลำดับ

```ts
type CreateUserInput = {
  name: string;
  role?: 'admin' | 'member';
};

function createUser({ name, role = 'member' }: CreateUserInput) {
  return { name, role, createdAt: new Date(2026, 8, 26) };
}

const user = createUser({ name: 'ต้นกล้า' }); // ชนิด: { name: string; role: "admin" | "member"; createdAt: Date; }

console.log(user.role); // → member
```

## Function type

type ของฟังก์ชันเขียนเป็น `(พารามิเตอร์) => ค่าที่คืน` เมื่อกำหนด type ให้ตัวแปรแล้ว พารามิเตอร์ของฟังก์ชันที่ใส่ลงไปจะรู้ type เองโดยไม่ต้องเขียนซ้ำ (contextual typing)

```ts
type Formatter = (value: number) => string;

const toBaht: Formatter = (value) => `${value.toFixed(2)} บาท`;
const toPercent: Formatter = (value) => `${Math.round(value * 100)}%`;

console.log(toBaht(99.5)); // → 99.50 บาท
console.log(toPercent(0.256)); // → 26%
```

## Callback และ `void`

callback ที่ type คืนเป็น `void` แปลว่า "ไม่สนใจค่าที่คืน" จึงส่งฟังก์ชันที่คืนค่าอะไรมาก็ได้ อย่างในตัวอย่างนี้ `push` คืนความยาวใหม่ของ array แต่ `repeat` ไม่เอาไปใช้

```ts
function repeat(times: number, action: (index: number) => void): void {
  for (let index = 0; index < times; index += 1) {
    action(index);
  }
}

const log: number[] = [];
repeat(3, (index) => log.push(index * 10));

console.log(log); // → [0, 10, 20]
```

แต่ฟังก์ชันที่ประกาศเองว่าคืน `void` ห้ามคืนค่า

```ts
function notify(message: string): void {
  return message; // ❌ Type 'string' is not assignable to type 'void'.
}
```

> [!TIP]
> อย่าใช้ `Function` เป็น type ของพารามิเตอร์ มันรับฟังก์ชันอะไรก็ได้ และเรียกด้วยพารามิเตอร์อะไรก็ผ่าน ให้เขียนเป็น function type ที่บอกพารามิเตอร์ชัด ๆ แทน

## Overload

ถ้า type ของค่าที่คืนขึ้นกับ type ของพารามิเตอร์ เขียนหลายหัวฟังก์ชัน (overload signature) ได้ คนเรียกจะเห็นเฉพาะหัวด้านบน ส่วนหัวของตัวที่ทำงานจริงถูกซ่อน

```ts
function toArray(value: string): string[];
function toArray(value: number): number[];
function toArray(value: string | number): (string | number)[] {
  return [value];
}

const words = toArray('ts'); // ชนิด: string[]
const numbers = toArray(7); // ชนิด: number[]
```

ใช้ overload เมื่อจำเป็นจริง ๆ เท่านั้น ถ้า return type ไม่ได้เปลี่ยนตาม input ใช้ union ในพารามิเตอร์ตัวเดียวก็พอ และหลายกรณีเขียนด้วย generics (บทที่ 8) ได้สั้นกว่า

## ข้อผิดพลาดที่พบบ่อย

- ใส่ type ให้พารามิเตอร์ของ callback ซ้ำ ทั้งที่ TypeScript รู้อยู่แล้วจาก function type
- ใช้ `Function` หรือ `any` เป็น type ของ callback
- ไม่เขียน return type ให้ฟังก์ชันที่ export แล้วเผลอคืน `undefined` ในบางทาง
- เขียน overload ทั้งที่ใช้ union ก็พอ

## สรุป

- พารามิเตอร์ต้องมี type เสมอ return type ควรเขียนเองสำหรับฟังก์ชันที่ export
- `?` ทำให้พารามิเตอร์ไม่บังคับ ค่าเริ่มต้นบอก type ได้เอง และ rest รับเป็น array
- function type ทำให้ callback รู้ type ของพารามิเตอร์เอง และ `void` ใน callback แปลว่าไม่สนค่าที่คืน

## อ่านเพิ่ม

- [TypeScript Handbook: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [TypeScript Handbook: Everyday Types — Functions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#functions)
