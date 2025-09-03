import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Plus, 
  Users, 
  Shield, 
  HelpCircle,
  MoreVertical,
  Search,
  Phone,
  Video
} from 'lucide-react';
import Echo from 'laravel-echo';

interface ChatRoom {
  id: number;
  name: string;
  type: string;
  status: string;
  unread_count: number;
  latest_message?: {
    message: string;
    user: {
      id: number;
      name: string;
      role: string;
    };
    created_at: string;
  };
  participants: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  updated_at: string;
}

interface ChatMessage {
  id: number;
  message: string;
  type: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
  created_at: string;
  is_read: boolean;
}

interface User {
  id: number;
  name: string;
  role: string;
}

interface ChatIndexProps {
  chatRooms: ChatRoom[];
  user: User;
}

export default function ChatIndex({ chatRooms, user }: ChatIndexProps) {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const echoRef = useRef<any>(null);

  // Initialize Laravel Echo for real-time updates
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Echo) {
      echoRef.current = window.Echo;
      
      // Listen for new messages in all rooms
      chatRooms.forEach(room => {
        echoRef.current?.channel(`chat-room-${room.id}`)
          .listen('new-message', (e: any) => {
            if (selectedRoom?.id === e.room_id) {
              setMessages(prev => [e.message, ...prev]);
            }
            // Update unread count for other rooms
            // You can implement this logic here
          });
      });
    }

    return () => {
      // Clean up Echo listeners
      if (echoRef.current) {
        chatRooms.forEach(room => {
          echoRef.current?.leaveChannel(`chat-room-${room.id}`);
        });
      }
    };
  }, [chatRooms, selectedRoom]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadMessages = async (roomId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/chat/rooms/${roomId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const response = await fetch(`/chat/rooms/${selectedRoom.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          message: newMessage,
          type: 'text',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Message will be added via Echo event
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getSupportChat = async () => {
    try {
      const response = await fetch('/chat/support');
      const data = await response.json();
      if (data.success) {
        // Find the room in chatRooms or add it
        const existingRoom = chatRooms.find(room => room.id === data.data.id);
        if (existingRoom) {
          setSelectedRoom(existingRoom);
        } else {
          // Add new room to the list
          // You can implement this logic here
        }
      }
    } catch (error) {
      console.error('Failed to get support chat:', error);
    }
  };

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <Head title="Chat - LMS Enterprise" />
      
      <div className="flex h-screen bg-gray-50">
        {/* Chat Rooms Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <Button size="sm" onClick={getSupportChat}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Support
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Chat Rooms List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRoom?.id === room.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/api/avatars/${room.participants[0]?.id}`} />
                      <AvatarFallback>
                        {room.participants[0]?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {room.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(room.updated_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={room.type === 'support' ? 'destructive' : 'secondary'} className="text-xs">
                          {room.type}
                        </Badge>
                        {room.unread_count > 0 && (
                          <Badge variant="default" className="text-xs">
                            {room.unread_count}
                          </Badge>
                        )}
                      </div>
                      
                      {room.latest_message && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          <span className="font-medium">{room.latest_message.user.name}:</span>{' '}
                          {room.latest_message.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/api/avatars/${selectedRoom.participants[0]?.id}`} />
                      <AvatarFallback>
                        {selectedRoom.participants[0]?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedRoom.name}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <Badge variant={selectedRoom.type === 'support' ? 'destructive' : 'secondary'}>
                          {selectedRoom.type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {selectedRoom.participants.length} participants
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading messages...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.user.id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${message.user.id === user.id ? 'order-2' : 'order-1'}`}>
                          {message.user.id !== user.id && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={`/api/avatars/${message.user.id}`} />
                                <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-gray-900">
                                {message.user.name}
                              </span>
                            </div>
                          )}
                          
                          <div
                            className={`p-3 rounded-lg ${
                              message.user.id === user.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <span className={`text-xs mt-1 block ${
                              message.user.id === user.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
                <p className="text-gray-500 mb-4">
                  Choose a conversation from the sidebar to start chatting
                </p>
                <Button onClick={getSupportChat}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Start Support Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
