# Knowledge Graph · develop-knowladge · The Brain คลังความรู้การพัฒนาโปรแกรม

- **โปรเจกต์:** `develop-knowladge` · ราก `C:\Users\loxbit\Desktop\develop-knowladge`
- **spec การบันทึก:** `C:\Users\loxbit\.claude\knowledge-graph\PATTERN.md` (ใช้ร่วมทุกโปรเจกต์ ห้ามแตกกฎเอง)
- **ทะเบียนโปรเจกต์:** `C:\Users\loxbit\.claude\knowledge-graph\PROJECTS.md`
- **สารบัญข้ามโปรเจกต์:** `C:\Users\loxbit\.claude\knowledge-graph\CROSS-INDEX.md`

ลิงก์ในโฟลเดอร์นี้ที่เขียน `[[slug]]` เฉย ๆ หมายถึง node ในโปรเจกต์นี้เท่านั้น
ถ้าจะอ้าง node ของโปรเจกต์อื่นต้องเขียน `[[<project>:<slug>]]` เสมอ

---

- [brain-hub-content-pack-architecture](entities/brain-hub-content-pack-architecture.md) — the-brain-hub เป็นแพลตฟอร์ม โฟลเดอร์ภาษาเป็นชุดเนื้อหา · languages.json ทะเบียนเดียว · new-language / sync / check · scale ถึง 14 ภาษาทดสอบแล้ว (by friday, 2026-09-25)
- [language-accent-from-logo-color](entities/language-accent-from-logo-color.md) — สีแต่ละภาษาจากสีโลโก้ (Simple Icons) เลื่อนความสว่าง OKLCH ให้ผ่านคอนทราสต์ 3:1 / 4.5:1 ทั้งสองธีม · JS ใช้ overrides อำพันแทนเขียวมะกอก · token ต่อยอดต้องประกาศซ้ำใน [data-language] (by friday, 2026-09-25)
- [cross-document-view-transition-hash-error](entities/cross-document-view-transition-hash-error.md) — @view-transition navigation auto + URL มี #fragment ทำให้ Chrome โยน "Transition was aborted because of invalid state. ViewTransition opt-in disabled" · ดัก pagereveal ไม่หาย · ตัดออก (by friday, 2026-09-25)
- [markdown-subset-renderer](entities/markdown-subset-renderer.md) — ตัวแปลง Markdown เขียนเอง escape HTML ทุกกรณี callout แบบ GitHub ลิงก์ .md เป็น route · id หัวข้อขึ้นต้น h- กันชนกับ id บท · ย่อหน้าไทยบรรทัดเดียว (by friday, 2026-09-25)
- [lesson-snippet-output-verification](entities/lesson-snippet-output-verification.md) — ตรวจผล console.log // → ของโค้ดในบทเรียน ใน Node 117 ก้อน และ Chrome 18 ก้อน · Intl ไทยของ Node กับ Chrome ตรงกัน · top-level await กับ vm.Script (by friday, 2026-09-25)
- [brain-hub-alignment-audit](entities/brain-hub-alignment-audit.md) — Playwright วัด getBoundingClientRect: container ขอบเดียว · prose ขอบเดียว 23 บท · subgrid การ์ด · control 32/40/48 · line-height หาร 4 · คอนทราสต์ธีมมืดด้วย light-dark() ตรวจได้ (by friday, 2026-09-25)
- [single-column-grid-expands-with-code](entities/single-column-grid-expands-with-code.md) — กริดคอลัมน์เดียวไม่กำหนด columns ขยายตาม pre/ตาราง จนหน้ามือถือกว้าง 580px บนจอ 390px · แก้ด้วย grid-template-columns minmax(0, 1fr) (by friday, 2026-09-25)
- [course-sidebar-rail-collapse](entities/course-sidebar-rail-collapse.md) — เมนูซ้ายหน้าคอร์สหุบเป็นแถบ rail 32px · จุดของบทแบบ stepper ต่อเป็นเส้น · ทุกชิ้นตรงโลโก้ x 68 · คีย์ [ ใช้ event.code BracketLeft (แป้นไทย "บ") · tooltip fixed · localStorage the-brain.sidebar (by friday, 2026-09-26)
- [typescript-lesson-verification](entities/typescript-lesson-verification.md) — ตรวจบท TypeScript ด้วย tsc 7.0.2 (// ❌ 66 จุด) + API TypeScript 6 stableTypeOrdering (// ชนิด: 80 จุด) + รันบน Node 24 (97 ผลลัพธ์) + tsconfig 7 ไฟล์ · verify-ts.mjs (by friday, 2026-09-26)
- [typescript-7-node-24-toolchain-2026](entities/typescript-7-node-24-toolchain-2026.md) — TypeScript 7.0 (8 ก.ค. 2026, Go, ไม่มี API) · TS 6 ค่าเริ่มต้นใหม่ strict/types [] · Node type stripping stable 24.12 · ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX · typescript-eslint ต้องติดตั้ง typescript6 คู่ (by friday, 2026-09-26)
- [check-typescript-syntax-with-node-strip](entities/check-typescript-syntax-with-node-strip.md) — npm run check ตรวจ syntax ของ code fence ts ด้วย module.stripTypeScriptTypes (Node 22.13+) ไม่ต้องลง typescript · Node 20 ข้ามพร้อมคำเตือน · ERR_UNSUPPORTED ไม่นับเป็น error (by friday, 2026-09-26)
