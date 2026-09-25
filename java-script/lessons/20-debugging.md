# Debugging ด้วย DevTools

> ทุกคนเขียนบั๊ก ความต่างระหว่างนักพัฒนามือใหม่กับมืออาชีพคือความเร็วในการหาต้นเหตุ บทนี้สอนเครื่องมือใน DevTools ที่ทำให้เลิกเดา และขั้นตอนหาบั๊กอย่างเป็นระบบ

## บทนี้จะได้อะไร

- อ่าน error และ stack trace ได้ว่าพังที่ไหน เพราะใคร
- ใช้ `console` ได้มากกว่า `log`
- หยุดโค้ดด้วย breakpoint ดูค่าตัวแปร และเดินทีละบรรทัด
- ตรวจคำขอในแท็บ Network และหาบั๊กตามขั้นตอนที่ทำซ้ำได้

## อ่าน error ให้ครบ

```text
Uncaught TypeError: Cannot read properties of undefined (reading 'name')
    at renderUser (user-card.js:12:28)
    at loadUsers (dashboard.js:40:5)
    at async init (dashboard.js:58:3)
```

- **บรรทัดแรก** บอกชนิดและสาเหตุ: มีค่าที่เป็น `undefined` แล้วโค้ดพยายามอ่าน `.name` จากมัน
- **บรรทัด `at` แรก** คือจุดที่พัง: ไฟล์ `user-card.js` บรรทัด 12 ตัวอักษรที่ 28 กดที่ลิงก์ใน DevTools เพื่อเปิดไปที่บรรทัดนั้นได้ทันที
- **บรรทัดถัดลงมา** คือเส้นทางที่เรียกมาถึงจุดนั้น ต้นเหตุจริงมักอยู่ที่บรรทัดล่าง ๆ ที่ส่งค่าผิดเข้ามา ไม่ใช่บรรทัดที่พัง

## console มากกว่า log

```js
const users = [
  { id: 1, name: 'Guy', role: 'admin' },
  { id: 2, name: 'Mint', role: 'editor' },
];

console.table(users); // แสดงเป็นตาราง อ่านง่ายกว่า log ทั้ง array

console.group('โหลดข้อมูลผู้ใช้');
console.info('เริ่มโหลด');
console.warn('API ตอบช้ากว่าปกติ'); // สีเหลือง กรองดูเฉพาะคำเตือนได้
console.groupEnd();

console.time('คำนวณรายงาน');
const total = users.reduce((sum, user) => sum + user.id, 0);
console.timeEnd('คำนวณรายงาน'); // พิมพ์เวลาที่ใช้

console.assert(total === 3, 'ผลรวมผิด', total); // พิมพ์เฉพาะตอนเงื่อนไขเป็นเท็จ
console.log({ total }); // ครอบด้วย { } จะเห็นชื่อตัวแปรคู่กับค่า
```

> [!TIP]
> `console.log({ total, user })` เร็วกว่า `console.log('total', total, 'user', user)` และไม่มีทางสลับชื่อกับค่าผิด

## Breakpoint: หยุดโค้ดแล้วดูข้างใน

`console.log` บอกได้แค่ค่าที่เราคิดว่าจะพิมพ์ breakpoint หยุดโค้ดทั้งโปรแกรมไว้ แล้วให้ดูได้ทุกตัวแปร ณ จังหวะนั้น

1. เปิด DevTools (`F12`) ไปที่แท็บ **Sources** แล้วเปิดไฟล์ด้วย `Ctrl+P`
2. คลิกเลขบรรทัดที่ต้องการให้หยุด แล้วทำให้โค้ดทำงาน (รีโหลด หรือกดปุ่ม)
3. เมื่อหยุดแล้ว ดูค่าตัวแปรในช่อง **Scope** หรือชี้เมาส์ที่ตัวแปรในโค้ด
4. เดินต่อทีละขั้น: `F10` ข้ามบรรทัด · `F11` เข้าไปในฟังก์ชัน · `Shift+F11` ออกจากฟังก์ชัน · `F8` ทำงานต่อจนถึง breakpoint ถัดไป

breakpoint แบบพิเศษที่ช่วยประหยัดเวลามาก

- **Conditional breakpoint** คลิกขวาที่เลขบรรทัด แล้วใส่เงื่อนไข เช่น `user.id === 42` หยุดเฉพาะรอบที่สนใจในลูปพันรอบ
- **Logpoint** พิมพ์ค่าออก console โดยไม่ต้องแก้โค้ดและไม่ต้องรีโหลด
- **Pause on exceptions** ในแผง Breakpoints ให้หยุดทันทีที่มี error เห็นค่าทุกตัวก่อนพัง

