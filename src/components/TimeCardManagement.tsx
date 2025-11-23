import { useState, useEffect } from 'react';
import {
  Clock, Calendar, Check, X, AlertTriangle, Download, Upload, Search, Filter,
  ChevronDown, ChevronUp, Edit, Save, MoreHorizontal, FileText, Eye, DollarSign,
  Users, TrendingUp, Activity, CheckCircle, XCircle, AlertCircle, PlayCircle,
  PauseCircle, Plus, Minus, RotateCcw, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppContext, type TimeCard, type TimeCardEntry, type PayPeriod, type User } from '@/app/context/AppContext';

export function TimeCardManagement() {
  const context = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPayPeriod, setSelectedPayPeriod] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showTimeCardDialog, setShowTimeCardDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedTimeCard, setSelectedTimeCard] = useState<TimeCard | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimeCardEntry | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data - in real app, this would come from your backend
  const [timeCards] = useState<TimeCard[]>([
    {
      id: 'tc1',
      employeeId: 'emp1',
      employeeName: 'Sarah Wilson',
      payPeriodId: 'pp1',
      entries: [
        {
          id: 'tce1',
          date: '2025-06-10',
          clockIn: '09:00',
          clockOut: '17:30',
          breakStart: ['12:00', '15:00'],
          breakEnd: ['12:30', '15:15'],
          totalHours: 8.0,
          regularHours: 8.0,
          overtimeHours: 0,
          category: 'operations',
          locationId: 'loc1',
          notes: 'Studio management tasks',
          wasScheduled: true,
          scheduledStart: '09:00',
          scheduledEnd: '17:00',
          status: 'approved',
          submittedAt: '2025-06-10T17:30:00Z',
          reviewedAt: '2025-06-11T08:00:00Z',
          reviewedBy: 'mgr1'
        },
        {
          id: 'tce2',
          date: '2025-06-11',
          clockIn: '08:45',
          clockOut: '18:00',
          breakStart: ['12:00'],
          breakEnd: ['13:00'],
          totalHours: 8.25,
          regularHours: 8.0,
          overtimeHours: 0.25,
          category: 'operations',
          locationId: 'loc1',
          notes: 'Extra time for inventory management',
          wasScheduled: true,
          scheduledStart: '09:00',
          scheduledEnd: '17:00',
          discrepancyReason: 'Stayed late to complete inventory count',
          status: 'needs-review',
          submittedAt: '2025-06-11T18:00:00Z'
        }
      ],
      totalRegularHours: 16.0,
      totalOvertimeHours: 0.25,
      totalHours: 16.25,
      status: 'needs-review',
      submittedAt: '2025-06-11T18:00:00Z',
      submittedBy: 'emp1',
      createdAt: '2025-06-10T09:00:00Z',
      updatedAt: '2025-06-11T18:00:00Z'
    },
    {
      id: 'tc2',
      employeeId: 'emp2',
      employeeName: 'Mike Chen',
      payPeriodId: 'pp1',
      entries: [
        {
          id: 'tce3',
          date: '2025-06-10',
          clockIn: '10:00',
          clockOut: '18:00',
          breakStart: ['14:00'],
          breakEnd: ['14:30'],
          totalHours: 7.5,
          regularHours: 7.5,
          overtimeHours: 0,
          category: 'classes',
          locationId: 'loc2',
          notes: 'Beginner wheel throwing class',
          wasScheduled: true,
          scheduledStart: '10:00',
          scheduledEnd: '18:00',
          status: 'approved',
          submittedAt: '2025-06-10T18:00:00Z',
          reviewedAt: '2025-06-11T09:00:00Z',
          reviewedBy: 'mgr1'
        }
      ],
      totalRegularHours: 7.5,
      totalOvertimeHours: 0,
      totalHours: 7.5,
      status: 'approved',
      submittedAt: '2025-06-10T18:00:00Z',
      submittedBy: 'emp2',
      approvedAt: '2025-06-11T09:00:00Z',
      approvedBy: 'mgr1',
      createdAt: '2025-06-10T10:00:00Z',
      updatedAt: '2025-06-11T09:00:00Z'
    },
    {
      id: 'tc3',
      employeeId: 'emp3',
      employeeName: 'Emma Davis',
      payPeriodId: 'pp1',
      entries: [
        {
          id: 'tce4',
          date: '2025-06-12',
          clockIn: '09:30',
          clockOut: '19:00',
          breakStart: ['13:00'],
          breakEnd: ['14:00'],
          totalHours: 8.5,
          regularHours: 8.0,
          overtimeHours: 0.5,
          category: 'classes',
          locationId: 'loc1',
          notes: 'Advanced ceramics workshop + setup time',
          wasScheduled: true,
          scheduledStart: '10:00',
          scheduledEnd: '18:00',
          discrepancyReason: 'Early arrival for workshop setup, stayed late for cleanup',
          status: 'submitted',
          submittedAt: '2025-06-12T19:00:00Z'
        }
      ],
      totalRegularHours: 8.0,
      totalOvertimeHours: 0.5,
      totalHours: 8.5,
      status: 'submitted',
      submittedAt: '2025-06-12T19:00:00Z',
      submittedBy: 'emp3',
      createdAt: '2025-06-12T09:30:00Z',
      updatedAt: '2025-06-12T19:00:00Z'
    }
  ]);

  const [employees] = useState<User[]>([
    {
      id: 'emp1',
      name: 'Sarah Wilson',
      email: 'sarah@artisanclay.com',
      handle: 'sarahwilson',
      type: 'artist',
      role: 'manager',
      studioId: context.currentStudio?.id,
      managerProfile: {
        id: 'mgr1',
        userId: 'emp1',
        studioId: context.currentStudio?.id || '1',
        role: 'manager',
        responsibilities: [],
        standardWorkHours: {
          monday: { start: '09:00', end: '17:00', isAvailable: true },
          tuesday: { start: '09:00', end: '17:00', isAvailable: true },
          wednesday: { start: '09:00', end: '17:00', isAvailable: true },
          thursday: { start: '09:00', end: '17:00', isAvailable: true },
          friday: { start: '09:00', end: '17:00', isAvailable: true },
          saturday: { start: '10:00', end: '16:00', isAvailable: true },
          sunday: { start: '10:00', end: '16:00', isAvailable: false }
        },
        permissions: {
          manageMembers: true,
          manageClasses: true,
          manageEvents: true,
          manageMessages: true,
          manageInventory: true,
          manageFiring: true,
          manageFinances: true,
          manageSettings: false,
          deleteProfiles: false,
          changeSubscription: false,
          approveTimeCards: true,
          viewPayroll: true
        },
        maxVacationDays: 15,
        maxSickDays: 10,
        usedVacationDays: 3,
        usedSickDays: 1,
        isActive: true,
        hiredDate: '2024-01-15',
        hourlyRate: 25.00,
        salaryType: 'hourly',
        overtimeEligible: true
      }
    },
    {
      id: 'emp2',
      name: 'Mike Chen',
      email: 'mike@artisanclay.com',
      handle: 'mikechen',
      type: 'artist',
      role: 'instructor',
      studioId: context.currentStudio?.id,
      instructorProfile: {
        id: 'inst1',
        userId: 'emp2',
        studioId: context.currentStudio?.id || '1',
        specialties: ['Wheel Throwing', 'Glazing'],
        certifications: ['Pottery Safety Certification'],
        experience: '8 years',
        hourlyRate: 30.00,
        availability: {
          monday: { start: '10:00', end: '18:00', isAvailable: true },
          tuesday: { start: '10:00', end: '18:00', isAvailable: true },
          wednesday: { start: '10:00', end: '18:00', isAvailable: true },
          thursday: { start: '10:00', end: '18:00', isAvailable: true },
          friday: { start: '10:00', end: '18:00', isAvailable: true },
          saturday: { start: '09:00', end: '17:00', isAvailable: true },
          sunday: { start: '12:00', end: '17:00', isAvailable: true }
        },
        assignedClasses: ['class1', 'class2'],
        isActive: true,
        hiredDate: '2023-09-01'
      }
    },
    {
      id: 'emp3',
      name: 'Emma Davis',
      email: 'emma@artisanclay.com',
      handle: 'emmadavis',
      type: 'artist',
      role: 'instructor',
      studioId: context.currentStudio?.id,
      instructorProfile: {
        id: 'inst2',
        userId: 'emp3',
        studioId: context.currentStudio?.id || '1',
        specialties: ['Advanced Ceramics', 'Sculpture'],
        certifications: ['Advanced Ceramics Certification'],
        experience: '12 years',
        hourlyRate: 35.00,
        availability: {
          monday: { start: '10:00', end: '18:00', isAvailable: true },
          tuesday: { start: '10:00', end: '18:00', isAvailable: true },
          wednesday: { start: '10:00', end: '18:00', isAvailable: true },
          thursday: { start: '10:00', end: '18:00', isAvailable: true },
          friday: { start: '10:00', end: '18:00', isAvailable: true },
          saturday: { start: '09:00', end: '17:00', isAvailable: true },
          sunday: { start: '12:00', end: '17:00', isAvailable: false }
        },
        assignedClasses: ['class3', 'class4'],
        isActive: true,
        hiredDate: '2022-03-15'
      }
    }
  ]);

  const currentPayPeriod = context.currentStudio?.payPeriods?.find(pp => pp.status === 'open') || context.currentStudio?.payPeriods?.[0];

  const filteredTimeCards = timeCards.filter(timeCard => {
    const matchesSearch = timeCard.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || timeCard.status === statusFilter;
    const matchesPayPeriod = selectedPayPeriod === 'current' || timeCard.payPeriodId === selectedPayPeriod;

    return matchesSearch && matchesStatus && matchesPayPeriod;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-500' },
      submitted: { label: 'Submitted', color: 'bg-blue-500' },
      'needs-review': { label: 'Needs Review', color: 'bg-yellow-500' },
      approved: { label: 'Approved', color: 'bg-green-500' },
      rejected: { label: 'Rejected', color: 'bg-red-500' },
      processed: { label: 'Processed', color: 'bg-purple-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };

    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'needs-review': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'submitted': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const calculateHourlyPay = (employee: User, regularHours: number, overtimeHours: number) => {
    const hourlyRate = employee.managerProfile?.hourlyRate || employee.instructorProfile?.hourlyRate || 20;
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * 1.5; // 1.5x for overtime
    return { regularPay, overtimePay, totalPay: regularPay + overtimePay };
  };

  const handleApproveTimeCard = (timeCardId: string, action: 'approved' | 'rejected') => {
    console.log(`${action} time card:`, timeCardId, 'Notes:', approvalNotes);
    setShowApprovalDialog(false);
    setApprovalNotes('');
    setSelectedTimeCard(null);
  };

  const handleClockIn = () => {
    if (!clockInTime || !selectedDate) return;

    const newEntry: TimeCardEntry = {
      id: `tce${Date.now()}`,
      date: selectedDate,
      clockIn: clockInTime,
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      category: 'operations',
      wasScheduled: false,
      status: 'draft'
    };

    console.log('Clock in entry:', newEntry);
    setClockInTime('');
  };

  const handleClockOut = () => {
    if (!clockOutTime) return;

    console.log('Clock out time:', clockOutTime);
    setClockOutTime('');
  };

  const getSummaryStats = () => {
    const pending = timeCards.filter(tc => tc.status === 'submitted' || tc.status === 'needs-review').length;
    const approved = timeCards.filter(tc => tc.status === 'approved').length;
    const totalHours = timeCards.reduce((sum, tc) => sum + tc.totalHours, 0);
    const totalOvertime = timeCards.reduce((sum, tc) => sum + tc.totalOvertimeHours, 0);

    return { pending, approved, totalHours, totalOvertime };
  };

  const stats = getSummaryStats();

  const canApproveTimeCards = context.currentUser?.managerProfile?.permissions?.approveTimeCards ||
                            context.currentUser?.role === 'owner' ||
                            context.currentUser?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Time Card Management</h1>
          <p className="text-muted-foreground">
            Manage employee time cards, approvals, and payroll processing
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {context.currentStudio?.settings?.allowSelfClockIn && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Quick Clock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Quick Clock In/Out</DialogTitle>
                  <DialogDescription>
                    Clock in or out for today's shift.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Clock In</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="time"
                          value={clockInTime}
                          onChange={(e) => setClockInTime(e.target.value)}
                        />
                        <Button onClick={handleClockIn} disabled={!clockInTime}>
                          <PlayCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Clock Out</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="time"
                          value={clockOutTime}
                          onChange={(e) => setClockOutTime(e.target.value)}
                        />
                        <Button onClick={handleClockOut} disabled={!clockOutTime}>
                          <PauseCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Time Card
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overtime Hours</p>
                <p className="text-2xl font-bold">{stats.totalOvertime.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPayPeriod} onValueChange={setSelectedPayPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Pay Period</SelectItem>
                {context.currentStudio?.payPeriods?.map(period => (
                  <SelectItem key={period.id} value={period.id}>
                    {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="needs-review">Needs Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Regular</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimeCards.map((timeCard) => {
                const employee = employees.find(emp => emp.id === timeCard.employeeId);
                const payPeriod = context.currentStudio?.payPeriods?.find(pp => pp.id === timeCard.payPeriodId);
                const pay = employee ? calculateHourlyPay(employee, timeCard.totalRegularHours, timeCard.totalOvertimeHours) : null;

                return (
                  <TableRow key={timeCard.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={employee?.profile?.profileImage} />
                          <AvatarFallback>
                            {timeCard.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{timeCard.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee?.role || 'Employee'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payPeriod ? (
                        <div>
                          <p className="text-sm">
                            {new Date(payPeriod.startDate).toLocaleDateString()} - {new Date(payPeriod.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{timeCard.totalHours.toFixed(1)}h</span>
                    </TableCell>
                    <TableCell>{timeCard.totalRegularHours.toFixed(1)}h</TableCell>
                    <TableCell>
                      {timeCard.totalOvertimeHours > 0 ? (
                        <span className="text-orange-600 font-medium">
                          {timeCard.totalOvertimeHours.toFixed(1)}h
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0h</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(timeCard.status)}
                        {getStatusBadge(timeCard.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {timeCard.submittedAt ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(timeCard.submittedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not submitted</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedTimeCard(timeCard)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {canApproveTimeCards && (timeCard.status === 'submitted' || timeCard.status === 'needs-review') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTimeCard(timeCard);
                                  setShowApprovalDialog(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Review & Approve
                              </DropdownMenuItem>
                            </>
                          )}
                          {pay && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Est. Pay: ${pay.totalPay.toFixed(2)}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Time Card Details Dialog */}
      <Dialog open={!!selectedTimeCard && !showApprovalDialog} onOpenChange={() => setSelectedTimeCard(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Time Card Details - {selectedTimeCard?.employeeName}</DialogTitle>
            <DialogDescription>
              Review time entries and approve or reject the time card.
            </DialogDescription>
          </DialogHeader>

          {selectedTimeCard && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-xl font-bold">{selectedTimeCard.totalHours.toFixed(1)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Regular</p>
                    <p className="text-xl font-bold">{selectedTimeCard.totalRegularHours.toFixed(1)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Overtime</p>
                    <p className="text-xl font-bold text-orange-600">{selectedTimeCard.totalOvertimeHours.toFixed(1)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedTimeCard.status)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Time Entries */}
              <div>
                <h4 className="mb-4">Time Entries</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTimeCard.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className={entry.wasScheduled && entry.scheduledStart !== entry.clockIn ? 'text-orange-600' : ''}>
                              {entry.clockIn}
                            </span>
                            {entry.wasScheduled && entry.scheduledStart && entry.scheduledStart !== entry.clockIn && (
                              <p className="text-xs text-muted-foreground">
                                Scheduled: {entry.scheduledStart}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className={entry.wasScheduled && entry.scheduledEnd !== entry.clockOut ? 'text-orange-600' : ''}>
                              {entry.clockOut || 'Not clocked out'}
                            </span>
                            {entry.wasScheduled && entry.scheduledEnd && entry.scheduledEnd !== entry.clockOut && (
                              <p className="text-xs text-muted-foreground">
                                Scheduled: {entry.scheduledEnd}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{entry.totalHours.toFixed(1)}h</span>
                            {entry.overtimeHours > 0 && (
                              <p className="text-xs text-orange-600">
                                +{entry.overtimeHours.toFixed(1)}h OT
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(entry.status)}
                            <span className="text-sm">{entry.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-48">
                            {entry.notes && (
                              <p className="text-sm">{entry.notes}</p>
                            )}
                            {entry.discrepancyReason && (
                              <p className="text-xs text-orange-600 mt-1">
                                Discrepancy: {entry.discrepancyReason}
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Time Card</DialogTitle>
            <DialogDescription>
              Approve or reject {selectedTimeCard?.employeeName}'s time card.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-lg font-bold">{selectedTimeCard?.totalHours.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regular</p>
                <p className="text-lg font-bold">{selectedTimeCard?.totalRegularHours.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overtime</p>
                <p className="text-lg font-bold text-orange-600">
                  {selectedTimeCard?.totalOvertimeHours.toFixed(1)}
                </p>
              </div>
            </div>

            <div>
              <Label>Review Notes</Label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalDialog(false);
                  setApprovalNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedTimeCard && handleApproveTimeCard(selectedTimeCard.id, 'rejected')}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => selectedTimeCard && handleApproveTimeCard(selectedTimeCard.id, 'approved')}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}