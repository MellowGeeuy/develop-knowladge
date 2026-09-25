# The Brain — ศูนย์กลางคลังความรู้การพัฒนาโปรแกรม

โฟลเดอร์นี้คือ **ตัวหลัก (Main)** ของคลังความรู้ `develop-knowladge` ทำหน้าที่สองอย่าง

1. **หน้าเว็บของ The Brain** — หน้า Intro ตอนเข้าเว็บ และหน้า Dashboard ที่มีการ์ดของทุกภาษา กดการ์ดแล้วพาไปยังโฟลเดอร์ของภาษานั้น
2. **แพลตฟอร์มที่ทุกภาษาใช้ร่วมกัน** — design system, ไอคอน, ตัวเล่นบทเรียน, ค้นหา, บันทึกความคืบหน้า, template และเครื่องมือเพิ่มภาษา

โฟลเดอร์ของแต่ละภาษา (เช่น `../java-script/`) จึงมีแค่เนื้อหา ไม่ต้องมี CSS หรือ JavaScript ของตัวเอง

## เปิดเว็บ

ต้องเปิดผ่าน `http://` เพราะหน้าเว็บใช้ ES Modules และโหลดไฟล์บทเรียนด้วย `fetch` ซึ่งใช้กับไฟล์ที่เปิดตรง ๆ (`file://`) ไม่ได้

```bash
cd the-brain-hub
npm start
```

เปิด `http://127.0.0.1:8765/` แล้วกด "เข้าสู่ The Brain" (ไม่ต้องติดตั้งอะไรเพิ่ม มีแค่ Node.js 20 ขึ้นไป)

ทางเลือกอื่นที่ใช้ได้เหมือนกัน ขอแค่เสิร์ฟจาก **โฟลเดอร์ `develop-knowladge`** (โฟลเดอร์แม่ของ the-brain-hub)

```bash
python -m http.server 8765 --directory "C:\Users\loxbit\Desktop\develop-knowladge"
```

| หน้า | URL |
|---|---|
| Intro (หน้าแรกตอนเข้าเว็บ) | `/the-brain-hub/` |
| Dashboard The Brain | `/the-brain-hub/dashboard/` |
| คอร์สของแต่ละภาษา | `/<โฟลเดอร์ภาษา>/` เช่น `/java-script/` |
| บทเรียน | `/java-script/#<id ของบท>` เช่น `/java-script/#scope-and-closures` |

## ใช้งาน

- **ค้นหา** กด `Ctrl+K` หรือ `/` บน Dashboard ค้นได้ข้ามทุกภาษา ในหน้าคอร์สค้นลึกถึงหัวข้อย่อยในบท
- **เปลี่ยนบท** ปุ่มลูกศร `←` `→` บนแป้นพิมพ์
- **ความคืบหน้า** กด "ทำเครื่องหมายว่าอ่านจบแล้ว" ท้ายบท ตัวเลขบน Dashboard อัปเดตตาม
  (เก็บใน `localStorage` ของเบราว์เซอร์นั้นด้วย key `the-brain.progress.v1` ส่วนธีมเก็บที่ `the-brain.theme`)
- **ธีม** ตามระบบปฏิบัติการเป็นค่าเริ่มต้น สลับเองได้ที่ปุ่มมุมขวาบน

## เพิ่มภาษาใหม่

```bash
cd the-brain-hub
npm run new-language -- --id python --name Python --badge PY --folder python --color "#3776AB" --ink "#FFFFFF" --alt "#FFD43B"
```

คำสั่งนี้

1. สร้างโฟลเดอร์ `python/` จาก `templates/` (หน้าเว็บ, `course.json`, `README.md`, บทแรก)
2. เพิ่ม Python ใน `languages.json` สถานะ `planned` การ์ดบน Dashboard จะขึ้น "กำลังจัดทำ"
3. สร้างสีประจำภาษาให้ทันที

จากนั้น

1. เขียนบทใน `python/lessons/` และลงรายการใน `python/course.json`
2. `npm run sync` แล้ว `npm run check` จนขึ้นว่าผ่าน
3. แก้ `status` ของภาษานั้นใน `languages.json` เป็น `"ready"` การ์ดจะกดเข้าเรียนได้

