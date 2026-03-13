# TUNorth-BRMS (Booking & Resource Management System)

ระบบบริหารจัดการการจองห้องและทรัพยากร (Room and Resource Booking System) ถูกพัฒนาขึ้นเพื่อใช้ในการจัดการการจองพื้นที่ ห้องประชุม และทรัพยากรต่างๆ ภายในองค์กร

## 🚀 ฟีเจอร์หลัก (Key Features)

- **ระบบเข้าสู่ระบบและสมัครสมาชิก** (Authentication): รองรับการเข้าสู่ระบบแบบปลอดภัยด้วย JWT
- **การจัดการการจอง** (Booking Management): ผู้ใช้งานสามารถตรวจสอบและจองห้อง/ทรัพยากรได้ผ่านหน้าต่างปฏิทิน (Calendar View)
- **การจัดการห้องและทรัพยากร** (Resource & Room Management): แอดมินสามารถเพิ่ม ลด แก้ไข ข้อมูลห้องและอุปกรณ์ต่างๆ ได้
- **การจัดการผู้ใช้งาน** (User Management): แอดมินสามารถจัดการสิทธิ์ผู้ใช้งานในระบบ
- **ประวัติและโปรไฟล์** (History & Profile): ผู้ใช้งานทั่วไปสามารถติดตามสถานะการจอง และสถิติการใช้งานของตนเองได้
- **บันทึกกิจกรรม** (Audit Logs): บันทึกการทำรายการต่างๆ ในระบบเพื่อความปลอดภัยและตรวจสอบได้

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### 🖥️ Frontend

- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: Radix UI, Lucide React
- **Calendar**: FullCalendar
- **Charts**: Recharts

### ⚙️ Backend

- **Language**: [Go](https://go.dev/) (1.25+)
- **Framework**: [Fiber](https://gofiber.io/)
- **ORM**: [GORM](https://gorm.io/)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **File Storage**: Cloudinary (สำหรับจัดการรูปภาพ)

---

## 💻 การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 1. การตั้งค่าฐานข้อมูล (Database Setup)

ระบบใช้ **PostgreSQL** เป็นฐานข้อมูลหลัก และมี **pgAdmin** สำหรับการจัดการฐานข้อมูลผ่านหน้าเว็บ (ใช้งานผ่าน Docker)

```bash
cd backend
docker-compose up -d
```

- **PostgreSQL** จะทำงานที่ Port `5433` (อ้างอิงจาก docker-compose.yml)
- **pgAdmin** จะทำงานที่ Port `5050` สามารถเข้าใช้งานได้ที่ `http://localhost:5050`
  - อีเมล: `admin@admin.com`
  - รหัสผ่าน: `root`

### 2. การรัน Backend (Go Fiber)

ต้องตั้งค่า Environment Variables ก่อน (คัดลอก `.env.example` ไปเป็น `.env` ถ้ามี หรือสร้างไฟล์ `.env` ใหม่)

```bash
cd backend

# ดาวน์โหลด Go Modules
go mod tidy

# เริ่มต้นเซิร์ฟเวอร์
go run main.go
```

_Backend จะทำงานที่พอร์ตที่กำหนดใน `.env` (ค่าเริ่มต้นมักจะเป็น `:8080` หรือ `:3000`)_

### 3. การรัน Frontend (Next.js)

แนะนำให้ใช้ `bun` (หรือใช้ `npm`/`yarn` แทนได้)

```bash
cd frontend

# ติดตั้ง Node Modules
bun install

# เริ่มต้นเซิร์ฟเวอร์แบบ Development
bun dev
```

_เข้าไปดูผลลัพธ์ที่ [http://localhost:3000](http://localhost:3000)_

---

## 📂 โครงสร้างโปรเจค (Project Structure)

- `/frontend` - โค้ดสำหรับส่วนหน้าบ้าน (Next.js Application)
- `/backend` - โค้ดสำหรับส่วนหลังบ้านและ API (Go Fiber)

## 🤝 การมีส่วนร่วมพัฒนาระบบ (Contributing)

หากพบปัญหาในการใช้งาน สามารถเปิด Issue หรือส่ง Pull Request นำเสนอส่วนแก้ไขได้ตลอดเวลา!
