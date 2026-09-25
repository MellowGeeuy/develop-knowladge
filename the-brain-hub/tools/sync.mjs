/**
 * npm run sync — สร้างไฟล์ที่ต้องตรงกับแหล่งเดียวใหม่ทั้งหมด
 *   สีประจำภาษา · หน้าเว็บ index.html ของทุกภาษา · ตารางบทใน README ของทุกภาษา
 * รันทุกครั้งหลังแก้ languages.json, templates/course-page.html หรือ course.json ของภาษาใด
 */
import { relative } from 'node:path';
import { ROOT_DIR } from './lib/catalog.mjs';
import { syncAll } from './lib/generate.mjs';

try {
  const written = syncAll();
  if (written.length === 0) {
    console.log('sync: ทุกไฟล์ตรงกับต้นทางอยู่แล้ว');
  } else {
    for (const target of written) console.log(`sync: เขียน ${relative(ROOT_DIR, target.path)} (${target.label})`);
  }
} catch (error) {
  console.error(`sync ไม่สำเร็จ: ${error.message}`);
  process.exitCode = 1;
}
