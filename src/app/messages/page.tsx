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
    unreadCount: number;
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
    const messagesScrollContainerRef = useRef<HTMLDivElement>(null);

    const studioId = currentStudio?.id;
    const activeConversation = conversations.find((c) => c.id === activeChat);
    const activeChatMessages = activeChat ? messages.filter((m) => m.conversationId === activeChat) : [];

    const fetchConversations = useCallback(
        async (opts?: { silent?: boolean }) => {
            if (!studioId || !authToken) return;
            const silent = opts?.silent === true;
            if (!silent) setConversationsLoading(true);
            try {
                const res = await fetch(`/api/studios/${studioId}/conversations`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                if (!res.ok) throw new Error("Failed to load conversations");
                const data = await res.json();
                setConversations(data.conversations ?? []);
            } catch (e) {
                if (!silent) console.error(e);
                if (!silent) setConversations([]);
            } finally {
                if (!silent) setConversationsLoading(false);
            }
        },
        [studioId, authToken]
    );

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

    const markConversationRead = useCallback(
        async (conversationId: string) => {
            if (!studioId || !authToken) return;
            try {
                await fetch(
                    `/api/studios/${studioId}/conversations/${conversationId}/read`,
                    { method: "POST", headers: { Authorization: `Bearer ${authToken}` } }
                );
                fetchConversations({ silent: true });
            } catch (e) {
                console.error(e);
            }
        },
        [studioId, authToken, fetchConversations]
    );

    useEffect(() => {
        if (activeChat && !messagesLoading) {
            markConversationRead(activeChat);
        }
    }, [activeChat, messagesLoading, markConversationRead]);

    useEffect(() => {
        if (showNewChatDialog) fetchMembers();
    }, [showNewChatDialog, fetchMembers]);

    // Scroll to bottom only within the messages panel (not the page). Use the ScrollArea viewport
    // so we don't trigger document scroll when selecting a conversation.
    const scrollMessagesToBottom = useCallback((behavior: "smooth" | "auto" = "smooth") => {
        const viewport = messagesScrollContainerRef.current?.querySelector<HTMLElement>(
            "[data-slot=scroll-area-viewport]"
        );
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior });
        }
    }, []);

    // Scroll to bottom only when opening a conversation (after messages load), not on every re-render.
    useEffect(() => {
        if (activeChat && !messagesLoading) {
            const t = setTimeout(() => scrollMessagesToBottom("smooth"), 0);
            return () => clearTimeout(t);
        }
    }, [activeChat, messagesLoading, scrollMessagesToBottom]);

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
        setTimeout(() => scrollMessagesToBottom("smooth"), 0);

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
            fetchConversations({ silent: true });
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
                await fetchConversations({ silent: true });
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

    if (!studioId) {
        return (
            <RequireAuth>
                <DefaultLayout>
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                        <div className="w-20 h-20 rounded-full bg-muted/80 flex items-center justify-center mb-6">
                            <MessageCircle className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-semibold">Select a studio</h2>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
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
            <div className="h-[calc(100vh-8rem)] max-w-6xl mx-auto flex flex-col px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Chat with studio members and instructors
                        </p>
                    </div>
                    <Dialog
                        open={showNewChatDialog}
                        onOpenChange={setShowNewChatDialog}
                    >
                        <DialogTrigger asChild>
                            <Button className="rounded-full shadow-sm">
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
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 bg-card border rounded-2xl shadow-sm overflow-hidden">
                    {/* Chat List Sidebar */}
                    <div className="flex flex-col border-r bg-muted/30">
                        <div className="p-3 border-b bg-background/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 rounded-lg bg-background border-muted-foreground/20"
                                />
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-0.5">
                                {conversationsLoading ? (
                                    <div className="p-6 text-center">
                                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                                    </div>
                                ) : (
                                    conversations
                                        .filter(
                                            (c) =>
                                                c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                (c.description ?? "").toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((chat) => {
                                            const unreadCount = chat.unreadCount ?? (chat as { unread_count?: number }).unread_count ?? 0;
                                            const lastMsg = chat.lastMessage as { createdAt?: string; created_at?: string; content?: string } | null;
                                            return (
                                            <button
                                                key={chat.id}
                                                type="button"
                                                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                                                    activeChat === chat.id
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "hover:bg-muted/80 active:bg-muted"
                                                }`}
                                                onClick={() => setActiveChat(chat.id)}
                                            >
                                                <div className="relative shrink-0">
                                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                                                        activeChat === chat.id ? "bg-primary-foreground/20" : "bg-muted"
                                                    }`}>
                                                        {chat.type === "group" ? (
                                                            <Users className="w-5 h-5 text-muted-foreground" />
                                                        ) : (
                                                            <span className="text-sm font-semibold">
                                                                {chat.displayName.slice(0, 2).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {unreadCount > 0 && (
                                                        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground ring-2 ring-background">
                                                            {unreadCount > 99 ? "99+" : unreadCount}
                                                        </span>
                                                    )}
                                                    {chat.isPrivate && (
                                                        <Lock className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-background p-0.5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                    <div className="flex items-center justify-between gap-2 min-w-0">
                                                        <span className="font-medium text-sm truncate min-w-0">
                                                            {chat.displayName}
                                                        </span>
                                                        {lastMsg && (
                                                            <span className={`text-xs whitespace-nowrap shrink-0 ${
                                                                activeChat === chat.id ? "text-primary-foreground/80" : "text-muted-foreground"
                                                            }`}>
                                                                {formatTime(lastMsg.createdAt ?? lastMsg.created_at ?? "")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {lastMsg ? (
                                                        <p className={`text-xs truncate mt-0.5 min-w-0 ${
                                                            activeChat === chat.id ? "text-primary-foreground/70" : "text-muted-foreground"
                                                        }`}>
                                                            {lastMsg.content}
                                                        </p>
                                                    ) : (
                                                        <p className={`text-xs mt-0.5 ${
                                                            activeChat === chat.id ? "text-primary-foreground/60" : "text-muted-foreground"
                                                        }`}>
                                                            {chat.memberCount} member{chat.memberCount !== 1 ? "s" : ""}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                            );
                                        })
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                    {/* Chat Messages Area */}
                    <div className="flex flex-col min-h-0 bg-background/50">
                        {activeChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            {activeConversation?.type === "group" ? (
                                                <Users className="w-5 h-5 text-muted-foreground" />
                                            ) : (
                                                <span className="text-sm font-semibold text-muted-foreground">
                                                    {activeConversation?.displayName?.slice(0, 2).toUpperCase() ?? "?"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold truncate">{activeConversation?.displayName}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {activeConversation?.memberCount ?? 0} member{(activeConversation?.memberCount ?? 0) !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                            <Phone className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                            <VideoIcon className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                            <Info className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                {/* Messages - ref wraps ScrollArea so we can scroll only its viewport, not the page */}
                                <div ref={messagesScrollContainerRef} className="flex-1 min-h-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-4">
                                        {messagesLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                <p className="text-sm text-muted-foreground mt-3">Loading messages...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {activeChatMessages.map((message) => {
                                                    const isOwn = message.senderId === currentUser?.id;
                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                                                        >
                                                            {!isOwn && (
                                                                <Avatar className="w-8 h-8 shrink-0">
                                                                    <AvatarFallback className="text-xs bg-muted">
                                                                        {message.senderName
                                                                            .split(" ")
                                                                            .map((n) => n[0])
                                                                            .join("")
                                                                            .slice(0, 2) || "?"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                            <div
                                                                className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${
                                                                    isOwn ? "items-end" : "items-start"
                                                                }`}
                                                            >
                                                                {!isOwn && activeConversation?.type === "group" && (
                                                                    <span className="text-xs font-medium text-muted-foreground mb-0.5 px-1">
                                                                        {message.senderName}
                                                                    </span>
                                                                )}
                                                                <div
                                                                    className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                                                        isOwn
                                                                            ? "bg-primary text-primary-foreground rounded-br-md"
                                                                            : "bg-muted rounded-bl-md"
                                                                    }`}
                                                                >
                                                                    <p className="break-words whitespace-pre-wrap">
                                                                        {message.content}
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`text-[10px] text-muted-foreground mt-1 px-1 ${
                                                                        isOwn ? "text-right" : "text-left"
                                                                    }`}
                                                                >
                                                                    {formatTime(message.createdAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        )}
                                        </div>
                                    </ScrollArea>
                                </div>
                                {/* Message Input */}
                                <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1 flex items-center gap-1 rounded-2xl border bg-muted/50 px-3 py-2 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full">
                                                <Paperclip className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                            <input
                                                placeholder="Type a message..."
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1.5"
                                            />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full">
                                                <Smile className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                        <Button
                                            size="icon"
                                            onClick={handleSendMessage}
                                            disabled={!messageText.trim() || sending}
                                            className="h-10 w-10 shrink-0 rounded-full shadow-sm"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center max-w-sm">
                                    <div className="mx-auto w-20 h-20 rounded-full bg-muted/80 flex items-center justify-center mb-6">
                                        <MessageCircle className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">
                                        Select a conversation
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Choose a chat from the list or start a new one to begin messaging.
                                    </p>
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
