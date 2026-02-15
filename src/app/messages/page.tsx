"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
    Plus,
    Search,
    Send,
    Paperclip,
    FileText,
    Users,
    Phone,
    VideoIcon,
    Info,
    Smile,
    MessageCircle,
    Hash,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/app/context/AppContext";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";

/** Conversation list item from API */
interface ConversationItem {
    id: string;
    type: "direct" | "group";
    name: string | null;
    displayName: string;
    description: string | null;
    isPrivate: boolean;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    lastMessage: {
        id: string;
        senderId: string;
        content: string;
        createdAt: string;
    } | null;
}

/** Message from API */
interface ApiMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderHandle: string;
    content: string;
    type: string;
    createdAt: string;
    updatedAt: string;
}

/** Studio member for New Chat picker */
interface StudioMemberOption {
    id: string;
    name: string;
    handle: string;
    email: string;
    role: string;
}

const roleConfig: Record<string, { label: string; variant: string }> = {
    owner: { label: "Owner", variant: "default" },
    admin: { label: "Admin", variant: "destructive" },
    manager: { label: "Manager", variant: "default" },
    instructor: { label: "Instructor", variant: "secondary" },
    employee: { label: "Employee", variant: "secondary" },
    member: { label: "Member", variant: "outline" }
};

export default function MessagingCenter() {
    const { currentUser, currentStudio, authToken } = useAppContext();
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [conversationsLoading, setConversationsLoading] = useState(false);
    const [members, setMembers] = useState<StudioMemberOption[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [messages, setMessages] = useState<ApiMessage[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [showNewChatDialog, setShowNewChatDialog] = useState(false);
    const [chatType, setChatType] = useState<"direct" | "group">("direct");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [isPrivateGroup, setIsPrivateGroup] = useState(false);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
    const [creatingChat, setCreatingChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const studioId = currentStudio?.id;
    const activeConversation = conversations.find((c) => c.id === activeChat);
    const activeChatMessages = activeChat ? messages.filter((m) => m.conversationId === activeChat) : [];

    const fetchConversations = useCallback(async () => {
        if (!studioId || !authToken) return;
        setConversationsLoading(true);
        try {
            const res = await fetch(`/api/studios/${studioId}/conversations`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error("Failed to load conversations");
            const data = await res.json();
            setConversations(data.conversations ?? []);
        } catch (e) {
            console.error(e);
            setConversations([]);
        } finally {
            setConversationsLoading(false);
        }
    }, [studioId, authToken]);

    const fetchMessages = useCallback(async (conversationId: string) => {
        if (!studioId || !authToken) return;
        setMessagesLoading(true);
        try {
            const res = await fetch(
                `/api/studios/${studioId}/conversations/${conversationId}/messages`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            if (!res.ok) throw new Error("Failed to load messages");
            const data = await res.json();
            setMessages(data.messages ?? []);
        } catch (e) {
            console.error(e);
            setMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    }, [studioId, authToken]);

    const fetchMembers = useCallback(async () => {
        if (!studioId || !authToken) return;
        setMembersLoading(true);
        try {
            const res = await fetch(`/api/studios/${studioId}/conversations/members`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error("Failed to load members");
            const data = await res.json();
            setMembers(data.members ?? []);
        } catch (e) {
            console.error(e);
            setMembers([]);
        } finally {
            setMembersLoading(false);
        }
    }, [studioId, authToken]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (activeChat) fetchMessages(activeChat);
        else setMessages([]);
    }, [activeChat, fetchMessages]);

    useEffect(() => {
        if (showNewChatDialog) fetchMembers();
    }, [showNewChatDialog, fetchMembers]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChatMessages]);

    const handleSendMessage = async () => {
        const content = messageText.trim();
        if (!content || !activeChat || !studioId || !authToken || sending) return;

        const optimistic: ApiMessage = {
            id: `temp-${Date.now()}`,
            conversationId: activeChat,
            senderId: currentUser?.id ?? "",
            senderName: currentUser?.name ?? "",
            senderHandle: currentUser?.handle ?? "",
            content,
            type: "text",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, optimistic]);
        setMessageText("");
        setSending(true);

        try {
            const res = await fetch(
                `/api/studios/${studioId}/conversations/${activeChat}/messages`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ content })
                }
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? "Failed to send");
            }
            const data = await res.json();
            setMessages((prev) =>
                prev.map((m) => (m.id === optimistic.id ? { ...data.message, id: data.message.id } : m))
            );
            fetchConversations();
        } catch (e) {
            setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
            setMessageText(content);
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const handleCreateChat = async () => {
        if (chatType === "direct" && selectedUsers.length !== 1) return;
        if (chatType === "group" && (selectedUsers.length < 1 || !groupName.trim())) return;
        if (!studioId || !authToken) return;

        setCreatingChat(true);
        try {
            const res = await fetch(`/api/studios/${studioId}/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    type: chatType,
                    participantIds: selectedUsers,
                    name: chatType === "group" ? groupName : undefined,
                    description: chatType === "group" ? groupDescription || undefined : undefined
                })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? "Failed to create chat");
            }
            const data = await res.json();
            const convId = data.conversation?.id;
            setSelectedUsers([]);
            setGroupName("");
            setGroupDescription("");
            setIsPrivateGroup(false);
            setShowNewChatDialog(false);
            if (convId) {
                await fetchConversations();
                setActiveChat(convId);
                fetchMessages(convId);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCreatingChat(false);
        }
    };

    const getRoleBadge = (role?: string) => {
        if (!role) return null;
        const config = roleConfig[role];
        if (!config) return null;
        return (
            <Badge variant={config.variant as "default" | "destructive" | "secondary" | "outline"} className="text-xs">
                {config.label}
            </Badge>
        );
    };

    const getRoleFilterOptions = () => [
        { value: "all", label: "All Users" },
        ...Object.entries(roleConfig).map(([value, { label }]) => ({ value, label }))
    ];

    const getFilteredMembers = () => {
        if (selectedRoleFilter === "all") return members.filter((m) => m.id !== currentUser?.id);
        return members.filter((m) => m.id !== currentUser?.id && m.role === selectedRoleFilter);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);
        if (hours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return date.toLocaleDateString();
    };

    const getChatIcon = (type: "direct" | "group") => {
        return type === "group" ? <Users className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />;
    };

    if (!studioId) {
        return (
            <RequireAuth>
                <DefaultLayout>
                    <div className="max-w-7xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                        <MessageCircle className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
                        <h2 className="text-xl font-semibold">Select a studio</h2>
                        <p className="text-muted-foreground mt-2">
                            Switch to a studio from the menu to view and send messages with studio members.
                        </p>
                    </div>
                </DefaultLayout>
            </RequireAuth>
        );
    }

    return (
        <RequireAuth>
        <DefaultLayout>
            <div className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold">Messages</h1>
                        <p className="text-muted-foreground text-lg">
                            Chat with studio members, instructors, and classmates
                        </p>
                    </div>
                    <Dialog
                        open={showNewChatDialog}
                        onOpenChange={setShowNewChatDialog}
                    >
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
                            <Tabs
                                value={chatType}
                                onValueChange={(value) => setChatType(value as "direct" | "group")}
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="direct">Direct Message</TabsTrigger>
                                    <TabsTrigger value="group">Group Chat</TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="direct"
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Select Person</Label>
                                            <Select
                                                value={selectedRoleFilter}
                                                onValueChange={setSelectedRoleFilter}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getRoleFilterOptions().map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                                            {membersLoading ? (
                                                <p className="text-sm text-muted-foreground">Loading members...</p>
                                            ) : (
                                                getFilteredMembers().map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center space-x-3 p-3 hover:bg-accent rounded-lg cursor-pointer"
                                                        onClick={() => setSelectedUsers([user.id])}
                                                    >
                                                        <Checkbox
                                                            checked={selectedUsers.includes(user.id)}
                                                            onChange={() => {}}
                                                        />
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarFallback>
                                                                {user.name.split(" ").map((n) => n[0]).join("") || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center space-x-2">
                                                                <p className="font-medium">{user.name}</p>
                                                                {getRoleBadge(user.role)}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">@{user.handle}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="group"
                                    className="space-y-6"
                                >
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
                                            <Label>
                                                Add Members ({selectedUsers.length} selected)
                                            </Label>
                                            <Select
                                                value={selectedRoleFilter}
                                                onValueChange={setSelectedRoleFilter}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getRoleFilterOptions().map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                                            {membersLoading ? (
                                                <p className="text-sm text-muted-foreground">Loading members...</p>
                                            ) : (
                                                getFilteredMembers().map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center space-x-3 p-3 hover:bg-accent rounded-lg cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedUsers((prev) =>
                                                                prev.includes(user.id)
                                                                    ? prev.filter((id) => id !== user.id)
                                                                    : [...prev, user.id]
                                                            );
                                                        }}
                                                    >
                                                        <Checkbox checked={selectedUsers.includes(user.id)} onChange={() => {}} />
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarFallback>
                                                                {user.name.split(" ").map((n) => n[0]).join("") || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center space-x-2">
                                                                <p className="font-medium">{user.name}</p>
                                                                {getRoleBadge(user.role)}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">@{user.handle}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
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
                                        creatingChat ||
                                        (chatType === "direct" && selectedUsers.length !== 1) ||
                                        (chatType === "group" && (selectedUsers.length < 1 || !groupName.trim()))
                                    }
                                >
                                    {creatingChat ? "Creating…" : "Create Chat"}
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
                            {conversationsLoading ? (
                                <p className="text-sm text-muted-foreground p-4">Loading conversations...</p>
                            ) : (
                                conversations
                                    .filter(
                                        (c) =>
                                            c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (c.description ?? "").toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((chat) => (
                                        <div
                                            key={chat.id}
                                            className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors border ${
                                                activeChat === chat.id
                                                    ? "bg-primary/5 border-primary/20"
                                                    : "hover:bg-accent border-transparent"
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
                                                    <p className="font-medium truncate">{chat.displayName}</p>
                                                    {chat.lastMessage && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTime(chat.lastMessage.createdAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                {chat.lastMessage && (
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {chat.lastMessage.content}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    {chat.memberCount} member{chat.memberCount !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                            )}
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
                                            {getChatIcon(activeConversation?.type ?? "direct")}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold">{activeConversation?.displayName}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {activeConversation?.memberCount ?? 0} member{(activeConversation?.memberCount ?? 0) !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <VideoIcon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <Info className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                {/* Messages */}
                                <ScrollArea className="flex-1 p-4">
                                    {messagesLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading messages...</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {activeChatMessages.map((message) => (
                                                <div key={message.id} className="flex items-start space-x-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarFallback>
                                                            {message.senderName
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("") || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium text-sm">
                                                                {message.senderName}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTime(message.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm">{message.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </ScrollArea>
                                {/* Message Input */}
                                <div className="p-4 border-t">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                placeholder="Type a message..."
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                onKeyPress={(e) =>
                                                    e.key === "Enter" && handleSendMessage()
                                                }
                                                className="pr-12"
                                            />
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Paperclip className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Smile className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!messageText.trim()}
                                        >
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
                                        <h3 className="text-xl font-semibold">
                                            Select a chat to start messaging
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Choose from your existing conversations or start a new
                                            one
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DefaultLayout>
        </RequireAuth>
    );
}
