# 💬 Chat System Setup Guide

## 📋 Overview

ระบบแชทที่ให้ student สามารถติดต่อผู้ดูแลหรือ teacher ได้แบบ real-time พร้อมฟีเจอร์:

- **Real-time Messaging** - ใช้ Pusher สำหรับ instant updates
- **Support Chat** - Student สามารถติดต่อ admin ได้ทันที
- **Private/Group Chats** - รองรับการแชทแบบส่วนตัวและกลุ่ม
- **File Sharing** - ส่งรูปภาพและไฟล์ได้
- **Read Receipts** - แสดงสถานะการอ่านข้อความ
- **Search & Filter** - ค้นหาบทสนทนาได้ง่าย

## 🔧 Prerequisites

- PHP 8.2+
- Laravel 12+
- MySQL 8.0+
- Pusher Account (สำหรับ real-time)
- Node.js & NPM

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
# Backend dependencies
composer require pusher/pusher-php-server

# Frontend dependencies
npm install laravel-echo pusher-js
```

### 2. Environment Configuration

เพิ่มในไฟล์ `.env`:

```bash
# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

# Broadcasting Configuration
BROADCAST_DRIVER=pusher
```

### 3. Run Migrations

```bash
php artisan migrate
```

### 4. Configure Broadcasting

แก้ไขไฟล์ `config/broadcasting.php`:

```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'useTLS' => true,
    ],
],
```

### 5. Frontend Echo Configuration

แก้ไขไฟล์ `resources/js/bootstrap.js`:

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
});
```

## 📱 Features

### 1. Support Chat

Student สามารถเริ่ม support chat ได้ทันที:

```javascript
// เริ่ม support chat
const response = await fetch('/chat/support');
const data = await response.json();

if (data.success) {
    // Redirect to chat room
    window.location.href = `/chat?room=${data.data.id}`;
}
```

### 2. Real-time Messaging

ข้อความจะปรากฏทันทีผ่าน Pusher:

```javascript
// ฟังข้อความใหม่
Echo.channel(`chat-room-${roomId}`)
    .listen('new-message', (e) => {
        // เพิ่มข้อความใหม่ใน UI
        addMessage(e.message);
    });
```

### 3. File Sharing

รองรับการส่งไฟล์หลายประเภท:

```javascript
// ส่งไฟล์
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('type', 'file');

await fetch(`/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    body: formData,
});
```

## 🔐 Security Features

### 1. Authorization Policies

ใช้ Laravel Policies สำหรับการควบคุมสิทธิ์:

```php
// ChatRoomPolicy
public function view(User $user, ChatRoom $chatRoom): bool
{
    return $chatRoom->participants()->where('user_id', $user->id)->exists();
}

public function sendMessage(User $user, ChatRoom $chatRoom): bool
{
    $participant = $chatRoom->participants()
        ->where('user_id', $user->id)
        ->where('is_active', true)
        ->first();

    return $participant !== null;
}
```

### 2. Input Validation

ตรวจสอบข้อมูลก่อนบันทึก:

```php
$request->validate([
    'message' => 'required|string|max:1000',
    'type' => 'sometimes|string|in:text,image,file,system',
    'file' => 'sometimes|file|max:10240', // 10MB max
]);
```

### 3. CSRF Protection

Laravel CSRF protection อัตโนมัติ:

```javascript
headers: {
    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')
        .getAttribute('content'),
}
```

## 📊 Database Schema

### Chat Rooms Table
```sql
CREATE TABLE chat_rooms (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NULL,
    type ENUM('private', 'group', 'support') DEFAULT 'private',
    status ENUM('active', 'archived', 'blocked') DEFAULT 'active',
    metadata JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    chat_room_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    metadata JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_room_created (chat_room_id, created_at),
    INDEX idx_user_created (user_id, created_at)
);
```

### Chat Room Participants Table
```sql
CREATE TABLE chat_room_participants (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    chat_room_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role ENUM('participant', 'admin', 'moderator') DEFAULT 'participant',
    is_active BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMP NULL,
    joined_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_room_user (chat_room_id, user_id),
    INDEX idx_user_active (user_id, is_active)
);
```

## 🧪 Testing

### 1. Test Support Chat

```bash
# สร้าง support chat
curl -X GET http://localhost:8000/chat/support \
  -H "Authorization: Bearer your-token"
```

### 2. Test Message Sending

```bash
# ส่งข้อความ
curl -X POST http://localhost:8000/chat/rooms/1/messages \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, I need help!"}'
```

### 3. Test Real-time Updates

```javascript
// เปิด browser console และฟังข้อความ
Echo.channel('chat-room-1')
    .listen('new-message', (e) => {
        console.log('New message:', e.message);
    });
```

## 🔍 Troubleshooting

### Common Issues

1. **Pusher Connection Failed**
   - ตรวจสอบ PUSHER_APP_KEY, PUSHER_APP_SECRET
   - ตรวจสอบ network connectivity
   - ตรวจสอบ cluster configuration

2. **Messages Not Appearing Real-time**
   - ตรวจสอบ Echo configuration
   - ตรวจสอบ Pusher webhook
   - ตรวจสอบ browser console errors

3. **File Upload Fails**
   - ตรวจสอบ file size limits
   - ตรวจสอบ storage permissions
   - ตรวจสอบ file type validation

4. **Authorization Errors**
   - ตรวจสอบ user authentication
   - ตรวจสอบ chat room policies
   - ตรวจสอบ participant relationships

### Debug Commands

```bash
# ตรวจสอบ broadcasting configuration
php artisan config:show broadcasting

# ตรวจสอบ Pusher connection
php artisan tinker
config('broadcasting.connections.pusher')

# Clear caches
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

## 📈 Performance Optimization

### 1. Database Indexing

```sql
-- เพิ่ม indexes สำหรับ performance
CREATE INDEX idx_messages_room_user ON chat_messages(chat_room_id, user_id, created_at);
CREATE INDEX idx_participants_active ON chat_room_participants(user_id, is_active, last_seen_at);
```

### 2. Message Pagination

```php
// ใช้ pagination สำหรับข้อความเก่า
$messages = $room->messages()
    ->with('user:id,name,role')
    ->orderBy('created_at', 'desc')
    ->paginate(50);
```

### 3. Real-time Optimization

```javascript
// ใช้ throttling สำหรับ frequent updates
let updateTimeout;
const throttledUpdate = (callback) => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(callback, 100);
};
```

## 🔒 Privacy & Compliance

### 1. Data Retention

```php
// ลบข้อความเก่าอัตโนมัติ
$olderMessages = ChatMessage::where('created_at', '<', now()->subMonths(6))->delete();
```

### 2. User Privacy

```php
// ไม่แสดงข้อมูลส่วนตัวใน logs
Log::info('Chat message sent', [
    'room_id' => $roomId,
    'user_id' => '***',
    'message_length' => strlen($message),
]);
```

### 3. GDPR Compliance

```php
// Export user data
public function exportUserData(User $user): array
{
    return [
        'messages' => $user->chatMessages()->get(),
        'chat_rooms' => $user->chatRooms()->get(),
    ];
}
```

## 📚 Additional Resources

- [Laravel Broadcasting Documentation](https://laravel.com/docs/broadcasting)
- [Pusher Documentation](https://pusher.com/docs)
- [Laravel Echo Documentation](https://laravel.com/docs/echo)
- [Real-time Chat Best Practices](https://pusher.com/tutorials/real-time-chat)

---

**Status**: ✅ Implementation Complete  
**Last Updated**: 2024-09-02  
**Version**: 1.0.0  
**Maintainer**: Development Team
