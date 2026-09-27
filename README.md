# Tactical Industrial HUD Portfolio — นายธนภัทร อินทร์ชูวงศ์ (โอ)
### นักศึกษาหลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.) สาขาครุศาสตร์อุตสาหกรรมไฟฟ้า
### คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น (ไทย-เยอรมัน)
**รหัสนักศึกษา:** `68322110081-8`

---

## ⚡ ภาพรวมการออกแบบ (Design & Architecture)

เว็บไซต์ Portfolio นี้ได้รับการออกแบบโดยอ้างอิงจากต้นแบบ **Tactical Instrumentation / Viewfinder Dashboard HUD (Heads-Up Display)** ในโทนสีอุ่น (**Warm Terracotta / Brick Red / Tactical Amber**) เพื่อสะท้อนความเป็นนักศึกษาและครูช่างสาขาวิศวกรรมไฟฟ้า การควบคุมอัตโนมัติในงานอุตสาหกรรม (PLC/SCADA) และการจัดการเรียนรู้สายอาชีวศึกษา

### จุดเด่นของระบบ
1. **สถาปัตยกรรมแบบ Zero-Dependency**: ใช้งานได้ทันทีโดยไม่ต้องลง Node.js หรือคอมไพล์โค้ด สามารถเปิดไฟล์ `index.html` บนเบราว์เซอร์ได้ทันที
2. **ระบบจัดการเนื้อหาในตัว (Built-in In-Browser CMS)**: ไม่จำเป็นต้องเขียนโค้ดเพื่อแก้ไขข้อมูล สามารถคลิกแก้ไขข้อความ เพิ่ม/ลบรายวิชาและกิจกรรมได้สดๆ บนหน้าเว็บ
3. **ระบบล็อกอินความปลอดภัยแบบซ่อน (Secret Access)**:
   - **คีย์ลัดเรียกหน้าต่างล็อกอิน:** กด <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>P</kbd> บนคีย์บอร์ด (หรือคลิกไอคอนแม่กุญแจมุมขวาบน)
   - **ชื่อผู้ใช้งาน (Username):** `O’Coner`
   - **รหัสผ่าน (Password):** `thanapat4444`
4. **โหมดสลับธีม มืด / สว่าง (Dark & Light Tactical Mode)**:
   - **Tactical Dark Chassis:** พื้นหลังสีดำออบซิเดียนเงียบสงบ ตัดด้วยเส้น Reticle สีส้มอิฐและเหลืองอำพัน
   - **Warm Architectural Ivory:** พื้นหลังโทนสว่างสีผืนผ้าใบอุ่น ตัดด้วยสีแดงอิฐเข้ม
5. **วิดเจ็ตความสามารถพิเศษด้านดนตรี (Guitar & Bass Synthesizer)**:
   - มีชุดจำลองสายกีต้าร์และเบสที่สร้างเสียงสังเคราะห์สดผ่าน **Web Audio API** พร้อมกราฟคลื่นเสียง Realtime Oscilloscope
6. **คลังจัดเก็บไฟล์ทุกประเภท (Universal Asset Storage with IndexedDB)**:
   - รองรับการอัปโหลดไฟล์วิดีโอ (MP4, WebM), ไฟล์เสียง (MP3, WAV), รูปภาพ (PNG, JPG), ฟอนต์ (TTF, WOFF2) และเอกสาร PDF โดยจัดเก็บไว้ในฐานข้อมูล IndexedDB ในเครื่อง ไม่จำกัดขนาด
7. **เชื่อมต่อคลาวด์ Supabase & Vercel พร้อมใช้งาน**:
   - สามารถระบุ Supabase Project URL และ Anon Key เพื่อซิงค์ข้อมูลขึ้น Cloud Database แบบ Realtime
   - มีไฟล์ `vercel.json` และโครงสร้างพร้อม Deploy ขึ้น Vercel และ GitHub Pages ในคลิกเดียว

---

## 🛠️ โครงสร้างไฟล์ในโครงการ

```
portfolio/
├── index.html              # โครงสร้างหน้าเว็บหลักและส่วนประกอบ HUD
├── styles.css              # ระบบดีไซน์โทนสีอุ่น Reticle และ Responsive
├── app.js                  # ระบบการทำงานหลัก, CMS, Web Audio, ล็อกอินซ่อน
├── data.js                 # ข้อมูลเริ่มต้นของคุณธนภัทร (ประวัติ, การศึกษา, รายวิชา)
├── db.js                   # ระบบ IndexedDB จัดเก็บไฟล์สื่อและเอกสารในเครื่อง
├── supabase-schema.sql     # คำสั่ง SQL สำหรับสร้างตารางบน Supabase Cloud
├── vercel.json             # การตั้งค่าการ Deploy บน Vercel
└── README.md               # เอกสารแนะนำการใช้งาน
```

---

## 🚀 ขั้นตอนการนำขึ้น Vercel

### วิธีที่ 1: คลิก Deploy อัตโนมัติในคลิกเดียว (1-Click Deploy)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthanapatinchuwong2547-ops%2Fportfolio-THANAPHAT)

หรือคลิกลิงก์ตรง: [👉 นำเข้าโครงการสู่ Vercel Dashboard ทันที](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthanapatinchuwong2547-ops%2Fportfolio-THANAPHAT)

### วิธีที่ 2: นำเข้าผ่าน Vercel Dashboard
1. เข้าเว็บไซต์ [Vercel Dashboard](https://vercel.com/new) และล็อกอินด้วยบัญชี GitHub
2. ภายใต้หัวข้อ **"Import Git Repository"** เลือกคลังโค้ด `portfolio-THANAPHAT` แล้วกด **"Import"**
3. ไม่ต้องตั้งค่าเพิ่มเติม (Zero Configuration) กดปุ่ม **"Deploy"**
4. Vercel จะตรวจจับและ Build เว็บไซต์ให้ทันที พร้อมมอบโดเมน `.vercel.app` ความเร็วสูงระดับ Edge ทั่วโลก

---

## 🗄️ การเปิดใช้งาน Supabase Cloud (Cloud Database & Media Storage)

1. เข้าไปที่ [Supabase Dashboard](https://supabase.com/dashboard) แล้วกด **New Project**
2. ไปที่เมนู **SQL Editor** แล้วคัดลอกคำสั่งทั้งหมดจากไฟล์ `supabase-schema.sql` ไปวางแล้วกด **Run**
3. ไปที่เมนู **Project Settings** -> **API** เพื่อคัดลอก:
   - **Project URL** (เช่น `https://xyzcompany.supabase.co`)
   - **anon public Key** (โทเคนสาธารณะ)
4. เปิดหน้าเว็บ Portfolio -> กดคีย์ลัด <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>P</kbd>
   - Username: `O’Coner`
   - Password: `thanapat4444`
5. กดปุ่ม **"Supabase Cloud"** บนแถบผู้ดูแลด้านล่าง -> วางค่า URL และ Anon Key -> กด **"ทดสอบและเชื่อมต่อ"** -> กด **"อัปโหลดข้อมูลขึ้น Supabase"**
6. ข้อมูลทั้งหมดจะถูกจัดเก็บบน Cloud Database และซิงค์สดแบบ Realtime ไม่ว่าเปิดจาก Vercel, มือถือ หรือคอมพิวเตอร์เครื่องใดก็ตาม