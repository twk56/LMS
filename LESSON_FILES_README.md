# ระบบไฟล์ในบทเรียน (Lesson Files System)

## ภาพรวม
ระบบไฟล์ในบทเรียนช่วยให้ผู้สอนสามารถอัปโหลดและจัดการไฟล์ต่างๆ ที่เกี่ยวข้องกับบทเรียน เช่น เอกสาร PDF, รูปภาพ, วิดีโอ และไฟล์อื่นๆ

## ฟีเจอร์หลัก

### 1. การอัปโหลดไฟล์
- รองรับไฟล์หลายประเภท: PDF, รูปภาพ, วิดีโอ, เอกสาร
- ขนาดไฟล์สูงสุด: 10MB
- สามารถกำหนดชื่อไฟล์และคำอธิบายได้
- จัดลำดับการแสดงผล

### 2. การจัดการไฟล์
- ดูรายการไฟล์ทั้งหมดในบทเรียน
- แก้ไขข้อมูลไฟล์ (ชื่อ, คำอธิบาย, ลำดับ, สถานะ)
- ลบไฟล์ที่ไม่ต้องการ
- ดาวน์โหลดไฟล์

### 3. การแสดงผล
- แสดงตัวอย่างรูปภาพและวิดีโอ
- แสดง PDF ใน iframe
- แสดงข้อมูลไฟล์ (ขนาด, ประเภท, วันที่)

## โครงสร้างไฟล์

### Backend
- `app/Models/LessonFile.php` - Model สำหรับไฟล์
- `app/Http/Controllers/LessonFileController.php` - Controller จัดการไฟล์
- `app/Policies/LessonFilePolicy.php` - Policy สำหรับการอนุญาต
- `database/migrations/2025_08_16_072446_create_lesson_files_table.php` - Migration

### Frontend
- `resources/js/pages/lessons/files/index.tsx` - หน้าแสดงรายการไฟล์
- `resources/js/pages/lessons/files/create.tsx` - หน้าอัปโหลดไฟล์
- `resources/js/pages/lessons/files/show.tsx` - หน้าแสดงรายละเอียดไฟล์
- `resources/js/pages/lessons/files/edit.tsx` - หน้าแก้ไขไฟล์

## การใช้งาน

### สำหรับผู้สอน (Admin)
1. เข้าไปที่บทเรียนที่ต้องการ
2. คลิก "ไฟล์" ในเมนู
3. คลิก "อัปโหลดไฟล์" เพื่อเพิ่มไฟล์ใหม่
4. จัดการไฟล์ที่มีอยู่ (แก้ไข, ลบ, จัดลำดับ)

### สำหรับผู้เรียน (Student)
1. เข้าไปที่บทเรียนที่ลงทะเบียนแล้ว
2. คลิก "ไฟล์" เพื่อดูไฟล์ที่เกี่ยวข้อง
3. ดาวน์โหลดไฟล์ที่ต้องการ
4. ดูตัวอย่างไฟล์ (รูปภาพ, วิดีโอ, PDF)

## Routes

```php
// Lesson File routes
Route::resource('courses.lessons.files', LessonFileController::class);
Route::get('courses/{course}/lessons/{lesson}/files/{file}/download', [LessonFileController::class, 'download']);
```

## การตั้งค่า

### 1. Storage
ไฟล์จะถูกเก็บใน `storage/app/public/lesson-files/{lesson_id}/`

### 2. File Types ที่รองรับ
- **Image**: jpg, jpeg, png, gif, webp
- **Video**: mp4, avi, mov, wmv
- **PDF**: pdf
- **Documents**: doc, docx, txt, rtf

### 3. ขนาดไฟล์
- ขนาดสูงสุด: 10MB ต่อไฟล์
- สามารถปรับได้ใน `LessonFileController.php`

## การแก้ไขปัญหา

### 1. หน้าเปล่า
- ตรวจสอบว่า route ถูกต้อง
- ตรวจสอบว่า Inertia render path ตรงกับโครงสร้างไฟล์
- ตรวจสอบ console errors

### 2. ไม่สามารถอัปโหลดไฟล์
- ตรวจสอบสิทธิ์การเขียนใน storage
- ตรวจสอบขนาดไฟล์
- ตรวจสอบประเภทไฟล์ที่อนุญาต

### 3. ไม่สามารถดาวน์โหลดไฟล์
- ตรวจสอบว่าไฟล์มีอยู่ใน storage
- ตรวจสอบสิทธิ์การเข้าถึง
- ตรวจสอบ route download

## การทดสอบ

### 1. รัน Migration
```bash
php artisan migrate
```

### 2. รัน Seeder (ถ้ามี)
```bash
php artisan db:seed --class=LessonFileSeeder
```

### 3. สร้าง Symbolic Link
```bash
php artisan storage:link
```

## การปรับแต่ง

### 1. เพิ่มประเภทไฟล์ใหม่
แก้ไขใน `LessonFileController.php` ใน method `getFileType()`

### 2. เปลี่ยนขนาดไฟล์สูงสุด
แก้ไขใน validation rules ของ method `store()`

### 3. เพิ่มฟีเจอร์ใหม่
- เพิ่ม method ใหม่ใน Controller
- เพิ่ม route ใหม่
- สร้างหน้า frontend ที่เกี่ยวข้อง

## หมายเหตุ
- ระบบนี้ใช้ Inertia.js สำหรับ frontend
- ใช้ Laravel Storage สำหรับจัดการไฟล์
- มีระบบ Policy สำหรับการควบคุมสิทธิ์
- รองรับการแสดงผลไฟล์หลายประเภท
