# Fetch API: คุยกับ Server

> `fetch` คือเครื่องมือมาตรฐานสำหรับขอและส่งข้อมูลผ่าน HTTP ใช้ง่าย แต่มีรายละเอียดที่ทำให้บั๊กเงียบได้ง่าย โดยเฉพาะเรื่องที่ `fetch` ไม่ถือว่า 404 หรือ 500 เป็น error บทนี้สร้างฟังก์ชันเรียก API ที่ใช้ซ้ำได้ทั้งโปรเจกต์

## บทนี้จะได้อะไร

- ขอข้อมูล JSON และส่งข้อมูลด้วย `fetch` ได้ถูกต้อง
- ตรวจ `response.ok` ตั้ง timeout และยกเลิกคำขอด้วย `AbortController`
- จัดสถานะหน้าจอ กำลังโหลด / ว่าง / ผิดพลาด / สำเร็จ ให้ครบ
- เข้าใจ CORS และรู้ว่าทำไมห้ามใส่ความลับไว้ใน frontend

## ขอข้อมูล (GET)

```js
const response = await fetch('https://api.example.com/products?limit=5');
if (!response.ok) {
  throw new Error(`โหลดสินค้าไม่สำเร็จ: HTTP ${response.status}`);
}
const products = await response.json();
```

> [!IMPORTANT]
> `fetch` reject เฉพาะตอนเชื่อมต่อไม่ได้เลย (เน็ตหลุด DNS ผิด ถูกยกเลิก) ถ้าเซิร์ฟเวอร์ตอบ 404 หรือ 500 กลับมา `fetch` ยังถือว่า "สำเร็จ" ต้องเช็ก `response.ok` (สถานะ 200–299) เองทุกครั้ง

## ส่งข้อมูล (POST)

```js
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sku: 'KB-01', quantity: 2 }),
});
```

body ต้องแปลงเป็นข้อความด้วย `JSON.stringify` และบอกเซิร์ฟเวอร์ด้วย `Content-Type` ว่าส่ง JSON มา

ประกอบ query string ด้วย `URLSearchParams` แทนการต่อ string เอง ตัวอักษรพิเศษและภาษาไทยจะถูก encode ให้ถูกต้อง

```js
const params = new URLSearchParams({ q: 'js tips', page: 2 });
console.log(params.toString()); // → q=js+tips&page=2
console.log(`/api/search?${params}`); // → /api/search?q=js+tips&page=2
```

## ฟังก์ชันกลางสำหรับเรียก API

แทนที่จะเขียน `fetch` พร้อมเช็กซ้ำทุกที่ ให้รวมไว้ในฟังก์ชันเดียว ทุกคำขอจะได้ timeout การเช็กสถานะ และรูปแบบ error เหมือนกัน

```js file=assets/js/utils/http.js
export class HttpError extends Error {
  constructor(response, body) {
    super(`HTTP ${response.status} ${response.statusText}`);
    this.name = 'HttpError';
    this.status = response.status;
    this.body = body;
  }
}

export async function requestJson(url, { method = 'GET', body, headers = {}, timeoutMs = 10000, signal } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new HttpError(response, data);
  return data;
}
```

ใช้งาน แล้วแยกจัดการตามชนิดของปัญหา

