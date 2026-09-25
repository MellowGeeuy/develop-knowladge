/**
 * npm start — static server สำหรับเปิดเว็บในเครื่อง (Node ล้วน ไม่ต้องลงอะไรเพิ่ม)
 *
 * ต้องเสิร์ฟจากโฟลเดอร์แม่ของ the-brain-hub เพราะหน้าภาษา (../java-script/) กับ hub อ้างไฟล์ของกันและกัน
 * และต้องเป็น http:// เพราะ ES Modules กับ fetch ใช้กับ file:// ไม่ได้
 * ฟังเฉพาะ 127.0.0.1 จึงเปิดได้จากเครื่องนี้เครื่องเดียว
 */
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT_DIR } from './lib/catalog.mjs';

const { values } = parseArgs({ options: { port: { type: 'string' } } });
const PORT = Number(values.port ?? process.env.PORT ?? 8765);
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function send(response, status, body, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  response.end(body);
}

function statOrNull(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}

const server = createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${HOST}`).pathname);
  } catch {
    send(response, 400, 'Bad request');
    return;
  }

  // ไม่เสิร์ฟโฟลเดอร์ที่ขึ้นต้นด้วยจุด (.claude, .git) และกันการถอยออกนอกโฟลเดอร์โปรเจกต์
  let filePath = resolve(ROOT_DIR, `.${pathname}`);
  const segments = pathname.split('/').filter(Boolean);
  if ((filePath !== ROOT_DIR && !filePath.startsWith(ROOT_DIR + sep)) || segments.some((part) => part.startsWith('.'))) {
    send(response, 404, 'Not found');
    return;
  }

  let stats = statOrNull(filePath);
  if (stats?.isDirectory()) {
    // ต้องมี / ปิดท้าย ไม่งั้น path แบบ relative ในหน้า (เช่น ../assets/) จะ resolve ผิดชั้น
    if (!pathname.endsWith('/')) {
      response.writeHead(301, { Location: `${pathname}/` });
      response.end();
      return;
    }
    filePath = join(filePath, 'index.html');
    stats = statOrNull(filePath);
  }

  if (!stats?.isFile()) {
    send(response, 404, `ไม่พบ ${pathname}`);
    return;
  }

  response.writeHead(200, {
    'Content-Type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') console.error(`พอร์ต ${PORT} ถูกใช้อยู่ ลอง npm start -- --port 8766`);
  else console.error(error.message);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`The Brain เปิดที่ http://${HOST}:${PORT}/   (กด Ctrl+C เพื่อปิด)`);
});
