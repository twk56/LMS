# ⚙️ Configuration Files Directory

## 📁 ไฟล์ในโฟลเดอร์นี้

### 🎨 Frontend Configuration
- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.js** - PostCSS configuration
- **components.json** - UI components configuration

### 🔧 Development Tools
- **eslint.config.js** - ESLint configuration
- **tsconfig.json** - TypeScript configuration
- **vite.config.ts** - Vite build tool configuration

## 🎯 การใช้งาน

### การแก้ไข Configuration
```bash
# แก้ไข Tailwind CSS
nano config-files/tailwind.config.js

# แก้ไข TypeScript
nano config-files/tsconfig.json

# แก้ไข Vite
nano config-files/vite.config.ts
```

### การ Copy ไฟล์กลับไปยัง root
```bash
# Copy ไฟล์กลับไปยัง root directory
cp config-files/* ./
```

## 📋 คำอธิบายไฟล์

### tailwind.config.js
- การตั้งค่า Tailwind CSS
- Custom colors และ themes
- Responsive breakpoints
- Custom utilities

### tsconfig.json
- TypeScript compiler options
- Path mapping
- Module resolution
- Strict mode settings

### vite.config.ts
- Vite build configuration
- Plugin settings
- Build optimization
- Development server settings

### eslint.config.js
- ESLint rules
- Code formatting
- TypeScript integration
- React specific rules

### postcss.config.js
- PostCSS plugins
- Autoprefixer settings
- CSS processing

### components.json
- UI components configuration
- Theme settings
- Component variants

## 🔧 การแก้ไขปัญหา

### TypeScript Errors
```bash
# ตรวจสอบ TypeScript
npx tsc --noEmit

# แก้ไข configuration
nano config-files/tsconfig.json
```

### Build Issues
```bash
# ตรวจสอบ Vite configuration
nano config-files/vite.config.ts

# รัน build
npm run build
```

### Styling Issues
```bash
# ตรวจสอบ Tailwind configuration
nano config-files/tailwind.config.js

# รีเซ็ต CSS
npm run dev
```
