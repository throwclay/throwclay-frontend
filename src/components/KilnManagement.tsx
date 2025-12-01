import { useEffect, useState } from 'react';
import { 
  Flame, Plus, Edit2, Trash2, Search, Filter, Calendar, Clock, 
  Thermometer, Users, Package, Settings, Eye, Bell, Download,
  CheckCircle, AlertTriangle, Info, BarChart3, Camera, MapPin,
  Zap, Fuel, User, CheckSquare, Square, MoreHorizontal, UserCheck,
  Play, Pause, RotateCcw, Timer, Gauge, Activity, Video, Monitor,
  Wifi, WifiOff, Battery, BatteryLow, Palette, Wrench, ClipboardList,
  FileText, Copy, Share, Star, TrendingUp, Target, Beaker,
  Layers, BookOpen, PlusCircle, Save, X, Send, Calculator
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Slider } from './ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAppContext } from '@/app/context/AppContext';
import type { 
  Kiln, KilnLoad, KilnLoadItem, KilnShelf, 
  KilnAssignment, CustomFiringType, KilnCamera, RingIntegration,
  KilnFiringTemplate
} from '@/types';
import {
  calculateTotalCapacity,
  calculateOptimalShelfConfig,
  PIECE_SIZE_PRESETS,
  type CapacityCalculation
} from '@/lib/utils/kilnCalculations';
import { toast } from 'sonner';

