import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Clock, Shield } from 'lucide-react';

interface Conversation {
  id: number;
  name: string;
  email: string;
  role: string;
  latest_message: {
    id: number;
    message: string;
    sender_type: string;
    created_at: string;
  } | null;
  unread_count: number;
  last_message_at: string | null;
}

interface AdminIndexProps {
  conversations: Conversation[];
  admin: {
    id: number;
    name: string;
    role: string;
  };
}

export default function AdminIndex({ conversations, admin }: AdminIndexProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <AppLayout>
      <Head title="จัดการแชท - Admin" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">จัดการแชท</h1>
              <p className="text-gray-600">ตอบกลับข้อความจากผู้ใช้</p>
            </div>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="ml-4">
                {totalUnread} ข้อความใหม่
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>การสนทนา ({conversations.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <input
                      type="text"
                      placeholder="ค้นหาผู้ใช้..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>ไม่มีการสนทนา</p>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <Link
                          key={conversation.id}
                          href={`/simple-chat/admin/conversation/${conversation.id}`}
                          className="block p-4 border-b hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {conversation.name}
                                </h3>
                                {conversation.unread_count > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.email}
                              </p>
                              {conversation.latest_message && (
                                <p className="text-sm text-gray-600 truncate mt-1">
                                  {conversation.latest_message.message}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  {conversation.last_message_at
                                    ? new Date(conversation.last_message_at).toLocaleString('th-TH')
                                    : 'ไม่เคยส่งข้อความ'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>คำแนะนำสำหรับ Admin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">วิธีการใช้งาน</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• คลิกที่การสนทนาเพื่อดูข้อความทั้งหมด</li>
                      <li>• ตอบกลับข้อความได้ทันที</li>
                      <li>• จำนวนข้อความใหม่จะแสดงเป็น Badge สีแดง</li>
                      <li>• ระบบจะอัปเดตข้อความใหม่ทุก 5 วินาที</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">สถิติ</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">การสนทนาทั้งหมด:</span>
                        <span className="font-medium ml-2">{conversations.length}</span>
                      </div>
                      <div>
                        <span className="text-green-700">ข้อความใหม่:</span>
                        <span className="font-medium ml-2">{totalUnread}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
