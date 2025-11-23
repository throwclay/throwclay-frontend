import { useState } from 'react';
import { Users, Clock, UserCog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmployeeManagement } from './EmployeeManagement';
import { TimeCardManagement } from './TimeCardManagement';
import { useAppContext } from '@/app/context/AppContext';

export default function StaffManagement() {
  const { currentUser, currentStudio } = useAppContext();
  const [activeTab, setActiveTab] = useState('employees');

  // Mock data for pending counts - in real app this would come from your backend
  const pendingTimeCards = 3; // Number of time cards awaiting approval
  const pendingTimeOffRequests = 2; // Number of time off requests awaiting approval

  // Check if user has permission to manage staff
  const canManageStaff = currentUser?.role === 'owner' ||
                        currentUser?.role === 'admin' ||
                        currentUser?.managerProfile?.permissions?.approveTimeCards;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <UserCog className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1>Staff Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage employees, instructors, time cards, and payroll for your pottery studio
        </p>
      </div>

      {/* Staff Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="employees" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Employees</span>
            {pendingTimeOffRequests > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingTimeOffRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="timecards" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Time Cards</span>
            {pendingTimeCards > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingTimeCards}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="timecards" className="space-y-6">
          <TimeCardManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}