สั่งหยุดจากโค้ดได้ด้วยคำสั่ง `debugger` (ทำงานเฉพาะตอนเปิด DevTools อยู่)

```js
function applyCoupon(total, coupon) {
  debugger; // หยุดตรงนี้ ดูว่า coupon ที่ได้รับหน้าตาเป็นอย่างไร
  return coupon.type === 'percent' ? total * (1 - coupon.value / 100) : total - coupon.value;
}
```

อย่าลืมลบ `debugger` ก่อนส่งโค้ด ESLint มีกฎ `no-debugger` ช่วยเตือน

## แท็บ Network

ปัญหาเรื่องข้อมูลไม่ขึ้นส่วนใหญ่ตอบได้ในแท็บ Network

- กรองด้วย **Fetch/XHR** ให้เหลือเฉพาะคำขอ API
- กดที่คำขอเพื่อดู URL จริง method สถานะ header สิ่งที่ส่งไป (Payload) และสิ่งที่ได้กลับมา (Response)
- ติ๊ก **Disable cache** ตอนพัฒนา กันไฟล์เก่าค้าง
- เลือก **Slow 4G** ใน Throttling เพื่อทดสอบหน้าจอ "กำลังโหลด" ที่ปกติเห็นไม่ทัน
- คลิกขวา **Copy as fetch** เพื่อนำคำขอเดิมไปทดลองซ้ำใน Console

## หาบั๊กอย่างเป็นระบบ

1. **ทำให้เกิดซ้ำได้** จดขั้นตอนที่ทำให้พังทุกครั้ง บั๊กที่ทำซ้ำไม่ได้แก้ไม่ได้
2. **อ่าน error ทั้งหมด** รวมถึง stack trace ทุกบรรทัด
3. **ตั้งสมมติฐาน** "น่าจะเพราะ API ส่ง `null` มาแทน array"
4. **พิสูจน์ด้วยข้อมูล** ใช้ breakpoint หรือ Network ดูค่าจริง ไม่เดา
5. **แก้ที่ต้นเหตุ** ไม่ใช่แค่ใส่ `?.` ปิดอาการที่บรรทัดที่พัง
6. **กันไม่ให้กลับมา** เขียนเทสต์ที่จำลองบั๊กนั้น (ดู [บทการทดสอบ](21-testing.md))

> [!TIP]
> ติดอยู่นานเกิน 30 นาที ให้ลองอธิบายปัญหาให้คนอื่นฟังทีละบรรทัด หรือพิมพ์อธิบายเหมือนจะถามคนอื่น บ่อยครั้งจะเจอคำตอบเองระหว่างอธิบาย

## Debug โค้ด Node.js

```bash
node --inspect-brk server.mjs
```

แล้วเปิด `chrome://inspect` ใน Chrome จะได้ DevTools ชุดเดียวกันกับของเบราว์เซอร์ หรือใน VS Code เปิด **JavaScript Debug Terminal** แล้วรัน `node` ตามปกติ breakpoint ที่ตั้งใน editor จะทำงานทันที

## ข้อผิดพลาดที่พบบ่อย

- อ่าน error แค่บรรทัดแรกแล้วเดาต่อ
- แก้หลายจุดพร้อมกันจนไม่รู้ว่าจุดไหนที่แก้ได้จริง
- ปล่อย `console.log` และ `debugger` ติดไปกับโค้ดจริง
- ไม่ได้เปิด **Preserve log** ใน Console เลยเห็น error หายไปตอนหน้าเปลี่ยน

## สรุป

- stack trace บอกทั้งจุดที่พังและเส้นทางที่มาถึง
- ใช้ `console.table`, `group`, `time`, `assert` และ `console.log({ ตัวแปร })`
- breakpoint โดยเฉพาะแบบมีเงื่อนไข เร็วกว่าการพิมพ์ log ไล่ทีละจุด
- หาบั๊กตามขั้นตอน: ทำซ้ำ อ่าน สมมติฐาน พิสูจน์ แก้ต้นเหตุ เขียนเทสต์

## อ่านเพิ่ม

- [Chrome DevTools: Debug JavaScript](https://developer.chrome.com/docs/devtools/javascript)
- [Chrome DevTools: Network features reference](https://developer.chrome.com/docs/devtools/network/reference)
- [MDN: console](https://developer.mozilla.org/en-US/docs/Web/API/console)
- [Node.js: Debugging](https://nodejs.org/learn/getting-started/debugging)
