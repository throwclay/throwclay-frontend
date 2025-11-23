import { useState, useRef } from 'react';
import { 
  FileText, Plus, Search, Filter, Edit, Trash2, Eye, Share2, Heart, 
  MessageCircle, Bookmark, Calendar, User, Clock, Tag, ImageIcon, 
  Video, Link, Bold, Italic, Underline, List, ListOrdered, Quote,
  Save, Send, Archive, RotateCcw, Settings, Globe, Lock, Users,
  ChevronDown, MoreHorizontal, Copy, ExternalLink, Facebook, Twitter, 
  Linkedin, Instagram, RefreshCw, TrendingUp, BarChart, Layers
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { AspectRatio } from './ui/aspect-ratio';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAppContext } from '@/app/context/AppContext';
import { toast } from 'sonner';

// Blog interfaces
export interface BlogComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  replies: BlogComment[];
  isEdited: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'members-only';
  slug: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
  comments: BlogComment[];
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
  socialShareEnabled: boolean;
  commentsEnabled: boolean;
  scheduledFor?: string;
  isSticky: boolean;
  isFeatured: boolean;
}

export function BlogManagement() {
  const { currentUser } = useAppContext();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'review' | 'published' | 'archived'>('all');
  const [activeTab, setActiveTab] = useState('posts');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock blog posts data
  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Art of Wheel Throwing: A Beginner\'s Complete Guide',
      content: `# The Art of Wheel Throwing: A Beginner's Complete Guide

Wheel throwing is one of the most fundamental techniques in pottery, yet it remains one of the most challenging to master. In this comprehensive guide, we'll walk you through everything you need to know to get started with wheel throwing.

## Getting Started

Before you even touch the clay, it's important to understand the basics of centering. Centering is the foundation of all wheel throwing, and without proper centering, your pieces will be uneven and difficult to work with.

### Essential Tools

- Potter's wheel
- Clay (we recommend starting with stoneware)
- Wire tool
- Ribs and scrapers
- Sponges
- Water bowl

## The Centering Process

1. **Preparing the Clay**: Start with a ball of clay about the size of a softball
2. **Mounting**: Firmly attach the clay to the wheel head
3. **Centering**: Use steady pressure to center the clay
4. **Opening**: Create the interior space of your vessel

Remember, patience is key. Most beginners struggle with centering, but with practice, it becomes second nature.`,
      excerpt: 'Learn the fundamentals of wheel throwing with our comprehensive beginner\'s guide covering centering, opening, and pulling techniques.',
      authorId: currentUser?.id || 'user_1',
      authorName: currentUser?.name || 'Studio Admin',
      authorHandle: currentUser?.handle || 'studio',
      authorAvatar: currentUser?.profile?.profileImage,
      status: 'published',
      visibility: 'public',
      slug: 'wheel-throwing-beginners-guide',
      featuredImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
      tags: ['wheel-throwing', 'beginner', 'pottery', 'ceramics', 'techniques'],
      category: 'Tutorials',
      publishedAt: '2025-01-15T10:00:00Z',
      createdAt: '2025-01-14T16:30:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
      likes: 145,
      views: 2841,
      comments: [],
      readingTime: 8,
      seoTitle: 'Wheel Throwing for Beginners - Complete Guide | Throw Clay Studio',
      seoDescription: 'Master wheel throwing with our step-by-step guide. Learn centering, opening, and pulling techniques from professional potters.',
      socialShareEnabled: true,
      commentsEnabled: true,
      isSticky: false,
      isFeatured: true
    },
    {
      id: '2',
      title: 'Understanding Glaze Chemistry: Creating Your Perfect Finish',
      content: `# Understanding Glaze Chemistry

Glazes are essentially glass that has been formulated to melt at ceramic firing temperatures. Understanding the basic chemistry behind glazes will help you create more predictable and beautiful results.

## The Three Main Components

### Silica (SiO₂)
The glass former - provides the basic structure of the glaze.

### Alumina (Al₂O₃)  
The stabilizer - prevents the glaze from running off the pot.

### Flux
The melter - lowers the melting temperature of silica.

## Common Glaze Problems and Solutions

- **Crazing**: Usually caused by glaze having a higher coefficient of expansion than the clay body
- **Crawling**: Often due to dust or oil on the bisque ware
- **Pinholing**: Typically caused by thick application or rapid firing`,
      excerpt: 'Dive deep into glaze chemistry and learn how to troubleshoot common glazing problems for perfect ceramic finishes.',
      authorId: currentUser?.id || 'user_1',
      authorName: currentUser?.name || 'Studio Admin',
      authorHandle: currentUser?.handle || 'studio',
      authorAvatar: currentUser?.profile?.profileImage,
      status: 'draft',
      visibility: 'public',
      slug: 'understanding-glaze-chemistry',
      featuredImage: 'https://images.unsplash.com/photo-1465408953385-7c4627c2d4a6?w=800&h=400&fit=crop',
      tags: ['glaze', 'chemistry', 'ceramics', 'firing', 'troubleshooting'],
      category: 'Technical',
      createdAt: '2025-01-12T14:20:00Z',
      updatedAt: '2025-01-12T16:45:00Z',
      likes: 0,
      views: 0,
      comments: [],
      readingTime: 12,
      socialShareEnabled: true,
      commentsEnabled: true,
      isSticky: false,
      isFeatured: false
    },
    {
      id: '3',
      title: 'Student Spotlight: Sarah\'s Ceramic Journey',
      content: `# Student Spotlight: Sarah's Ceramic Journey

This month, we're excited to feature Sarah Martinez, one of our most dedicated students who has been with us for over two years.

## The Beginning

Sarah first came to our studio as a complete beginner, taking our "Introduction to Pottery" class. Like many beginners, she was initially frustrated by the wheel throwing process.

"I remember my first day," Sarah laughs. "I couldn't center the clay to save my life. I went home covered in mud and questioning if I'd ever get the hang of it."

## The Breakthrough

After six weeks of consistent practice, something clicked. Sarah's centering improved dramatically, and she began creating her first successful bowls and cups.

## Current Work

Today, Sarah is working on a series of large platters with intricate carved designs. Her work shows a sophisticated understanding of form and surface treatment.

## Advice for New Students

"Don't give up after the first few sessions," Sarah advises. "Pottery is a practice that rewards patience and persistence. Every 'failure' teaches you something important."`,
      excerpt: 'Meet Sarah Martinez, a dedicated student whose pottery journey from complete beginner to accomplished ceramic artist inspires us all.',
      authorId: currentUser?.id || 'user_1',
      authorName: currentUser?.name || 'Studio Admin',
      authorHandle: currentUser?.handle || 'studio',
      authorAvatar: currentUser?.profile?.profileImage,
      status: 'published',
      visibility: 'public',
      slug: 'student-spotlight-sarah-martinez',
      featuredImage: 'https://images.unsplash.com/photo-1543254382-96cd0c0b8746?w=800&h=400&fit=crop',
      tags: ['student-spotlight', 'community', 'inspiration', 'journey'],
      category: 'Community',
      publishedAt: '2025-01-10T09:00:00Z',
      createdAt: '2025-01-09T11:30:00Z',
      updatedAt: '2025-01-10T09:00:00Z',
      likes: 89,
      views: 1456,
      comments: [],
      readingTime: 5,
      socialShareEnabled: true,
      commentsEnabled: true,
      isSticky: false,
      isFeatured: false
    }
  ];

  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    category: '',
    status: 'draft',
    visibility: 'public',
    socialShareEnabled: true,
    commentsEnabled: true,
    isSticky: false,
    isFeatured: false
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePost = () => {
    const post: BlogPost = {
      id: `post_${Date.now()}`,
      title: newPost.title || 'Untitled Post',
      content: newPost.content || '',
      excerpt: newPost.excerpt || '',
      authorId: currentUser?.id || 'user_1',
      authorName: currentUser?.name || 'Author',
      authorHandle: currentUser?.handle || 'author',
      authorAvatar: currentUser?.profile?.profileImage,
      status: newPost.status as BlogPost['status'] || 'draft',
      visibility: newPost.visibility as BlogPost['visibility'] || 'public',
      slug: (newPost.title || 'untitled-post').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      featuredImage: newPost.featuredImage,
      tags: newPost.tags || [],
      category: newPost.category || 'General',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: newPost.status === 'published' ? new Date().toISOString() : undefined,
      likes: 0,
      views: 0,
      comments: [],
      readingTime: Math.ceil((newPost.content || '').split(' ').length / 200),
      socialShareEnabled: newPost.socialShareEnabled ?? true,
      commentsEnabled: newPost.commentsEnabled ?? true,
      isSticky: newPost.isSticky ?? false,
      isFeatured: newPost.isFeatured ?? false
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({
      title: '',
      content: '',
      excerpt: '',
      tags: [],
      category: '',
      status: 'draft',
      visibility: 'public',
      socialShareEnabled: true,
      commentsEnabled: true,
      isSticky: false,
      isFeatured: false
    });
    setIsEditing(false);
    toast.success('Blog post created successfully!');
  };

  const handleUpdatePost = (updatedPost: BlogPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? { ...updatedPost, updatedAt: new Date().toISOString() } : post
    ));
    setSelectedPost(null);
    setIsEditing(false);
    toast.success('Blog post updated successfully!');
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
    }
    toast.success('Blog post deleted successfully!');
  };

  const handleStatusChange = (postId: string, newStatus: BlogPost['status']) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const updatedPost = { 
          ...post, 
          status: newStatus, 
          updatedAt: new Date().toISOString()
        };
        if (newStatus === 'published' && !post.publishedAt) {
          updatedPost.publishedAt = new Date().toISOString();
        }
        return updatedPost;
      }
      return post;
    }));
    toast.success(`Post ${newStatus === 'published' ? 'published' : `moved to ${newStatus}`} successfully!`);
  };

  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'review': return 'warning';
      case 'published': return 'default';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: BlogPost['status']) => {
    switch (status) {
      case 'draft': return Edit;
      case 'review': return Eye;
      case 'published': return Globe;
      case 'archived': return Archive;
      default: return FileText;
    }
  };

  const categories = ['Tutorials', 'Technical', 'Community', 'News', 'Tips', 'Student Work', 'Events'];

  if (!currentUser) {
    return (
      <div className="p-8 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">Please log in to manage blog posts.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage your blog content</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <BarChart className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setIsEditing(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Blog Post</DialogTitle>
                  <DialogDescription>
                    Write and publish your blog content for your community
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Post Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your blog post title..."
                      className="text-lg"
                    />
                  </div>

                  {/* Content Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">Content</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={editorMode === 'write' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEditorMode('write')}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Write
                        </Button>
                        <Button
                          variant={editorMode === 'preview' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEditorMode('preview')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    
                    {editorMode === 'write' ? (
                      <div className="space-y-3">
                        {/* Toolbar */}
                        <div className="flex items-center space-x-2 p-2 border rounded-lg bg-muted/30">
                          <Button variant="ghost" size="sm">
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Italic className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Underline className="w-4 h-4" />
                          </Button>
                          <Separator orientation="vertical" className="h-4" />
                          <Button variant="ghost" size="sm">
                            <List className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ListOrdered className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Quote className="w-4 h-4" />
                          </Button>
                          <Separator orientation="vertical" className="h-4" />
                          <Button variant="ghost" size="sm">
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Link className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Textarea
                          id="content"
                          value={newPost.content}
                          onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Write your blog post content here... You can use Markdown syntax."
                          rows={12}
                          className="resize-none font-mono text-sm"
                        />
                      </div>
                    ) : (
                      <div className="min-h-[300px] p-4 border rounded-lg bg-background">
                        <div className="prose prose-sm max-w-none">
                          {newPost.content ? (
                            <div className="whitespace-pre-wrap">{newPost.content}</div>
                          ) : (
                            <p className="text-muted-foreground italic">No content to preview yet...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                          id="excerpt"
                          value={newPost.excerpt}
                          onChange={(e) => setNewPost(prev => ({ ...prev, excerpt: e.target.value }))}
                          placeholder="Brief description of your post..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={newPost.category} onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          placeholder="pottery, ceramics, tutorial (comma separated)"
                          onChange={(e) => {
                            const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                            setNewPost(prev => ({ ...prev, tags }));
                          }}
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={newPost.status} onValueChange={(value) => setNewPost(prev => ({ ...prev, status: value as BlogPost['status'] }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="visibility">Visibility</Label>
                        <Select value={newPost.visibility} onValueChange={(value) => setNewPost(prev => ({ ...prev, visibility: value as BlogPost['visibility'] }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="members-only">Members Only</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="comments">Enable Comments</Label>
                          <Switch
                            id="comments"
                            checked={newPost.commentsEnabled}
                            onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, commentsEnabled: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="social">Social Sharing</Label>
                          <Switch
                            id="social"
                            checked={newPost.socialShareEnabled}
                            onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, socialShareEnabled: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="featured">Featured Post</Label>
                          <Switch
                            id="featured"
                            checked={newPost.isFeatured}
                            onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, isFeatured: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Reading time: ~{Math.ceil((newPost.content || '').split(' ').length / 200)} min</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePost}>
                        <Save className="w-4 h-4 mr-2" />
                        {newPost.status === 'published' ? 'Publish' : 'Save Draft'}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const StatusIcon = getStatusIcon(post.status);
              return (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Featured Image */}
                      {post.featuredImage && (
                        <div className="w-24 h-16 flex-shrink-0">
                          <AspectRatio ratio={3/2}>
                            <img 
                              src={post.featuredImage} 
                              alt={post.title}
                              className="w-full h-full object-cover rounded"
                            />
                          </AspectRatio>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant={getStatusColor(post.status)} className="flex items-center space-x-1">
                                <StatusIcon className="w-3 h-3" />
                                <span className="capitalize">{post.status}</span>
                              </Badge>
                              {post.isFeatured && (
                                <Badge variant="outline">Featured</Badge>
                              )}
                              {post.isSticky && (
                                <Badge variant="outline">Sticky</Badge>
                              )}
                              <Badge variant="secondary">{post.category}</Badge>
                            </div>
                            
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Avatar className="w-4 h-4">
                                  <AvatarImage src={post.authorAvatar} />
                                  <AvatarFallback className="text-xs">
                                    {post.authorName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{post.authorName}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{post.readingTime} min read</span>
                              </div>
                              {post.status === 'published' && (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{post.views.toLocaleString()} views</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Heart className="w-3 h-3" />
                                    <span>{post.likes}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageCircle className="w-3 h-3" />
                                    <span>{post.comments.length}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1 mt-3">
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Preview</TooltipContent>
                            </Tooltip>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Blog Post</DialogTitle>
                                </DialogHeader>
                                {/* Edit form would go here - similar to create form */}
                              </DialogContent>
                            </Dialog>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {post.status !== 'published' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'published')}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                {post.status === 'published' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'draft')}>
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Unpublish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'archived')}>
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Blog Posts Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first blog post to get started.'
                  }
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsEditing(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}