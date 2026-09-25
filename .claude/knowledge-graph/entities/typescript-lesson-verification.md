---
name: typescript-lesson-verification
type: pattern
agent: friday
date: 2026-09-26
---

## Triple

[[typescript-lesson-verification]] --is--> วิธีตรวจโค้ดในบท TypeScript กับเครื่องมือจริง 4 ชั้น: error ของ tsc 7 · type ที่เขียนไว้ · ผลที่รันได้ · tsconfig ที่แสดงในบท
[[typescript-lesson-verification]] --uses--> [[lesson-snippet-output-verification]] (จับคู่ `// →` กับ console.log ตามลำดับบรรทัด และโหมด `// ผลลัพธ์`)
[[typescript-lesson-verification]] --uses--> `typescript@7.0.2` CLI (`--pretty false` แล้วแยก `file(line,col): error TSxxxx: msg`) · `typescript@6.0.3` API + `stableTypeOrdering: true` สำหรับ `// ชนิด:` · Node 24.21 แบบพกพา · zod 4.6.5
[[typescript-lesson-verification]] --requires--> ทุกบล็อกรันได้ในตัวเอง ยกเว้นบล็อกที่มี `file=` ซึ่งรวมเป็นโปรเจกต์เดียวต่อบท · ไฟล์ `.js` ที่มี `// @ts-check` ตรวจด้วย allowJs
[[typescript-lesson-verification]] --documented-in--> scratchpad ของ session 2026-09-26 `ts/verify-ts.mjs` (ไม่เก็บในโปรเจกต์ เพราะต้องติดตั้ง TypeScript สองรุ่นกับ Node 24) · ผลอยู่ใน `C:\Users\loxbit\Desktop\develop-knowladge\Updates\Update v.0002.md` หัวข้อ "ตรวจแล้ว"
[[typescript-lesson-verification]] --verified-with--> 2026-09-26: 198 บล็อก · ตรวจ type 167 · `// ❌` 66 จุดตรงกับ tsc 7 และไม่มี error ที่ไม่ได้เขียนไว้ · `// ชนิด:` 80 จุด · รัน 75 บล็อก 97 ผลลัพธ์ · tsconfig 7 ไฟล์
[[typescript-lesson-verification]] --solves--> ข้อความหรือ type ที่ต่างจากที่คาดระหว่างเขียนบท เช่น union ที่ tsc 7 เรียงใหม่ `"center" | "left" | "right"` · click เป็น `PointerEvent` · `'Promise<number>' and '1'` · mapped type ที่แสดงแบบคลี่แล้ว
[[typescript-lesson-verification]] --avoid--> เขียน `// ชนิด:` กับ type alias ของ `keyof` (แสดงเป็น `keyof X` ตามที่เอาเมาส์ชี้) ใช้ `// เท่ากับ` แล้วให้ตัวตรวจคลี่ union แทน
[[typescript-lesson-verification]] --avoid--> วาง `src/x.js` กับ `src/x.ts` ในโปรเจกต์เดียวกัน TypeScript ถือว่า .js เป็นผลลัพธ์ของ .ts แล้วข้ามไม่ตรวจ
[[typescript-lesson-verification]] --avoid--> console.log ที่ไม่ได้ทำงาน (อยู่หลังบรรทัดที่ throw) ในบล็อกที่มี `// →` จำนวนผลลัพธ์จะไม่ตรง
[[typescript-lesson-verification]] --relates--> [[typescript-7-node-24-toolchain-2026]]

## Note

WHY ใช้ API ของ TypeScript 6 ตรวจชนิด: TypeScript 7.0 ไม่มี API ให้โปรแกรมอื่นเรียก แต่ 6.0 มี `--stableTypeOrdering`
ที่ทำให้ลำดับ type ตรงกับ 7 ส่วน error ทุกข้อความยังตรวจด้วย tsc 7 ตัวจริง

WHY ตรวจตอนรันด้วย tsc แปลงเป็น JS (target es2024) แทนการให้ Node ลบ type: บท 6, 12, 13, 15 มี enum, parameter property
และ decorator ที่ Node รันตรงไม่ได้ ส่วน error TS1294 ของ erasableSyntaxOnly ถูกข้าม เว้นแต่บรรทัดนั้นเขียน `// ❌` ไว้เอง

ใช้ `relates` กับ typescript-7-node-24-toolchain-2026 เพราะไฟล์นั้นคือข้อเท็จจริงของเครื่องมือที่ตัวตรวจนี้พึ่ง ไม่ใช่ส่วนหนึ่งของวิธีตรวจ
