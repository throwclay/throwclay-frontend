import { useState } from 'react';
import {
  Plus, Search, Filter, Eye, Edit2, Trash2, Star, Upload, Download,
  Beaker, Calendar, User, Flame, Thermometer, Image as ImageIcon,
  Tag, Save, X, Copy, BarChart3, TrendingUp, AlertTriangle, MoreHorizontal,
  Palette, CheckSquare, FileSpreadsheet, Settings, ArrowLeft, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext, type GlazeExperiment, type PhotoEntry } from '@/app/context/AppContext';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface GlazeEntry {
  id: string;
  name: string;
  type: 'store-bought' | 'experiment';
  status: 'available' | 'experiment' | 'not-available';
  experimenterName?: string;
  experimentedBy?: string;
  testDate?: string;
  firedDate?: string;
  imageUrl?: string;
  quantity: number;
  quantityUnit: string;
  cone: string[];
  atmosphere: string;
  notes: string;
  tags: string[];
  ingredients?: { ingredient: string; quantity: number; unit: string }[];
  manufacturer?: string;
  productCode?: string;
  createdAt: string;
  updatedAt: string;
  photos?: PhotoEntry[];
}

export default function GlazeManagement() {
  const context = useAppContext();
  const [activeTab, setActiveTab] = useState('all-glazes');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAtmosphere, setFilterAtmosphere] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [selectedGlaze, setSelectedGlaze] = useState<GlazeEntry | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
  const [editingGlazeId, setEditingGlazeId] = useState<string | null>(null);

  // Form state for creating/editing glazes
  const [glazeForm, setGlazeForm] = useState({
    name: '',
    type: 'experiment' as 'store-bought' | 'experiment',
    status: 'available' as 'available' | 'experiment' | 'not-available',
    quantity: 0,
    quantityUnit: 'grams',
    cone: [] as string[],
    atmosphere: 'oxidation',
    notes: '',
    tags: [] as string[],
    ingredients: [] as { ingredient: string; quantity: number; unit: string }[],
    manufacturer: '',
    productCode: '',
    photos: [] as PhotoEntry[]
  });

  // Mock data for glazes
  const [glazes] = useState<GlazeEntry[]>([
    {
      id: 'glaze1',
      name: 'Celadon Green',
      type: 'experiment',
      status: 'available',
      experimenterName: 'Jane Potter',
      experimentedBy: 'user1',
      testDate: '2025-06-01',
      firedDate: '2025-06-03',
      quantity: 500,
      quantityUnit: 'grams',
      cone: ['9', '10'],
      atmosphere: 'reduction',
      notes: 'Beautiful jade green color in reduction. Flows nicely with excellent results on porcelain.',
      tags: ['celadon', 'high-fire', 'food-safe'],
      ingredients: [
        { ingredient: 'Potash Feldspar', quantity: 45, unit: 'g' },
        { ingredient: 'Silica', quantity: 30, unit: 'g' },
        { ingredient: 'Whiting', quantity: 15, unit: 'g' },
        { ingredient: 'Kaolin', quantity: 8, unit: 'g' },
        { ingredient: 'Iron Oxide', quantity: 2, unit: 'g' }
      ],
      createdAt: '2025-06-01T10:00:00Z',
      updatedAt: '2025-06-03T15:30:00Z',
      photos: [
        {
          id: 'photo1',
          url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
          type: 'photo',
          caption: 'Test tiles showing color variation',
          notes: 'Fired in reduction at cone 10. Beautiful jade color.',
          timestamp: '2025-06-03T15:30:00Z'
        },
        {
          id: 'photo2',
          url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
          type: 'photo',
          caption: 'Final bowl with celadon glaze',
          notes: 'Perfect application thickness achieved.',
          timestamp: '2025-06-04T10:15:00Z'
        }
      ]
    },
    {
      id: 'glaze2',
      name: 'Amaco Potter\'s Choice Amber',
      type: 'store-bought',
      status: 'available',
      quantity: 1,
      quantityUnit: 'pint',
      cone: ['5', '6'],
      atmosphere: 'oxidation',
      notes: 'Reliable amber glaze. Good for functional ware. Consistent results every time.',
      tags: ['amber', 'mid-fire', 'food-safe', 'commercial'],
      manufacturer: 'Amaco',
      productCode: 'PC-10',
      createdAt: '2025-05-15T09:00:00Z',
      updatedAt: '2025-05-15T09:00:00Z',
      photos: [
        {
          id: 'photo3',
          url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop',
          type: 'photo',
          caption: 'Commercial amber glaze on mugs',
          notes: 'Consistent color across multiple pieces.',
          timestamp: '2025-05-16T14:20:00Z'
        }
      ]
    },
    {
      id: 'glaze3',
      name: 'Iron Red Experiment',
      type: 'experiment',
      status: 'experiment',
      experimenterName: 'Mike Chen',
      experimentedBy: 'user2',
      testDate: '2025-06-10',
      quantity: 200,
      quantityUnit: 'grams',
      cone: ['6'],
      atmosphere: 'reduction',
      notes: 'Testing iron content variations. Current batch shows promise but needs refinement.',
      tags: ['iron-red', 'experimental', 'high-iron'],
      ingredients: [
        { ingredient: 'Potash Feldspar', quantity: 40, unit: 'g' },
        { ingredient: 'Silica', quantity: 25, unit: 'g' },
        { ingredient: 'Whiting', quantity: 20, unit: 'g' },
        { ingredient: 'Red Iron Oxide', quantity: 15, unit: 'g' }
      ],
      createdAt: '2025-06-10T14:00:00Z',
      updatedAt: '2025-06-10T14:00:00Z',
      photos: [
        {
          id: 'photo4',
          url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=300&fit=crop',
          type: 'photo',
          caption: 'Test tiles showing iron red variations',
          notes: 'Different iron percentages tested.',
          timestamp: '2025-06-11T09:45:00Z'
        }
      ]
    }
  ]);

  // Mock experiments data
  const [experiments] = useState<GlazeExperiment[]>([
    {
      id: 'exp1',
      studioId: context.currentStudio?.id || '',
      name: 'Crystalline Blue Series',
      description: 'Exploring crystalline formations with zinc and titanium',
      glazeType: 'new-recipe',
      recipe: {
        totalBatchWeight: 1000,
        totalBatchUnit: 'grams',
        ingredients: [
          { ingredientId: '1', ingredientName: 'Silica', quantity: 40, unit: 'percentage', notes: 'High silica for crystal formation' },
          { ingredientId: '2', ingredientName: 'Zinc Oxide', quantity: 25, unit: 'percentage' },
          { ingredientId: '3', ingredientName: 'Potash Feldspar', quantity: 20, unit: 'percentage' },
          { ingredientId: '4', ingredientName: 'Titanium Dioxide', quantity: 10, unit: 'percentage' },
          { ingredientId: '5', ingredientName: 'Cobalt Carbonate', quantity: 5, unit: 'percentage' }
        ],
        mixingInstructions: 'Mix dry ingredients thoroughly, add water slowly to create smooth consistency',
        meshSize: 80
      },
      experimentedBy: context.currentUser?.id || '',
      experimenterName: context.currentUser?.name || 'Unknown',
      testDate: '2025-06-15',
      firingDates: ['2025-06-18'],
      cones: ['9', '10'],
      atmospheres: ['oxidation'],
      testResults: [],
      tags: ['crystalline', 'experimental', 'high-fire'],
      status: 'testing',
      isPublic: false,
      averageRating: 0,
      totalQuantityMade: 500,
      quantityUnit: 'grams',
      notes: 'First attempt at crystalline glazes. Promising early results.',
      createdAt: '2025-06-15T10:00:00Z',
      updatedAt: '2025-06-15T10:00:00Z',
      successfulTests: 0,
      totalTests: 1,
      photos: [
        {
          id: 'exp_photo1',
          url: 'https://images.unsplash.com/photo-1594736797933-d0a9ba12feaa?w=400&h=300&fit=crop',
          type: 'photo',
          caption: 'Crystal formation test pieces',
          notes: 'Beautiful crystal formations visible.',
          timestamp: '2025-06-19T16:30:00Z'
        }
      ]
    }
  ]);

  const filteredGlazes = glazes.filter(glaze => {
    const matchesSearch = glaze.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         glaze.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         glaze.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || glaze.status === filterStatus;
    const matchesType = filterType === 'all' || glaze.type === filterType;
    const matchesAtmosphere = filterAtmosphere === 'all' || glaze.atmosphere === filterAtmosphere;

    return matchesSearch && matchesStatus && matchesType && matchesAtmosphere;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'experiment': return 'secondary';
      case 'not-available': return 'destructive';
      default: return 'outline';
    }
  };

  const handleCreateGlaze = () => {
    setEditingGlazeId(null);
    setGlazeForm({
      name: '',
      type: 'experiment',
      status: 'available',
      quantity: 0,
      quantityUnit: 'grams',
      cone: [],
      atmosphere: 'oxidation',
      notes: '',
      tags: [],
      ingredients: [],
      manufacturer: '',
      productCode: '',
      photos: []
    });
    setCurrentView('editor');
  };

  const handleEditGlaze = (glazeId: string) => {
    const glaze = glazes.find(g => g.id === glazeId);
    if (glaze) {
      setEditingGlazeId(glazeId);
      setGlazeForm({
        name: glaze.name,
        type: glaze.type,
        status: glaze.status,
        quantity: glaze.quantity,
        quantityUnit: glaze.quantityUnit,
        cone: glaze.cone,
        atmosphere: glaze.atmosphere,
        notes: glaze.notes,
        tags: glaze.tags,
        ingredients: glaze.ingredients || [],
        manufacturer: glaze.manufacturer || '',
        productCode: glaze.productCode || '',
        photos: glaze.photos || []
      });
      setCurrentView('editor');
    }
  };

  const handleSaveGlaze = () => {
    console.log('Saving glaze:', glazeForm);
    setCurrentView('list');
    setEditingGlazeId(null);
  };

  const handleAddPhoto = (glazeId?: string) => {
    setSelectedGlaze(glazes.find(g => g.id === glazeId) || null);
    setShowPhotoDialog(true);
  };

  const renderEditor = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setCurrentView('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Glazes
          </Button>
          <div>
            <h1 className="flex items-center space-x-3 text-3xl font-semibold">
              <Palette className="w-8 h-8 text-primary" />
              <span>{editingGlazeId ? 'Edit Glaze' : 'New Glaze'}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {editingGlazeId ? 'Update glaze details and recipe' : 'Create a new glaze experiment or add store-bought glaze'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setCurrentView('list')}>
            Cancel
          </Button>
          <Button onClick={handleSaveGlaze}>
            <Save className="w-4 h-4 mr-2" />
            Save Glaze
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Glaze Name *</Label>
              <Input
                value={glazeForm.name}
                onChange={(e) => setGlazeForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Celadon Green or Amaco Potter's Choice"
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={glazeForm.type}
                onValueChange={(value: 'store-bought' | 'experiment') => setGlazeForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="experiment">Experiment/Recipe</SelectItem>
                  <SelectItem value="store-bought">Store Bought</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={glazeForm.notes}
              onChange={(e) => setGlazeForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Test results, color description, application notes, firing observations..."
              rows={4}
            />
          </div>

          {/* Photos Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Photos</Label>
              <Button variant="outline" size="sm" onClick={() => handleAddPhoto()}>
                <Camera className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
            </div>

            {glazeForm.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {glazeForm.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium line-clamp-1">{photo.caption}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{photo.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No photos added yet</p>
                <p className="text-sm">Add photos to document your glaze results</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (currentView === 'editor') {
    return (
      <div className="max-w-6xl mx-auto p-8">
        {renderEditor()}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center space-x-3 text-3xl font-semibold">
            <Palette className="w-8 h-8 text-primary" />
            <span>Glaze Management</span>
          </h1>
          <p className="text-muted-foreground text-lg">Track glazes, experiments, and photo documentation</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => console.log('Export')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateGlaze}>
            <Plus className="w-4 h-4 mr-2" />
            Add Glaze
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-glazes">
            All Glazes
            <Badge variant="secondary" className="ml-2">
              {glazes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="experiments">
            Experiments
            <Badge variant="secondary" className="ml-2">
              {experiments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="photos">
            Photo Gallery
            <Badge variant="secondary" className="ml-2">
              {glazes.reduce((acc, glaze) => acc + (glaze.photos?.length || 0), 0)}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* All Glazes Tab */}
        <TabsContent value="all-glazes" className="space-y-6">
          {/* Filters and Search */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search glazes, notes, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="experiment">Experiment</SelectItem>
                  <SelectItem value="not-available">Not Available</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="experiment">Experiment</SelectItem>
                  <SelectItem value="store-bought">Store Bought</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Glazes Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cone</TableHead>
                  <TableHead>Atmosphere</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGlazes.map((glaze) => (
                  <TableRow key={glaze.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{glaze.name}</div>
                        {glaze.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {glaze.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {glaze.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{glaze.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {glaze.type === 'store-bought' ? 'Store Bought' : 'Experiment'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(glaze.status) as any}>
                        {glaze.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {glaze.quantity} {glaze.quantityUnit}
                    </TableCell>
                    <TableCell>
                      {glaze.cone.map(cone => `Cone ${cone}`).join(', ')}
                    </TableCell>
                    <TableCell className="capitalize">{glaze.atmosphere}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {glaze.photos?.length || 0} photos
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => handleAddPhoto(glaze.id)}>
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditGlaze(glaze.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditGlaze(glaze.id)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Experiments Tab */}
        <TabsContent value="experiments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map((experiment) => (
              <Card key={experiment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{experiment.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {experiment.experimenterName}
                      </p>
                    </div>
                    <Badge variant={experiment.status === 'completed' ? 'default' : 'secondary'}>
                      {experiment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {experiment.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Thermometer className="w-4 h-4 text-muted-foreground" />
                      <span>Cone {experiment.cones.join(', ')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(experiment.testDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {experiment.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {experiment.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{experiment.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {experiment.photos && experiment.photos.length > 0 && (
                    <div className="flex -space-x-2">
                      {experiment.photos.slice(0, 3).map((photo, index) => (
                        <div key={photo.id} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                          <ImageWithFallback
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {experiment.photos.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                          <span className="text-xs">+{experiment.photos.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {glazes.flatMap(glaze =>
              (glaze.photos || []).map(photo => ({
                ...photo,
                glazeName: glaze.name,
                glazeId: glaze.id
              }))
            ).map((photo) => (
              <div key={photo.id} className="space-y-3">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm line-clamp-1">{photo.caption}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {photo.glazeName}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {photo.notes}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(photo.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {glazes.every(glaze => !glaze.photos || glaze.photos.length === 0) && (
            <div className="text-center py-16 space-y-4">
              <Camera className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No photos yet</h3>
                <p className="text-muted-foreground">
                  Start documenting your glazes by adding photos to capture results and variations
                </p>
              </div>
              <Button onClick={handleCreateGlaze}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Glaze
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Photo</DialogTitle>
            <DialogDescription>
              Add a photo to document your glaze results
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input placeholder="https://example.com/photo.jpg" />
            </div>
            <div className="space-y-2">
              <Label>Caption</Label>
              <Input placeholder="e.g., Test tiles showing color variation" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Describe firing conditions, results, observations..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPhotoDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowPhotoDialog(false)}>
                <Save className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}