export function KilnManagement() {
  const { currentStudio, authToken } = useAppContext();
  const [selectedTab, setSelectedTab] = useState('kilns');
  const [selectedKilns, setSelectedKilns] = useState<string[]>([]);
  const [kilns, setKilns] = useState<any[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [showAddKiln, setShowAddKiln] = useState(false);
  const [showKilnDetails, setShowKilnDetails] = useState(false);
  const [showScheduleFiring, setShowScheduleFiring] = useState(false);
  const [showQuickStartFiring, setShowQuickStartFiring] = useState(false);
  const [showScheduledFiringSelection, setShowScheduledFiringSelection] = useState(false);
  const [scheduledFiringsForKiln, setScheduledFiringsForKiln] = useState<any[]>([]);
  const [quickStartKilnId, setQuickStartKilnId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedKilnId, setSelectedKilnId] = useState<string>('');
  const [kilnFiringTemplates, setKilnFiringTemplates] = useState<any[]>([]);
  
  // Quick-start firing form state
  const [quickStartForm, setQuickStartForm] = useState({
    name: '',
    templateId: '',
    atmosphere: 'oxidation' as 'oxidation' | 'reduction' | 'neutral',
    targetCone: '',
    targetTemperature: '',
    notes: '',
    operatorId: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [templateTypeFilter, setTemplateTypeFilter] = useState<string>('all');

  // Form states
  const [newKiln, setNewKiln] = useState<Partial<Kiln>>({
    name: '',
    type: 'electric',
    manufacturer: '',
    model: '',
    serialNumber: '',
    locationId: currentStudio?.locations?.[0]?.id || '',
    capacity: 20,
    maxTemp: 1300,
    shelfCount: 4,
    isActive: true,
    status: 'available',
    totalFirings: 0,
    notes: '',
    shelfConfiguration: [],
    specifications: {},
    installDate: undefined,
    warrantyExpiry: undefined,
    maintenanceSchedule: undefined,
  });

  // Enhanced form states for capacity calculator
  const [shelfDimensions, setShelfDimensions] = useState({
    width: 24,
    depth: 24,
    height: 10,
    totalKilnHeight: 36,
    shelfThickness: 1,
  });
  const [selectedPieceSize, setSelectedPieceSize] = useState<'small' | 'medium' | 'large' | 'extraLarge' | 'custom'>('medium');
  const [customPieceSize, setCustomPieceSize] = useState({ width: 6, depth: 6, height: 8 });
  const [capacityCalculation, setCapacityCalculation] = useState<CapacityCalculation | null>(null);
  const [showCapacityCalculator, setShowCapacityCalculator] = useState(false);
  const [autoCalculateCapacity, setAutoCalculateCapacity] = useState(true);
  
  // Maintenance schedule state
  const [maintenanceScheduleType, setMaintenanceScheduleType] = useState<'firings' | 'time' | 'both'>('time');
  const [maintenanceInterval, setMaintenanceInterval] = useState<number>(180); // days or firings
  const [interiorDimensions, setInteriorDimensions] = useState({
    width: 24,
    depth: 24,
    height: 36,
  });

  // Firing Schedule state
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [showCreateScheduleDialog, setShowCreateScheduleDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<string>('all');
  const [selectedRacks, setSelectedRacks] = useState<string[]>([]);
  const [firingSchedules, setFiringSchedules] = useState<any[]>([]);

  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    kilnId: '',
    date: '',
    startTime: '',
    endTime: '',
    firingType: '',
    operatorId: '',
    locationId: currentStudio?.locations?.[0]?.id || '',
    temperature: '',
    notes: '',
  });

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

  // Load kilns & firings from backend when studio/auth token available
  useEffect(() => {
    if (!currentStudio?.id || !authToken) {
      setKilns([]);
      setFiringSchedules([]);
      return;
    }

    let cancelled = false;

    async function loadKilns() {
      try {
        const res = await fetch(
          `/api/admin/studios/${currentStudio?.id}/kilns`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error('Failed to load kilns', await res.text());
          if (!cancelled) setKilns([]);
          return;
        }

        const body = await res.json();
        if (!cancelled) {
          setKilns(body.kilns ?? []);
        }
      } catch (err) {
        console.error('Error loading kilns', err);
        if (!cancelled) setKilns([]);
      }
    }

    async function loadFirings() {
      try {
        const res = await fetch(
          `/api/admin/studios/${currentStudio?.id}/kiln-firings`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error('Failed to load kiln firings', await res.text());
          if (!cancelled) setFiringSchedules([]);
          return;
        }

        const body = await res.json();
        if (!cancelled) {
          setFiringSchedules(body.firings ?? []);
        }
      } catch (err) {
        console.error('Error loading kiln firings', err);
        if (!cancelled) setFiringSchedules([]);
      }
    }

    async function loadStaff() {
      try {
        const res = await fetch(
          `/api/admin/studios/${currentStudio?.id}/staff`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!res.ok) {
          console.error('Failed to load staff', await res.text());
          if (!cancelled) setStaff([]);
          return;
        }

        const body = await res.json();
        if (!cancelled) {
          setStaff(body.staff ?? []);
        }
      } catch (err) {
        console.error('Error loading staff', err);
        if (!cancelled) setStaff([]);
      }
    }

    loadKilns();
    loadFirings();
    loadStaff();

    return () => {
      cancelled = true;
    };
  }, [currentStudio?.id, authToken]);

  // Capacity calculation handler
  const handleCalculateCapacity = () => {
    try {
      const pieceSize = selectedPieceSize === 'custom' 
        ? customPieceSize 
        : selectedPieceSize;
      
      const calculation = calculateTotalCapacity(
        newKiln.shelfCount || 4,
        {
          width: shelfDimensions.width,
          depth: shelfDimensions.depth,
          height: shelfDimensions.height,
        },
        pieceSize as any
      );
      
      setCapacityCalculation(calculation);
      // Auto-update capacity in form
      setNewKiln(prev => ({ ...prev, capacity: calculation.totalCapacity }));
    } catch (error) {
      console.error('Error calculating capacity:', error);
    }
  };

  // Auto-calculate capacity when dimensions change (if auto-calculate is enabled)
  useEffect(() => {
    if (autoCalculateCapacity && newKiln.shelfCount && shelfDimensions.width && shelfDimensions.depth) {
      const pieceSize = selectedPieceSize === 'custom' 
        ? customPieceSize 
        : selectedPieceSize;
      
      try {
        const calculation = calculateTotalCapacity(
          newKiln.shelfCount,
          {
            width: shelfDimensions.width,
            depth: shelfDimensions.depth,
            height: shelfDimensions.height,
          },
          pieceSize as any
        );
        
        setCapacityCalculation(calculation);
        setNewKiln(prev => ({ ...prev, capacity: calculation.totalCapacity }));
      } catch (error) {
        // Silently fail for auto-calculations
      }
    }
  }, [
    autoCalculateCapacity,
    newKiln.shelfCount,
    shelfDimensions.width,
    shelfDimensions.depth,
    shelfDimensions.height,
    selectedPieceSize,
    customPieceSize.width,
    customPieceSize.depth,
    customPieceSize.height,
  ]);

  // Auto-generate shelf configuration
  const handleAutoGenerateShelves = () => {
    if (!shelfDimensions.totalKilnHeight) return;
    
    const config = calculateOptimalShelfConfig(
      shelfDimensions.totalKilnHeight,
      shelfDimensions.shelfThickness
    );
    
    setNewKiln(prev => ({
      ...prev,
      shelfCount: config.shelfCount,
      shelfConfiguration: config.shelves.map(shelf => ({
        level: shelf.level,
        height: shelf.height,
        capacity: 0, // Will be calculated
      })),
    }));
    
    // Update shelf dimensions height to average
    setShelfDimensions(prev => ({
      ...prev,
      height: config.averageShelfHeight,
    }));
  };

  const handleCreateKiln = async () => {
    if (!currentStudio?.id || !authToken) {
      console.error('Cannot create kiln: missing studio or auth token');
      return;
    }

    try {
      const res = await fetch(`/api/admin/studios/${currentStudio.id}/kilns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newKiln.name,
          type: newKiln.type,
          manufacturer: newKiln.manufacturer,
          model: newKiln.model,
          serialNumber: newKiln.serialNumber,
          locationId: newKiln.locationId,
          capacity: newKiln.capacity,
          maxTemp: newKiln.maxTemp,
          shelfCount: newKiln.shelfCount,
          shelfConfiguration: newKiln.shelfConfiguration,
          specifications: newKiln.specifications,
          installDate: newKiln.installDate,
          warrantyExpiry: newKiln.warrantyExpiry,
          maintenanceSchedule: newKiln.maintenanceSchedule,
          status: newKiln.status,
          isActive: newKiln.isActive,
          notes: newKiln.notes,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to create kiln', errorText);
        toast.error('Failed to create kiln', {
          description: 'Please check all required fields and try again.',
        });
        return;
      }

      const result = await res.json();
      console.log('Created kiln', result);
      
      // Refresh kilns from backend
      try {
        const refreshRes = await fetch(
          `/api/admin/studios/${currentStudio.id}/kilns`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (refreshRes.ok) {
          const body = await refreshRes.json();
          setKilns(body.kilns ?? []);
        }
      } catch (err) {
        console.error('Error refreshing kilns', err);
      }
      
      toast.success('Kiln created successfully', {
        description: `${newKiln.name} has been added to your studio.`,
      });
      
      setShowAddKiln(false);
      setNewKiln({
        name: '',
        type: 'electric',
        manufacturer: '',
        model: '',
        serialNumber: '',
        locationId: currentStudio?.locations?.[0]?.id || '',
        capacity: 20,
        maxTemp: 1300,
        shelfCount: 4,
        isActive: true,
        status: 'available',
        totalFirings: 0,
        notes: '',
        shelfConfiguration: [],
        specifications: {},
      });
      // Reset capacity calculator
      setCapacityCalculation(null);
      setShelfDimensions({
        width: 24,
        depth: 24,
        height: 10,
        totalKilnHeight: 36,
        shelfThickness: 1,
      });
      setSelectedPieceSize('medium');
      setShowCapacityCalculator(false);
    } catch (err) {
      console.error('Error creating kiln', err);
      toast.error('Error creating kiln', {
        description: 'An unexpected error occurred. Please try again.',
      });
    }
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

  const [isEditingKiln, setIsEditingKiln] = useState(false);
  const [editingKiln, setEditingKiln] = useState<Partial<Kiln> | null>(null);
  const [editingShelfDimensions, setEditingShelfDimensions] = useState({
    width: 24,
    depth: 24,
    height: 10,
    totalKilnHeight: 36,
    shelfThickness: 1,
  });

  const handleViewKilnDetails = (kilnId: string) => {
    const kiln = kilns.find((k: any) => k.id === kilnId);
    if (kiln) {
    setSelectedKilnId(kilnId);
      setEditingKiln({ ...kiln });
      // Extract shelf dimensions if available
      if (kiln.shelfConfiguration && kiln.shelfConfiguration.length > 0) {
        const firstShelf = kiln.shelfConfiguration[0];
        setEditingShelfDimensions(prev => ({
          ...prev,
          height: firstShelf.height || prev.height,
        }));
      }
      setIsEditingKiln(false);
    setShowKilnDetails(true);
    }
  };

  const handleUpdateKiln = async () => {
    if (!currentStudio?.id || !authToken || !editingKiln?.id) {
      console.error('Cannot update kiln: missing studio, auth token, or kiln ID');
      return;
    }

    try {
      const res = await fetch(`/api/admin/studios/${currentStudio.id}/kilns/${editingKiln.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: editingKiln.name,
          type: editingKiln.type,
          manufacturer: editingKiln.manufacturer,
          model: editingKiln.model,
          serialNumber: editingKiln.serialNumber,
          locationId: editingKiln.locationId,
          capacity: editingKiln.capacity,
          maxTemp: editingKiln.maxTemp,
          shelfCount: editingKiln.shelfCount,
          shelfConfiguration: editingKiln.shelfConfiguration,
          specifications: editingKiln.specifications,
          installDate: editingKiln.installDate,
          warrantyExpiry: editingKiln.warrantyExpiry,
          maintenanceSchedule: editingKiln.maintenanceSchedule,
          status: editingKiln.status,
          isActive: editingKiln.isActive,
          notes: editingKiln.notes,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to update kiln', errorText);
        toast.error('Failed to update kiln', {
          description: 'Please check all required fields and try again.',
        });
        return;
      }

      const result = await res.json();
      console.log('Updated kiln', result);

      // Refresh kilns from backend
      try {
        const refreshRes = await fetch(
          `/api/admin/studios/${currentStudio.id}/kilns`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (refreshRes.ok) {
          const body = await refreshRes.json();
          setKilns(body.kilns ?? []);
        }
      } catch (err) {
        console.error('Error refreshing kilns', err);
      }
      
      toast.success('Kiln updated successfully', {
        description: `${editingKiln.name} has been updated.`,
      });
      
      setIsEditingKiln(false);
      setShowKilnDetails(false);
    } catch (err) {
      console.error('Error updating kiln', err);
      toast.error('Error updating kiln', {
        description: 'An unexpected error occurred. Please try again.',
      });
    }
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
      case 'in-use': return 'secondary';
      case 'loading': return 'secondary';
      case 'firing': return 'destructive';
      case 'cooling': return 'secondary';
      case 'maintenance': return 'secondary';
      case 'out-of-service': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredKilns = kilns.filter((kiln) => {
    const matchesSearch = kiln.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kiln.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || kiln.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || kiln.locationId === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Templates would be loaded separately - for now use empty array
  const filteredTemplates: any[] = [];

  // Staff/operators state
  const [staff, setStaff] = useState<any[]>([]);

  const filteredSchedules = firingSchedules.filter((schedule: any) => {
    const type = (schedule.type ?? schedule.firing_type ?? '').toString();
    const notes = (schedule.notes ?? '').toString();
    const matchesSearch =
      type.toLowerCase().includes(scheduleSearchTerm.toLowerCase()) ||
      notes.toLowerCase().includes(scheduleSearchTerm.toLowerCase());
    const matchesStatus =
      scheduleStatusFilter === 'all' || schedule.status === scheduleStatusFilter;
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

  const handleCreateSchedule = async () => {
    if (!currentStudio?.id || !authToken) {
      console.error('Cannot create firing schedule: missing studio or auth token');
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/studios/${currentStudio.id}/kiln-firings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: scheduleForm.name,
            kilnId: scheduleForm.kilnId,
            date: scheduleForm.date,
            startTime: scheduleForm.startTime,
            atmosphere: null,
            targetCone: scheduleForm.temperature || null,
            operatorId: scheduleForm.operatorId || null,
            notes: scheduleForm.notes,
            rackNumbers: selectedRacks,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to create kiln firing', errorText);
        toast.error('Failed to schedule firing', {
          description: 'Please check all fields and try again.',
        });
        return;
      }

      const result = await res.json();
      console.log('Created kiln firing', result);
      // Refresh firing schedules from backend
      try {
        const refreshRes = await fetch(
          `/api/admin/studios/${currentStudio.id}/kiln-firings`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (refreshRes.ok) {
          const body = await refreshRes.json();
          setFiringSchedules(body.firings ?? []);
        }
      } catch (err) {
        console.error('Error refreshing kiln firings', err);
      }
      // Close the appropriate dialog
      setShowCreateScheduleDialog(false);
      setShowScheduleFiring(false);
      setSelectedRacks([]);
      setScheduleForm({
        name: '',
        kilnId: '',
        date: '',
        startTime: '',
        endTime: '',
        firingType: '',
        operatorId: '',
        locationId: currentStudio?.locations?.[0]?.id || '',
        temperature: '',
        notes: '',
      });

      toast.success('Firing scheduled', {
        description: `"${scheduleForm.name || 'Unnamed firing'}" has been scheduled.`,
      });
    } catch (err) {
      console.error('Error creating kiln firing', err);
      toast.error('Failed to schedule firing', {
        description: 'An error occurred. Please try again.',
      });
    }
  };

  const handleStartFiring = (kilnId: string) => {
    // First, check if there's already an active firing for this kiln
    // A kiln can only have one active firing at a time (loading, firing, or cooling)
    const activeFiring = firingSchedules.find(
      (f: any) => 
        (f.kiln_id === kilnId || f.kilnId === kilnId) && 
        ['loading', 'firing', 'cooling'].includes(f.status)
    );

    if (activeFiring) {
      toast.error('Cannot start new firing', {
        description: `This kiln already has an active firing: "${activeFiring.name || 'Unnamed'}" (${activeFiring.status}). Please complete or cancel the current firing first.`,
      });
      return;
    }

    // Check if kiln status is in-use (should match active firing check, but double-check)
    const kiln = kilns.find((k: any) => k.id === kilnId);
    if (kiln?.status === 'in-use') {
      toast.error('Cannot start new firing', {
        description: 'This kiln is currently in use. Please complete the current firing first.',
      });
      return;
    }

    // Find all scheduled firings for this kiln
    // Handle both snake_case (from API) and camelCase (transformed) formats
    const scheduledFirings = firingSchedules.filter(
      (f: any) => (f.kiln_id === kilnId || f.kilnId === kilnId) && f.status === 'scheduled'
    );

    if (scheduledFirings.length === 0) {
      // No scheduled firings, open quick-start modal
      setQuickStartKilnId(kilnId);
      setQuickStartForm({
        name: '',
        templateId: '',
        atmosphere: 'oxidation',
        targetCone: '',
        targetTemperature: '',
        notes: '',
        operatorId: '',
      });
      setShowQuickStartFiring(true);
      return;
    }

    // Sort scheduled firings by priority:
    // 1. Past due firings first (scheduled_start < now)
    // 2. Then by scheduled_start time (earliest first)
    const now = new Date();
    const sortedFirings = scheduledFirings.sort((a: any, b: any) => {
      const aStart = a.scheduled_start ? new Date(a.scheduled_start) : null;
      const bStart = b.scheduled_start ? new Date(b.scheduled_start) : null;
      
      // Both have dates
      if (aStart && bStart) {
        const aPastDue = aStart < now;
        const bPastDue = bStart < now;
        
        // Past due firings come first
        if (aPastDue && !bPastDue) return -1;
        if (!aPastDue && bPastDue) return 1;
        
        // Both past due or both future: sort by time
        return aStart.getTime() - bStart.getTime();
      }
      
      // One has date, one doesn't - prioritize the one with date
      if (aStart && !bStart) return -1;
      if (!aStart && bStart) return 1;
      
      // Neither has date - sort by creation time
      const aCreated = a.created_at ? new Date(a.created_at) : new Date(0);
      const bCreated = b.created_at ? new Date(b.created_at) : new Date(0);
      return aCreated.getTime() - bCreated.getTime();
    });

    // Always show selection dialog, even for single scheduled firing
    setScheduledFiringsForKiln(sortedFirings);
    setQuickStartKilnId(kilnId); // Store kilnId for fallback to quick-start
    setShowScheduledFiringSelection(true);
  };

  const handleStartScheduledFiring = async (firingId: string) => {
    if (!currentStudio?.id || !authToken) {
      toast.error('Cannot start firing', {
        description: 'Missing studio or authentication.',
      });
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/studios/${currentStudio.id}/kiln-firings/${firingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            status: 'loading',
            actualStart: new Date().toISOString(),
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to start firing', errorText);
        toast.error('Failed to start firing', {
          description: 'Please try again.',
        });
        return;
      }

      // Refresh firings and kilns
      const refreshFirings = async () => {
        try {
          const res = await fetch(
            `/api/admin/studios/${currentStudio.id}/kiln-firings`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (res.ok) {
            const body = await res.json();
            setFiringSchedules(body.firings ?? []);
          }
        } catch (err) {
          console.error('Error refreshing firings', err);
        }
      };

      const refreshKilns = async () => {
        try {
          const res = await fetch(
            `/api/admin/studios/${currentStudio.id}/kilns`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (res.ok) {
            const body = await res.json();
            setKilns(body.kilns ?? []);
          }
        } catch (err) {
          console.error('Error refreshing kilns', err);
        }
      };

      await Promise.all([refreshFirings(), refreshKilns()]);

      toast.success('Firing started', {
        description: 'The kiln is now loading.',
      });
    } catch (err) {
      console.error('Error starting firing', err);
      toast.error('Failed to start firing', {
        description: 'An error occurred. Please try again.',
      });
    }
  };

  const handleQuickStartFiring = async () => {
    if (!currentStudio?.id || !authToken || !quickStartKilnId) {
      toast.error('Cannot start firing', {
        description: 'Missing required information.',
      });
      return;
    }

    try {
      // Create firing with status "loading" to start immediately
      const res = await fetch(
        `/api/admin/studios/${currentStudio.id}/kiln-firings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: quickStartForm.name || `Quick Start - ${new Date().toLocaleString()}`,
            kilnId: quickStartKilnId,
            date: new Date().toISOString().split('T')[0],
            startTime: new Date().toTimeString().slice(0, 5),
            atmosphere: quickStartForm.atmosphere || null,
            targetCone: quickStartForm.targetCone || null,
            targetTemperature: quickStartForm.targetTemperature || null,
            operatorId: quickStartForm.operatorId || null,
            notes: quickStartForm.notes || null,
            status: 'loading', // Start immediately
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to create firing', errorText);
        toast.error('Failed to start firing', {
          description: 'Please check all fields and try again.',
        });
        return;
      }

      // Refresh firings and kilns
      const refreshFirings = async () => {
        try {
          const res = await fetch(
            `/api/admin/studios/${currentStudio.id}/kiln-firings`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (res.ok) {
            const body = await res.json();
            setFiringSchedules(body.firings ?? []);
          }
        } catch (err) {
          console.error('Error refreshing firings', err);
        }
      };

      const refreshKilns = async () => {
        try {
          const res = await fetch(
            `/api/admin/studios/${currentStudio.id}/kilns`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (res.ok) {
            const body = await res.json();
            setKilns(body.kilns ?? []);
          }
        } catch (err) {
          console.error('Error refreshing kilns', err);
        }
      };

      await Promise.all([refreshFirings(), refreshKilns()]);

      setShowQuickStartFiring(false);
      setQuickStartKilnId('');
      setQuickStartForm({
        name: '',
        templateId: '',
        atmosphere: 'oxidation',
        targetCone: '',
        targetTemperature: '',
        notes: '',
        operatorId: '',
      });

      toast.success('Firing started', {
        description: 'The kiln is now loading.',
      });
    } catch (err) {
      console.error('Error starting firing', err);
      toast.error('Failed to start firing', {
        description: 'An error occurred. Please try again.',
      });
    }
  };

  const handleProgressFiring = async (firingId: string, currentStatus: string) => {
    if (!currentStudio?.id || !authToken) {
      toast.error('Cannot progress firing', {
        description: 'Missing studio or authentication.',
      });
      return;
    }

    let nextStatus: string;
    let statusMessage: string;

    // Determine next status in the progression
    switch (currentStatus) {
      case 'loading':
        nextStatus = 'firing';
        statusMessage = 'Firing started. The kiln is now firing.';
        break;
      case 'firing':
        nextStatus = 'cooling';
        statusMessage = 'Firing complete. The kiln is now cooling.';
        break;
      case 'cooling':
        nextStatus = 'completed';
        statusMessage = 'Firing completed successfully!';
        break;
      default:
        toast.error('Invalid firing status', {
          description: `Cannot progress from status: ${currentStatus}`,
        });
        return;
    }

    try {
      const updateData: any = {
        status: nextStatus,
      };

      // Note: actualStart is already set when firing starts (status becomes 'loading')
      // via handleStartScheduledFiring, so we don't set it again here when progressing to 'firing'

      // Set actual_end when completing
      if (nextStatus === 'completed') {
        updateData.actualEnd = new Date().toISOString();
      }

      const res = await fetch(
        `/api/admin/studios/${currentStudio.id}/kiln-firings/${firingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to progress firing', errorText);
        toast.error('Failed to progress firing', {
          description: 'Please try again.',
        });
        return;
      }

      // Refresh firings and kilns
      const refreshFirings = async () => {
        try {
          const res = await fetch(
            `/api/admin/studios/${currentStudio.id}/kiln-firings`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (res.ok) {
            const body = await res.json();
            setFiringSchedules(body.firings ?? []);
          }
        } catch (err) {
          console.error('Error refreshing firings', err);
        }
      };

      const refreshKilns = async () => {
        try {
          const res = await fetch(
            `/api/admin/studios/${currentStudio.id}/kilns`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (res.ok) {
            const body = await res.json();
            setKilns(body.kilns ?? []);
          }
        } catch (err) {
          console.error('Error refreshing kilns', err);
        }
      };

      await Promise.all([refreshFirings(), refreshKilns()]);

      toast.success(statusMessage);
    } catch (err) {
      console.error('Error progressing firing', err);
      toast.error('Failed to progress firing', {
        description: 'An error occurred. Please try again.',
      });
    }
  };

  const handleCancelFiring = async (firingId: string, firingName?: string) => {
    if (!currentStudio?.id || !authToken) {
      toast.error('Cannot cancel firing', {
        description: 'Missing studio or authentication.',
      });
      return;
    }

    // Confirm cancellation
    const confirmed = confirm(
      `Are you sure you want to cancel this firing?${firingName ? `\n\nFiring: "${firingName}"` : ''}\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/studios/${currentStudio.id}/kiln-firings/${firingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            status: 'cancelled',
            actualEnd: new Date().toISOString(),
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to cancel firing', errorText);
        toast.error('Failed to cancel firing', {
          description: 'Please try again.',
        });
        return;
      }

      // Refresh firings and kilns
      const refreshFirings = async () => {
        try {
          const res = await fetch(
            `/api/admin/studios/${currentStudio.id}/kiln-firings`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (res.ok) {
            const body = await res.json();
            setFiringSchedules(body.firings ?? []);
          }
        } catch (err) {
          console.error('Error refreshing firings', err);
        }
      };

      const refreshKilns = async () => {
        try {
          const res = await fetch(
            `/api/admin/studios/${currentStudio.id}/kilns`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (res.ok) {
            const body = await res.json();
            setKilns(body.kilns ?? []);
          }
        } catch (err) {
          console.error('Error refreshing kilns', err);
        }
      };

      await Promise.all([refreshFirings(), refreshKilns()]);

      toast.success('Firing cancelled', {
        description: 'The kiln is now available.',
      });
    } catch (err) {
      console.error('Error cancelling firing', err);
      toast.error('Failed to cancel firing', {
        description: 'An error occurred. Please try again.',
      });
    }
  };

  const handleDeleteKiln = async (kilnId: string, kilnName: string) => {
    if (!currentStudio?.id || !authToken) {
      toast.error('Cannot delete kiln', {
        description: 'Missing studio or authentication.',
      });
      return;
    }

    // Check if there are any active firings for this kiln
    const activeFiring = firingSchedules.find(
      (f: any) => 
        (f.kiln_id === kilnId || f.kilnId === kilnId) && 
        ['loading', 'firing', 'cooling'].includes(f.status)
    );

    if (activeFiring) {
      toast.error('Cannot delete kiln', {
        description: `This kiln has an active firing: "${activeFiring.name || 'Unnamed'}". Please complete or cancel the firing first.`,
      });
      return;
    }

    // Check for scheduled firings
    const scheduledFirings = firingSchedules.filter(
      (f: any) => 
        (f.kiln_id === kilnId || f.kilnId === kilnId) && 
        f.status === 'scheduled'
    );

    let warningMessage = `Are you sure you want to delete "${kilnName}"?`;
    if (scheduledFirings.length > 0) {
      warningMessage += `\n\nWarning: This kiln has ${scheduledFirings.length} scheduled firing(s) that will need to be rescheduled or cancelled.`;
    }
    warningMessage += '\n\nThis action cannot be undone.';

    const confirmed = confirm(warningMessage);

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/studios/${currentStudio.id}/kilns/${kilnId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to delete kiln', errorText);
        toast.error('Failed to delete kiln', {
          description: 'Please try again.',
        });
        return;
      }

      // Refresh kilns list
      try {
        const refreshRes = await fetch(
          `/api/admin/studios/${currentStudio.id}/kilns`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (refreshRes.ok) {
          const body = await refreshRes.json();
          setKilns(body.kilns ?? []);
        }
      } catch (err) {
        console.error('Error refreshing kilns', err);
      }

      // Close details modal if it's open for this kiln
      if (editingKiln?.id === kilnId) {
        setShowKilnDetails(false);
        setEditingKiln(null);
        setIsEditingKiln(false);
      }

      toast.success('Kiln deleted', {
        description: `"${kilnName}" has been deleted.`,
      });
    } catch (err) {
      console.error('Error deleting kiln', err);
      toast.error('Failed to delete kiln', {
        description: 'An error occurred. Please try again.',
      });
    }
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
              <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Add New Kiln</DialogTitle>
                  <DialogDescription>
                    Add a new kiln to your studio inventory with detailed configuration
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="basic" className="w-full flex flex-col flex-1 min-h-0">
                  <TabsList className="grid w-full grid-cols-4 flex-shrink-0 gap-2">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="shelves">Capacity</TabsTrigger>
                    <TabsTrigger value="specs">Specifications</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  </TabsList>

                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="space-y-6 flex-1 overflow-y-auto mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Kiln Name *</Label>
                      <Input
                        value={newKiln.name}
                        onChange={(e) => setNewKiln(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Studio Kiln 1"
                      />
                    </div>
                    <div className="space-y-2">
                        <Label>Type *</Label>
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

                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Serial Number</Label>
                      <Input
                          value={newKiln.serialNumber}
                          onChange={(e) => setNewKiln(prev => ({ ...prev, serialNumber: e.target.value }))}
                          placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                        <Label>Location *</Label>
                        <Select 
                          value={newKiln.locationId} 
                          onValueChange={(value) => setNewKiln(prev => ({ ...prev, locationId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentStudio?.locations.map(location => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Max Temperature (°C) *</Label>
                      <Input
                        type="number"
                        value={newKiln.maxTemp}
                        onChange={(e) => setNewKiln(prev => ({ ...prev, maxTemp: parseInt(e.target.value) || 0 }))}
                        placeholder="e.g., 1300"
                      />
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
                  </TabsContent>

                  {/* Capacity Tab */}
                  <TabsContent value="shelves" className="space-y-6 flex-1 overflow-y-auto mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Shelf Configuration</h3>
                          <p className="text-sm text-muted-foreground">Configure shelves and calculate capacity</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAutoGenerateShelves}
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Auto-Generate
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Total Kiln Height (inches)</Label>
                          <Input
                            type="number"
                            value={shelfDimensions.totalKilnHeight}
                            onChange={(e) => setShelfDimensions(prev => ({ ...prev, totalKilnHeight: parseInt(e.target.value) || 0 }))}
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
                        <div className="space-y-2">
                          <Label>Shelf Thickness (inches)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={shelfDimensions.shelfThickness}
                            onChange={(e) => setShelfDimensions(prev => ({ ...prev, shelfThickness: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                      <Separator />

                      {/* Shelf Dimensions */}
                      <div>
                        <h4 className="font-medium mb-3">Shelf Dimensions</h4>
                        <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                            <Label>Width (inches)</Label>
                            <Input
                              type="number"
                              value={shelfDimensions.width}
                              onChange={(e) => setShelfDimensions(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Depth (inches)</Label>
                            <Input
                              type="number"
                              value={shelfDimensions.depth}
                              onChange={(e) => setShelfDimensions(prev => ({ ...prev, depth: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Height/Clearance (inches)</Label>
                            <Input
                              type="number"
                              value={shelfDimensions.height}
                              onChange={(e) => setShelfDimensions(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Capacity Calculator */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Capacity Calculator</h4>
                            <p className="text-sm text-muted-foreground">Calculate capacity based on piece size</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={autoCalculateCapacity}
                                onCheckedChange={setAutoCalculateCapacity}
                                id="auto-calculate"
                              />
                              <Label htmlFor="auto-calculate" className="text-sm">Auto-calculate</Label>
                            </div>
                            {!autoCalculateCapacity && (
                              <Button onClick={handleCalculateCapacity} variant="outline" size="sm">
                                <Calculator className="w-4 h-4 mr-2" />
                                Calculate
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Piece Size</Label>
                    <Select 
                              value={selectedPieceSize}
                              onValueChange={(value) => setSelectedPieceSize(value as any)}
                    >
                      <SelectTrigger>
                                <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                                {Object.entries(PIECE_SIZE_PRESETS).map(([key, preset]) => (
                                  <SelectItem key={key} value={key}>
                                    {preset.name} - {preset.description}
                          </SelectItem>
                        ))}
                                <SelectItem value="custom">Custom Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                          {selectedPieceSize === 'custom' && (
                            <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                                <Label>Width (in)</Label>
                                <Input
                                  type="number"
                                  value={customPieceSize.width}
                                  onChange={(e) =>
                                    setCustomPieceSize(prev => ({
                                      ...prev,
                                      width: parseInt(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Depth (in)</Label>
                                <Input
                                  type="number"
                                  value={customPieceSize.depth}
                                  onChange={(e) =>
                                    setCustomPieceSize(prev => ({
                                      ...prev,
                                      depth: parseInt(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Height (in)</Label>
                                <Input
                                  type="number"
                                  value={customPieceSize.height}
                                  onChange={(e) =>
                                    setCustomPieceSize(prev => ({
                                      ...prev,
                                      height: parseInt(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {capacityCalculation && (
                          <Card className="bg-muted/50">
                            <CardContent className="pt-6">
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Pieces per Shelf</p>
                                  <p className="text-2xl font-bold">{capacityCalculation.piecesPerShelf}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                                  <p className="text-2xl font-bold">{capacityCalculation.totalCapacity}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Utilization</p>
                                  <p className="text-2xl font-bold">
                                    {(capacityCalculation.utilizationRate * 100).toFixed(0)}%
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4">
                                <Label>Calculated Capacity (will auto-fill)</Label>
                                <Input
                                  type="number"
                                  value={newKiln.capacity}
                                  onChange={(e) => setNewKiln(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                                  readOnly={!!capacityCalculation}
                                  className={capacityCalculation ? 'bg-muted' : ''}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Technical Specifications Tab */}
                  <TabsContent value="specs" className="space-y-6 flex-1 overflow-y-auto mt-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Technical Specifications</h3>
                      
                      {/* Interior Dimensions */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3">Interior Dimensions (inches)</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Width</Label>
                              <Input
                                type="number"
                                value={interiorDimensions.width}
                                onChange={(e) => {
                                  const width = parseInt(e.target.value) || 0;
                                  setInteriorDimensions(prev => ({ ...prev, width }));
                                  setShelfDimensions(prev => ({ ...prev, width }));
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Depth</Label>
                              <Input
                                type="number"
                                value={interiorDimensions.depth}
                                onChange={(e) => {
                                  const depth = parseInt(e.target.value) || 0;
                                  setInteriorDimensions(prev => ({ ...prev, depth }));
                                  setShelfDimensions(prev => ({ ...prev, depth }));
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Height</Label>
                              <Input
                                type="number"
                                value={interiorDimensions.height}
                                onChange={(e) => {
                                  const height = parseInt(e.target.value) || 0;
                                  setInteriorDimensions(prev => ({ ...prev, height }));
                                  setShelfDimensions(prev => ({ ...prev, totalKilnHeight: height }));
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <Separator />
                      </div>
                      
                      {/* Electric Kiln Fields */}
                      {newKiln.type === 'electric' && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Electrical Specifications</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Voltage</Label>
                              <Input
                                value={newKiln.specifications?.voltage || ''}
                                onChange={(e) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, voltage: e.target.value }
                                }))}
                                placeholder="e.g., 240V"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Amperage</Label>
                              <Input
                                value={newKiln.specifications?.amperage || ''}
                                onChange={(e) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, amperage: e.target.value }
                                }))}
                                placeholder="e.g., 50A"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Controller Type</Label>
                              <Select
                                value={newKiln.specifications?.controllerType || ''}
                                onValueChange={(value) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, controllerType: value }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select controller type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="digital">Digital</SelectItem>
                                  <SelectItem value="manual">Manual</SelectItem>
                                  <SelectItem value="programmable">Programmable</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Element Count</Label>
                              <Input
                                type="number"
                                value={(newKiln.specifications as any)?.elementCount || ''}
                                onChange={(e) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, elementCount: parseInt(e.target.value) || undefined }
                                }))}
                                placeholder="Number of elements"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Gas Kiln Fields */}
                      {newKiln.type === 'gas' && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Gas Specifications</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Gas Type</Label>
                              <Select
                                value={newKiln.specifications?.gasType || ''}
                                onValueChange={(value) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, gasType: value as 'natural' | 'propane' }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gas type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="natural">Natural Gas</SelectItem>
                                  <SelectItem value="propane">Propane</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Burner Count</Label>
                              <Input
                                type="number"
                                value={(newKiln.specifications as any)?.burnerCount || ''}
                                onChange={(e) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, burnerCount: parseInt(e.target.value) || undefined }
                                }))}
                                placeholder="Number of burners"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Ventilation Required</Label>
                              <Select
                                value={(newKiln.specifications as any)?.ventilationRequired ? 'yes' : 'no'}
                                onValueChange={(value) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, ventilationRequired: value === 'yes' }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes</SelectItem>
                                  <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Wood Kiln Fields */}
                      {newKiln.type === 'wood' && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Wood Firing Specifications</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Firebox Size (cubic feet)</Label>
                              <Input
                                type="number"
                                value={(newKiln.specifications as any)?.fireboxSize || ''}
                                onChange={(e) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, fireboxSize: parseFloat(e.target.value) || undefined }
                                }))}
                                placeholder="Firebox volume"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Chimney Height (feet)</Label>
                              <Input
                                type="number"
                                value={(newKiln.specifications as any)?.chimneyHeight || ''}
                                onChange={(e) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, chimneyHeight: parseFloat(e.target.value) || undefined }
                                }))}
                                placeholder="Chimney height"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Raku Kiln Fields */}
                      {newKiln.type === 'raku' && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Raku Specifications</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Safety Equipment Required</Label>
                    <Textarea
                                value={(newKiln.specifications as any)?.safetyEquipment || ''}
                                onChange={(e) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, safetyEquipment: e.target.value }
                                }))}
                                placeholder="List required safety equipment"
                      rows={3}
                    />
                  </div>
                            <div className="space-y-2">
                              <Label>Cooling Area Available</Label>
                              <Select
                                value={(newKiln.specifications as any)?.coolingArea ? 'yes' : 'no'}
                                onValueChange={(value) => setNewKiln(prev => ({
                                  ...prev,
                                  specifications: { ...prev.specifications, coolingArea: value === 'yes' }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes</SelectItem>
                                  <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Maintenance Tab */}
                  <TabsContent value="maintenance" className="space-y-6 flex-1 overflow-y-auto mt-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4">Installation & Warranty</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Install Date</Label>
                            <Input
                              type="date"
                              value={newKiln.installDate ? newKiln.installDate.split('T')[0] : ''}
                              onChange={(e) => setNewKiln(prev => ({
                                ...prev,
                                installDate: e.target.value ? new Date(e.target.value).toISOString() : undefined
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Warranty Expiry</Label>
                            <Input
                              type="date"
                              value={newKiln.warrantyExpiry ? newKiln.warrantyExpiry.split('T')[0] : ''}
                              onChange={(e) => setNewKiln(prev => ({
                                ...prev,
                                warrantyExpiry: e.target.value ? new Date(e.target.value).toISOString() : undefined
                              }))}
                            />
                            {newKiln.warrantyExpiry && new Date(newKiln.warrantyExpiry) < new Date() && (
                              <p className="text-sm text-destructive">Warranty has expired</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-4">Maintenance Schedule</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Schedule Type</Label>
                            <Select
                              value={maintenanceScheduleType}
                              onValueChange={(value) => {
                                setMaintenanceScheduleType(value as 'firings' | 'time' | 'both');
                                setNewKiln(prev => ({
                                  ...prev,
                                  maintenanceSchedule: {
                                    ...prev.maintenanceSchedule,
                                    maintenanceType: 'routine',
                                    lastMaintenance: new Date().toISOString(),
                                    nextMaintenance: new Date().toISOString(),
                                  }
                                }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="time">Time-based (days/months)</SelectItem>
                                <SelectItem value="firings">Firing-based (every N firings)</SelectItem>
                                <SelectItem value="both">Both time and firing-based</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>
                              {maintenanceScheduleType === 'firings' 
                                ? 'Maintenance Interval (number of firings)' 
                                : maintenanceScheduleType === 'time'
                                ? 'Maintenance Interval (days)'
                                : 'Time Interval (days)'}
                            </Label>
                            <Input
                              type="number"
                              value={maintenanceInterval}
                              onChange={(e) => {
                                const interval = parseInt(e.target.value) || 0;
                                setMaintenanceInterval(interval);
                                
                                // Calculate next maintenance date
                                if (maintenanceScheduleType === 'time' || maintenanceScheduleType === 'both') {
                                  const nextDate = new Date();
                                  nextDate.setDate(nextDate.getDate() + interval);
                                  setNewKiln(prev => ({
                                    ...prev,
                                    maintenanceSchedule: {
                                      ...prev.maintenanceSchedule,
                                      maintenanceType: 'routine',
                                      lastMaintenance: new Date().toISOString(),
                                      nextMaintenance: nextDate.toISOString(),
                                    }
                                  }));
                                }
                              }}
                              placeholder={maintenanceScheduleType === 'firings' ? 'e.g., 50' : 'e.g., 180'}
                            />
                            {maintenanceScheduleType === 'firings' && (
                              <p className="text-sm text-muted-foreground">
                                Maintenance will be scheduled after every {maintenanceInterval} firings
                              </p>
                            )}
                            {maintenanceScheduleType === 'time' && (
                              <p className="text-sm text-muted-foreground">
                                Next maintenance: {maintenanceInterval > 0 
                                  ? new Date(Date.now() + maintenanceInterval * 24 * 60 * 60 * 1000).toLocaleDateString()
                                  : 'Not set'}
                              </p>
                            )}
                          </div>

                          {maintenanceScheduleType === 'both' && (
                            <div className="space-y-2">
                              <Label>Firing Interval (number of firings)</Label>
                              <Input
                                type="number"
                                value={(newKiln.maintenanceSchedule as any)?.firingInterval || ''}
                                onChange={(e) => {
                                  const interval = parseInt(e.target.value) || undefined;
                                  setNewKiln(prev => ({
                                    ...prev,
                                    maintenanceSchedule: prev.maintenanceSchedule ? {
                                      ...prev.maintenanceSchedule,
                                      lastMaintenance: prev.maintenanceSchedule.lastMaintenance || new Date().toISOString(),
                                      nextMaintenance: prev.maintenanceSchedule.nextMaintenance || new Date().toISOString(),
                                      maintenanceType: prev.maintenanceSchedule.maintenanceType || 'routine',
                                      firingInterval: interval
                                    } : {
                                      lastMaintenance: new Date().toISOString(),
                                      nextMaintenance: new Date().toISOString(),
                                      maintenanceType: 'routine',
                                      firingInterval: interval
                                    }
                                  }));
                                }}
                                placeholder="e.g., 50"
                              />
                              <p className="text-sm text-muted-foreground">
                                Maintenance will be scheduled based on both time ({maintenanceInterval} days) and firings
                              </p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Maintenance Type</Label>
                            <Select
                              value={newKiln.maintenanceSchedule?.maintenanceType || 'routine'}
                              onValueChange={(value) => setNewKiln(prev => ({
                                ...prev,
                                maintenanceSchedule: {
                                  ...prev.maintenanceSchedule,
                                  maintenanceType: value,
                                  lastMaintenance: prev.maintenanceSchedule?.lastMaintenance || new Date().toISOString(),
                                  nextMaintenance: prev.maintenanceSchedule?.nextMaintenance || new Date().toISOString(),
                                }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">Routine Maintenance</SelectItem>
                                <SelectItem value="deep-clean">Deep Clean</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Kiln Status</Label>
                          <p className="text-sm text-muted-foreground">Set whether this kiln is currently active</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newKiln.isActive ?? true}
                            onCheckedChange={(checked) => setNewKiln(prev => ({ ...prev, isActive: checked }))}
                          />
                          <Label>{newKiln.isActive ? 'Active' : 'Inactive'}</Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-3 pt-4 border-t flex-shrink-0 mt-4">
                    <Button variant="outline" onClick={() => setShowAddKiln(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKiln}>
                      <Save className="w-4 h-4 mr-2" />
                      Add Kiln
                    </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Kilns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredKilns.map((kiln) => {
              // Determine kiln status - check if there's an active firing
              const activeFiring = firingSchedules.find(
                (f: any) => 
                  (f.kiln_id === kiln.id || f.kilnId === kiln.id) && 
                  ['loading', 'firing', 'cooling'].includes(f.status)
              );
              
              // If there's an active firing but kiln status isn't in-use, use in-use
              // Otherwise use the kiln's actual status
              const displayStatus = activeFiring && kiln.status !== 'in-use' 
                ? 'in-use' 
                : (kiln.status || 'available');
              
              // Get location name from currentStudio locations
              const location = (currentStudio as any)?.locations?.find(
                (loc: any) => loc.id === kiln.locationId
              );
              const locationName = location?.name || 'No location';
              
              return (
              <Card key={kiln.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{kiln.name}</CardTitle>
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">
                          {kiln.type}
                        </Badge>
                        <Badge variant={getStatusBadge(displayStatus) as any}>
                          {displayStatus}
                        </Badge>
                        {kiln.locationId && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{locationName}</span>
                          </div>
                        )}
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
                        <DropdownMenuItem onClick={() => {
                          handleViewKilnDetails(kiln.id);
                          setIsEditingKiln(true);
                        }}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Kiln
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setScheduleForm({
                            name: '',
                            kilnId: kiln.id,
                            date: '',
                            startTime: '',
                            endTime: '',
                            firingType: '',
                            operatorId: '',
                            locationId: currentStudio?.locations?.[0]?.id || '',
                            temperature: '',
                            notes: '',
                          });
                          setSelectedRacks([]);
                          setShowScheduleFiring(true);
                        }}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Firing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Wrench className="w-4 h-4 mr-2" />
                          Maintenance
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteKiln(kiln.id, kiln.name)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Kiln
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

                  {/* Active Firing Status */}
                  {activeFiring && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {activeFiring.name || 'Active Firing'}
                            </span>
                            <Badge variant={
                              activeFiring.status === 'loading' ? 'secondary' :
                              activeFiring.status === 'firing' ? 'destructive' :
                              'default'
                            }>
                              {activeFiring.status}
                            </Badge>
                          </div>
                          {activeFiring.actual_start && (
                            <p className="text-xs text-muted-foreground">
                              Started: {new Date(activeFiring.actual_start).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProgressFiring(activeFiring.id, activeFiring.status)}
                          >
                            {activeFiring.status === 'loading' && (
                              <>
                                <Flame className="w-4 h-4 mr-2" />
                                Start Firing
                              </>
                            )}
                            {activeFiring.status === 'firing' && (
                              <>
                                <Timer className="w-4 h-4 mr-2" />
                                Start Cooling
                              </>
                            )}
                            {activeFiring.status === 'cooling' && (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Complete
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelFiring(activeFiring.id, activeFiring.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewKilnDetails(kiln.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleStartFiring(kiln.id)}
                      disabled={displayStatus === 'in-use' || !!activeFiring}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Firing
                    </Button>
                  </div>
                </CardContent>
              </Card>
              );
            })}
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
                            {kilns.map((kiln: any) => (
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
                            {currentStudio?.glazes?.slice(0, 9).map((glaze) => (
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
                const kiln = kilns.find((k: any) => k.id === template.kilnId);
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
                            {Math.min(...template.temperatureCurve.map((c: any) => c.targetTemp))}°C - {Math.max(...template.temperatureCurve.map((c: any) => c.targetTemp))}°C
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
                        <Input
                          placeholder="e.g., Morning Bisque Load"
                          value={scheduleForm.name}
                          onChange={(e) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Kiln</Label>
                        <Select
                          value={scheduleForm.kilnId}
                          onValueChange={(value) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              kilnId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select kiln" />
                          </SelectTrigger>
                          <SelectContent>
                            {kilns.map((kiln: any) => (
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
                        <Input
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={scheduleForm.startTime}
                          onChange={(e) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={scheduleForm.endTime}
                          onChange={(e) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Firing Type</Label>
                        <Select
                          value={scheduleForm.firingType}
                          onValueChange={(value) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              firingType: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bisque">Bisque</SelectItem>
                            <SelectItem value="glaze">Glaze</SelectItem>
                            <SelectItem value="raku">Raku</SelectItem>
                            <SelectItem value="crystalline">
                              Crystalline
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Temperature / Cone</Label>
                        <Input
                          placeholder="e.g., 1280°C or Cone 10"
                          value={scheduleForm.temperature}
                          onChange={(e) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              temperature: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select
                          value={scheduleForm.operatorId}
                          onValueChange={(value) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              operatorId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((operator) => (
                              <SelectItem key={operator.id || operator.userId} value={operator.id || operator.userId}>
                                {operator.name} - {operator.role || 'Staff'}
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
                        value={scheduleForm.notes}
                        onChange={(e) =>
                          setScheduleForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => {
                        setShowCreateScheduleDialog(false);
                        setSelectedRacks([]);
                        setScheduleForm({
                          name: '',
                          kilnId: '',
                          date: '',
                          startTime: '',
                          endTime: '',
                          firingType: '',
                          operatorId: '',
                          locationId: currentStudio?.locations?.[0]?.id || '',
                          temperature: '',
                          notes: '',
                        });
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
                  <TableHead>Firing Name</TableHead>
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
                {filteredSchedules.map((schedule: any) => {
                  // Get kiln from joined data or fallback to kilns state
                  const kiln = schedule.kilns || kilns.find((k) => k.id === (schedule.kiln_id || schedule.kilnId));
                  // Get template if available
                  const template = schedule.templates;
                  // Get creator/operator from joined data or fallback to staff lookup
                  const creator = schedule.creator;
                  const operatorProfile = schedule.operator;
                  
                  // Find operator: first try operator from joined data, then fall back to creator
                  const operator = operatorProfile
                    ? staff.find((s) => (s.userId === operatorProfile.id || s.id === operatorProfile.id))
                    : creator
                    ? staff.find((s) => s.userId === creator.id || s.id === creator.id)
                    : staff.find((s) => s.userId === schedule.created_by || s.id === schedule.created_by);
                  
                  const scheduledStart = schedule.scheduled_start
                    ? new Date(schedule.scheduled_start)
                    : schedule.date
                    ? new Date(schedule.date)
                    : null;

                  // Map firing type: from template base_type, or derive from kiln type, or fallback
                  const firingType = template?.base_type 
                    || (kiln?.type === 'raku' ? 'raku' : kiln?.type === 'electric' ? 'bisque' : 'glaze')
                    || schedule.type 
                    || schedule.firing_type 
                    || schedule.firingType 
                    || '—';

                  // Map temperature: from target_cone, or from template temperature curve max, or fallback
                  let temperature = '';
                  if (schedule.target_cone) {
                    temperature = schedule.target_cone;
                  } else if (template?.temperature_curve && Array.isArray(template.temperature_curve)) {
                    const maxTemp = Math.max(...template.temperature_curve.map((phase: any) => phase.targetTemp || 0));
                    if (maxTemp > 0) {
                      temperature = `${maxTemp}°C`;
                    }
                  }

                  // Map capacity: from kiln capacity
                  const capacity = kiln?.capacity || null;
                  const bookedSlots = schedule.booked_slots || 0;

                  // Map racks: parse from notes (format: "Racks: A1, A2, B1")
                  let racks: string[] = [];
                  if (schedule.notes && schedule.notes.includes("Racks:")) {
                    const racksMatch = schedule.notes.match(/Racks:\s*([^-\n]+)/);
                    if (racksMatch && racksMatch[1]) {
                      racks = racksMatch[1].split(',').map((r: string) => r.trim()).filter(Boolean);
                    }
                  }

                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSchedules.includes(schedule.id)}
                          onCheckedChange={(checked) => handleSelectSchedule(schedule.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {schedule.name || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {scheduledStart
                              ? scheduledStart.toLocaleDateString()
                              : "—"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {scheduledStart
                              ? scheduledStart.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {firingType}
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
                      <TableCell>{temperature}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {operator?.name || creator?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {operator?.role}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {racks.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {racks.slice(0, 3).map((rack: string) => (
                                <Badge
                                  key={rack}
                                  variant="outline"
                                  className="text-xs font-mono"
                                >
                                  {rack}
                                </Badge>
                              ))}
                              {racks.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{racks.length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No racks specified
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {capacity
                            ? `${bookedSlots}/${capacity}`
                            : "—"}
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: capacity
                                  ? `${((bookedSlots / capacity) * 100).toFixed(0)}%`
                                  : "0%",
                              }}
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

      {/* Kiln Details/Edit Dialog */}
      <Dialog open={showKilnDetails} onOpenChange={(open) => {
        setShowKilnDetails(open);
        if (!open) {
          setIsEditingKiln(false);
          setEditingKiln(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>
                  {isEditingKiln ? 'Edit Kiln' : 'Kiln Details'}
                </DialogTitle>
            <DialogDescription>
                  {isEditingKiln 
                    ? 'Update kiln information and configuration'
                    : 'View detailed information about this kiln'}
            </DialogDescription>
              </div>
              {!isEditingKiln && editingKiln && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditingKiln(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </DialogHeader>

          {editingKiln ? (
            <Tabs defaultValue="basic" className="w-full flex flex-col flex-1 min-h-0">
              <TabsList className="grid w-full grid-cols-4 flex-shrink-0 gap-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="shelves">Capacity</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6 flex-1 overflow-y-auto mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kiln Name *</Label>
                    {isEditingKiln ? (
                      <Input
                        value={editingKiln.name || ''}
                        onChange={(e) => setEditingKiln(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                        placeholder="e.g., Studio Kiln 1"
                      />
                    ) : (
                      <p className="text-sm py-2">{editingKiln.name || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    {isEditingKiln ? (
                      <Select 
                        value={editingKiln.type} 
                        onValueChange={(value) => setEditingKiln(prev => prev ? ({ ...prev, type: value as any }) : null)}
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
                    ) : (
                      <p className="text-sm py-2 capitalize">{editingKiln.type || '—'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Manufacturer</Label>
                    {isEditingKiln ? (
                      <Input
                        value={editingKiln.manufacturer || ''}
                        onChange={(e) => setEditingKiln(prev => prev ? ({ ...prev, manufacturer: e.target.value }) : null)}
                        placeholder="e.g., L&L Kiln"
                      />
                    ) : (
                      <p className="text-sm py-2">{editingKiln.manufacturer || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    {isEditingKiln ? (
                      <Input
                        value={editingKiln.model || ''}
                        onChange={(e) => setEditingKiln(prev => prev ? ({ ...prev, model: e.target.value }) : null)}
                        placeholder="e.g., Jupiter 2327"
                      />
                    ) : (
                      <p className="text-sm py-2">{editingKiln.model || '—'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    {isEditingKiln ? (
                      <Input
                        value={editingKiln.serialNumber || ''}
                        onChange={(e) => setEditingKiln(prev => prev ? ({ ...prev, serialNumber: e.target.value }) : null)}
                        placeholder="Optional"
                      />
                    ) : (
                      <p className="text-sm py-2">{editingKiln.serialNumber || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    {isEditingKiln ? (
                      <Select 
                        value={editingKiln.locationId || ''} 
                        onValueChange={(value) => setEditingKiln(prev => prev ? ({ ...prev, locationId: value }) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentStudio?.locations.map(location => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm py-2">
                        {currentStudio?.locations.find(l => l.id === editingKiln.locationId)?.name || '—'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Capacity (pieces)</Label>
                    {isEditingKiln ? (
                      <Input
                        type="number"
                        value={editingKiln.capacity || 0}
                        onChange={(e) => setEditingKiln(prev => prev ? ({ ...prev, capacity: parseInt(e.target.value) || 0 }) : null)}
                      />
                    ) : (
                      <p className="text-sm py-2">{editingKiln.capacity || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Max Temperature (°C) *</Label>
                    {isEditingKiln ? (
                      <Input
                        type="number"
                        value={editingKiln.maxTemp || 0}
                        onChange={(e) => setEditingKiln(prev => prev ? ({ ...prev, maxTemp: parseInt(e.target.value) || 0 }) : null)}
                        placeholder="e.g., 1300"
                      />
                    ) : (
                      <p className="text-sm py-2">{editingKiln.maxTemp ? `${editingKiln.maxTemp}°C` : '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Shelf Count</Label>
                    {isEditingKiln ? (
                      <Input
                        type="number"
                        value={editingKiln.shelfCount || 0}
                        onChange={(e) => setEditingKiln(prev => prev ? ({ ...prev, shelfCount: parseInt(e.target.value) || 0 }) : null)}
                      />
                    ) : (
                      <p className="text-sm py-2">{editingKiln.shelfCount || '—'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  {isEditingKiln ? (
                    <Select 
                      value={editingKiln.status} 
                      onValueChange={(value) => setEditingKiln(prev => prev ? ({ ...prev, status: value as any }) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="out-of-service">Out of Service</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    (() => {
                      // Check if there's an active firing for this kiln
                      const activeFiring = editingKiln?.id 
                        ? firingSchedules.find(
                            (f: any) => 
                              (f.kiln_id === editingKiln.id || f.kilnId === editingKiln.id) && 
                              ['loading', 'firing', 'cooling'].includes(f.status)
                          )
                        : null;
                      
                      // If there's an active firing, show "in-use" status
                      // Otherwise use the kiln's actual status
                      const displayStatus = activeFiring 
                        ? 'in-use' 
                        : (editingKiln.status || 'available');
                      
                      return (
                        <Badge variant={getStatusBadge(displayStatus) as any}>
                          {displayStatus}
                        </Badge>
                      );
                    })()
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  {isEditingKiln ? (
                    <Textarea
                      value={editingKiln.notes || ''}
                      onChange={(e) => setEditingKiln(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                      placeholder="Additional notes about this kiln..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm py-2 whitespace-pre-wrap">{editingKiln.notes || '—'}</p>
                  )}
                </div>
              </TabsContent>

              {/* Capacity Tab */}
              <TabsContent value="shelves" className="space-y-6 flex-1 overflow-y-auto mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Shelf Configuration</h3>
                    {isEditingKiln && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Add a new shelf
                          const newShelf = {
                            level: (editingKiln.shelfConfiguration?.length || 0) + 1,
                            height: 10,
                            capacity: 0,
                          };
                          setEditingKiln(prev => prev ? ({
                            ...prev,
                            shelfConfiguration: [...(prev.shelfConfiguration || []), newShelf],
                            shelfCount: (prev.shelfCount || 0) + 1,
                          }) : null);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Shelf
                      </Button>
                    )}
                  </div>
                  
                  {editingKiln.shelfConfiguration && editingKiln.shelfConfiguration.length > 0 ? (
                    <div className="space-y-3">
                      {editingKiln.shelfConfiguration.map((shelf, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="grid grid-cols-3 gap-4 flex-1">
                                <div>
                                  <Label className="text-muted-foreground">Level</Label>
                                  {isEditingKiln ? (
                                    <Input
                                      type="number"
                                      value={shelf.level}
                                      onChange={(e) => {
                                        const newConfig = [...(editingKiln.shelfConfiguration || [])];
                                        newConfig[index].level = parseInt(e.target.value) || 0;
                                        setEditingKiln(prev => prev ? ({ ...prev, shelfConfiguration: newConfig }) : null);
                                      }}
                                    />
                                  ) : (
                                    <p className="text-sm font-medium py-2">{shelf.level}</p>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Height (inches)</Label>
                                  {isEditingKiln ? (
                                    <Input
                                      type="number"
                                      value={shelf.height}
                                      onChange={(e) => {
                                        const newConfig = [...(editingKiln.shelfConfiguration || [])];
                                        newConfig[index].height = parseInt(e.target.value) || 0;
                                        setEditingKiln(prev => prev ? ({ ...prev, shelfConfiguration: newConfig }) : null);
                                      }}
                                    />
                                  ) : (
                                    <p className="text-sm py-2">{shelf.height}"</p>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Capacity</Label>
                                  {isEditingKiln ? (
                                    <Input
                                      type="number"
                                      value={shelf.capacity || 0}
                                      onChange={(e) => {
                                        const newConfig = [...(editingKiln.shelfConfiguration || [])];
                                        newConfig[index].capacity = parseInt(e.target.value) || 0;
                                        setEditingKiln(prev => prev ? ({ ...prev, shelfConfiguration: newConfig }) : null);
                                      }}
                                    />
                                  ) : (
                                    <p className="text-sm py-2">{shelf.capacity || '—'} pieces</p>
                                  )}
                                </div>
                              </div>
                              {isEditingKiln && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newConfig = editingKiln.shelfConfiguration?.filter((_, i) => i !== index) || [];
                                    setEditingKiln(prev => prev ? ({
                                      ...prev,
                                      shelfConfiguration: newConfig,
                                      shelfCount: newConfig.length,
                                    }) : null);
                                  }}
                                  className="ml-2"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No shelf configuration available
                        </p>
                        {isEditingKiln && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const newShelf = {
                                level: 1,
                                height: 10,
                                capacity: 0,
                              };
                              setEditingKiln(prev => prev ? ({
                                ...prev,
                                shelfConfiguration: [newShelf],
                                shelfCount: 1,
                              }) : null);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Shelf
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  <div className="pt-4">
                    <h4 className="font-medium mb-4">Capacity Summary</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">Total Capacity</p>
                          <p className="text-2xl font-bold">{editingKiln.capacity || 0}</p>
                          <p className="text-xs text-muted-foreground">pieces</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">Shelf Count</p>
                          <p className="text-2xl font-bold">{editingKiln.shelfCount || 0}</p>
                          <p className="text-xs text-muted-foreground">shelves</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">Total Firings</p>
                          <p className="text-2xl font-bold">{editingKiln.totalFirings || 0}</p>
                          <p className="text-xs text-muted-foreground">firings</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Technical Specifications Tab */}
              <TabsContent value="specs" className="space-y-6 flex-1 overflow-y-auto mt-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Technical Specifications</h3>
                  
                  {/* Electric Kiln Specifications */}
                  {editingKiln.type === 'electric' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Voltage</Label>
                        {isEditingKiln ? (
                          <Input
                            value={editingKiln.specifications?.voltage || ''}
                            onChange={(e) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, voltage: e.target.value }
                            }) : null)}
                            placeholder="e.g., 240V"
                          />
                        ) : (
                          <p className="text-sm py-2">{editingKiln.specifications?.voltage || '—'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Amperage</Label>
                        {isEditingKiln ? (
                          <Input
                            value={editingKiln.specifications?.amperage || ''}
                            onChange={(e) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, amperage: e.target.value }
                            }) : null)}
                            placeholder="e.g., 50A"
                          />
                        ) : (
                          <p className="text-sm py-2">{editingKiln.specifications?.amperage || '—'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Controller Type</Label>
                        {isEditingKiln ? (
                          <Select
                            value={editingKiln.specifications?.controllerType || ''}
                            onValueChange={(value) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, controllerType: value }
                            }) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select controller type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="digital">Digital</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="programmable">Programmable</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm py-2 capitalize">{editingKiln.specifications?.controllerType || '—'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Element Count</Label>
                        {isEditingKiln ? (
                          <Input
                            type="number"
                            value={(editingKiln.specifications as any)?.elementCount || ''}
                            onChange={(e) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, elementCount: parseInt(e.target.value) || undefined }
                            }) : null)}
                            placeholder="Number of elements"
                          />
                        ) : (
                          <p className="text-sm py-2">{(editingKiln.specifications as any)?.elementCount || '—'}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Gas Kiln Specifications */}
                  {editingKiln.type === 'gas' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Gas Type</Label>
                        {isEditingKiln ? (
                          <Select
                            value={editingKiln.specifications?.gasType || ''}
                            onValueChange={(value) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, gasType: value as 'natural' | 'propane' }
                            }) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gas type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="natural">Natural Gas</SelectItem>
                              <SelectItem value="propane">Propane</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm py-2 capitalize">{editingKiln.specifications?.gasType || '—'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Burner Count</Label>
                        {isEditingKiln ? (
                          <Input
                            type="number"
                            value={(editingKiln.specifications as any)?.burnerCount || ''}
                            onChange={(e) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, burnerCount: parseInt(e.target.value) || undefined }
                            }) : null)}
                            placeholder="Number of burners"
                          />
                        ) : (
                          <p className="text-sm py-2">{(editingKiln.specifications as any)?.burnerCount || '—'}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wood Kiln Specifications */}
                  {editingKiln.type === 'wood' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Firebox Size (cubic feet)</Label>
                        {isEditingKiln ? (
                          <Input
                            type="number"
                            value={(editingKiln.specifications as any)?.fireboxSize || ''}
                            onChange={(e) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, fireboxSize: parseFloat(e.target.value) || undefined }
                            }) : null)}
                            placeholder="Firebox volume"
                          />
                        ) : (
                          <p className="text-sm py-2">{(editingKiln.specifications as any)?.fireboxSize ? `${(editingKiln.specifications as any).fireboxSize} cu ft` : '—'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Chimney Height (feet)</Label>
                        {isEditingKiln ? (
                          <Input
                            type="number"
                            value={(editingKiln.specifications as any)?.chimneyHeight || ''}
                            onChange={(e) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, chimneyHeight: parseFloat(e.target.value) || undefined }
                            }) : null)}
                            placeholder="Chimney height"
                          />
                        ) : (
                          <p className="text-sm py-2">{(editingKiln.specifications as any)?.chimneyHeight ? `${(editingKiln.specifications as any).chimneyHeight} ft` : '—'}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Raku Kiln Specifications */}
                  {editingKiln.type === 'raku' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Safety Equipment Required</Label>
                        {isEditingKiln ? (
                          <Textarea
                            value={(editingKiln.specifications as any)?.safetyEquipment || ''}
                            onChange={(e) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, safetyEquipment: e.target.value }
                            }) : null)}
                            placeholder="List required safety equipment"
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm py-2 whitespace-pre-wrap">{(editingKiln.specifications as any)?.safetyEquipment || '—'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Cooling Area Available</Label>
                        {isEditingKiln ? (
                          <Select
                            value={(editingKiln.specifications as any)?.coolingArea ? 'yes' : 'no'}
                            onValueChange={(value) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              specifications: { ...prev.specifications, coolingArea: value === 'yes' }
                            }) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm py-2">{(editingKiln.specifications as any)?.coolingArea ? 'Yes' : 'No'}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {(!editingKiln.specifications || Object.keys(editingKiln.specifications).length === 0) && !isEditingKiln && (
                    <p className="text-sm text-muted-foreground">No specifications available</p>
                  )}
                </div>
              </TabsContent>

              {/* Maintenance Tab */}
              <TabsContent value="maintenance" className="space-y-6 flex-1 overflow-y-auto mt-4">
          <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Installation & Warranty</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Install Date</Label>
                        {isEditingKiln ? (
                          <Input
                            type="date"
                            value={editingKiln.installDate ? editingKiln.installDate.split('T')[0] : ''}
                            onChange={(e) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              installDate: e.target.value ? new Date(e.target.value).toISOString() : undefined
                            }) : null)}
                          />
                        ) : (
                          <p className="text-sm py-2">
                            {editingKiln.installDate ? new Date(editingKiln.installDate).toLocaleDateString() : '—'}
                          </p>
                        )}
            </div>
                      <div className="space-y-2">
                        <Label>Warranty Expiry</Label>
                        {isEditingKiln ? (
                          <Input
                            type="date"
                            value={editingKiln.warrantyExpiry ? editingKiln.warrantyExpiry.split('T')[0] : ''}
                            onChange={(e) => setEditingKiln(prev => prev ? ({
                              ...prev,
                              warrantyExpiry: e.target.value ? new Date(e.target.value).toISOString() : undefined
                            }) : null)}
                          />
                        ) : (
                          <p className="text-sm py-2">
                            {editingKiln.warrantyExpiry 
                              ? new Date(editingKiln.warrantyExpiry).toLocaleDateString() 
                              : '—'}
                            {editingKiln.warrantyExpiry && new Date(editingKiln.warrantyExpiry) < new Date() && (
                              <Badge variant="destructive" className="ml-2">Expired</Badge>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-4">Maintenance Schedule</h3>
                    {editingKiln.maintenanceSchedule || isEditingKiln ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Maintenance Type</Label>
                          {isEditingKiln ? (
                            <Select
                              value={editingKiln.maintenanceSchedule?.maintenanceType || 'routine'}
                              onValueChange={(value) => setEditingKiln(prev => prev ? ({
                                ...prev,
                                maintenanceSchedule: {
                                  ...prev.maintenanceSchedule,
                                  maintenanceType: value,
                                  lastMaintenance: prev.maintenanceSchedule?.lastMaintenance || new Date().toISOString(),
                                  nextMaintenance: prev.maintenanceSchedule?.nextMaintenance || new Date().toISOString(),
                                }
                              }) : null)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">Routine Maintenance</SelectItem>
                                <SelectItem value="deep-clean">Deep Clean</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-sm py-2 capitalize">
                              {editingKiln.maintenanceSchedule?.maintenanceType || '—'}
                            </p>
                          )}
                        </div>
                        {editingKiln.maintenanceSchedule?.lastMaintenance && (
                          <div className="space-y-2">
                            <Label>Last Maintenance</Label>
                            {isEditingKiln ? (
                              <Input
                                type="date"
                                value={editingKiln.maintenanceSchedule.lastMaintenance.split('T')[0]}
                                onChange={(e) => setEditingKiln(prev => prev ? ({
                                  ...prev,
                                  maintenanceSchedule: {
                                    ...prev.maintenanceSchedule,
                                    lastMaintenance: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString(),
                                    maintenanceType: prev.maintenanceSchedule?.maintenanceType || 'routine',
                                    nextMaintenance: prev.maintenanceSchedule?.nextMaintenance || new Date().toISOString(),
                                  }
                                }) : null)}
                              />
                            ) : (
                              <p className="text-sm py-2">
                                {new Date(editingKiln.maintenanceSchedule.lastMaintenance).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                        {editingKiln.maintenanceSchedule?.nextMaintenance && (
                          <div className="space-y-2">
                            <Label>Next Maintenance</Label>
                            {isEditingKiln ? (
                              <Input
                                type="date"
                                value={editingKiln.maintenanceSchedule.nextMaintenance.split('T')[0]}
                                onChange={(e) => setEditingKiln(prev => prev ? ({
                                  ...prev,
                                  maintenanceSchedule: {
                                    ...prev.maintenanceSchedule,
                                    nextMaintenance: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString(),
                                    maintenanceType: prev.maintenanceSchedule?.maintenanceType || 'routine',
                                    lastMaintenance: prev.maintenanceSchedule?.lastMaintenance || new Date().toISOString(),
                                  }
                                }) : null)}
                              />
                            ) : (
                              <p className="text-sm py-2">
                                {new Date(editingKiln.maintenanceSchedule.nextMaintenance).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                        {isEditingKiln && !editingKiln.maintenanceSchedule && (
                          <Button
                            variant="outline"
                            onClick={() => setEditingKiln(prev => prev ? ({
                              ...prev,
                              maintenanceSchedule: {
                                maintenanceType: 'routine',
                                lastMaintenance: new Date().toISOString(),
                                nextMaintenance: new Date().toISOString(),
                              }
                            }) : null)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Maintenance Schedule
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No maintenance schedule configured</p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Kiln Status</Label>
                      <p className="text-sm text-muted-foreground">Active/Inactive status</p>
                    </div>
                    {isEditingKiln ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingKiln.isActive ?? true}
                          onCheckedChange={(checked) => setEditingKiln(prev => prev ? ({ ...prev, isActive: checked }) : null)}
                        />
                        <Label>{editingKiln.isActive ? 'Active' : 'Inactive'}</Label>
                      </div>
                    ) : (
                      <Badge variant={editingKiln.isActive ? 'default' : 'secondary'}>
                        {editingKiln.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading kiln details...</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t flex-shrink-0 mt-4">
            {!isEditingKiln && editingKiln && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeleteKiln(editingKiln.id!, editingKiln.name || 'this kiln')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Kiln
              </Button>
            )}
            <div className="flex justify-end space-x-3 ml-auto">
              {isEditingKiln ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingKiln(false);
                      // Reset to original kiln data
                      const kiln = kilns.find((k: any) => k.id === selectedKilnId);
                      if (kiln) {
                        setEditingKiln({ ...kiln });
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateKiln}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setShowKilnDetails(false)}>
                  Close
                </Button>
              )}
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
      <Dialog open={showScheduleFiring} onOpenChange={(open) => {
        setShowScheduleFiring(open);
        if (!open) {
          // Reset form when closing
          setScheduleForm({
            name: '',
            kilnId: '',
            date: '',
            startTime: '',
            endTime: '',
            firingType: '',
            operatorId: '',
            locationId: currentStudio?.locations?.[0]?.id || '',
            temperature: '',
            notes: '',
          });
          setSelectedRacks([]);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Firing</DialogTitle>
            <DialogDescription>
              Schedule a new firing session for this kiln
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Firing Name</Label>
                <Input
                  placeholder="e.g., Morning Bisque Load"
                  value={scheduleForm.name}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Kiln</Label>
                <Select
                  value={scheduleForm.kilnId}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      kilnId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select kiln" />
                  </SelectTrigger>
                  <SelectContent>
                    {kilns.map((kiln: any) => (
                      <SelectItem key={kiln.id} value={kiln.id}>
                        {kiln.name} ({kiln.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Cone (Optional)</Label>
                <Input
                  placeholder="e.g., 04, 6, 10"
                  value={scheduleForm.temperature}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      temperature: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Operator (Optional)</Label>
                <Select
                  value={scheduleForm.operatorId}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      operatorId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((operator) => (
                      <SelectItem key={operator.id || operator.userId} value={operator.id || operator.userId}>
                        {operator.name || operator.email} {operator.role ? `- ${operator.role}` : ''}
                      </SelectItem>
                    ))}
                    {staff.length === 0 && (
                      <SelectItem value="no-employees" disabled>
                        No employees available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this firing..."
                value={scheduleForm.notes}
                onChange={(e) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowScheduleFiring(false);
                  setScheduleForm({
                    name: '',
                    kilnId: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    firingType: '',
                    operatorId: '',
                    locationId: currentStudio?.locations?.[0]?.id || '',
                    temperature: '',
                    notes: '',
                  });
                  setSelectedRacks([]);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!scheduleForm.kilnId || !scheduleForm.date || !scheduleForm.startTime) {
                    toast.error('Missing required fields', {
                      description: 'Please fill in kiln, date, and start time.',
                    });
                    return;
                  }

                  await handleCreateSchedule();
                  setShowScheduleFiring(false);
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Firing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scheduled Firing Selection Dialog */}
      <Dialog open={showScheduledFiringSelection} onOpenChange={setShowScheduledFiringSelection}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Scheduled Firing to Start</DialogTitle>
            <DialogDescription>
              Multiple scheduled firings found for this kiln. Select which one to start.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {scheduledFiringsForKiln.map((firing: any) => {
                const scheduledStart = firing.scheduled_start ? new Date(firing.scheduled_start) : null;
                const isPastDue = scheduledStart && scheduledStart < new Date();
                const timeInfo = scheduledStart 
                  ? scheduledStart.toLocaleString()
                  : 'No scheduled time';
                
                return (
                  <Card 
                    key={firing.id}
                    className={`cursor-pointer transition-all hover:bg-accent ${
                      isPastDue ? 'border-orange-500 bg-orange-50/50' : ''
                    }`}
                    onClick={() => {
                      handleStartScheduledFiring(firing.id);
                      setShowScheduledFiringSelection(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              {firing.name || 'Unnamed Firing'}
                            </h4>
                            {isPastDue && (
                              <Badge variant="destructive" className="text-xs">
                                Past Due
                              </Badge>
                            )}
                            {firing.target_cone && (
                              <Badge variant="outline" className="text-xs">
                                Cone {firing.target_cone}
                              </Badge>
                            )}
    </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>{timeInfo}</span>
                            </div>
                            {firing.atmosphere && (
                              <div className="flex items-center gap-2">
                                <Flame className="w-3 h-3" />
                                <span className="capitalize">{firing.atmosphere}</span>
                              </div>
                            )}
                            {firing.notes && (
                              <p className="text-xs mt-1">{firing.notes}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartScheduledFiring(firing.id);
                            setShowScheduledFiringSelection(false);
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Separator />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowScheduledFiringSelection(false);
                  // Open quick-start modal instead
                  setShowQuickStartFiring(true);
                }}
              >
                Start New Firing Instead
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowScheduledFiringSelection(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Start Firing Dialog */}
      <Dialog open={showQuickStartFiring} onOpenChange={setShowQuickStartFiring}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Start Firing</DialogTitle>
            <DialogDescription>
              Start a firing immediately for this kiln
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Firing Name (Optional)</Label>
              <Input
                placeholder="e.g., Morning Bisque Firing"
                value={quickStartForm.name}
                onChange={(e) => setQuickStartForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to auto-generate a name
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Atmosphere</Label>
                <Select
                  value={quickStartForm.atmosphere}
                  onValueChange={(value: 'oxidation' | 'reduction' | 'neutral') =>
                    setQuickStartForm(prev => ({ ...prev, atmosphere: value }))
                  }
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
                <Label>Target Cone (Optional)</Label>
                <Input
                  placeholder="e.g., 04, 6, 10"
                  value={quickStartForm.targetCone}
                  onChange={(e) => setQuickStartForm(prev => ({ ...prev, targetCone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Temperature (Optional)</Label>
              <Input
                type="number"
                placeholder="e.g., 1200"
                value={quickStartForm.targetTemperature}
                onChange={(e) => setQuickStartForm(prev => ({ ...prev, targetTemperature: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Operator (Optional)</Label>
              <div className="flex gap-2">
                <Select
                  value={quickStartForm.operatorId || undefined}
                  onValueChange={(value) => setQuickStartForm(prev => ({ ...prev, operatorId: value }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select operator (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((operator) => (
                      <SelectItem key={operator.id || operator.userId} value={operator.id || operator.userId}>
                        {operator.name || operator.email} {operator.role ? `- ${operator.role}` : ''}
                      </SelectItem>
                    ))}
                    {staff.length === 0 && (
                      <SelectItem value="no-employees" disabled>
                        No employees available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {quickStartForm.operatorId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickStartForm(prev => ({ ...prev, operatorId: '' }))}
                    title="Clear operator"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this firing..."
                value={quickStartForm.notes}
                onChange={(e) => setQuickStartForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowQuickStartFiring(false);
                setQuickStartKilnId('');
                setQuickStartForm({
                  name: '',
                  templateId: '',
                  atmosphere: 'oxidation',
                  targetCone: '',
                  targetTemperature: '',
                  notes: '',
                  operatorId: '',
                });
              }}>
                Cancel
              </Button>
              <Button onClick={handleQuickStartFiring}>
                <Play className="w-4 h-4 mr-2" />
                Start Firing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}