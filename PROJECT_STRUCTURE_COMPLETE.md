# 📁 Laravel LMS - Complete Project Structure

## 🎯 ภาพรวมโปรเจค

**Laravel LMS** เป็นระบบจัดการการเรียนรู้ออนไลน์ที่พัฒนาด้วย Laravel 12 + React + TypeScript + Tailwind CSS

### 📊 สถิติโปรเจค
- **Total Files**: ~500+ files
- **PHP Files**: ~80+ files
- **TypeScript/React Files**: ~120+ files
- **Configuration Files**: ~20+ files
- **Documentation Files**: ~10+ files

---

## 📂 โครงสร้างโฟลเดอร์หลัก

```
Laravel LMS/
├── 📁 app/                          # Laravel Application Core
├── 📁 bootstrap/                    # Application Bootstrap
├── 📁 config/                       # Configuration Files
├── 📁 config-files/                 # Frontend Configuration
├── 📁 database/                     # Database Files
├── 📁 deployment/                   # Deployment Configuration
├── 📁 docs/                         # Documentation
├── 📁 public/                       # Public Assets
├── 📁 resources/                    # Frontend Resources
├── 📁 routes/                       # Route Definitions
├── 📁 scripts/                      # Utility Scripts
├── 📁 storage/                      # Laravel Storage
├── 📁 tests/                        # Test Files
├── 📁 vendor/                       # Composer Dependencies
└── 📄 Configuration Files           # Root Level Configs
```

---

## 🏗️ Laravel Backend Structure

### 📁 app/ (Laravel Application Core)

#### 📁 Console/Commands/ (3 files)
- `CreateAdminCommand.php` - สร้าง admin user
- `ListUsersCommand.php` - แสดงรายการ users
- `ProdReportCommand.php` - รายงาน production

#### 📁 Http/Controllers/ (32 files)

**Main Controllers:**
- `Controller.php` - Base controller
- `DashboardController.php` - หน้าหลัก
- `CourseController.php` - จัดการหลักสูตร
- `LessonController.php` - จัดการบทเรียน
- `QuizController.php` - จัดการแบบทดสอบ
- `CertificateController.php` - จัดการใบรับรอง
- `ChatController.php` - ระบบแชท
- `VideoController.php` - จัดการวิดีโอ

**Analytics Controllers:**
- `AnalyticsController.php` - การวิเคราะห์พื้นฐาน
- `AdvancedAnalyticsController.php` - การวิเคราะห์ขั้นสูง
- `AIMLController.php` - AI/ML features
- `PerformanceController.php` - ตรวจสอบประสิทธิภาพ

**Enterprise Controllers:**
- `EnterpriseController.php` - ฟีเจอร์องค์กร
- `NotificationController.php` - การแจ้งเตือน
- `ExportController.php` - ส่งออกข้อมูล

**API Controllers:**
- `Api/AvatarController.php` - API สำหรับ avatar
- `Api/ImageUploadController.php` - API อัปโหลดรูป
- `Api/SwaggerController.php` - API documentation

**Auth Controllers:**
- `Auth/AuthenticatedSessionController.php` - การล็อกอิน
- `Auth/RegisteredUserController.php` - การสมัครสมาชิก
- `Auth/EmailVerificationController.php` - ยืนยันอีเมล
- `Auth/PasswordResetController.php` - รีเซ็ตรหัสผ่าน

**Settings Controllers:**
- `Settings/ProfileController.php` - จัดการโปรไฟล์
- `Settings/PasswordController.php` - เปลี่ยนรหัสผ่าน
- `Settings/AppearanceController.php` - ตั้งค่าการแสดงผล

#### 📁 Http/Middleware/ (6 files)
- `HandleInertiaRequests.php` - Inertia.js middleware
- `SecurityHeaders.php` - Security headers
- `RateLimit.php` - Rate limiting
- `SentryMiddleware.php` - Error tracking
- `VerifyCsrfToken.php` - CSRF protection
- `HandleAppearance.php` - Appearance settings

#### 📁 Http/Requests/ (7 files)
- `Auth/LoginRequest.php` - Login validation
- `Settings/ProfileUpdateRequest.php` - Profile update validation
- `StoreCategoryRequest.php` - Category creation validation
- `StoreCourseRequest.php` - Course creation validation
- `StoreLessonRequest.php` - Lesson creation validation
- `UpdateCategoryRequest.php` - Category update validation
- `UpdateCourseRequest.php` - Course update validation