```js
import { HttpError, requestJson } from '../utils/http.js';

async function submitOrder(order) {
  try {
    const created = await requestJson('/api/orders', { method: 'POST', body: order });
    showMessage(`สร้างออร์เดอร์ #${created.id} แล้ว`);
  } catch (error) {
    if (error instanceof HttpError && error.status === 422) {
      showMessage(`ข้อมูลไม่ครบ: ${error.body?.message ?? 'กรุณาตรวจสอบอีกครั้ง'}`);
    } else if (error.name === 'TimeoutError') {
      showMessage('เซิร์ฟเวอร์ตอบช้าเกินไป กรุณาลองใหม่');
    } else {
      showMessage('เชื่อมต่อไม่สำเร็จ');
      throw error; // ปัญหาที่ไม่รู้จัก ส่งต่อให้ระบบ log
    }
  }
}
```

## สถานะของหน้าจอให้ครบสี่แบบ

ทุกส่วนที่โหลดข้อมูลต้องมี 4 สถานะเสมอ ไม่งั้นผู้ใช้จะเจอหน้าว่างเปล่าแล้วไม่รู้ว่ากำลังโหลด ไม่มีข้อมูล หรือพัง

```js
async function renderProducts(container) {
  container.setAttribute('aria-busy', 'true');
  container.textContent = 'กำลังโหลดสินค้า…'; // 1. กำลังโหลด
  try {
    const products = await requestJson('/api/products');
    if (products.length === 0) {
      container.textContent = 'ยังไม่มีสินค้าในหมวดนี้'; // 2. ว่าง
      return;
    }
    container.replaceChildren(...products.map(createProductCard)); // 3. สำเร็จ
  } catch (error) {
    container.textContent = 'โหลดสินค้าไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง'; // 4. ผิดพลาด
    console.error(error);
  } finally {
    container.removeAttribute('aria-busy');
  }
}
```

## ยกเลิกคำขอเก่าเมื่อมีคำขอใหม่

ช่องค้นหาที่ยิงคำขอทุกครั้งที่พิมพ์ อาจได้คำตอบกลับมาสลับลำดับ แล้วผลของคำค้นเก่าทับผลใหม่ ให้ยกเลิกคำขอเก่าทิ้งก่อนเริ่มคำขอใหม่

```js
let controller = null;

async function search(query) {
  controller?.abort(); // ยกเลิกคำขอก่อนหน้าที่ยังไม่กลับมา
  controller = new AbortController();
  try {
    const params = new URLSearchParams({ q: query });
    return await requestJson(`/api/search?${params}`, { signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') return null; // เรายกเลิกเอง ไม่ใช่ความผิดพลาด
    throw error;
  }
}
```

## CORS

เบราว์เซอร์ไม่ให้หน้าเว็บอ่านคำตอบจาก origin อื่น (โดเมน พอร์ต หรือโปรโตคอลต่างกัน) เว้นแต่เซิร์ฟเวอร์ปลายทางจะอนุญาตด้วย header เช่น `Access-Control-Allow-Origin` ข้อความ "blocked by CORS policy" จึงเป็น **เรื่องที่ต้องตั้งที่เซิร์ฟเวอร์** แก้จากโค้ด frontend ไม่ได้ และ `mode: 'no-cors'` ก็ไม่ช่วย เพราะได้คำตอบที่อ่านเนื้อหาไม่ได้กลับมา

## ห้ามใส่ความลับไว้ใน frontend

ทุกอย่างที่ส่งไปถึงเบราว์เซอร์ ผู้ใช้เปิดดูได้หมดจาก DevTools รวมถึง API key ที่ฝังในโค้ด บริการที่ต้องใช้ secret key ต้องเรียกผ่าน backend ของเราเอง แล้วให้ frontend เรียก backend อีกทอดหนึ่ง (ดู [บท Security](22-security-basics.md))

## ข้อผิดพลาดที่พบบ่อย

- ไม่เช็ก `response.ok` แล้วเอา JSON ของหน้า error ไปแสดงเหมือนข้อมูลจริง
- ลืม `JSON.stringify` body หรือลืม `Content-Type`
- ไม่มี timeout หน้าเว็บค้างที่ "กำลังโหลด" ตลอดไปเมื่อเซิร์ฟเวอร์ไม่ตอบ
- ไม่ยกเลิกคำขอเก่า ผลลัพธ์สลับลำดับ
- ต่อ query string เองจนภาษาไทยหรือเครื่องหมาย `&` ทำให้ URL เพี้ยน

## สรุป

- `fetch` ต้องเช็ก `response.ok` เองเสมอ
- รวมการเรียก API ไว้ในฟังก์ชันกลางที่มี timeout และ error ที่มีชนิดชัดเจน
- ทุกส่วนที่โหลดข้อมูลต้องมีสถานะ กำลังโหลด / ว่าง / ผิดพลาด / สำเร็จ
- CORS แก้ที่เซิร์ฟเวอร์ และความลับอยู่ฝั่ง backend เท่านั้น

## อ่านเพิ่ม

- [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN: Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)
- [MDN: AbortSignal.timeout()](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)
- [MDN: Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
