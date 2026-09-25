---
name: typescript-7-node-24-toolchain-2026
type: research
agent: friday
date: 2026-09-26
---

## Triple

[[typescript-7-node-24-toolchain-2026]] --is--> ข้อเท็จจริงของเครื่องมือ TypeScript และ Node.js ณ ก.ย. 2026 ที่คอร์ส TypeScript อิงอยู่
[[typescript-7-node-24-toolchain-2026]] --source--> https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ (อ่าน 2026-09-26): 7.0 ออก 8 ก.ค. 2026 · port เป็น Go · full build เร็วขึ้น 8–12 เท่า · "TypeScript 7.0 does not ship with an API" (7.1 จะมี) · `@typescript/typescript6` ไว้ติดตั้งคู่ · JSDoc เลิกรองรับ `@enum`
[[typescript-7-node-24-toolchain-2026]] --source--> https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html: ค่าเริ่มต้นใหม่ strict true · module esnext · target es2025 · types [] · rootDir "." · deprecate target es5, moduleResolution node10, baseUrl, outFile
[[typescript-7-node-24-toolchain-2026]] --source--> https://nodejs.org/api/typescript.html (เอกสาร v26.10.0): type stripping เปิดเองตั้งแต่ v22.18/v23.6 · stable ตั้งแต่ v24.12/v25.2 · ลบ `--experimental-transform-types` ใน v26.0 · แทน type ด้วยช่องว่าง ไม่ตรวจ type · ไม่อ่าน tsconfig · ไม่รัน .ts ใน node_modules
[[typescript-7-node-24-toolchain-2026]] --source--> npm registry 2026-09-26: typescript latest 7.0.2 · typescript-eslint 8.70.1 peer `typescript >=4.8.4 <6.1.0` · eslint 10.11.0 engines `^20.19.0 || ^22.13.0 || >=24` · @eslint/js 10.0.0 ถูก deprecate (latest 10.0.1) · Node LTS 24.21.0
[[typescript-7-node-24-toolchain-2026]] --verified-with--> Node 24.21 พกพา: enum, namespace ที่มีค่า, parameter property → `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` · decorator → `SyntaxError: Invalid or unexpected token` · `node --test` เจอ `*.test.ts` เอง · Node 20.18 รัน .ts ไม่ได้ (SyntaxError หรือ ERR_UNKNOWN_FILE_EXTENSION)
[[typescript-7-node-24-toolchain-2026]] --verified-with--> tsc 7.0.2: `target: esnext` ปล่อย decorator ไว้ในผลลัพธ์ · es2025 ลงมาแปลงเป็น helper แล้วรันได้ · erasableSyntaxOnly ให้ TS1294 · คำว่า `module` แทน namespace ให้ TS1540 · `types: []` ไม่กัน `@types` ของแพ็กเกจที่ import
[[typescript-7-node-24-toolchain-2026]] --verified-with--> ติดตั้ง `@typescript/native@npm:typescript@^7.0.2` + `typescript@npm:@typescript/typescript6@^6.0.2` ได้ `npx tsc` = 7.0.2 และ `npx tsc6` = 6.0.3 · ESLint 10 + typed linting รันได้
[[typescript-7-node-24-toolchain-2026]] --impacts--> [[typescript-lesson-verification]]
[[typescript-7-node-24-toolchain-2026]] --documented-in--> `C:\Users\loxbit\Desktop\develop-knowladge\types-script\lessons\01-what-is-typescript.md` · `02-setup-and-tsconfig.md` · `19-typescript-with-nodejs.md` · `20-strict-and-linting.md`

## Note

ทุกข้อผูกกับเวลา (2026-09) · เมื่อ TypeScript 7.1 มี API และ typescript-eslint รองรับแล้ว บท 1 และ 20 ต้องแก้เรื่องการติดตั้งคู่
ข้อสังเกต: ตามรอบออกรุ่นปกติ Node รุ่นเลขคู่เข้า LTS ในเดือนตุลาคม บท 1, 2, 19 ที่บอกว่า LTS ล่าสุดคือ 24 จึงควรทบทวนหลัง ต.ค. 2026
ข้อสังเกต: เครื่องของ Guy ยังเป็น Node 20.18 ซึ่งหมดระยะดูแลตั้งแต่ เม.ย. 2026