#### 📁 Models/ (18 files)
**Core Models:**
- `User.php` - ผู้ใช้
- `Course.php` - หลักสูตร
- `Lesson.php` - บทเรียน
- `CourseCategory.php` - หมวดหมู่หลักสูตร
- `LessonFile.php` - ไฟล์ในบทเรียน
- `LessonProgress.php` - ความก้าวหน้าในการเรียน

**Quiz Models:**
- `Quiz.php` - แบบทดสอบ
- `QuizQuestion.php` - คำถาม
- `QuizAnswer.php` - คำตอบ
- `QuizAttempt.php` - การทำแบบทดสอบ
- `QuizAttemptAnswer.php` - คำตอบที่เลือก

**Certificate Models:**
- `Certificate.php` - ใบรับรอง

**Chat Models:**
- `ChatRoom.php` - ห้องแชท
- `ChatMessage.php` - ข้อความแชท
- `ChatRoomParticipant.php` - ผู้เข้าร่วมแชท
- `MessageReaction.php` - ปฏิกิริยาข้อความ

**Enterprise Models:**
- `Tenant.php` - องค์กร
- `AppearanceSetting.php` - การตั้งค่าการแสดงผล

#### 📁 Policies/ (7 files)
- `CoursePolicy.php` - Authorization สำหรับหลักสูตร
- `LessonPolicy.php` - Authorization สำหรับบทเรียน
- `QuizPolicy.php` - Authorization สำหรับแบบทดสอบ
- `CertificatePolicy.php` - Authorization สำหรับใบรับรอง
- `ChatRoomPolicy.php` - Authorization สำหรับแชท
- `CourseCategoryPolicy.php` - Authorization สำหรับหมวดหมู่
- `LessonFilePolicy.php` - Authorization สำหรับไฟล์บทเรียน

#### 📁 Providers/ (3 files)
- `AppServiceProvider.php` - Application service provider
- `AuthServiceProvider.php` - Authentication service provider
- `SentryServiceProvider.php` - Error tracking service provider

#### 📁 Services/ (9 files)
- `AnalyticsService.php` - บริการการวิเคราะห์
- `AdvancedAnalyticsService.php` - บริการการวิเคราะห์ขั้นสูง
- `AIMLService.php` - บริการ AI/ML
- `NotificationService.php` - บริการการแจ้งเตือน
- `PerformanceService.php` - บริการตรวจสอบประสิทธิภาพ
- `SecurityService.php` - บริการความปลอดภัย
- `TenantService.php` - บริการองค์กร
- `VideoService.php` - บริการวิดีโอ
- `ComplianceService.php` - บริการการปฏิบัติตามกฎระเบียบ

---

## 🎨 Frontend Structure

### 📁 resources/js/ (119 files)

#### 📁 components/ (39 files)
**Main Components:**
- `app-content.tsx` - เนื้อหาหลัก
- `app-header.tsx` - หัวเว็บ
- `app-sidebar.tsx` - แถบเมนูด้านข้าง
- `app-shell.tsx` - โครงสร้างหลัก
- `breadcrumbs.tsx` - เส้นทางนำทาง
- `error-boundary.tsx` - จัดการข้อผิดพลาด

**UI Components (39 files):**
- `ui/button.tsx` - ปุ่ม
- `ui/card.tsx` - การ์ด
- `ui/input.tsx` - ช่องกรอกข้อมูล
- `ui/select.tsx` - รายการเลือก
- `ui/modal.tsx` - หน้าต่างป๊อปอัพ
- `ui/table.tsx` - ตาราง
- `ui/form.tsx` - ฟอร์ม
- `ui/notification.tsx` - การแจ้งเตือน
- และอีก 32 components

#### 📁 pages/ (50+ files)
**Authentication Pages:**
- `auth/login.tsx` - หน้าเข้าสู่ระบบ
- `auth/register.tsx` - หน้าสมัครสมาชิก
- `auth/forgot-password.tsx` - หน้ารีเซ็ตรหัสผ่าน
- `auth/verify-email.tsx` - หน้ายืนยันอีเมล

**Main Pages:**
- `dashboard.tsx` - หน้าหลัก
- `courses/index.tsx` - รายการหลักสูตร
- `courses/create.tsx` - สร้างหลักสูตร
- `courses/edit.tsx` - แก้ไขหลักสูตร
- `courses/show.tsx` - ดูหลักสูตร

**Lesson Pages:**
- `lessons/index.tsx` - รายการบทเรียน
- `lessons/create.tsx` - สร้างบทเรียน
- `lessons/edit.tsx` - แก้ไขบทเรียน
- `lessons/show.tsx` - ดูบทเรียน
- `lessons/files/` - จัดการไฟล์บทเรียน

