# 🔧 Scripts Directory

## 📁 โครงสร้าง Scripts

### 🚀 Deployment Scripts
**โฟลเดอร์:** `scripts/deployment/`
- **deploy-render.sh** - Script สำหรับ deploy ไปยัง Render
- **verify_prod.sh** - Script ตรวจสอบ production readiness

### 💻 Development Scripts
**โฟลเดอร์:** `scripts/development/`
- **dev-setup.sh** - Script setup โปรเจคสำหรับ development

### 🔧 Maintenance Scripts
**โฟลเดอร์:** `scripts/maintenance/`
- **quick-fix.sh** - Script แก้ไขปัญหาทั่วไป

## 🎯 การใช้งาน

### การ Deploy
```bash
# Deploy ไปยัง Render
./scripts/deployment/deploy-render.sh

# ตรวจสอบ production readiness
./scripts/deployment/verify_prod.sh
```

### การ Development
```bash
# Setup โปรเจค
./scripts/development/dev-setup.sh
```

### การ Maintenance
```bash
# แก้ไขปัญหาทั่วไป
./scripts/maintenance/quick-fix.sh
```

## 📋 คำอธิบาย Scripts

### deploy-render.sh
- แสดงคำแนะนำการ deploy ไปยัง Render
- ตรวจสอบไฟล์ configuration
- แสดงขั้นตอนการตั้งค่า

### verify_prod.sh
- ตรวจสอบ production readiness
- ทดสอบการ build
- ตรวจสอบ environment variables
- ทดสอบ health endpoint

### dev-setup.sh
- ติดตั้ง dependencies
- รัน migrations
- สร้าง test user
- ตั้งค่า development environment

### quick-fix.sh
- ล้าง cache
- แก้ไขปัญหา permissions
- รีเซ็ต configuration
