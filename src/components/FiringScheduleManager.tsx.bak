import { useState } from 'react';
import {
  Calendar, Clock, Flame, Plus, Search, Filter, Eye, Edit2, Trash2,
  Bell, User, Package, Thermometer, CheckSquare, MoreHorizontal,
  Save, X, FileText, Send, AlertCircle, CheckCircle, Users, Settings, BarChart3
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAppContext } from '@/app/context/AppContext';
import type { FiringSchedule, KilnFiringTemplate, CustomFiringType } from '@/app/context/AppContext';

interface FiringScheduleForm {
  id?: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  kilnId: string;
  templateId?: string;
  customFiringTypeId?: string;
  firingType: string;
  temperature: string;
  atmosphere: string;
  operatorId: string;
  operatorName: string;
  rackNumbers: string[];
  capacity: number;
  bookedSlots: number;
  notes: string;
  notificationSettings: {
    sendStartReminder: boolean;
    sendCompletionAlert: boolean;
    notifyOperator: boolean;
    reminderHoursBefore: number;
  };
  specialInstructions: string;
  locationId: string;
}

export function FiringScheduleManager() {
  const { currentStudio, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState('schedules');
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  // Form state
  const [scheduleForm, setScheduleForm] = useState<FiringScheduleForm>({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    kilnId: '',
    templateId: '',
    customFiringTypeId: '',
    firingType: '',
    temperature: '',
    atmosphere: 'oxidation',
    operatorId: '',
    operatorName: '',
    rackNumbers: [],
    capacity: 20,
    bookedSlots: 0,
    notes: '',
    notificationSettings: {
      sendStartReminder: true,
      sendCompletionAlert: true,
      notifyOperator: true,
      reminderHoursBefore: 2
    },
    specialInstructions: '',
    locationId: currentStudio?.locations?.[0]?.id || ''
  });

  // Available rack numbers (mock data)
  const availableRacks = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6'
  ];

  // Mock firing schedules
  const [firingSchedules] = useState<FiringSchedule[]>([
    {
      id: '1',
      date: '2025-07-10',
      type: 'Bisque',
      temperature: '1000°C',
      capacity: 20,
      bookedSlots: 15,
      notes: 'Standard bisque firing',
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
      notes: 'High-fire reduction glaze',
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
      notes: 'Large member bisque load',
      status: 'in-progress',
      kilnId: 'kiln1',
      startTime: '10:00',
      endTime: '19:00',
      locationId: 'loc1',
      assignedEmployeeId: 'emp1'
    }
  ]);

  // Mock operators/staff
  const operators = [
    { id: 'emp1', name: 'Mike Chen', role: 'Lead Kiln Operator' },
    { id: 'emp2', name: 'Sarah Wilson', role: 'Studio Manager' },
    { id: 'emp3', name: 'David Park', role: 'Kiln Technician' }
  ];

  const filteredSchedules = firingSchedules.filter(schedule => {
    const matchesSearch = schedule.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSchedule = () => {
    console.log('Creating firing schedule:', scheduleForm);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleUseTemplate = (templateId: string) => {
    const template = currentStudio?.kilnFiringTemplates?.find(t => t.id === templateId);
    if (template) {
      setScheduleForm(prev => ({
        ...prev,
        templateId: template.id,
        kilnId: template.kilnId,
        firingType: template.baseType,
        atmosphere: template.atmosphere,
        temperature: `${Math.max(...template.temperatureCurve.map(c => c.targetTemp))}°C`,
        endTime: calculateEndTime(prev.startTime, template.estimatedDuration)
      }));
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    startDate.setHours(startDate.getHours() + duration);
    return startDate.toTimeString().slice(0, 5);
  };

  const handleRackToggle = (rackNumber: string) => {
    setScheduleForm(prev => ({
      ...prev,
      rackNumbers: prev.rackNumbers.includes(rackNumber)
        ? prev.rackNumbers.filter(r => r !== rackNumber)
        : [...prev.rackNumbers, rackNumber]
    }));
  };

  const handleSelectAllRacks = () => {
    setScheduleForm(prev => ({
      ...prev,
      rackNumbers: prev.rackNumbers.length === availableRacks.length ? [] : [...availableRacks]
    }));
  };

  const handleSendNotifications = () => {
    console.log('Sending notifications for schedules:', selectedSchedules);
    setShowNotificationDialog(false);
    setSelectedSchedules([]);
  };

  const resetForm = () => {
    setScheduleForm({
      name: '',
      date: '',
      startTime: '',
      endTime: '',
      kilnId: '',
      templateId: '',
      customFiringTypeId: '',
      firingType: '',
      temperature: '',
      atmosphere: 'oxidation',
      operatorId: '',
      operatorName: '',
      rackNumbers: [],
      capacity: 20,
      bookedSlots: 0,
      notes: '',
      notificationSettings: {
        sendStartReminder: true,
        sendCompletionAlert: true,
        notifyOperator: true,
        reminderHoursBefore: 2
      },
      specialInstructions: '',
      locationId: currentStudio?.locations?.[0]?.id || ''
    });
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'in-progress': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center space-x-3 text-3xl font-semibold">
            <Calendar className="w-8 h-8 text-primary" />
            <span>Firing Schedule</span>
          </h1>
          <p className="text-muted-foreground text-lg">Manage kiln firing schedules, templates, and notifications</p>
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
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
                  Create a new firing schedule from scratch or use an existing template
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Details</TabsTrigger>
                  <TabsTrigger value="template">Template & Settings</TabsTrigger>
                  <TabsTrigger value="racks">Rack Assignment</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Firing Name</Label>
                      <Input
                        value={scheduleForm.name}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Morning Bisque Load"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kiln</Label>
                      <Select 
                        value={scheduleForm.kilnId}
                        onValueChange={(value) => setScheduleForm(prev => ({ ...prev, kilnId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select kiln" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentStudio?.kilns?.map(kiln => (
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
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={scheduleForm.endTime}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Operator</Label>
                      <Select 
                        value={scheduleForm.operatorId}
                        onValueChange={(value) => {
                          const operator = operators.find(op => op.id === value);
                          setScheduleForm(prev => ({ 
                            ...prev, 
                            operatorId: value,
                            operatorName: operator?.name || ''
                          }));
                        }}
                      >
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
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select 
                        value={scheduleForm.locationId}
                        onValueChange={(value) => setScheduleForm(prev => ({ ...prev, locationId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentStudio?.locations?.map(location => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Special instructions, notes about this firing..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="template" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Use Existing Template (Optional)</Label>
                      <Badge variant="secondary" className="text-xs">
                        {currentStudio?.kilnFiringTemplates?.length || 0} templates available
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {currentStudio?.kilnFiringTemplates?.filter(t => 
                        !scheduleForm.kilnId || t.kilnId === scheduleForm.kilnId
                      ).map(template => (
                        <div 
                          key={template.id} 
                          className={`p-3 border rounded cursor-pointer transition-colors ${
                            scheduleForm.templateId === template.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                          }`}
                          onClick={() => handleUseTemplate(template.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {template.baseType} • {template.atmosphere} • {template.estimatedDuration}h
                              </p>
                            </div>
                            {scheduleForm.templateId === template.id && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Firing Type</Label>
                      <Select 
                        value={scheduleForm.firingType}
                        onValueChange={(value) => setScheduleForm(prev => ({ ...prev, firingType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select firing type" />
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
                    <div className="space-y-2">
                      <Label>Atmosphere</Label>
                      <Select 
                        value={scheduleForm.atmosphere}
                        onValueChange={(value) => setScheduleForm(prev => ({ ...prev, atmosphere: value }))}
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
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Target Temperature</Label>
                      <Input
                        value={scheduleForm.temperature}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, temperature: e.target.value }))}
                        placeholder="e.g., 1000°C"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        value={scheduleForm.capacity}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Currently Booked</Label>
                      <Input
                        type="number"
                        value={scheduleForm.bookedSlots}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, bookedSlots: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Special Instructions</Label>
                    <Textarea
                      value={scheduleForm.specialInstructions}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      placeholder="Specific firing instructions, safety notes, or special handling requirements..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="racks" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Select Rack Numbers for This Firing</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAllRacks}
                      >
                        {scheduleForm.rackNumbers.length === availableRacks.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                      {availableRacks.map(rack => (
                        <div key={rack} className="flex items-center space-x-2">
                          <Checkbox
                            id={rack}
                            checked={scheduleForm.rackNumbers.includes(rack)}
                            onCheckedChange={() => handleRackToggle(rack)}
                          />
                          <Label htmlFor={rack} className="text-sm font-mono">
                            {rack}
                          </Label>
                        </div>
                      ))}
                    </div>

                    {scheduleForm.rackNumbers.length > 0 && (
                      <div className="space-y-2">
                        <Label>Selected Racks ({scheduleForm.rackNumbers.length})</Label>
                        <div className="flex flex-wrap gap-1">
                          {scheduleForm.rackNumbers.map(rack => (
                            <Badge key={rack} variant="secondary" className="text-xs font-mono">
                              {rack}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>Notification Settings</Label>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Label>Send Start Reminder</Label>
                            <p className="text-sm text-muted-foreground">
                              Notify operator before firing begins
                            </p>
                          </div>
                          <Checkbox
                            checked={scheduleForm.notificationSettings.sendStartReminder}
                            onCheckedChange={(checked) => 
                              setScheduleForm(prev => ({
                                ...prev,
                                notificationSettings: {
                                  ...prev.notificationSettings,
                                  sendStartReminder: checked as boolean
                                }
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Label>Send Completion Alert</Label>
                            <p className="text-sm text-muted-foreground">
                              Notify when firing is complete
                            </p>
                          </div>
                          <Checkbox
                            checked={scheduleForm.notificationSettings.sendCompletionAlert}
                            onCheckedChange={(checked) => 
                              setScheduleForm(prev => ({
                                ...prev,
                                notificationSettings: {
                                  ...prev.notificationSettings,
                                  sendCompletionAlert: checked as boolean
                                }
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Label>Notify Operator</Label>
                            <p className="text-sm text-muted-foreground">
                              Send notifications to assigned operator
                            </p>
                          </div>
                          <Checkbox
                            checked={scheduleForm.notificationSettings.notifyOperator}
                            onCheckedChange={(checked) => 
                              setScheduleForm(prev => ({
                                ...prev,
                                notificationSettings: {
                                  ...prev.notificationSettings,
                                  notifyOperator: checked as boolean
                                }
                              }))
                            }
                          />
                        </div>
                      </div>

                      {scheduleForm.notificationSettings.sendStartReminder && (
                        <div className="space-y-2">
                          <Label>Reminder Time (hours before start)</Label>
                          <Select 
                            value={scheduleForm.notificationSettings.reminderHoursBefore.toString()}
                            onValueChange={(value) => 
                              setScheduleForm(prev => ({
                                ...prev,
                                notificationSettings: {
                                  ...prev.notificationSettings,
                                  reminderHoursBefore: parseInt(value)
                                }
                              }))
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 hour</SelectItem>
                              <SelectItem value="2">2 hours</SelectItem>
                              <SelectItem value="4">4 hours</SelectItem>
                              <SelectItem value="8">8 hours</SelectItem>
                              <SelectItem value="24">24 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSchedule}>
                  <Save className="w-4 h-4 mr-2" />
                  Schedule Firing
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedules">Firing Schedules</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-8">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search firing schedules..."
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedSchedules.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedSchedules.length} selected
                </span>
              </div>
            )}
          </div>

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
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => {
                  const kiln = currentStudio?.kilns?.find(k => k.id === schedule.kilnId);
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
                        <Badge variant={getStatusBadge(schedule.status) as any}>
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
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start by scheduling your first firing'
                  }
                </p>
              </div>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule First Firing
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-8">
          <div className="text-center py-16 space-y-4">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Template Management</h3>
              <p className="text-muted-foreground">
                Manage your firing templates here
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-8">
          <div className="text-center py-16 space-y-4">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Firing Analytics</h3>
              <p className="text-muted-foreground">
                View firing performance and statistics
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}