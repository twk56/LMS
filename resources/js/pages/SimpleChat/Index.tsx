import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, User, Shield } from 'lucide-react';

interface ChatMessage {
  id: number;
  message: string;
  sender_type: 'user' | 'admin';
  sender: {
    id: number;
    name: string;
    role: string;
  };
  is_read: boolean;
  created_at: string;
}

interface SimpleChatIndexProps {
  messages: ChatMessage[];
  unreadCount: number;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

export default function SimpleChatIndex({ messages: initialMessages, unreadCount, user }: SimpleChatIndexProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { post, processing } = useForm({
    message: '',
  });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/simple-chat/messages');
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || processing) return;

    setIsLoading(true);
    
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!csrfToken) {
        console.error('CSRF token not found');
        return;
      }

      const response = await fetch('/simple-chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, data.data]);
          setNewMessage('');
        }
      } else {
        console.error('Failed to send message:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!csrfToken) {
        console.error('CSRF token not found');
        return;
      }

      const response = await fetch('/simple-chat/mark-read', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to mark as read:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark messages as read when component mounts
  useEffect(() => {
    markAsRead();
  }, []);

  return (
    <AppLayout>
      <Head title="แชทกับ Admin" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">แชทกับ Admin</h1>
              <p className="text-gray-600">ติดต่อสอบถามหรือขอความช่วยเหลือ</p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                {unreadCount}
              </div>
            )}
          </div>

          <Card className="h-[600px] flex flex-col">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Admin Support</span>
                <span className="text-sm text-gray-500 ml-auto">
                  {messages.length} ข้อความ
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>ยังไม่มีข้อความ</p>
                    <p className="text-sm">เริ่มต้นการสนทนากับ Admin</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender_type === 'admin' ? (
                            <Shield className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender_type === 'admin' ? 'Admin' : (message.sender?.name || 'Unknown')}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1"
                    disabled={processing || isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || processing || isLoading}
                    className="px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