**Analytics Pages:**
- `analytics/Dashboard.tsx` - หน้าวิเคราะห์
- `analytics/CourseAnalytics.tsx` - วิเคราะห์หลักสูตร
- `analytics/UserProgress.tsx` - ความก้าวหน้าผู้ใช้
- `advanced-analytics/` - การวิเคราะห์ขั้นสูง

**Settings Pages:**
- `settings/profile.tsx` - จัดการโปรไฟล์
- `settings/password.tsx` - เปลี่ยนรหัสผ่าน
- `settings/appearance.tsx` - ตั้งค่าการแสดงผล

**Other Pages:**
- `Chat/Index.tsx` - ระบบแชท
- `notifications/` - การแจ้งเตือน
- `certificates/` - ใบรับรอง
- `enterprise/` - ฟีเจอร์องค์กร

#### 📁 layouts/ (8 files)
- `app-layout.tsx` - Layout หลัก
- `auth-layout.tsx` - Layout สำหรับ authentication
- `app/app-header-layout.tsx` - Layout หัวเว็บ
- `app/app-sidebar-layout.tsx` - Layout แถบเมนู
- `auth/auth-card-layout.tsx` - Layout การ์ด auth
- `settings/layout.tsx` - Layout ตั้งค่า

#### 📁 hooks/ (5 files)
- `use-appearance.tsx` - Hook สำหรับการแสดงผล
- `use-initials.tsx` - Hook สำหรับอักษรย่อ
- `use-mobile-navigation.ts` - Hook สำหรับเมนูมือถือ
- `use-mobile.tsx` - Hook สำหรับมือถือ
- `use-notifications.ts` - Hook สำหรับการแจ้งเตือน

#### 📁 types/ (4 files)
- `dashboard.ts` - Types สำหรับ dashboard
- `global.d.ts` - Global types
- `index.d.ts` - Main types
- `vite-env.d.ts` - Vite environment types

#### 📁 lib/ (1 file)
- `utils.ts` - Utility functions

---

## 🗄️ Database Structure

### 📁 database/migrations/ (30 files)
**Core Tables:**
- `create_users_table.php` - ตารางผู้ใช้
- `create_courses_table.php` - ตารางหลักสูตร
- `create_lessons_table.php` - ตารางบทเรียน
- `create_lesson_progress_table.php` - ตารางความก้าวหน้า
- `create_course_categories_table.php` - ตารางหมวดหมู่

**Quiz Tables:**
- `create_quizzes_table.php` - ตารางแบบทดสอบ
- `create_quiz_questions_table.php` - ตารางคำถาม
- `create_quiz_answers_table.php` - ตารางคำตอบ
- `create_quiz_attempts_table.php` - ตารางการทำแบบทดสอบ

**Certificate Tables:**
- `create_certificates_table.php` - ตารางใบรับรอง

**Chat Tables:**
- `create_chat_rooms_table.php` - ตารางห้องแชท
- `create_chat_messages_table.php` - ตารางข้อความ
- `create_chat_room_participants_table.php` - ตารางผู้เข้าร่วม

**Enterprise Tables:**
- `create_tenants_table.php` - ตารางองค์กร
- `create_appearance_settings_table.php` - ตารางการตั้งค่าการแสดงผล

### 📁 database/seeders/ (6 files)
- `DatabaseSeeder.php` - Main seeder
- `CreateAdminUserSeeder.php` - สร้าง admin user
- `CreateCourseCategoriesSeeder.php` - สร้างหมวดหมู่
- `CustomAdminSeeder.php` - Custom admin seeder
- `LessonFileSeeder.php` - Seeder สำหรับไฟล์บทเรียน
- `TestUserSeeder.php` - สร้าง test users

### 📁 database/factories/ (5 files)
- `UserFactory.php` - Factory สำหรับ User
- `CourseFactory.php` - Factory สำหรับ Course
- `LessonFactory.php` - Factory สำหรับ Lesson
- `CourseCategoryFactory.php` - Factory สำหรับ Category
- `QuizFactory.php` - Factory สำหรับ Quiz

---

## ⚙️ Configuration Files

