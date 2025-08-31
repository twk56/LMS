# 📚 Laravel LMS Documentation

## 📁 โครงสร้างเอกสาร

### 📖 เอกสารหลัก
- **README.md** - เอกสารหลักของโปรเจค
- **LESSON_FILES_README.md** - คู่มือระบบไฟล์ในบทเรียน

### 🚀 การ Deploy
- **deployment/** - ไฟล์และคู่มือการ deploy
  - `RENDER_DEPLOYMENT.md` - คู่มือการ deploy ไปยัง Render
  - `render.yaml` - Configuration สำหรับ Render
  - `env.production` - Environment variables สำหรับ production

### ⚙️ การตั้งค่า
- **config-files/** - ไฟล์ configuration ต่างๆ
  - `eslint.config.js` - ESLint configuration
  - `tailwind.config.js` - Tailwind CSS configuration
  - `tsconfig.json` - TypeScript configuration
  - `vite.config.ts` - Vite configuration
  - `postcss.config.js` - PostCSS configuration
  - `components.json` - UI components configuration

## 🔧 การใช้งาน

### การ Deploy
```bash
# ดูคู่มือการ deploy
cat deployment/RENDER_DEPLOYMENT.md

# รัน script deploy
./scripts/deployment/deploy-render.sh
```

### การ Development
```bash
# รัน script setup
./scripts/development/dev-setup.sh

# รัน script maintenance
./scripts/maintenance/quick-fix.sh
```

## 📋 โครงสร้างโปรเจค

```
Laravel LMS/
├── app/                    # Laravel application
├── config/                 # Laravel configuration
├── database/               # Database migrations & seeders
├── deployment/             # Deployment files
├── docs/                   # Documentation
├── public/                 # Public assets
├── resources/              # Frontend resources
├── routes/                 # Laravel routes
├── scripts/                # Utility scripts
│   ├── deployment/         # Deployment scripts
│   ├── development/        # Development scripts
│   └── maintenance/        # Maintenance scripts
├── storage/                # Laravel storage
└── tests/                  # Test files
```

## 🎯 วัตถุประสงค์

เอกสารนี้จัดเก็บไว้เพื่อ:
- **ความเข้าใจง่าย** - จัดระเบียบไฟล์ให้หาได้ง่าย
- **การบำรุงรักษา** - แยกประเภทไฟล์ตามการใช้งาน
- **การทำงานเป็นทีม** - ทุกคนเข้าใจโครงสร้างโปรเจค
- **การ Deploy** - มีคู่มือและไฟล์ที่จำเป็นครบถ้วน
