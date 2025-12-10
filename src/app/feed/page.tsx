import { useState } from "react";
import {
    Heart,
    MessageCircle,
    Share2,
    Send,
    MoreVertical,
    Image as ImageIcon,
    Video,
    Calendar,
    Globe,
    ChevronDown,
    Plus,
    Bookmark,
    Facebook,
    Twitter,
    Instagram,
    X,
    Users,
    Search,
    UserPlus,
    UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

interface Post {
    id: string;
    author: {
        name: string;
        username: string;
        avatar: boolean;
        type: "artist" | "studio" | "public";
        isFollowing?: boolean;
    };
    content: string;
    images?: string[];
    video?: string;
    timestamp: string;
    likes: number;
    comments: Comment[];
    shares: number;
    isLiked: boolean;
    isSaved: boolean;
}

interface Comment {
    id: string;
    author: string;
    avatar: boolean;
    content: string;
    timestamp: string;
    likes: number;
}

export default function Feed() {
    const [posts, setPosts] = useState<Post[]>([
        {
            id: "1",
            author: {
                name: "Sarah Chen",
                username: "@sarahceramics",
                avatar: true,
                type: "artist",
                isFollowing: false
            },
            content:
                "Just finished this beautiful celadon vase! The glaze came out perfectly after the cone 6 firing. So happy with how the color developed! 🏺✨",
            images: ["pottery1", "pottery2"],
            timestamp: "2 hours ago",
            likes: 47,
            comments: [
                {
                    id: "c1",
                    author: "Mike Potter",
                    avatar: true,
                    content: "Stunning work! The color is incredible.",
                    timestamp: "1 hour ago",
                    likes: 3
                },
                {
                    id: "c2",
                    author: "Emma Clay",
                    avatar: true,
                    content: "Love the form! What clay body did you use?",
                    timestamp: "45 min ago",
                    likes: 1
                }
            ],
            shares: 5,
            isLiked: false,
            isSaved: false
        },
        {
            id: "2",
            author: {
                name: "Clay & Fire Studio",
                username: "@clayfirstudio",
                avatar: true,
                type: "studio",
                isFollowing: true
            },
            content:
                "New workshop alert! 🎉 Join us for our Advanced Wheel Throwing workshop this Saturday. Limited spots available. Sign up through the link in our profile!",
            images: ["workshop"],
            timestamp: "5 hours ago",
            likes: 92,
            comments: [
                {
                    id: "c3",
                    author: "John Ceramic",
                    avatar: true,
                    content: "Just signed up! Can't wait!",
                    timestamp: "4 hours ago",
                    likes: 5
                }
            ],
            shares: 12,
            isLiked: true,
            isSaved: true
        },
        {
            id: "3",
            author: {
                name: "Maria Rodriguez",
                username: "@mariaclay",
                avatar: true,
                type: "artist",
                isFollowing: true
            },
            content:
                "Working on a new series of functional dinnerware. Here's a sneak peek at the testing phase. Trying out different glazes combinations 🎨",
            images: ["testing1", "testing2", "testing3"],
            timestamp: "1 day ago",
            likes: 156,
            comments: [
                {
                    id: "c4",
                    author: "David Lee",
                    avatar: true,
                    content: "Beautiful color palette!",
                    timestamp: "1 day ago",
                    likes: 2
                },
                {
                    id: "c5",
                    author: "Lisa Kim",
                    avatar: true,
                    content: "Would love to buy a set when they're ready!",
                    timestamp: "23 hours ago",
                    likes: 4
                }
            ],
            shares: 8,
            isLiked: true,
            isSaved: false
        },
        {
            id: "4",
            author: {
                name: "Tom Wilson",
                username: "@tomthepotter",
                avatar: true,
                type: "public",
                isFollowing: false
            },
            content:
                "Studio tour! Come check out my workspace where all the magic happens. What does your pottery corner look like? Share below! 👇",
            video: "studio-tour",
            timestamp: "2 days ago",
            likes: 203,
            comments: [
                {
                    id: "c6",
                    author: "Anna Smith",
                    avatar: true,
                    content: "What a beautiful space! So organized!",
                    timestamp: "2 days ago",
                    likes: 8
                },
                {
                    id: "c7",
                    author: "Chris Brown",
                    avatar: true,
                    content: "Love the natural lighting!",
                    timestamp: "1 day ago",
                    likes: 3
                }
            ],
            shares: 15,
            isLiked: false,
            isSaved: true
        }
    ]);

    const [showNewPost, setShowNewPost] = useState(false);
    const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");
    const [filterType, setFilterType] = useState<"all" | "following" | "studios" | "artists">(
        "all"
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFilter, setSearchFilter] = useState<
        "all" | "people" | "studio" | "artist" | "following"
    >("all");

    // New Post Form State
    const [newPostContent, setNewPostContent] = useState("");
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [schedulePost, setSchedulePost] = useState(false);
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [crossPost, setCrossPost] = useState({
        facebook: false,
        instagram: false,
        threads: false,
        x: false
    });

    const handleLike = (postId: string) => {
        setPosts(
            posts.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          isLiked: !post.isLiked,
                          likes: post.isLiked ? post.likes - 1 : post.likes + 1
                      }
                    : post
            )
        );
    };

    const handleSave = (postId: string) => {
        setPosts(
            posts.map((post) => (post.id === postId ? { ...post, isSaved: !post.isSaved } : post))
        );
    };

    const handleFollow = (postId: string) => {
        setPosts(
            posts.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          author: { ...post.author, isFollowing: !post.author.isFollowing }
                      }
                    : post
            )
        );
    };

    const handleComment = (postId: string) => {
        if (!commentText.trim()) return;

        const newComment: Comment = {
            id: `c-${Date.now()}`,
            author: "You",
            avatar: true,
            content: commentText,
            timestamp: "Just now",
            likes: 0
        };

        setPosts(
            posts.map((post) =>
                post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
            )
        );

        setCommentText("");
        setActiveCommentPost(null);
    };

    const handleShare = (platform: string) => {
        alert(`Sharing to ${platform}...`);
    };

    const handleCreatePost = () => {
        const newPost: Post = {
            id: `post-${Date.now()}`,
            author: { name: "You", username: "@you", avatar: true, type: "artist" },
            content: newPostContent,
            images: selectedImages.length > 0 ? selectedImages : undefined,
            timestamp: schedulePost
                ? `Scheduled for ${scheduleDate} at ${scheduleTime}`
                : "Just now",
            likes: 0,
            comments: [],
            shares: 0,
            isLiked: false,
            isSaved: false
        };

        if (!schedulePost) {
            setPosts([newPost, ...posts]);
        }

        // Simulate cross-posting
        const platforms = Object.entries(crossPost)
            .filter(([_, enabled]) => enabled)
            .map(([platform]) => platform);

        if (platforms.length > 0) {
            alert(
                `Post ${schedulePost ? "scheduled" : "published"} to: Throw Clay${
                    platforms.length > 0 ? ", " + platforms.join(", ") : ""
                }`
            );
        }

        // Reset form
        setNewPostContent("");
        setSelectedImages([]);
        setSchedulePost(false);
        setScheduleDate("");
        setScheduleTime("");
        setCrossPost({
            facebook: false,
            instagram: false,
            threads: false,
            x: false
        });
        setShowNewPost(false);
    };

    const filteredPosts = posts.filter((post) => {
        // Apply text search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                post.author.name.toLowerCase().includes(query) ||
                post.author.username.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query);

            if (!matchesSearch) return false;

            // Apply search-specific filters
            if (searchFilter === "people") return true;
            if (searchFilter === "studio") return post.author.type === "studio";
            if (searchFilter === "artist") return post.author.type === "artist";
            if (searchFilter === "following")
                return post.author.type === "artist" || post.author.type === "studio";

            return true;
        }

        // Apply regular feed filters when not searching
        if (filterType === "all") return true;
        if (filterType === "following")
            return post.author.type === "artist" || post.author.type === "studio";
        if (filterType === "studios") return post.author.type === "studio";
        if (filterType === "artists") return post.author.type === "artist";
        return true;
    });

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1>Feed</h1>
                        <p className="text-muted-foreground">
                            Stay connected with the pottery community
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Feed - Left/Center Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Posts */}
                        {filteredPosts.map((post) => (
                            <Card key={post.id}>
                                <CardContent className="pt-6 space-y-4">
                                    {/* Post Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                                <span className="text-lg">
                                                    {post.author.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm">{post.author.name}</h4>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {post.author.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {post.author.username} • {post.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {post.author.isFollowing === false && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleFollow(post.id)}
                                                >
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Follow
                                                </Button>
                                            )}
                                            {post.author.isFollowing === true && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleFollow(post.id)}
                                                >
                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                    Following
                                                </Button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Report Post</DropdownMenuItem>
                                                    <DropdownMenuItem>Hide Post</DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Unfollow {post.author.name}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <div className="space-y-3">
                                        <p className="text-sm leading-relaxed">{post.content}</p>

                                        {/* Images */}
                                        {post.images && (
                                            <div
                                                className={`grid gap-2 ${
                                                    post.images.length === 1
                                                        ? "grid-cols-1"
                                                        : post.images.length === 2
                                                          ? "grid-cols-2"
                                                          : "grid-cols-3"
                                                }`}
                                            >
                                                {post.images.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="aspect-square bg-muted rounded-lg overflow-hidden"
                                                    >
                                                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Video */}
                                        {post.video && (
                                            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                                    <Video className="w-16 h-16 text-muted-foreground" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Post Stats */}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                        <span>{post.likes} likes</span>
                                        <span>{post.comments.length} comments</span>
                                        <span>{post.shares} shares</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t">
                                        <Button
                                            variant={post.isLiked ? "default" : "ghost"}
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleLike(post.id)}
                                        >
                                            <Heart
                                                className={`w-4 h-4 mr-2 ${
                                                    post.isLiked ? "fill-current" : ""
                                                }`}
                                            />
                                            Like
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() =>
                                                setActiveCommentPost(
                                                    activeCommentPost === post.id ? null : post.id
                                                )
                                            }
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Comment
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-1"
                                                >
                                                    <Share2 className="w-4 h-4 mr-2" />
                                                    Share
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => handleShare("Facebook")}
                                                >
                                                    <Facebook className="w-4 h-4 mr-2" />
                                                    Share to Facebook
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleShare("Instagram")}
                                                >
                                                    <Instagram className="w-4 h-4 mr-2" />
                                                    Share to Instagram
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleShare("Threads")}
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-2" />
                                                    Share to Threads
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleShare("X")}>
                                                    <Twitter className="w-4 h-4 mr-2" />
                                                    Share to X
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        navigator.clipboard.writeText(
                                                            `https://throwclay.com/post/${post.id}`
                                                        )
                                                    }
                                                >
                                                    <Globe className="w-4 h-4 mr-2" />
                                                    Copy Link
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSave(post.id)}
                                        >
                                            <Bookmark
                                                className={`w-4 h-4 ${
                                                    post.isSaved ? "fill-current" : ""
                                                }`}
                                            />
                                        </Button>
                                    </div>

                                    {/* Comments Section */}
                                    {post.comments.length > 0 && (
                                        <div className="space-y-3 pt-3 border-t">
                                            {post.comments.map((comment) => (
                                                <div
                                                    key={comment.id}
                                                    className="flex gap-3"
                                                >
                                                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs">
                                                            {comment.author.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-muted rounded-lg p-3">
                                                            <p className="text-sm font-medium">
                                                                {comment.author}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {comment.content}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                            <span>{comment.timestamp}</span>
                                                            <button className="hover:text-foreground">
                                                                Like
                                                            </button>
                                                            <button className="hover:text-foreground">
                                                                Reply
                                                            </button>
                                                            {comment.likes > 0 && (
                                                                <span>• {comment.likes} likes</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Comment */}
                                    {activeCommentPost === post.id && (
                                        <div className="flex gap-2 pt-3 border-t">
                                            <Input
                                                placeholder="Write a comment..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                onKeyPress={(e) =>
                                                    e.key === "Enter" && handleComment(post.id)
                                                }
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleComment(post.id)}
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Right Column - Filters and Search */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Filter Tabs */}
                        <Card>
                            <CardContent className="pt-6">
                                <Tabs
                                    value={filterType}
                                    onValueChange={(value: any) => setFilterType(value)}
                                >
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="all">All Posts</TabsTrigger>
                                        <TabsTrigger value="following">Following</TabsTrigger>
                                        <TabsTrigger value="studios">Studios</TabsTrigger>
                                        <TabsTrigger value="artists">Artists</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Search Bar */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    <Input
                                        placeholder="Search posts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>

                                {/* Search Filters */}
                                {searchQuery && (
                                    <div className="mt-2">
                                        <Label className="text-xs">Filter by:</Label>
                                        <Select
                                            defaultValue="all"
                                            onValueChange={(value: any) => setSearchFilter(value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4" />
                                                        All
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="people">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        People
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="studio">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        Studios
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="artist">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        Artists
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="following">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        Following
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Floating New Post Button */}
            <Button
                size="lg"
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
                onClick={() => setShowNewPost(true)}
            >
                <Plus className="w-6 h-6" />
            </Button>

            {/* New Post Dialog */}
            <Dialog
                open={showNewPost}
                onOpenChange={setShowNewPost}
            >
                <DialogContent className="max-w-2xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                        <DialogDescription>
                            Share your pottery journey with the community
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-4 pb-4">
                            {/* Post Content */}
                            <div>
                                <Label>What's on your mind?</Label>
                                <Textarea
                                    placeholder="Share your thoughts, progress, or tips..."
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    rows={4}
                                    className="mt-2"
                                />
                            </div>

                            {/* Media Upload */}
                            <div>
                                <Label>Add Media</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <Button
                                        variant="outline"
                                        className="h-24"
                                    >
                                        <div className="text-center">
                                            <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                                            <p className="text-xs">Add Photos</p>
                                        </div>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-24"
                                    >
                                        <div className="text-center">
                                            <Video className="w-6 h-6 mx-auto mb-1" />
                                            <p className="text-xs">Add Video</p>
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            {/* Schedule Post */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="schedule"
                                        checked={schedulePost}
                                        onCheckedChange={(checked) =>
                                            setSchedulePost(checked as boolean)
                                        }
                                    />
                                    <Label
                                        htmlFor="schedule"
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Schedule for later
                                    </Label>
                                </div>

                                {schedulePost && (
                                    <div className="grid grid-cols-2 gap-3 ml-6">
                                        <div>
                                            <Label className="text-xs">Date</Label>
                                            <Input
                                                type="date"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Time</Label>
                                            <Input
                                                type="time"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cross-Post to Other Platforms */}
                            <div className="space-y-3 pt-3 border-t">
                                <Label className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Also post to:
                                </Label>
                                <div className="space-y-2 ml-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="facebook"
                                            checked={crossPost.facebook}
                                            onCheckedChange={(checked) =>
                                                setCrossPost({
                                                    ...crossPost,
                                                    facebook: checked as boolean
                                                })
                                            }
                                        />
                                        <Label
                                            htmlFor="facebook"
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Facebook className="w-4 h-4 text-blue-600" />
                                            Facebook
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="instagram"
                                            checked={crossPost.instagram}
                                            onCheckedChange={(checked) =>
                                                setCrossPost({
                                                    ...crossPost,
                                                    instagram: checked as boolean
                                                })
                                            }
                                        />
                                        <Label
                                            htmlFor="instagram"
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Instagram className="w-4 h-4 text-pink-600" />
                                            Instagram
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="threads"
                                            checked={crossPost.threads}
                                            onCheckedChange={(checked) =>
                                                setCrossPost({
                                                    ...crossPost,
                                                    threads: checked as boolean
                                                })
                                            }
                                        />
                                        <Label
                                            htmlFor="threads"
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Threads
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="x"
                                            checked={crossPost.x}
                                            onCheckedChange={(checked) =>
                                                setCrossPost({
                                                    ...crossPost,
                                                    x: checked as boolean
                                                })
                                            }
                                        />
                                        <Label
                                            htmlFor="x"
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Twitter className="w-4 h-4" />X (Twitter)
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Settings */}
                            <div className="pt-3 border-t">
                                <Label>Who can see this post?</Label>
                                <Select defaultValue="public">
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                Public - Anyone can see
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="followers">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Followers Only
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="studios">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                My Studios Only
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowNewPost(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim()}
                        >
                            {schedulePost ? (
                                <>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Schedule Post
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Post Now
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
