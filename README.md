# AI Project Dashboard

Dashboard สำหรับติดตามระบบ AI ออกใบแจ้งหนี้อัตโนมัติ (ค่าไฟฟ้า / ค่าน้ำ / ค่าส่วนกลาง)

## Structure

```
.
├── frontend/   # React 19 + Vite + Tailwind v4 + Recharts
├── backend/    # Express + node-postgres (Supabase)
└── docker-compose.yml
```

## Local development

```bash
# Backend
cd backend
cp .env.example .env       # กรอก DATABASE_URL
npm install
npm run db:migrate         # ครั้งแรกเท่านั้น
EXCEL_PATH=./data.xlsx npm run db:import   # ครั้งแรกเท่านั้น
npm run dev                # API :3001

# Frontend (อีก terminal)
cd frontend
npm install
npm run dev                # Vite :5173 (proxies /api → :3001)
```

## Deploy

### แยก service (recommended)
- **Frontend** → Vercel / Netlify / Cloudflare Pages (build: `npm run build`, output: `dist/`)
  - ตั้ง env `VITE_API_BASE=https://your-backend-url`
- **Backend** → Railway / Render / Fly.io
  - ตั้ง env `DATABASE_URL`, `CORS_ORIGIN=https://your-frontend-url`

### Docker (single host)
```bash
docker compose up -d --build
# frontend: http://localhost:8080
# backend:  http://localhost:3001
```