ภาษาที่อยู่ในทะเบียนแล้ว (เช่น TypeScript) สั่งแค่ `npm run new-language -- --id typescript` ก็สร้างโฟลเดอร์ตามข้อมูลเดิม

### สีประจำภาษา

| ช่องใน `languages.json` | ความหมาย |
|---|---|
| `color` | สีหลักของโลโก้ภาษา ใช้ค่าจาก [Simple Icons](https://simpleicons.org/) |
| `colorInk` | สีตัวอักษรบนสีหลัก (`#000000` หรือ `#FFFFFF`) ต้องได้คอนทราสต์อย่างน้อย 4.5:1 |
| `colorAlt` | สีรองของโลโก้ ใช้กับแสงพื้นหลัง ไม่ใส่ก็ได้ ระบบหมุนเฉดจากสีหลักให้ |
| `overrides` | ค่าสีที่ตั้งเองแทนค่าอัตโนมัติ (`strongLight`, `strongDark`, `textLight`, `textDark`) |
| `logo` | ไฟล์ SVG โลโก้ในโฟลเดอร์ภาษา ถ้าไม่ใส่จะใช้ badge ตัวอักษรแบบโลโก้ JS/TS |

`npm run sync` ขยับความสว่างของสีหลัก (บนระบบสี OKLCH ซึ่งคงเฉดเดิมไว้) ให้ตัวชี้ผ่านคอนทราสต์ 3:1 และตัวอักษรผ่าน 4.5:1
ทั้งธีมสว่างและมืด แล้วเขียนลง `assets/css/generated/language-accents.css`

> JavaScript ใช้ `overrides` ในธีมสว่าง เพราะเหลืองที่ถูกทำให้เข้มอัตโนมัติออกเป็นสีเขียวมะกอก จึงเลือกโทนอำพัน
> `#A16207` / `#854D0E` แทน (ยังผ่านเกณฑ์คอนทราสต์เดียวกัน `npm run check` ตรวจให้)

## คำสั่งทั้งหมด

| คำสั่ง | หน้าที่ |
|---|---|
| `npm start` | เปิดเว็บที่ `http://127.0.0.1:8765/` (`npm start -- --port 8766` เปลี่ยนพอร์ต) |
| `npm run new-language -- ...` | สร้างชุดเนื้อหาของภาษาใหม่และลงทะเบียน |
| `npm run sync` | สร้างไฟล์ที่ต้องตรงกับต้นทางใหม่ทั้งหมด: หน้า `index.html` ของทุกภาษา สีประจำภาษา และตารางบทใน README |
| `npm run check` | ตรวจทะเบียน สี `course.json` บทเรียน ลิงก์ระหว่างบท syntax ของโค้ด JavaScript และไฟล์ที่ต้อง sync |

ไฟล์ที่ **ห้ามแก้มือ** เพราะ `sync` จะเขียนทับ: `<ภาษา>/index.html`, `assets/css/generated/language-accents.css`
และตารางใน README ของแต่ละภาษาที่อยู่ระหว่าง `<!-- brain:lessons:start -->` กับ `<!-- brain:lessons:end -->`

## Markdown ที่รองรับในบทเรียน

ตัวแปลงเขียนขึ้นเอง (`assets/js/utils/markdown.js`) และ **escape HTML ดิบทุกกรณี** ไฟล์บทเรียนจึงฝังสคริปต์ลงหน้าเว็บไม่ได้

| เขียน | ได้ |
|---|---|
| `# หัวเรื่อง` บรรทัดแรก | ชื่อบท (ต้องตรงกับ `title` ใน `course.json`) |
| `> ข้อความ` ต่อจากหัวเรื่อง | คำนำใต้ชื่อบท |
| `##` และ `###` | หัวข้อ แสดงใน "ในบทนี้" และค้นหาได้ |
| `**หนา**` `*เอียง*` `` `โค้ด` `` `~~ขีดฆ่า~~` | ตัวหนา ตัวเอียง โค้ดในบรรทัด ขีดฆ่า |
| `[ข้อความ](ไฟล์บทอื่น.md)` | ลิงก์ไปบทนั้นบนเว็บ (บน GitHub ก็ยังใช้ได้) |
| `[ข้อความ](https://...)` | ลิงก์ภายนอก เปิดแท็บใหม่ |
| `-` หรือ `1.` | รายการ ซ้อนได้หนึ่งชั้นด้วยการย่อหน้า 2 ช่อง |
| ```` ```js file=utils/math.js ```` | กล่องโค้ดพร้อมชื่อไฟล์ ภาษาที่ไฮไลต์ได้: `js`, `ts`, `json`, `html`, `css`, `bash`, `powershell`, `text` |
| ```` ```js nocheck ```` | ไม่ให้ `npm run check` ตรวจ syntax (ใช้กับโค้ดที่ตั้งใจให้ผิด) |
| `> [!NOTE]` `[!TIP]` `[!IMPORTANT]` `[!WARNING]` `[!CAUTION]` | กล่อง หมายเหตุ · เคล็ดลับ · สำคัญ · ข้อควรระวัง · อันตราย (แบบเดียวกับ GitHub) |
| ตาราง `\| a \| b \|` | ตาราง จัดกลางหรือขวาด้วย `:---:` `---:` |
| `---` | เส้นคั่น |

ไม่รองรับ: HTML ดิบ, ตัวเอียงด้วย `_ขีดล่าง_`, หัวข้อแบบขีดเส้นใต้ (`===`), รายการซ้อนเกินหนึ่งชั้น
เขียนหนึ่งย่อหน้าเป็นบรรทัดเดียว เพราะการขึ้นบรรทัดใหม่กลางประโยคภาษาไทยจะกลายเป็นช่องว่างบนหน้าเว็บ

## โครงสร้าง

```text
the-brain-hub/
├── index.html                 Intro (หน้ากากตอนเข้าเว็บ)
├── dashboard/index.html       Dashboard The Brain
├── languages.json             ทะเบียนภาษา แหล่งเดียวของการ์ดทุกใบ
├── package.json               ไม่มี dependency มีแค่คำสั่ง npm ของเครื่องมือ
├── templates/                 ต้นแบบของภาษาใหม่ (หน้าเว็บ, course.json, README, บทเรียน)
├── tools/                     serve · new-language · sync · check (+ lib/)
└── assets/
    ├── css/
    │   ├── design-system.css             token + component ที่ใช้ร่วมกันทั้งหมด (ที่เดียว)
    │   ├── generated/language-accents.css สีประจำภาษา (สร้างจาก languages.json)
    │   └── page-specific/                layout เฉพาะหน้า: intro · dashboard · course
    ├── images/                icon-sprite.svg · favicon.svg
    └── js/
        ├── utils/             ของพื้นฐาน ไม่ผูกกับหน้าจอ (markdown, highlight, grammars, search-index, catalog, ...)
        ├── modules/           ฟีเจอร์ของหน้า import จาก utils เท่านั้น
        └── pages/             จุดเริ่มของแต่ละหน้า: intro · dashboard · course
```

- ES Modules ไม่มี bundler พึ่งพาทางเดียว `pages` → `modules` → `utils`
- ลิงก์และ path ทั้งหมดเป็น relative ที่ JavaScript fetch เองผูกกับ `import.meta.url` จึงย้ายขึ้น GitHub Pages ได้โดยไม่ต้องแก้
- ไฮไลต์โค้ดของภาษาใหม่: เพิ่ม grammar ใน `assets/js/utils/grammars.js` แล้วลงชื่อใน `LANGUAGES`

## หน้าตาและ alignment

- ฟอนต์ Bai Jamjuree (หัวเรื่อง) · IBM Plex Sans Thai (เนื้อหา) · JetBrains Mono (โค้ด)
- ระยะทุกค่าเป็นพหุคูณของ 4 · line-height หาร 4 ลงตัว · ความสูง control มีแค่ 32 / 40 / 48px
- ทุก section ในหน้าเดียวกันใช้ `.container` ตัวเดียวกัน ขอบซ้าย-ขวาจึงตรงกันทั้งหน้า
- การ์ดภาษาใช้ CSS subgrid ชื่อ ความคืบหน้า และปุ่มของทุกการ์ดในแถวเดียวกันอยู่ระดับเดียวกัน
- ธีมสว่าง-มืดใช้ `light-dark()` token แต่ละตัวนิยามครั้งเดียว
