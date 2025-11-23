import { useState, useRef, useEffect } from 'react';
import {
  Plus, Search, Send, Paperclip, Image as ImageIcon, Video, FileText,
  Users, Settings, MoreHorizontal, Phone, VideoIcon, Info, Smile,
  X, Edit, UserPlus, UserMinus, Crown, Shield, Trash2, Download,
  MessageCircle, Hash, Lock, Globe, Camera, Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAppContext, type Message, type ChatGroup, type User } from '@/app/context/AppContext';

interface ChatParticipant extends User {
  lastSeen?: string;
  isOnline?: boolean;
  role?: 'admin' | 'member' | 'owner';
}

interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: number;
  url: string;
  uploadedAt: string;
}

interface ExtendedMessage extends Message {
  replyTo?: string;
  isEdited?: boolean;
  editedAt?: string;
  reactions?: { emoji: string; users: string[] }[];
  attachments?: FileAttachment[];
}

export default function MessagingCenter() {
  const context = useAppContext();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPrivateGroup, setIsPrivateGroup] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  const [chats] = useState<ChatGroup[]>([
    {
      id: 'chat1',
      name: 'Beginner Wheel Throwing',
      type: 'class',
      members: ['user1', 'instructor1', 'student1', 'student2'],
      adminIds: ['instructor1'],
      description: 'Class discussion and updates',
      isPrivate: false,
      createdAt: '2025-06-01',
      relatedId: 'class1',
      autoCreated: true
    },
    {
      id: 'chat2',
      name: 'Studio Announcements',
      type: 'announcement',
      members: ['user1', 'manager1', 'instructor1', 'student1', 'student2'],
      adminIds: ['manager1'],
      description: 'Important studio updates and announcements',
      isPrivate: false,
      createdAt: '2025-06-01'
    },
    {
      id: 'chat3',
      name: 'Firing Squad',
      type: 'general',
      members: ['user1', 'student1', 'student2', 'student3'],
      adminIds: ['user1', 'student1'],
      description: 'Coordinating firing schedules and sharing tips',
      isPrivate: false,
      createdAt: '2025-06-05'
    }
  ]);

  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: 'msg1',
      senderId: 'instructor1',
      senderName: 'Emma Davis',
      senderHandle: 'emmadavis',
      groupId: 'chat1',
      content: 'Welcome to our Beginner Wheel Throwing class! Feel free to ask questions and share your progress here.',
      type: 'text',
      timestamp: '2025-06-14T09:00:00Z',
      readBy: ['user1', 'student1'],
      reactions: [{ emoji: '👋', users: ['user1', 'student1'] }]
    },
    {
      id: 'msg2',
      senderId: 'student1',
      senderName: 'Alex Johnson',
      senderHandle: 'alexj',
      groupId: 'chat1',
      content: 'Thanks Emma! I\'m excited to get started. When do we begin working on the wheel?',
      type: 'text',
      timestamp: '2025-06-14T09:15:00Z',
      readBy: ['user1', 'instructor1']
    }
  ]);

  const [allUsers] = useState<ChatParticipant[]>([
    {
      id: 'instructor1',
      name: 'Emma Davis',
      email: 'emma@artisanclay.com',
      handle: 'emmadavis',
      type: 'artist',
      role: 'instructor',
      studioId: context.currentStudio?.id,
      isOnline: true,
      lastSeen: '2025-06-14T11:30:00Z'
    },
    {
      id: 'manager1',
      name: 'Sarah Wilson',
      email: 'sarah@artisanclay.com',
      handle: 'sarahwilson',
      type: 'artist',
      role: 'admin',
      studioId: context.currentStudio?.id,
      isOnline: true,
      lastSeen: '2025-06-14T11:25:00Z'
    },
    {
      id: 'student1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      handle: 'alexj',
      type: 'artist',
      role: 'student',
      studioId: context.currentStudio?.id,
      isOnline: false,
      lastSeen: '2025-06-14T10:00:00Z'
    }
  ]);

  const activeGroup = chats.find(chat => chat.id === activeChat);
  const activeChatMessages = messages.filter(msg =>
    msg.groupId === activeChat || msg.recipientId === activeChat
  );

  const isGroupAdmin = activeGroup && activeGroup.adminIds.includes(context.currentUser?.id || '');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChat) return;

    const newMessage: ExtendedMessage = {
      id: `msg${Date.now()}`,
      senderId: context.currentUser?.id || '',
      senderName: context.currentUser?.name || '',
      senderHandle: context.currentUser?.handle || '',
      groupId: activeChat,
      content: messageText,
      type: 'text',
      timestamp: new Date().toISOString(),
      readBy: [context.currentUser?.id || '']
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
  };

  const handleCreateChat = () => {
    if (chatType === 'direct' && selectedUsers.length !== 1) return;
    if (chatType === 'group' && (selectedUsers.length < 2 || !groupName.trim())) return;

    const newChat: ChatGroup = {
      id: `chat${Date.now()}`,
      name: chatType === 'direct'
        ? allUsers.find(u => u.id === selectedUsers[0])?.name || 'Direct Message'
        : groupName,
      type: 'general',
      members: [...selectedUsers, context.currentUser?.id || ''],
      adminIds: [context.currentUser?.id || ''],
      description: groupDescription,
      isPrivate: isPrivateGroup,
      createdAt: new Date().toISOString()
    };

    console.log('Creating new chat:', newChat);

    setSelectedUsers([]);
    setGroupName('');
    setGroupDescription('');
    setIsPrivateGroup(false);
    setShowNewChatDialog(false);
    setActiveChat(newChat.id);
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;

    const roleConfig = {
      owner: { label: 'Owner', variant: 'default' },
      admin: { label: 'Admin', variant: 'destructive' },
      manager: { label: 'Manager', variant: 'default' },
      instructor: { label: 'Instructor', variant: 'secondary' },
      member: { label: 'Member', variant: 'outline' },
      student: { label: 'Student', variant: 'secondary' },
      buyer: { label: 'Buyer', variant: 'outline' },
      guest: { label: 'Guest', variant: 'outline' },
      'future-member': { label: 'Future Member', variant: 'secondary' }
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) return null;

    return (
      <Badge variant={config.variant as any} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getRoleFilterOptions = () => [
    { value: 'all', label: 'All Users' },
    { value: 'admin', label: 'Admins' },
    { value: 'manager', label: 'Managers' },
    { value: 'instructor', label: 'Instructors' },
    { value: 'member', label: 'Members' },
    { value: 'student', label: 'Students' },
    { value: 'buyer', label: 'Buyers' },
    { value: 'guest', label: 'Guests' },
    { value: 'future-member', label: 'Future Members' }
  ];

  const getFilteredUsers = () => {
    return allUsers.filter(user => {
      if (selectedRoleFilter === 'all') return true;
      return user.role === selectedRoleFilter;
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getChatIcon = (type: ChatGroup['type']) => {
    switch (type) {
      case 'class': return <Users className="w-4 h-4" />;
      case 'announcement': return <Hash className="w-4 h-4" />;
      case 'project': return <FileText className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Messages</h1>
          <p className="text-muted-foreground text-lg">
            Chat with studio members, instructors, and classmates
          </p>
        </div>
        <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Start New Chat</DialogTitle>
              <DialogDescription>
                Create a direct message or group chat with studio members.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={chatType} onValueChange={(value) => setChatType(value as 'direct' | 'group')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="direct">Direct Message</TabsTrigger>
                <TabsTrigger value="group">Group Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Select Person</Label>
                    <Select value={selectedRoleFilter} onValueChange={setSelectedRoleFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getRoleFilterOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                    {getFilteredUsers()
                      .filter(user => user.id !== context.currentUser?.id)
                      .map(user => (
                        <div key={user.id} className="flex items-center space-x-3 p-3 hover:bg-accent rounded-lg cursor-pointer"
                             onClick={() => setSelectedUsers([user.id])}>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => {}}
                          />
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{user.name}</p>
                              {getRoleBadge(user.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">@{user.handle}</p>
                            {user.studioId && (
                              <p className="text-xs text-muted-foreground">Studio Member</p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="group" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Group Name</Label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={isPrivateGroup}
                      onCheckedChange={setIsPrivateGroup}
                    />
                    <Label>Private Group</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="What's this group about?"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Add Members ({selectedUsers.length} selected)</Label>
                    <Select value={selectedRoleFilter} onValueChange={setSelectedRoleFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getRoleFilterOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                    {getFilteredUsers()
                      .filter(user => user.id !== context.currentUser?.id)
                      .map(user => (
                        <div key={user.id} className="flex items-center space-x-3 p-3 hover:bg-accent rounded-lg cursor-pointer"
                             onClick={() => {
                               setSelectedUsers(prev =>
                                 prev.includes(user.id)
                                   ? prev.filter(id => id !== user.id)
                                   : [...prev, user.id]
                               );
                             }}>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => {}}
                          />
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{user.name}</p>
                              {getRoleBadge(user.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">@{user.handle}</p>
                            {user.studioId && (
                              <p className="text-xs text-muted-foreground">Studio Member</p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateChat}
                disabled={
                  (chatType === 'direct' && selectedUsers.length !== 1) ||
                  (chatType === 'group' && (selectedUsers.length < 2 || !groupName.trim()))
                }
              >
                Create Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)]">
        {/* Chat List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            {chats
              .filter(chat =>
                chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chat.description?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(chat => {
                const lastMessage = messages
                  .filter(msg => msg.groupId === chat.id)
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

                const unreadCount = messages
                  .filter(msg => msg.groupId === chat.id && !msg.readBy.includes(context.currentUser?.id || ''))
                  .length;

                return (
                  <div
                    key={chat.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors border ${
                      activeChat === chat.id ? 'bg-primary/5 border-primary/20' : 'hover:bg-accent border-transparent'
                    }`}
                    onClick={() => setActiveChat(chat.id)}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        {getChatIcon(chat.type)}
                      </div>
                      {chat.isPrivate && (
                        <Lock className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full p-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{chat.name}</p>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.senderName}: {lastMessage.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {chat.members.length} members
                        </p>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs h-5 w-5 flex items-center justify-center p-0">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="lg:col-span-3 flex flex-col">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    {getChatIcon(activeGroup?.type || 'general')}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{activeGroup?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeGroup?.members.length} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <VideoIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeChatMessages.map(message => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{message.senderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{message.senderName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                              >
                                {reaction.emoji} {reaction.users.length}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="pr-12"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Select a chat to start messaging</h3>
                  <p className="text-muted-foreground">
                    Choose from your existing conversations or start a new one
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}