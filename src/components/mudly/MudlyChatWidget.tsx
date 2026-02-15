"use client";

import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/app/context/AppContext";
import {
    X,
    Send,
    Mic,
    MicOff,
    Paperclip,
    Settings,
    Trash2,
    Download,
    Volume2,
    Minimize2,
    Maximize2,
    Image as ImageIcon,
    FileText,
    Bell,
    Shield,
    Sparkles,
    ThumbsUp,
    ThumbsDown,
    MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MudlyLogo } from "@/components/MudlyLogo";

export type MudlyPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    attachments?: Array<{ name: string; type: string; size: number }>;
    isAudio?: boolean;
    feedback?: "liked" | "disliked" | null;
}

interface MudlySettings {
    position: MudlyPosition;
    notifications: boolean;
    soundEnabled: boolean;
    dataSharing: boolean;
    conversationHistory: boolean;
}

const POSITION_CLASSES: Record<MudlyPosition, string> = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6"
};

export interface MudlyChatWidgetProps {
    /** Position of the widget on screen. Default bottom-right for overlay use. */
    position?: MudlyPosition;
}

export function MudlyChatWidget({ position = "bottom-right" }: MudlyChatWidgetProps) {
    const { currentUser, currentStudio, authToken } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null);
    const [feedbackCategory, setFeedbackCategory] = useState("");
    const [feedbackText, setFeedbackText] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content:
                "Hi there! I'm Mudly, your pottery studio AI agent! 🎨 I can help you with studio management, pottery techniques, glaze recipes, kiln schedules, and much more. How can I help you today?",
            timestamp: new Date()
        }
    ]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [settings, setSettings] = useState<MudlySettings>({
        position,
        notifications: true,
        soundEnabled: true,
        dataSharing: false,
        conversationHistory: true
    });

    const positionClasses = POSITION_CLASSES[settings.position];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!currentMessage.trim() && uploadedFiles.length === 0) return;
        if (!authToken) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "You need to be signed in to chat with me.",
                    timestamp: new Date()
                }
            ]);
            return;
        }
        const userContent = currentMessage.trim();
        const newMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userContent,
            timestamp: new Date(),
            attachments: uploadedFiles.map((f) => ({ name: f.name, type: f.type, size: f.size }))
        };
        setMessages((prev) => [...prev, newMessage]);
        setCurrentMessage("");
        setUploadedFiles([]);
        setIsLoading(true);
        try {
            const apiMessages = [...messages, newMessage]
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({ role: m.role, content: m.content }));
            const res = await fetch("/api/mudly/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    context: {
                        activeMode: currentUser?.activeMode ?? "artist",
                        studioId: currentStudio?.id ?? null,
                        userName: currentUser?.name ?? "User"
                    }
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const err = data?.error ?? "Something went wrong.";
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `Sorry, I couldn't complete that. (${err})`,
                        timestamp: new Date()
                    }
                ]);
                return;
            }
            const assistantContent = data?.content ?? "I didn't get a response. Try again.";
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: assistantContent,
                    timestamp: new Date()
                }
            ]);
        } catch (e) {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Something went wrong. Please try again.",
                    timestamp: new Date()
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    };

    const removeFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            setTimeout(() => {
                setIsRecording(false);
                const audioMessage: Message = {
                    id: Date.now().toString(),
                    role: "user",
                    content: '[Voice message: "How do I fix a crack in my pottery?"]',
                    timestamp: new Date(),
                    isAudio: true
                };
                setMessages((prev) => [...prev, audioMessage]);
                setTimeout(() => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: (Date.now() + 1).toString(),
                            role: "assistant",
                            content:
                                "I heard your question about fixing cracks! For greenware, you can use slip and scoring. For bisqueware, you'll need a different approach. Would you like detailed instructions?",
                            timestamp: new Date(),
                            isAudio: true
                        }
                    ]);
                }, 1000);
            }, 2000);
        }
    };

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to clear all chat history?")) {
            setMessages([
                {
                    id: "1",
                    role: "assistant",
                    content:
                        "Hi there! I'm Mudly, your pottery studio AI agent! 🎨 How can I help you today?",
                    timestamp: new Date()
                }
            ]);
        }
    };

    const exportHistory = () => {
        const dataStr = JSON.stringify(messages, null, 2);
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const name = `mudly-chat-history-${new Date().toISOString().split("T")[0]}.json`;
        const link = document.createElement("a");
        link.setAttribute("href", dataUri);
        link.setAttribute("download", name);
        link.click();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const handleLike = (messageId: string) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === messageId
                    ? { ...msg, feedback: msg.feedback === "liked" ? null : ("liked" as const) }
                    : msg
            )
        );
    };

    const handleDislike = (messageId: string) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === messageId ? { ...msg, feedback: "disliked" as const } : msg
            )
        );
        setFeedbackMessageId(messageId);
        setShowFeedbackDialog(true);
    };

    const submitFeedback = () => {
        setFeedbackCategory("");
        setFeedbackText("");
        setFeedbackMessageId(null);
        setShowFeedbackDialog(false);
    };

    return (
        <>
            {!isOpen && (
                <div className={`fixed ${positionClasses} z-[100] group`}>
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="relative h-16 w-16 rounded-full shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 p-0 overflow-visible"
                    >
                        <MudlyLogo className="size-14 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                        {settings.notifications && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </Button>
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-foreground text-background text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                            Chat with Mudly AI
                        </div>
                    </div>
                </div>
            )}

            {isOpen && (
                <div className={`fixed ${positionClasses} z-[100]`}>
                    <Card
                        className={`${isMinimized ? "w-80" : "w-96"} shadow-2xl transition-all duration-300`}
                    >
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <MudlyLogo size={40} />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Mudly AI</h3>
                                        <p className="text-xs text-white/80">Your pottery agent</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        onClick={() => setIsMinimized(!isMinimized)}
                                    >
                                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        onClick={() => setShowSettings(true)}
                                    >
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                <ScrollArea className="h-[400px] p-4">
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                            >
                                                <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                                                    {message.role === "assistant" && (
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <MudlyLogo size={20} />
                                                            <span className="text-xs text-muted-foreground">Mudly</span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`rounded-lg p-3 ${
                                                            message.role === "user"
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted"
                                                        }`}
                                                    >
                                                        {message.isAudio && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Volume2 className="w-4 h-4" />
                                                                <div className="flex-1 h-1 bg-current/20 rounded-full">
                                                                    <div className="h-full w-2/3 bg-current rounded-full" />
                                                                </div>
                                                                <span className="text-xs">0:03</span>
                                                            </div>
                                                        )}
                                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                        {message.attachments?.length ? (
                                                            <div className="mt-2 space-y-1">
                                                                {message.attachments.map((file, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center gap-2 text-xs p-2 bg-background/50 rounded"
                                                                    >
                                                                        {file.type.startsWith("image/") ? (
                                                                            <ImageIcon className="w-3 h-3" />
                                                                        ) : (
                                                                            <FileText className="w-3 h-3" />
                                                                        )}
                                                                        <span className="flex-1 truncate">{file.name}</span>
                                                                        <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            {message.timestamp.toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </span>
                                                        {message.role === "assistant" && (
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={`h-6 w-6 ${message.feedback === "liked" ? "text-green-600" : "text-muted-foreground hover:text-green-600"}`}
                                                                    onClick={() => handleLike(message.id)}
                                                                >
                                                                    <ThumbsUp className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={`h-6 w-6 ${message.feedback === "disliked" ? "text-red-600" : "text-muted-foreground hover:text-red-600"}`}
                                                                    onClick={() => handleDislike(message.id)}
                                                                >
                                                                    <ThumbsDown className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>

                                {uploadedFiles.length > 0 && (
                                    <div className="px-4 pb-2">
                                        <div className="bg-muted rounded-lg p-2 space-y-1">
                                            {uploadedFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    {file.type.startsWith("image/") ? (
                                                        <ImageIcon className="w-4 h-4" />
                                                    ) : (
                                                        <FileText className="w-4 h-4" />
                                                    )}
                                                    <span className="flex-1 truncate">{file.name}</span>
                                                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(idx)}>
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 border-t">
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            multiple
                                            className="hidden"
                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-shrink-0"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant={isRecording ? "destructive" : "outline"}
                                            size="icon"
                                            onClick={toggleRecording}
                                            className="flex-shrink-0"
                                        >
                                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                        </Button>
                                        <Textarea
                                            placeholder="Ask Mudly anything..."
                                            value={currentMessage}
                                            onChange={(e) => setCurrentMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            disabled={isRecording || isLoading}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            size="icon"
                                            className="flex-shrink-0"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <span className="text-xs">...</span>
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {isRecording && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            Recording... Click to stop
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            )}

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MudlyLogo size={32} />
                            Mudly AI Settings
                        </DialogTitle>
                        <DialogDescription>Customize your Mudly AI agent preferences</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="privacy">Privacy</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="position">Screen Position</Label>
                                <Select
                                    value={settings.position}
                                    onValueChange={(value: MudlyPosition) =>
                                        setSettings((s) => ({ ...s, position: value }))
                                    }
                                >
                                    <SelectTrigger id="position">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                        <SelectItem value="top-right">Top Right</SelectItem>
                                        <SelectItem value="top-left">Top Left</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Choose where Mudly appears on your screen</p>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Sound Effects</Label>
                                    <p className="text-sm text-muted-foreground">Play sounds for messages and notifications</p>
                                </div>
                                <Switch
                                    checked={settings.soundEnabled}
                                    onCheckedChange={(checked) => setSettings((s) => ({ ...s, soundEnabled: checked }))}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <Label>Chat History</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={exportHistory} className="flex-1">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export History
                                    </Button>
                                    <Button variant="destructive" onClick={clearHistory} className="flex-1">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear History
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">{messages.length} messages in current conversation</p>
                            </div>
                        </TabsContent>
                        <TabsContent value="privacy" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <Label>Save Conversation History</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Store chat history for improved assistance and context</p>
                                </div>
                                <Switch
                                    checked={settings.conversationHistory}
                                    onCheckedChange={(checked) =>
                                        setSettings((s) => ({ ...s, conversationHistory: checked }))
                                    }
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <Label>Data Sharing for Improvement</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Share anonymized data to help improve Mudly's responses</p>
                                </div>
                                <Switch
                                    checked={settings.dataSharing}
                                    onCheckedChange={(checked) => setSettings((s) => ({ ...s, dataSharing: checked }))}
                                />
                            </div>
                            <Separator />
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                                <div className="flex items-start gap-2">
                                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Your Privacy Matters</p>
                                        <p className="text-xs text-muted-foreground">
                                            Mudly AI is designed with privacy in mind. Your conversations are encrypted and stored securely.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="notifications" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        <Label>Enable Notifications</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Show notification badge when Mudly has updates</p>
                                </div>
                                <Switch
                                    checked={settings.notifications}
                                    onCheckedChange={(checked) => setSettings((s) => ({ ...s, notifications: checked }))}
                                />
                            </div>
                            <Separator />
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Bell className="w-5 h-5 text-primary mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Smart Notifications</p>
                                        <p className="text-xs text-muted-foreground">
                                            Mudly learns your preferences and only sends notifications that matter to you.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
                        <Button onClick={() => setShowSettings(false)}>Save Settings</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MudlyLogo size={32} />
                            Provide Feedback
                        </DialogTitle>
                        <DialogDescription>Help us improve Mudly AI by sharing your thoughts</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="feedbackCategory">What went wrong?</Label>
                            <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                                <SelectTrigger id="feedbackCategory">
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inaccurate">Response was inaccurate</SelectItem>
                                    <SelectItem value="unhelpful">Response was unhelpful</SelectItem>
                                    <SelectItem value="incomplete">Response was incomplete</SelectItem>
                                    <SelectItem value="too-technical">Response was too technical</SelectItem>
                                    <SelectItem value="irrelevant">Response was irrelevant</SelectItem>
                                    <SelectItem value="unsafe">Response was unsafe or inappropriate</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label htmlFor="feedbackText">Additional Details (Optional)</Label>
                            <Textarea
                                id="feedbackText"
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Tell us more about what went wrong..."
                                rows={4}
                            />
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">
                                💡 Your feedback helps us improve Mudly AI for everyone. Thank you for taking the time to share your thoughts!
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>Cancel</Button>
                        <Button onClick={submitFeedback}>Submit Feedback</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
