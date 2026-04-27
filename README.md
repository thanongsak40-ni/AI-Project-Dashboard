# AI Project Dashboard

Dashboard สำหรับติดตามระบบ AI ออกใบแจ้งหนี้อัตโนมัติ (ค่าไฟฟ้า / ค่าน้ำ / ค่าส่วนกลาง) ของโครงการในเครือเสนา

## Stack
- **Frontend:** React 19 + Vite + Tailwind v4 + Recharts
- **Backend:** Express + node-postgres
- **Database:** Supabase (PostgreSQL)

## Setup

```bash
cd ai-dashboard
cp .env.example .env       # กรอก DATABASE_URL
npm install
npm run db:migrate         # สร้าง schema
npm run db:import          # นำเข้าข้อมูลจาก Excel
```

## Development

```bash
npm run server   # API :3001
npm run dev      # Vite :5173 (proxies /api → :3001)
```

## Production

```bash
npm run build && npm start
# หรือใช้ Docker:
docker build -t ai-dashboard ./ai-dashboard
docker run -p 3001:3001 --env-file ai-dashboard/.env ai-dashboard
```

ดูรายละเอียดเพิ่มเติมที่ [ai-dashboard/](ai-dashboard/)
