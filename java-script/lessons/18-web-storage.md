# เก็บข้อมูลในเบราว์เซอร์

> เบราว์เซอร์มีที่เก็บข้อมูลให้หน้าเว็บหลายแบบ ที่ใช้บ่อยที่สุดคือ localStorage สำหรับจำค่าตั้งค่าหรือร่างข้อความข้ามการเปิดหน้า บทนี้สอนวิธีใช้ให้ไม่พัง และสิ่งที่ห้ามเก็บเด็ดขาด

## บทนี้จะได้อะไร

- ใช้ `localStorage` และ `sessionStorage` เก็บและอ่านข้อมูลได้
- เก็บ object ด้วย JSON และห่อให้ปลอดภัยจากกรณีเขียนหรืออ่านไม่ได้
- เลือกที่เก็บให้เหมาะกับข้อมูล และรู้ว่าอะไรไม่ควรอยู่ในเบราว์เซอร์

## localStorage และ sessionStorage

ทั้งสองเก็บคู่ key และค่าที่เป็น **string เท่านั้น** แยกตาม origin (โดเมน พอร์ต โปรโตคอล) และจำกัดขนาดราว 5 MB ต่างกันที่อายุของข้อมูล

- `localStorage` อยู่จนกว่าผู้ใช้หรือโค้ดจะลบ แม้ปิดเบราว์เซอร์ไปแล้ว
- `sessionStorage` อยู่แค่ในแท็บนั้น ปิดแท็บแล้วหายไป

```js
localStorage.setItem('theme', 'dark');
console.log(localStorage.getItem('theme')); // → dark
console.log(localStorage.getItem('missing')); // → null
localStorage.removeItem('theme');
console.log(localStorage.getItem('theme')); // → null
```

## เก็บ object ต้องแปลงเป็น JSON

ค่าที่ไม่ใช่ string จะถูกแปลงเป็น string ให้เองแบบที่ไม่ต้องการ

```js
localStorage.setItem('draft', { title: 'บันทึกประชุม' });
console.log(localStorage.getItem('draft')); // → [object Object]

localStorage.setItem('draft', JSON.stringify({ title: 'บันทึกประชุม' }));
console.log(JSON.parse(localStorage.getItem('draft')).title); // → บันทึกประชุม
```

## ห่อให้ปลอดภัย

การอ่านเขียน storage โยน error ได้จริงในหลายสถานการณ์ เช่น โหมดส่วนตัวของบางเบราว์เซอร์ ผู้ใช้ปิดการเก็บข้อมูลของเว็บ หรือพื้นที่เต็ม ข้อมูลที่อ่านมาก็อาจเสียเพราะเวอร์ชันเก่าหรือถูกแก้มือ ให้ห่อไว้ในฟังก์ชันกลางที่คืนค่าสำรองเสมอ

```js file=assets/js/utils/storage.js
export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    // อ่านไม่ได้หรือข้อมูลเสีย: ใช้ค่าสำรอง ดีกว่าทำให้ทั้งหน้าพัง
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // พื้นที่เต็ม (QuotaExceededError) หรือถูกปิดการเขียน: แจ้งคนเรียกให้ตัดสินใจเอง
    return false;
  }
}
```

ใส่เลขเวอร์ชันไว้ในชื่อ key เช่น `app.cart.v1` วันที่เปลี่ยนรูปแบบข้อมูลจะเปลี่ยนเป็น `v2` ได้ทันที โดยไม่ต้องเขียนโค้ดรองรับข้อมูลรูปแบบเก่าที่ค้างอยู่ในเครื่องผู้ใช้

> [!NOTE]
> เว็บ The Brain ที่กำลังอ่านอยู่ใช้วิธีนี้จำว่าอ่านบทไหนไปแล้ว ด้วย key `the-brain.progress.v1` (โค้ดอยู่ที่ `the-brain-hub/assets/js/utils/progress-store.js`)

## ซิงก์ข้ามแท็บ

เมื่อแท็บหนึ่งแก้ `localStorage` แท็บอื่นของ origin เดียวกันจะได้ event `storage`

```js
window.addEventListener('storage', (event) => {
  if (event.key === 'theme') {
    document.documentElement.dataset.theme = event.newValue ?? 'light';
  }
});
```

## เลือกที่เก็บให้เหมาะ

| | localStorage | sessionStorage | Cookie | IndexedDB |
|---|---|---|---|---|
| อยู่ได้นาน | จนกว่าจะลบ | จนปิดแท็บ | ตามวันหมดอายุ | จนกว่าจะลบ |
| ขนาดโดยประมาณ | ราว 5 MB | ราว 5 MB | ราว 4 KB ต่อ cookie | ใหญ่มาก ตามพื้นที่เครื่อง |
| ส่งไปกับทุกคำขอ | ไม่ | ไม่ | ส่ง | ไม่ |
| JavaScript อ่านได้ | ได้ | ได้ | ได้ ยกเว้นแบบ HttpOnly | ได้ (แบบ async) |
| เหมาะกับ | ธีม ค่าตั้งค่า ร่างข้อความ | สถานะชั่วคราวในแท็บ | session ที่เซิร์ฟเวอร์ตั้ง | ข้อมูลจำนวนมาก ใช้งานออฟไลน์ |

## สิ่งที่ห้ามเก็บใน localStorage

- **token ที่ใช้ยืนยันตัวตน** โค้ด JavaScript ทุกตัวบนหน้าอ่านได้ ถ้าหน้าเว็บโดน XSS แม้จุดเดียว token จะถูกขโมยไปทันที session ควรเป็น cookie แบบ `HttpOnly` และ `Secure` ที่เซิร์ฟเวอร์ตั้ง JavaScript จะอ่านไม่ได้เลย
- **รหัสผ่านและข้อมูลส่วนบุคคล** เช่น เลขบัตรประชาชน ข้อมูลที่อยู่ในเครื่องผู้ใช้โดยไม่มีการป้องกันขัดกับหลักของ PDPA
- **ข้อมูลที่ต้องเชื่อถือได้** ผู้ใช้แก้ค่าใน storage ได้เองจาก DevTools ห้ามใช้ตัดสินสิทธิ์หรือราคาสินค้า

## ข้อผิดพลาดที่พบบ่อย

- เก็บ object โดยไม่ `JSON.stringify` จนได้ `'[object Object]'`
- เก็บ token หรือข้อมูลส่วนตัวไว้ใน `localStorage`
- ไม่ครอบด้วย `try`/`catch` แล้วหน้าเว็บพังในโหมดส่วนตัว
- เชื่อข้อมูลจาก storage โดยไม่ตรวจ ทั้งที่ผู้ใช้แก้เองได้

## สรุป

- storage เก็บได้แค่ string ต้องแปลง object ด้วย JSON
- ห่อการอ่านเขียนด้วยฟังก์ชันกลางที่มี `try`/`catch` และค่าสำรอง
- เก็บเฉพาะค่าตั้งค่าและข้อมูลที่ไม่ลับ ส่วน session ใช้ cookie แบบ HttpOnly

## อ่านเพิ่ม

- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)
