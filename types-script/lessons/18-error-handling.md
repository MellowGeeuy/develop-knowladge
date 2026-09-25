# การจัดการ Error แบบปลอดภัย

> JavaScript โยนอะไรออกมาเป็น error ก็ได้ ไม่ว่าจะเป็น `Error`, ข้อความ หรือตัวเลข TypeScript จึงให้ค่าใน `catch` เป็น `unknown` บังคับให้ตรวจก่อนใช้ บทนี้ตรวจ error อย่างถูกวิธี สร้าง error ของตัวเองที่มีข้อมูลครบ และใช้ Result type กับความผิดพลาดที่คาดไว้แล้ว

## บทนี้จะได้อะไร

- จัดการค่าใน `catch` ที่เป็น `unknown` อย่างปลอดภัย
- สร้าง Error class ของตัวเองและแยกประเภทด้วย `instanceof`
- เลือกระหว่างการโยน error กับการคืนผลแบบ Result

## error ใน catch เป็น unknown

เมื่อเปิด `strict` (ตัวเลือก `useUnknownInCatchVariables` อยู่ในชุดนี้) ค่าใน `catch` เป็น `unknown` จะเรียก `.message` ตรง ๆ ไม่ได้

```ts
try {
  JSON.parse('{ไม่ใช่ JSON');
} catch (error) {
  console.log(error.message); // ❌ 'error' is of type 'unknown'.
}
```

เช็กด้วย `instanceof Error` ก่อน ในบล็อกนั้น TypeScript จะรู้ว่าเป็น `Error`

```ts
try {
  JSON.parse('{ไม่ใช่ JSON');
} catch (error) {
  if (error instanceof SyntaxError) {
    console.log(`JSON ผิดรูปแบบ: ${error.name}`); // → JSON ผิดรูปแบบ: SyntaxError
  }
}
```

ถ้าต้องแปลง error เป็นข้อความบ่อย ๆ เขียนฟังก์ชันไว้ใช้ซ้ำ รองรับทั้งกรณีที่มีคนโยนข้อความหรือค่าอื่นที่ไม่ใช่ `Error` ออกมา

```ts
function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

try {
  throw 'บันทึกไม่สำเร็จ';
} catch (error) {
  console.log(errorMessage(error)); // → บันทึกไม่สำเร็จ
}
```

## Error class ของตัวเอง

extends จาก `Error` แล้วเพิ่มข้อมูลที่ต้องใช้ เช่น ชื่อช่องที่ผิด ตั้ง `name` ให้ตรงกับชื่อ class เพื่อให้ log และ stack trace อ่านรู้เรื่อง

```ts
class ValidationError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function parseAge(input: string): number {
  const age = Number(input);
  if (!Number.isInteger(age) || age < 0) {
    throw new ValidationError('age', `อายุต้องเป็นจำนวนเต็มบวก ได้ "${input}"`);
  }
  return age;
}

try {
  parseAge('สิบ');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`${error.field}: ${error.message}`); // → age: อายุต้องเป็นจำนวนเต็มบวก ได้ "สิบ"
  } else {
    throw error;
  }
}
```

error ที่ไม่ได้ตั้งใจจัดการให้โยนต่อ (`throw error`) อย่ากลืนทิ้ง ไม่งั้นบั๊กจริงจะหายไปเงียบ ๆ

## ส่งต่อสาเหตุด้วย cause

เวลาห่อ error ระดับล่างด้วยข้อความที่เข้าใจง่ายขึ้น ใส่ error เดิมไว้ใน `cause` (มีตั้งแต่ ES2022) คนแก้บั๊กจะยังเห็นต้นเหตุจริง

```ts
function loadConfig(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('อ่านไฟล์ตั้งค่าไม่สำเร็จ', { cause: error });
  }
}

try {
  loadConfig('{port: 3000}');
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message, '←', error.cause instanceof SyntaxError); // → อ่านไฟล์ตั้งค่าไม่สำเร็จ ← true
  }
}
```

## Promise ที่ถูก reject

`.catch()` ของ Promise ยังให้ `reason` เป็น `any` ตามนิยามเดิมของ lib `strict` ช่วยไม่ได้ในจุดนี้ ให้เขียน `unknown` กำกับเองทุกครั้ง หรือใช้ `try/catch` กับ `await` ซึ่งได้ `unknown` อัตโนมัติ

```ts
async function loadProfile(): Promise<string> {
  throw new Error('เซิร์ฟเวอร์ไม่ตอบ');
}

await loadProfile().catch((error: unknown) => {
  console.log(error instanceof Error ? error.message : String(error)); // → เซิร์ฟเวอร์ไม่ตอบ
});
```

## Result: คืนความผิดพลาดแทนการโยน

ความผิดพลาดที่คาดไว้แล้ว เช่น ผู้ใช้กรอกข้อมูลผิด ไม่จำเป็นต้องเป็น exception คืนเป็นค่าที่บอกว่าสำเร็จหรือไม่ได้ ด้วย discriminated union (บทที่ 7) คนเรียกต้องเช็กก่อนใช้ค่าเสมอ ลืมไม่ได้เพราะ TypeScript ไม่ยอม

```ts
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parsePrice(input: string): Result<number> {
  const price = Number(input.replaceAll(',', ''));
  if (Number.isNaN(price) || price < 0) {
    return { ok: false, error: `ราคา "${input}" ไม่ถูกต้อง` };
  }
  return { ok: true, value: price };
}

const result = parsePrice('1,250');

if (result.ok) {
  console.log(result.value * 2); // → 2500
}

const failed = parsePrice('ฟรี');
console.log(failed.ok ? failed.value : failed.error); // → ราคา "ฟรี" ไม่ถูกต้อง
console.log(result.value); // ❌ Property 'value' does not exist on type 'Result<number, string>'.
```

| ใช้แบบไหน | เหมาะกับ |
|---|---|
| `throw` | สิ่งที่ไม่ควรเกิดและโค้ดตรงนั้นแก้ไม่ได้ เช่น ไฟล์ตั้งค่าหาย ฐานข้อมูลล่ม บั๊กในโปรแกรม |
| `Result` | ความผิดพลาดที่คาดไว้และคนเรียกต้องตัดสินใจเอง เช่น ข้อมูลที่ผู้ใช้กรอก การค้นหาที่ไม่เจอ |

## ข้อผิดพลาดที่พบบ่อย

- ใช้ `error.message` ใน `catch` โดยไม่เช็กว่าเป็น `Error` ก่อน
- `catch` แล้วไม่ทำอะไรเลย (กลืน error) หรือ log แล้วทำงานต่อเหมือนไม่มีอะไรเกิดขึ้น
- สร้าง error ใหม่ทับโดยไม่ใส่ `cause` ทำให้ต้นเหตุจริงหายไป
- ใช้ exception กับทุกกรณี แม้แต่ข้อมูลที่ผู้ใช้กรอกผิดซึ่งเป็นเรื่องปกติ

## สรุป

- ค่าใน `catch` เป็น `unknown` ต้องตรวจด้วย `instanceof` ก่อนใช้ และ `.catch()` ของ Promise ต้องเขียน `unknown` เอง
- Error class ของตัวเองบอกประเภทและข้อมูลของความผิดพลาดได้ชัด ใช้คู่กับ `cause`
- ความผิดพลาดที่คาดไว้แล้วคืนเป็น Result ส่วน `throw` เก็บไว้กับสิ่งที่ไม่ควรเกิด

## อ่านเพิ่ม

- [TSConfig: useUnknownInCatchVariables](https://www.typescriptlang.org/tsconfig/#useUnknownInCatchVariables)
- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: Error.prototype.cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
