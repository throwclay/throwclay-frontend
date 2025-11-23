import { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, Copy, Edit, Trash2, Eye, BookOpen, Users, Calendar, DollarSign, Star, MoreHorizontal, Save, FileText, History, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { toast } from 'sonner';

interface ClassTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  capacity: number;
  materials: string;
  prerequisites: string;
  whatYouLearn: string[];
  pricingTiers: PricingTier[];
  discountCodes: DiscountCode[];
  images: string[];
  thumbnail: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  version: string;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
  baseTemplateId?: string;
  versions: TemplateVersion[];
}

interface PricingTier {
  name: string;
  price: number;
  description: string;
  isDefault: boolean;
}

interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
}

interface TemplateVersion {
  id: string;
  version: string;
  description: string;
  createdBy: string;
  createdDate: string;
  isActive: boolean;
}

interface ClassTemplateManagerProps {
  onBack: () => void;
  onSelectTemplate?: (template: ClassTemplate) => void;
  mode?: 'manage' | 'select';
}

export function ClassTemplateManager({ onBack, onSelectTemplate, mode = 'manage' }: ClassTemplateManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ClassTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('');
  const [newTemplateTags, setNewTemplateTags] = useState('');

  // Mock template data
  const mockTemplates: ClassTemplate[] = [
    {
      id: '1',
      name: 'Beginner Wheel Throwing',
      description: 'Perfect template for introductory wheel throwing classes',
      category: 'Wheel Throwing',
      level: 'Beginner',
      duration: '8 weeks',
      capacity: 12,
      materials: 'Clay, glazes, and tools included',
      prerequisites: 'No experience required',
      whatYouLearn: [
        'Clay preparation and wedging',
        'Centering on the wheel',
        'Basic pulling techniques',
        'Trimming and finishing'
      ],
      pricingTiers: [
        { name: 'Early Bird', price: 280, description: 'Early registration discount', isDefault: false },
        { name: 'Standard', price: 320, description: 'Regular pricing', isDefault: true }
      ],
      discountCodes: [
        { code: 'BEGINNER20', type: 'percentage', value: 20, description: 'First-time student discount' }
      ],
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      createdBy: 'Sarah Martinez',
      createdDate: '2024-12-15',
      lastModified: '2025-01-08',
      version: '2.1',
      isPublic: true,
      usageCount: 15,
      tags: ['beginner', 'wheel', 'pottery', 'fundamentals'],
      versions: [
        { id: '1', version: '2.1', description: 'Updated pricing and materials list', createdBy: 'Sarah Martinez', createdDate: '2025-01-08', isActive: true },
        { id: '2', version: '2.0', description: 'Major update with new curriculum', createdBy: 'Sarah Martinez', createdDate: '2024-12-20', isActive: false },
        { id: '3', version: '1.0', description: 'Initial template creation', createdBy: 'Sarah Martinez', createdDate: '2024-12-15', isActive: false }
      ]
    },
    {
      id: '2',
      name: 'Advanced Glazing Workshop',
      description: 'Comprehensive glazing techniques for experienced potters',
      category: 'Glazing',
      level: 'Advanced',
      duration: '4 weeks',
      capacity: 8,
      materials: 'Glazes, brushes, and test tiles provided',
      prerequisites: 'Basic pottery experience required',
      whatYouLearn: [
        'Advanced glazing techniques',
        'Layering and blending',
        'Troubleshooting glaze issues',
        'Creating custom glazes'
      ],
      pricingTiers: [
        { name: 'Standard', price: 280, description: 'Regular workshop price', isDefault: true },
        { name: 'Premium', price: 350, description: 'Includes take-home materials', isDefault: false }
      ],
      discountCodes: [],
      images: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
      createdBy: 'Michael Chen',
      createdDate: '2024-11-20',
      lastModified: '2024-12-05',
      version: '1.2',
      isPublic: true,
      usageCount: 8,
      tags: ['advanced', 'glazing', 'workshop', 'techniques'],
      versions: [
        { id: '1', version: '1.2', description: 'Added new glazing techniques', createdBy: 'Michael Chen', createdDate: '2024-12-05', isActive: true },
        { id: '2', version: '1.1', description: 'Updated materials list', createdBy: 'Michael Chen', createdDate: '2024-11-25', isActive: false },
        { id: '3', version: '1.0', description: 'Initial template', createdBy: 'Michael Chen', createdDate: '2024-11-20', isActive: false }
      ]
    },
    {
      id: '3',
      name: 'Kids Pottery Fun',
      description: 'Engaging pottery activities designed for children',
      category: 'Kids Classes',
      level: 'Kids (8-12)',
      duration: '6 weeks',
      capacity: 10,
      materials: 'Child-safe clay and tools provided',
      prerequisites: 'Ages 8-12, no experience needed',
      whatYouLearn: [
        'Basic clay handling',
        'Simple handbuilding techniques',
        'Painting and decorating',
        'Safety in the studio'
      ],
      pricingTiers: [
        { name: 'Standard', price: 180, description: 'Regular kids class price', isDefault: true }
      ],
      discountCodes: [
        { code: 'SIBLING15', type: 'percentage', value: 15, description: 'Sibling discount' }
      ],
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      createdBy: 'Emma Rodriguez',
      createdDate: '2024-10-10',
      lastModified: '2024-12-01',
      version: '1.3',
      isPublic: true,
      usageCount: 12,
      tags: ['kids', 'children', 'fun', 'handbuilding'],
      versions: [
        { id: '1', version: '1.3', description: 'Updated safety protocols', createdBy: 'Emma Rodriguez', createdDate: '2024-12-01', isActive: true },
        { id: '2', version: '1.2', description: 'Added new activities', createdBy: 'Emma Rodriguez', createdDate: '2024-11-15', isActive: false },
        { id: '3', version: '1.1', description: 'Improved age guidelines', createdBy: 'Emma Rodriguez', createdDate: '2024-10-25', isActive: false }
      ]
    }
  ];

  const categories = ['all', 'Wheel Throwing', 'Handbuilding', 'Glazing', 'Kids Classes', 'Sculpting', 'Workshops'];

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    toast.success('Template created successfully!');
    setShowCreateDialog(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateCategory('');
    setNewTemplateTags('');
  };

  const handleSelectTemplate = (template: ClassTemplate) => {
    if (mode === 'select' && onSelectTemplate) {
      onSelectTemplate(template);
      toast.success(`Template "${template.name}" selected`);
    }
  };

  const handleDuplicateTemplate = (template: ClassTemplate) => {
    toast.success(`Template "${template.name}" duplicated`);
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    toast.success(`Template "${templateName}" deleted`);
  };

  const handleCreateVersion = () => {
    if (!selectedTemplate) return;

    toast.success(`New version created for "${selectedTemplate.name}"`);
    setShowVersionDialog(false);
    setSelectedTemplate(null);
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'Beginner': return 'default';
      case 'Intermediate': return 'secondary';
      case 'Advanced': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'select' ? 'Select Template' : 'Class Templates'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'select'
                ? 'Choose a template to create your class'
                : 'Manage your class templates and versions'
              }
            </p>
          </div>
        </div>

        {mode === 'manage' && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-muted relative">
              <ImageWithFallback
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <Badge variant={getBadgeVariant(template.level)}>{template.level}</Badge>
                {template.isPublic && <Badge variant="outline">Public</Badge>}
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{template.category}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {mode === 'select' ? (
                      <>
                        <DropdownMenuItem onClick={() => handleSelectTemplate(template)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Use Template
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedTemplate(template);
                          setShowVersionDialog(true);
                        }}>
                          <History className="w-4 h-4 mr-2" />
                          Manage Versions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteTemplate(template.id, template.name)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {template.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {template.duration}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {template.capacity}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>v{template.version}</span>
                  <span>•</span>
                  <span>{template.usageCount} uses</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {template.createdBy.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{template.createdBy}</span>
                </div>

                {mode === 'select' && (
                  <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                    Use Template
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first template to get started'
            }
          </p>
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for your classes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Beginner Wheel Throwing"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-category">Category *</Label>
                <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'all').map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Describe what this template is for..."
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-tags">Tags (comma-separated)</Label>
              <Input
                id="template-tags"
                placeholder="e.g., beginner, wheel, pottery"
                value={newTemplateTags}
                onChange={(e) => setNewTemplateTags(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Management Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Template Versions</DialogTitle>
            <DialogDescription>
              {selectedTemplate ? `Managing versions for "${selectedTemplate.name}"` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Current Version: {selectedTemplate.version}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last modified: {selectedTemplate.lastModified}
                  </p>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Version
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                {selectedTemplate.versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={version.isActive ? 'default' : 'outline'}>
                          v{version.version}
                        </Badge>
                        {version.isActive && (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1">{version.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                        <span>By {version.createdBy}</span>
                        <span>•</span>
                        <span>{version.createdDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!version.isActive && (
                        <Button variant="outline" size="sm">
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}