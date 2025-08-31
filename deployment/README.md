# 🚀 Deployment Directory

## 📁 ไฟล์ในโฟลเดอร์นี้

### 📖 คู่มือการ Deploy
- **RENDER_DEPLOYMENT.md** - คู่มือการ deploy ไปยัง Render แบบละเอียด

### ⚙️ Configuration Files
- **render.yaml** - Configuration สำหรับ Render deployment
- **env.production** - Environment variables สำหรับ production

## 🎯 การใช้งาน

### การ Deploy ไปยัง Render
1. อ่านคู่มือ: `RENDER_DEPLOYMENT.md`
2. ใช้ configuration: `render.yaml`
3. ตั้งค่า environment: `env.production`

### การรัน Script
```bash
# แสดงคำแนะนำการ deploy
./scripts/deployment/deploy-render.sh

# ตรวจสอบ production readiness
./scripts/deployment/verify_prod.sh
```

## 📋 คำอธิบายไฟล์

### RENDER_DEPLOYMENT.md
คู่มือการ deploy แบบละเอียด รวมถึง:
- ขั้นตอนการสร้าง Render account
- การตั้งค่า Web Service
- Environment variables ที่จำเป็น
- การแก้ไขปัญหา
- การ monitor และ troubleshoot

### render.yaml
Configuration สำหรับ Render:
- Build commands
- Start commands
- Environment variables
- Health check settings

### env.production
Environment variables สำหรับ production:
- APP_ENV=production
- APP_DEBUG=false
- Database settings
- Cache settings
- Log settings

## 🔗 ลิงก์ที่เกี่ยวข้อง
- [Render Dashboard](https://dashboard.render.com)
- [Render Documentation](https://render.com/docs)
- [Laravel Deployment Guide](https://laravel.com/docs/deployment)
