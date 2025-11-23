"use client"

import { useState } from 'react';
import {
  Flame, Plus, Edit2, Trash2, Search, Filter, Calendar, Clock,
  Thermometer, Users, Package, Settings, Eye, Bell, Download,
  CheckCircle, AlertTriangle, Info, BarChart3, Camera, MapPin,
  Zap, Fuel, User, CheckSquare, Square, MoreHorizontal, UserCheck,
  Play, Pause, RotateCcw, Timer, Gauge, Activity, Video, Monitor,
  Wifi, WifiOff, Battery, BatteryLow, Palette, Wrench, ClipboardList,
  FileText, Copy, Share, Star, TrendingUp, Target, Beaker,
  Layers, BookOpen, PlusCircle, Save, X, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/app/context/AppContext';
import type {
  Kiln, KilnLoad, KilnLoadItem, KilnShelf, FiringSchedule,
  KilnAssignment, CustomFiringType, KilnCamera, RingIntegration,
  KilnFiringTemplate
} from '@/app/context/AppContext';

export default function KilnManagement() {
  const context = useAppContext();
  const [selectedTab, setSelectedTab] = useState('kilns');
  const [selectedKilns, setSelectedKilns] = useState<string[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [showAddKiln, setShowAddKiln] = useState(false);
  const [showKilnDetails, setShowKilnDetails] = useState(false);
  const [showScheduleFiring, setShowScheduleFiring] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedKilnId, setSelectedKilnId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [templateTypeFilter, setTemplateTypeFilter] = useState<string>('all');

  // Form states
  const [newKiln, setNewKiln] = useState<Partial<Kiln>>({
    name: '',
    type: 'electric',
    manufacturer: '',
    model: '',
    locationId: context.currentStudio?.locations?.[0]?.id || '',
    capacity: 20,
    maxTemp: 1300,
    shelfCount: 4,
    isActive: true,
    status: 'available',
    totalFirings: 0,
    notes: ''
  });

  // Firing Schedule state
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [showCreateScheduleDialog, setShowCreateScheduleDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<string>('all');
  const [selectedRacks, setSelectedRacks] = useState<string[]>([]);

  // Available rack numbers
  const availableRacks = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6'
  ];

  const [newKilnTemplate, setNewKilnTemplate] = useState<Partial<KilnFiringTemplate>>({
    kilnId: '',
    name: '',
    description: '',
    baseType: 'bisque',
    atmosphere: 'oxidation',
    estimatedDuration: 8,
    clayCompatibility: [],
    glazeCompatibility: [],
    isDefault: false,
    isActive: true,
    isShared: false,
    version: '1.0',
    temperatureCurve: [
      {
        phase: 'initial',
        targetTemp: 100,
        ratePerHour: 50,
        holdTime: 60,
        notes: 'Initial heating phase'
      },
      {
        phase: 'ramp-up',
        targetTemp: 1000,
        ratePerHour: 120,
        holdTime: 30,
        notes: 'Main firing phase'
      }
    ]
  });

  const handleCreateKiln = () => {
    const kiln: Kiln = {
      id: `kiln_${Date.now()}`,
      studioId: context.currentStudio?.id || '',
      ...newKiln
    } as Kiln;

    console.log('Creating new kiln:', kiln);
    setShowAddKiln(false);
    // Reset form
    setNewKiln({
      name: '',
      type: 'electric',
      manufacturer: '',
      model: '',
      locationId: context.currentStudio?.locations?.[0]?.id || '',
      capacity: 20,
      maxTemp: 1300,
      shelfCount: 4,
      isActive: true,
      status: 'available',
      totalFirings: 0,
      notes: ''
    });
  };

  const handleCreateKilnTemplate = () => {
    console.log('Creating kiln firing template:', newKilnTemplate);
    setShowCreateTemplate(false);
    // Reset form
    setNewKilnTemplate({
      kilnId: '',
      name: '',
      description: '',
      baseType: 'bisque',
      atmosphere: 'oxidation',
      estimatedDuration: 8,
      clayCompatibility: [],
      glazeCompatibility: [],
      isDefault: false,
      isActive: true,
      isShared: false,
      version: '1.0',
      temperatureCurve: [
        {
          phase: 'initial',
          targetTemp: 100,
          ratePerHour: 50,
          holdTime: 60,
          notes: 'Initial heating phase'
        },
        {
          phase: 'ramp-up',
          targetTemp: 1000,
          ratePerHour: 120,
          holdTime: 30,
          notes: 'Main firing phase'
        }
      ]
    });
  };

  const handleViewKilnDetails = (kilnId: string) => {
    setSelectedKilnId(kilnId);
    setShowKilnDetails(true);
  };

  const handleUseTemplate = (templateId: string) => {
    console.log('Using template for firing:', templateId);
    setShowScheduleFiring(true);
    // In a real app, this would populate a firing form with template data
  };

  const handleAddTemperatureCurvePhase = () => {
    setNewKilnTemplate(prev => ({
      ...prev,
      temperatureCurve: [
        ...(prev.temperatureCurve || []),
        {
          phase: 'ramp-up',
          targetTemp: 500,
          ratePerHour: 100,
          holdTime: 0,
          notes: ''
        }
      ]
    }));
  };

  const handleUpdateTemperatureCurvePhase = (index: number, field: string, value: any) => {
    setNewKilnTemplate(prev => ({
      ...prev,
      temperatureCurve: prev.temperatureCurve?.map((phase, i) =>
        i === index ? { ...phase, [field]: value } : phase
      ) || []
    }));
  };

  const handleRemoveTemperatureCurvePhase = (index: number) => {
    setNewKilnTemplate(prev => ({
      ...prev,
      temperatureCurve: prev.temperatureCurve?.filter((_, i) => i !== index) || []
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'loading': return 'secondary';
      case 'firing': return 'destructive';
      case 'cooling': return 'secondary';
      case 'maintenance': return 'secondary';
      case 'out-of-service': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredKilns = context.currentStudio?.kilns?.filter(kiln => {
    const matchesSearch = kiln.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kiln.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || kiln.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const filteredTemplates = context.currentStudio?.kilnFiringTemplates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(templateSearchTerm.toLowerCase());
    const matchesType = templateTypeFilter === 'all' || template.baseType === templateTypeFilter;
    return matchesSearch && matchesType && template.isActive;
  }) || [];

  // Mock firing schedules for the schedule tab
  const mockFiringSchedules: FiringSchedule[] = [
    {
      id: '1',
      date: '2025-07-10',
      type: 'Bisque',
      temperature: '1000°C',
      capacity: 20,
      bookedSlots: 15,
      notes: 'Standard bisque firing - Racks: A1, A2, A3, B1, B2',
      status: 'scheduled',
      kilnId: 'kiln1',
      startTime: '09:00',
      endTime: '18:00',
      locationId: 'loc1',
      assignedEmployeeId: 'emp1'
    },
    {
      id: '2',
      date: '2025-07-12',
      type: 'Glaze',
      temperature: '1280°C',
      capacity: 15,
      bookedSlots: 8,
      notes: 'High-fire reduction glaze - Racks: C1, C2, C3',
      status: 'scheduled',
      kilnId: 'kiln2',
      startTime: '08:00',
      endTime: '20:00',
      locationId: 'loc1',
      assignedEmployeeId: 'emp2'
    },
    {
      id: '3',
      date: '2025-07-08',
      type: 'Bisque',
      temperature: '980°C',
      capacity: 20,
      bookedSlots: 18,
      notes: 'Large member bisque load - Racks: A1, A2, A3, A4, B1, B2, B3, B4',
      status: 'in-progress',
      kilnId: 'kiln1',
      startTime: '10:00',
      endTime: '19:00',
      locationId: 'loc1',
      assignedEmployeeId: 'emp1'
    }
  ];

  // Mock operators/staff
  const operators = [
    { id: 'emp1', name: 'Mike Chen', role: 'Lead Kiln Operator' },
    { id: 'emp2', name: 'Sarah Wilson', role: 'Studio Manager' },
    { id: 'emp3', name: 'David Park', role: 'Kiln Technician' }
  ];

  const filteredSchedules = mockFiringSchedules.filter(schedule => {
    const matchesSearch = schedule.type.toLowerCase().includes(scheduleSearchTerm.toLowerCase()) ||
                         schedule.notes?.toLowerCase().includes(scheduleSearchTerm.toLowerCase());
    const matchesStatus = scheduleStatusFilter === 'all' || schedule.status === scheduleStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectSchedule = (scheduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedSchedules(prev => [...prev, scheduleId]);
    } else {
      setSelectedSchedules(prev => prev.filter(id => id !== scheduleId));
    }
  };

  const handleSelectAllSchedules = (checked: boolean) => {
    if (checked) {
      setSelectedSchedules(filteredSchedules.map(s => s.id));
    } else {
      setSelectedSchedules([]);
    }
  };

  const handleSendNotifications = () => {
    console.log('Sending notifications for schedules:', selectedSchedules);
    setShowNotificationDialog(false);
    setSelectedSchedules([]);
  };

  const getScheduleStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'in-progress': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleRackToggle = (rackNumber: string) => {
    setSelectedRacks(prev =>
      prev.includes(rackNumber)
        ? prev.filter(r => r !== rackNumber)
        : [...prev, rackNumber]
    );
  };

  const handleSelectAllRacks = () => {
    setSelectedRacks(prev =>
      prev.length === availableRacks.length ? [] : [...availableRacks]
    );
  };

  const handleCreateSchedule = () => {
    console.log('Creating firing schedule with racks:', selectedRacks);
    setShowCreateScheduleDialog(false);
    setSelectedRacks([]);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center space-x-3 text-3xl font-semibold">
            <Flame className="w-8 h-8 text-primary" />
            <span>Kiln Management</span>
          </h1>
          <p className="text-muted-foreground text-lg">Manage kilns, firing schedules, templates, and monitoring</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kilns">Kilns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Kilns Tab */}
        <TabsContent value="kilns" className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search kilns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="loading">Loading</SelectItem>
                  <SelectItem value="firing">Firing</SelectItem>
                  <SelectItem value="cooling">Cooling</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out-of-service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddKiln} onOpenChange={setShowAddKiln}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Kiln
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Kiln</DialogTitle>
                  <DialogDescription>
                    Add a new kiln to your studio inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kiln Name</Label>
                      <Input
                        value={newKiln.name}
                        onChange={(e) => setNewKiln(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Studio Kiln 1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newKiln.type}
                        onValueChange={(value) => setNewKiln(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="gas">Gas</SelectItem>
                          <SelectItem value="wood">Wood</SelectItem>
                          <SelectItem value="raku">Raku</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Manufacturer</Label>
                      <Input
                        value={newKiln.manufacturer}
                        onChange={(e) => setNewKiln(prev => ({ ...prev, manufacturer: e.target.value }))}
                        placeholder="e.g., L&L Kiln"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input
                        value={newKiln.model}
                        onChange={(e) => setNewKiln(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="e.g., Jupiter 2327"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Capacity (pieces)</Label>
                      <Input
                        type="number"
                        value={newKiln.capacity}
                        onChange={(e) => setNewKiln(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Temperature (°C)</Label>
                      <Input
                        type="number"
                        value={newKiln.maxTemp}
                        onChange={(e) => setNewKiln(prev => ({ ...prev, maxTemp: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Shelf Count</Label>
                      <Input
                        type="number"
                        value={newKiln.shelfCount}
                        onChange={(e) => setNewKiln(prev => ({ ...prev, shelfCount: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select
                      value={newKiln.locationId}
                      onValueChange={(value) => setNewKiln(prev => ({ ...prev, locationId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {context.currentStudio?.locations.map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newKiln.notes}
                      onChange={(e) => setNewKiln(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this kiln..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setShowAddKiln(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKiln}>
                      <Save className="w-4 h-4 mr-2" />
                      Add Kiln
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Kilns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredKilns.map((kiln) => (
              <Card key={kiln.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{kiln.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {kiln.type}
                        </Badge>
                        <Badge variant={getStatusBadge(kiln.status) as any}>
                          {kiln.status}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewKilnDetails(kiln.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Kiln
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Firing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Wrench className="w-4 h-4 mr-2" />
                          Maintenance
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Capacity</span>
                      <p className="font-medium">{kiln.capacity} pieces</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Max Temp</span>
                      <p className="font-medium">{kiln.maxTemp}°C</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Shelves</span>
                      <p className="font-medium">{kiln.shelfCount}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Total Firings</span>
                      <p className="font-medium">{kiln.totalFirings}</p>
                    </div>
                  </div>

                  {kiln.notes && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Notes</span>
                      <p className="text-sm">{kiln.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewKilnDetails(kiln.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Start Firing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={templateSearchTerm}
                  onChange={(e) => setTemplateSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={templateTypeFilter} onValueChange={setTemplateTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bisque">Bisque</SelectItem>
                  <SelectItem value="glaze">Glaze</SelectItem>
                  <SelectItem value="raku">Raku</SelectItem>
                  <SelectItem value="crystalline">Crystalline</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Kiln Firing Template</DialogTitle>
                  <DialogDescription>
                    Create a firing template optimized for a specific kiln with detailed temperature curves and compatibility settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-8">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="curve">Temperature Curve</TabsTrigger>
                      <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                      <div className="space-y-2">
                        <Label>Select Kiln</Label>
                        <Select
                          value={newKilnTemplate.kilnId}
                          onValueChange={(value) => setNewKilnTemplate(prev => ({ ...prev, kilnId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose kiln" />
                          </SelectTrigger>
                          <SelectContent>
                            {context.currentStudio?.kilns?.map((kiln) => (
                              <SelectItem key={kiln.id} value={kiln.id}>
                                {kiln.name} ({kiln.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Template Name</Label>
                          <Input
                            value={newKilnTemplate.name}
                            onChange={(e) => setNewKilnTemplate(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Electric Bisque Standard"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Base Type</Label>
                          <Select
                            value={newKilnTemplate.baseType}
                            onValueChange={(value) => setNewKilnTemplate(prev => ({ ...prev, baseType: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bisque">Bisque</SelectItem>
                              <SelectItem value="glaze">Glaze</SelectItem>
                              <SelectItem value="raku">Raku</SelectItem>
                              <SelectItem value="crystalline">Crystalline</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newKilnTemplate.description}
                          onChange={(e) => setNewKilnTemplate(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe this firing template..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Atmosphere</Label>
                          <Select
                            value={newKilnTemplate.atmosphere}
                            onValueChange={(value) => setNewKilnTemplate(prev => ({ ...prev, atmosphere: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oxidation">Oxidation</SelectItem>
                              <SelectItem value="reduction">Reduction</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Estimated Duration (hours)</Label>
                          <Input
                            type="number"
                            value={newKilnTemplate.estimatedDuration}
                            onChange={(e) => setNewKilnTemplate(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="curve" className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">Temperature Curve</h3>
                          <p className="text-muted-foreground">Define the firing phases and temperature progression</p>
                        </div>
                        <Button onClick={handleAddTemperatureCurvePhase}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Phase
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {newKilnTemplate.temperatureCurve?.map((phase, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Phase {index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTemperatureCurvePhase(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Phase Type</Label>
                                <Select
                                  value={phase.phase}
                                  onValueChange={(value) => handleUpdateTemperatureCurvePhase(index, 'phase', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="initial">Initial</SelectItem>
                                    <SelectItem value="ramp-up">Ramp Up</SelectItem>
                                    <SelectItem value="soak">Soak</SelectItem>
                                    <SelectItem value="cool-down">Cool Down</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Target Temperature (°C)</Label>
                                <Input
                                  type="number"
                                  value={phase.targetTemp}
                                  onChange={(e) => handleUpdateTemperatureCurvePhase(index, 'targetTemp', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Rate Per Hour (°C/h)</Label>
                                <Input
                                  type="number"
                                  value={phase.ratePerHour}
                                  onChange={(e) => handleUpdateTemperatureCurvePhase(index, 'ratePerHour', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Hold Time (minutes)</Label>
                                <Input
                                  type="number"
                                  value={phase.holdTime}
                                  onChange={(e) => handleUpdateTemperatureCurvePhase(index, 'holdTime', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Notes</Label>
                              <Input
                                value={phase.notes}
                                onChange={(e) => handleUpdateTemperatureCurvePhase(index, 'notes', e.target.value)}
                                placeholder="Phase-specific notes..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="compatibility" className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label>Clay Compatibility</Label>
                          <div className="grid grid-cols-3 gap-3">
                            {['Stoneware', 'Earthenware', 'Porcelain', 'Paper Clay', 'Sculpture Clay'].map((clay) => (
                              <div key={clay} className="flex items-center space-x-2">
                                <Checkbox
                                  id={clay}
                                  checked={newKilnTemplate.clayCompatibility?.includes(clay)}
                                  onCheckedChange={(checked) => {
                                    const current = newKilnTemplate.clayCompatibility || [];
                                    if (checked) {
                                      setNewKilnTemplate(prev => ({
                                        ...prev,
                                        clayCompatibility: [...current, clay]
                                      }));
                                    } else {
                                      setNewKilnTemplate(prev => ({
                                        ...prev,
                                        clayCompatibility: current.filter(c => c !== clay)
                                      }));
                                    }
                                  }}
                                />
                                <Label htmlFor={clay}>{clay}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>Glaze Compatibility</Label>
                          <div className="grid grid-cols-3 gap-3">
                            {context.currentStudio?.glazes?.slice(0, 9).map((glaze) => (
                              <div key={glaze} className="flex items-center space-x-2">
                                <Checkbox
                                  id={glaze}
                                  checked={newKilnTemplate.glazeCompatibility?.includes(glaze)}
                                  onCheckedChange={(checked) => {
                                    const current = newKilnTemplate.glazeCompatibility || [];
                                    if (checked) {
                                      setNewKilnTemplate(prev => ({
                                        ...prev,
                                        glazeCompatibility: [...current, glaze]
                                      }));
                                    } else {
                                      setNewKilnTemplate(prev => ({
                                        ...prev,
                                        glazeCompatibility: current.filter(g => g !== glaze)
                                      }));
                                    }
                                  }}
                                />
                                <Label htmlFor={glaze}>{glaze}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between py-3">
                          <div className="space-y-1">
                            <Label>Default Template</Label>
                            <p className="text-sm text-muted-foreground">
                              Set as default for this kiln and firing type
                            </p>
                          </div>
                          <Switch
                            checked={newKilnTemplate.isDefault}
                            onCheckedChange={(checked) => setNewKilnTemplate(prev => ({ ...prev, isDefault: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between py-3">
                          <div className="space-y-1">
                            <Label>Share Template</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow other studios to use this template
                            </p>
                          </div>
                          <Switch
                            checked={newKilnTemplate.isShared}
                            onCheckedChange={(checked) => setNewKilnTemplate(prev => ({ ...prev, isShared: checked }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Safety Notes</Label>
                          <Textarea
                            value={newKilnTemplate.safetyNotes}
                            onChange={(e) => setNewKilnTemplate(prev => ({ ...prev, safetyNotes: e.target.value }))}
                            placeholder="Important safety considerations for this firing..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Kiln-Specific Instructions</Label>
                          <Textarea
                            value={newKilnTemplate.kilnSpecificInstructions}
                            onChange={(e) => setNewKilnTemplate(prev => ({ ...prev, kilnSpecificInstructions: e.target.value }))}
                            placeholder="Instructions specific to this kiln..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKilnTemplate}>
                      <Save className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No templates yet</h3>
                <p className="text-muted-foreground">
                  Create your first firing template to get started
                </p>
              </div>
              <Button onClick={() => setShowCreateTemplate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const kiln = context.currentStudio?.kilns?.find(k => k.id === template.kilnId);
                const successRate = template.averageSuccessRate || 0;

                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            {template.isDefault && (
                              <Badge variant="default" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="capitalize">
                              {template.baseType}
                            </Badge>
                            <span>•</span>
                            <span className="capitalize">{template.atmosphere}</span>
                            <span>•</span>
                            <span>{template.estimatedDuration}h</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTemplateId(template.id);
                              setShowTemplateDetails(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Template
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="w-4 h-4 mr-2" />
                              Share Template
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Kiln Information */}
                      <div className="flex items-center space-x-2 text-sm">
                        <Flame className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{kiln?.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {kiln?.type}
                        </Badge>
                      </div>

                      {/* Description */}
                      {template.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-muted-foreground">Success Rate</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={successRate} className="flex-1 h-2" />
                            <span className="font-medium">{successRate.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Target className="w-3 h-3 text-blue-500" />
                            <span className="text-muted-foreground">Usage</span>
                          </div>
                          <p className="font-medium">{template.usageCount} firings</p>
                        </div>
                      </div>

                      {/* Temperature Range */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1 text-sm">
                          <Thermometer className="w-4 h-4 text-orange-500" />
                          <span className="text-muted-foreground">Temperature Range</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">
                            {Math.min(...template.temperatureCurve.map(c => c.targetTemp))}°C - {Math.max(...template.temperatureCurve.map(c => c.targetTemp))}°C
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 pt-2 border-t">
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedTemplateId(template.id);
                          setShowTemplateDetails(true);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => handleUseTemplate(template.id)}>
                          <Play className="w-4 h-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-8">
          {/* Schedule Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search firing schedules..."
                  value={scheduleSearchTerm}
                  onChange={(e) => setScheduleSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={scheduleStatusFilter} onValueChange={setScheduleStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              {selectedSchedules.length > 0 && (
                <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Send Notifications ({selectedSchedules.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Notifications</DialogTitle>
                      <DialogDescription>
                        Send notifications for {selectedSchedules.length} selected firing schedules
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Notification Type</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="reminder" defaultChecked />
                            <Label htmlFor="reminder">Firing start reminder</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="completion" defaultChecked />
                            <Label htmlFor="completion">Completion alert</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="operator" defaultChecked />
                            <Label htmlFor="operator">Notify operators</Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendNotifications}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Notifications
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Dialog open={showCreateScheduleDialog} onOpenChange={setShowCreateScheduleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Firing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Schedule New Firing</DialogTitle>
                    <DialogDescription>
                      Create a new firing schedule for your kilns and select rack assignments
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Firing Name</Label>
                        <Input placeholder="e.g., Morning Bisque Load" />
                      </div>
                      <div className="space-y-2">
                        <Label>Kiln</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select kiln" />
                          </SelectTrigger>
                          <SelectContent>
                            {context.currentStudio?.kilns?.map(kiln => (
                              <SelectItem key={kiln.id} value={kiln.id}>
                                {kiln.name} ({kiln.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input type="time" />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input type="time" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Firing Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bisque">Bisque</SelectItem>
                            <SelectItem value="glaze">Glaze</SelectItem>
                            <SelectItem value="raku">Raku</SelectItem>
                            <SelectItem value="crystalline">Crystalline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(operator => (
                              <SelectItem key={operator.id} value={operator.id}>
                                {operator.name} - {operator.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Rack Selection Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Select Rack Numbers for This Firing</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllRacks}
                        >
                          {selectedRacks.length === availableRacks.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                        {availableRacks.map(rack => (
                          <div key={rack} className="flex items-center space-x-2">
                            <Checkbox
                              id={rack}
                              checked={selectedRacks.includes(rack)}
                              onCheckedChange={() => handleRackToggle(rack)}
                            />
                            <Label htmlFor={rack} className="text-sm font-mono">
                              {rack}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {selectedRacks.length > 0 && (
                        <div className="space-y-2">
                          <Label>Selected Racks ({selectedRacks.length})</Label>
                          <div className="flex flex-wrap gap-1">
                            {selectedRacks.map(rack => (
                              <Badge key={rack} variant="secondary" className="text-xs font-mono">
                                {rack}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() => handleRackToggle(rack)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Special instructions, notes about this firing..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => {
                        setShowCreateScheduleDialog(false);
                        setSelectedRacks([]);
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSchedule}>
                        <Save className="w-4 h-4 mr-2" />
                        Schedule Firing
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {selectedSchedules.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{selectedSchedules.length} selected</span>
            </div>
          )}

          {/* Schedules Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSchedules.length === filteredSchedules.length && filteredSchedules.length > 0}
                      onCheckedChange={handleSelectAllSchedules}
                    />
                  </TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Kiln</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Racks</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => {
                  const kiln = context.currentStudio?.kilns?.find(k => k.id === schedule.kilnId);
                  const operator = operators.find(op => op.id === schedule.assignedEmployeeId);

                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSchedules.includes(schedule.id)}
                          onCheckedChange={(checked) => handleSelectSchedule(schedule.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {new Date(schedule.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {schedule.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{kiln?.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {kiln?.type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.temperature}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{operator?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {operator?.role}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {schedule.notes && schedule.notes.includes('Racks:') ? (
                            <div className="flex flex-wrap gap-1">
                              {schedule.notes.split('Racks: ')[1]?.split(' - ')[0]?.split(', ')?.slice(0, 3).map(rack => (
                                <Badge key={rack} variant="outline" className="text-xs font-mono">
                                  {rack.trim()}
                                </Badge>
                              ))}
                              {schedule.notes.split('Racks: ')[1]?.split(' - ')[0]?.split(', ')?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{schedule.notes.split('Racks: ')[1]?.split(' - ')[0]?.split(', ')?.length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No racks specified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{schedule.bookedSlots}/{schedule.capacity}</div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(schedule.bookedSlots / schedule.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getScheduleStatusBadge(schedule.status) as any}>
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Bell className="w-4 h-4 mr-2" />
                              Send Notification
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancel Firing
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredSchedules.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No firing schedules found</h3>
                <p className="text-muted-foreground">
                  {scheduleSearchTerm || scheduleStatusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start by scheduling your first firing'
                  }
                </p>
              </div>
              {!scheduleSearchTerm && scheduleStatusFilter === 'all' && (
                <Button onClick={() => setShowCreateScheduleDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule First Firing
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-8">
          <div className="text-center py-16 space-y-4">
            <Monitor className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Kiln Monitoring</h3>
              <p className="text-muted-foreground">
                Real-time kiln monitoring and camera feeds
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Kiln Details Dialog */}
      <Dialog open={showKilnDetails} onOpenChange={setShowKilnDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Kiln Details</DialogTitle>
            <DialogDescription>
              View detailed information about this kiln
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center py-8">
              <Flame className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Kiln Details View</h3>
              <p className="text-muted-foreground">
                Detailed kiln information would be displayed here
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowKilnDetails(false)}>
                Close
              </Button>
              <Button>
                Edit Kiln
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Details Dialog */}
      <Dialog open={showTemplateDetails} onOpenChange={setShowTemplateDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Details</DialogTitle>
            <DialogDescription>
              View and edit detailed firing template information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Template Details View</h3>
              <p className="text-muted-foreground">
                Detailed template editor would be here
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTemplateDetails(false)}>
                Close
              </Button>
              <Button>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Firing Dialog */}
      <Dialog open={showScheduleFiring} onOpenChange={setShowScheduleFiring}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Firing</DialogTitle>
            <DialogDescription>
              Schedule a new firing session using the selected template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Firing Schedule Form</h3>
              <p className="text-muted-foreground">
                Firing scheduling interface would be here
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowScheduleFiring(false)}>
                Cancel
              </Button>
              <Button>
                Schedule Firing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}