---
name: language-accent-from-logo-color
type: decision
agent: friday
date: 2026-09-25
---

## Triple

[[language-accent-from-logo-color]] --is--> สีของแต่ละภาษามาจาก `color` (สีหลักของโลโก้) ใน languages.json แล้ว sync เลื่อนความสว่างใน OKLCH ให้ตัวชี้ ≥ 3:1 และตัวอักษร ≥ 4.5:1 เทียบพื้นทุกชั้นของทั้งสองธีม ก่อนเขียนลง `generated/language-accents.css`
[[language-accent-from-logo-color]] --source--> Guy 2026-09-25 "สีที่ใช้ให้แต่ละ hub เนี่ย อิงตามสีหลักของ Logo หรือ Icon ภาษาครับ"
[[language-accent-from-logo-color]] --uses--> [[uxui-theory:hsl-scale-uneven-across-hues]] (เหตุผลที่เลื่อนใน OKLCH ไม่ใช่ HSL และ gamut map ด้วยการลด chroma)
[[language-accent-from-logo-color]] --source--> Simple Icons 16.32.0 `https://cdn.jsdelivr.net/npm/simple-icons@latest/data/simple-icons.json` ตรวจ 2026-09-25: JavaScript `#F7DF1E` · TypeScript `#3178C6` · Python `#3776AB` ตรงกับค่าในทะเบียน
[[language-accent-from-logo-color]] --documented-in--> `C:\Users\loxbit\Desktop\develop-knowladge\the-brain-hub\tools\lib\color.mjs` (adjustForContrast) · `tools\lib\generate.mjs` (deriveAccent)
[[language-accent-from-logo-color]] --verified-with--> ค่าอัตโนมัติ 2026-09-25: JS ธีมสว่าง strong `#988800` 3.00:1 · text `#7e7000` 4.54:1 · TS ธีมมืด text `#3c83d1` 4.53:1 · Brain ธีมมืด text `#7b6aff` 4.52:1 · `npm run check` ตรวจทุกคู่ทุกภาษา
[[language-accent-from-logo-color]] --avoid--> ประกาศ token ที่ต่อยอดจาก --accent (soft, glow, border) ไว้ที่ :root อย่างเดียว — var() ใน custom property ถูกแทนค่าตรงที่ประกาศแล้วส่งต่อเป็นค่าตายตัว การ์ดทุกใบจะได้สีม่วงของ hub ต้องประกาศซ้ำใน `:root, [data-language]`
[[language-accent-from-logo-color]] --solves--> การ์ดบน Dashboard และหน้าคอร์สเปลี่ยนสีตามภาษาได้โดยใส่แค่ `data-language` ไม่มี JS คำนวณสีตอนรัน จึงไม่มีจังหวะสีผิดตอนเปิดหน้า

## Note

**เปลี่ยนเมื่อ 2026-09-25: เดิมใช้ค่าอัตโนมัติทุกภาษา → ใหม่ JavaScript ธีมสว่างใช้ overrides
`strongLight #A16207` / `textLight #854D0E`** (เหตุผล: เหลืองที่ลดความสว่างโดยคง hue ออกเป็นเขียวมะกอก
ดูจากภาพหน้าจอแล้วไม่ใช่ "สีของ JS" จึงเลือกอำพันที่ hue ต่ำกว่าเล็กน้อย ยังผ่านเกณฑ์เดียวกัน)

ข้อสังเกต: เฉดเหลืองทุกภาษา (เช่น colorAlt ของ Python) จะเจอปัญหาเดียวกันเมื่อถูกทำให้เข้มในธีมสว่าง
ถ้าเพิ่มภาษาที่สีหลักเป็นเหลืองอีก ให้ตรวจภาพแล้วพิจารณา overrides แบบเดียวกัน

badge ใช้สีโลโก้ตรง ๆ คู่กับ `colorInk` ส่วนข้อความเนื้อหาเป็นสีกลางเสมอ สีภาษาใช้กับตัวชี้และพื้นหลัง
เท่านั้น จึงไม่มีปัญหาอ่านยากแม้สีโลโก้จะอ่อนมาก
