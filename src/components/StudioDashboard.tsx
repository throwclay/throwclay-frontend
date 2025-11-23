import { useState } from 'react';
import { Calendar, Clock, Thermometer, Users, Flame, MessageCircle, Camera, MapPin, Activity, TrendingUp, AlertTriangle, CheckCircle, Star, Bell, Eye, MessageSquare, UserCheck, Palette, Droplets, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/app/context/AppContext';

export function StudioDashboard() {
  const context = useAppContext();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Determine if current user is studio owner/admin
  const isStudioOwner = context.currentUser?.type === 'studio' || context.currentUser?.role === 'owner' || context.currentUser?.role === 'admin';

  // Mock kilns data since it's not in the Studio interface
  const mockKilns = [
    {
      id: 'kiln_1',
      name: 'Main Electric Kiln',
      type: 'electric',
      status: 'available',
      capacity: 30,
      maxTemp: 1260,
      lastFired: '2025-01-10T00:00:00Z',
      notes: 'Recently serviced and ready for bisque firings'
    },
    {
      id: 'kiln_2',
      name: 'Gas Reduction Kiln',
      type: 'gas',
      status: 'firing',
      capacity: 25,
      maxTemp: 1280,
      lastFired: '2025-01-12T00:00:00Z',
      notes: 'Currently running glaze firing - completion expected tomorrow'
    },
    {
      id: 'kiln_3',
      name: 'Raku Kiln',
      type: 'raku',
      status: 'maintenance',
      capacity: 15,
      maxTemp: 1000,
      lastFired: '2025-01-05T00:00:00Z',
      notes: 'Scheduled for maintenance this week'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">
          {isStudioOwner ? 'Studio Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isStudioOwner
            ? 'Manage your studio operations and monitor key metrics'
            : 'Welcome back to the studio'
          }
        </p>
      </div>

      {/* Quick Stats - Only for studio owners */}
      {isStudioOwner && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Members</span>
            </div>
            <p className="text-3xl font-semibold">{context.currentStudio?.memberCount || 24}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Revenue This Month</span>
            </div>
            <p className="text-3xl font-semibold">$3,240</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Classes This Week</span>
            </div>
            <p className="text-3xl font-semibold">{context.currentStudio?.classCount || 12}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Flame className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Kilns Running</span>
            </div>
            <p className="text-3xl font-semibold">2</p>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kilns">Kilns</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Firing Schedule */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Flame className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">
                  {isStudioOwner ? 'Firing Schedule' : 'Upcoming Firings'}
                </h2>
              </div>

              <div className="space-y-6">
                {context.currentStudio?.firingSchedule?.map((firing) => (
                  <div key={firing.id} className="flex items-center justify-between py-6 border-b">
                    <div className="flex items-center space-x-4">
                      <Thermometer className="w-5 h-5 text-muted-foreground" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-lg">{firing.type} Firing</h4>
                        <p className="text-muted-foreground">
                          {new Date(firing.date).toLocaleDateString()} • {firing.temperature}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">
                            {firing.bookedSlots}/{firing.capacity} slots filled
                          </span>
                          <Progress
                            value={(firing.bookedSlots / firing.capacity) * 100}
                            className="w-24 h-2"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="default">
                        Scheduled
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming firings scheduled
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 py-4">
                  <UserCheck className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">New member enrolled</p>
                    <p className="text-sm text-muted-foreground">Sarah Wilson joined the studio</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 py-4">
                  <Flame className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">Bisque firing completed</p>
                    <p className="text-sm text-muted-foreground">Main kiln finished successfully</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 py-4">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">Class scheduled</p>
                    <p className="text-sm text-muted-foreground">Wheel throwing workshop added</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 py-4">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">New message received</p>
                    <p className="text-sm text-muted-foreground">Question about glazing techniques</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Upcoming Classes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4 py-6 border-b">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Wheel Throwing Basics</h4>
                  <p className="text-muted-foreground">
                    Introduction to pottery wheel techniques
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">Tomorrow, 2:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">8/12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Instructor</span>
                    <span className="font-medium">Sarah Wilson</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 py-6 border-b">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Glazing Workshop</h4>
                  <p className="text-muted-foreground">
                    Advanced glazing techniques and color theory
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">Friday, 10:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">6/8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Instructor</span>
                    <span className="font-medium">Mike Chen</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 py-6 border-b">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Hand Building</h4>
                  <p className="text-muted-foreground">
                    Coil and slab construction methods
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">Saturday, 1:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">10/15</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Instructor</span>
                    <span className="font-medium">Emma Davis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kilns" className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Flame className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Kiln Status</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {mockKilns.map((kiln) => (
                <div key={kiln.id} className="space-y-6 py-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{kiln.name}</h3>
                    <Badge variant={kiln.status === 'available' ? 'default' : 'secondary'}>
                      {kiln.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Type</span>
                      <p className="font-medium capitalize">{kiln.type}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Capacity</span>
                      <p className="font-medium">{kiln.capacity} pieces</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Max Temp</span>
                      <p className="font-medium">{kiln.maxTemp}°C</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Last Fired</span>
                      <p className="font-medium">
                        {kiln.lastFired ? new Date(kiln.lastFired).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  {kiln.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-muted-foreground">{kiln.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Recent Member Activity</h2>
            </div>

            <div className="space-y-6">
              {[
                { name: 'Sarah Wilson', action: 'Joined the studio', time: '2 hours ago', status: 'new' },
                { name: 'Mike Chen', action: 'Renewed membership', time: '1 day ago', status: 'renewed' },
                { name: 'Emma Davis', action: 'Completed wheel throwing class', time: '2 days ago', status: 'completed' },
                { name: 'John Smith', action: 'Scheduled firing slot', time: '3 days ago', status: 'scheduled' },
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.action}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline">
                      {member.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{member.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Analytics Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-3">
                <p className="text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-semibold">$12,450</p>
                <p className="text-sm text-muted-foreground">+15% from last month</p>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground">Active Memberships</p>
                <p className="text-3xl font-semibold">{context.currentStudio?.memberCount || 24}</p>
                <p className="text-sm text-muted-foreground">+3 new this month</p>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground">Class Completion Rate</p>
                <p className="text-3xl font-semibold">92%</p>
                <p className="text-sm text-muted-foreground">Above average</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}