### 📁 config/ (14 files)
- `app.php` - Application configuration
- `auth.php` - Authentication configuration
- `database.php` - Database configuration
- `mail.php` - Mail configuration
- `queue.php` - Queue configuration
- `session.php` - Session configuration
- `cache.php` - Cache configuration
- `filesystems.php` - File system configuration
- `broadcasting.php` - Broadcasting configuration
- `sanctum.php` - API authentication
- `sentry.php` - Error tracking
- `inertia.php` - Inertia.js configuration
- `l5-swagger.php` - API documentation
- `aws.php` - AWS services

### 📁 config-files/ (7 files)
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - UI components configuration

---

## 🚀 Deployment & Scripts

### 📁 deployment/ (4 files)
- `RENDER_DEPLOYMENT.md` - คู่มือ deploy ไปยัง Render
- `render.yaml` - Render configuration
- `env.production` - Production environment variables
- `README.md` - Deployment documentation

### 📁 scripts/ (7 files)
**Deployment Scripts:**
- `deployment/deploy-render.sh` - Script deploy ไปยัง Render
- `deployment/verify_prod.sh` - ตรวจสอบ production
- `deployment/test-production.sh` - ทดสอบ production

**Development Scripts:**
- `development/dev-setup.sh` - Setup โปรเจค

**Maintenance Scripts:**
- `maintenance/quick-fix.sh` - แก้ไขปัญหาด่วน
- `shell-fix.sh` - แก้ไขปัญหา shell

---

## 📚 Documentation

### 📁 docs/ (5 files)
- `README.md` - เอกสารหลัก
- `CHAT_SETUP.md` - คู่มือตั้งค่าระบบแชท
- `ENTERPRISE_FEATURES.md` - ฟีเจอร์องค์กร
- `ENTERPRISE_SETUP.md` - คู่มือตั้งค่าองค์กร
- `LESSON_FILES_README.md` - คู่มือระบบไฟล์บทเรียน

### 📄 Root Documentation Files
- `README.md` - เอกสารหลักของโปรเจค
- `PROJECT_STRUCTURE.md` - โครงสร้างโปรเจค
- `CODE_ORGANIZATION.md` - การจัดระเบียบโค้ด
- `RENDER_DEPLOYMENT.md` - คู่มือ deployment

---

## 🧪 Testing

### 📁 tests/ (16 files)
**Feature Tests (14 files):**
- `Feature/AuthenticationTest.php` - ทดสอบการ authentication
- `Feature/CourseTest.php` - ทดสอบหลักสูตร
- `Feature/LessonTest.php` - ทดสอบบทเรียน
- `Feature/QuizTest.php` - ทดสอบแบบทดสอบ
- `Feature/SecurityTest.php` - ทดสอบความปลอดภัย
- `Feature/DashboardTest.php` - ทดสอบหน้าหลัก

**Unit Tests (1 file):**
- `Unit/ExampleTest.php` - ตัวอย่าง unit test

**Test Configuration:**
- `TestCase.php` - Base test case
- `Pest.php` - Pest testing configuration

---

## 📦 Dependencies

### 📄 composer.json
**PHP Dependencies:**
- Laravel Framework 12.0
- Inertia.js Laravel
- Laravel Sanctum
- AWS SDK
- Pusher
- Sentry
- Swagger/OpenAPI
- PHPOffice Spreadsheet

### 📄 package.json
**Frontend Dependencies:**
- React 18.2.0
- TypeScript 5.2.2
- Tailwind CSS 3.4.17
- Radix UI Components
- Lucide React Icons
- Vite 5.1.4
- Inertia.js React

---

## 🎯 สรุป

### ✅ **จุดแข็ง**
1. **โครงสร้างชัดเจน** - แยกประเภทไฟล์ตามหน้าที่
2. **Modern Stack** - Laravel 12 + React + TypeScript
3. **Comprehensive Features** - ครบทุกฟีเจอร์ที่จำเป็น
4. **Good Documentation** - มีเอกสารครบถ้วน
5. **Testing Ready** - มี test structure พร้อมใช้งาน
6. **Deployment Ready** - มี scripts และ config สำหรับ deploy

### 📊 **สถิติไฟล์**
- **Total Files**: ~500+ files
- **Backend (PHP)**: ~80+ files
- **Frontend (TSX/TS)**: ~120+ files
- **Configuration**: ~20+ files
- **Documentation**: ~10+ files
- **Tests**: ~16+ files

### 🚀 **การใช้งาน**
```bash
# Development
make dev

# Testing
make test

# Deployment
./scripts/deployment/deploy-render.sh
```

---

**🎉 Laravel LMS เป็นโปรเจคที่มีโครงสร้างดี มีฟีเจอร์ครบถ้วน และพร้อมใช้งานจริง!**
