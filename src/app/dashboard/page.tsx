"use client"

import { Users, Calendar, Flame, BarChart3, Clock, CheckCircle, AlertCircle, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function DashboardMockup() {
  return (
    <div className="bg-gray-100 p-2 rounded-lg shadow-2xl max-w-4xl mx-auto">
      {/* Browser chrome */}
      <div className="bg-gray-200 rounded-t-lg px-3 py-1.5 flex items-center space-x-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        <div className="flex-1 bg-white rounded px-2 py-0.5 mx-3">
          <span className="text-xs text-gray-600">throwclay.com/dashboard</span>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="bg-white rounded-b-lg p-4 min-h-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Studio Dashboard</h1>
            <p className="text-sm text-gray-600">Artisan Clay Studio</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800 text-xs">Studio Pro</Badge>
            <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">Members</CardTitle>
              <Users className="h-3 w-3 text-blue-600" />
            </CardHeader>
            <CardContent className="pb-1">
              <div className="text-lg font-bold text-gray-900">47</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-2 w-2 mr-1" />
                +12%
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">Classes</CardTitle>
              <Calendar className="h-3 w-3 text-purple-600" />
            </CardHeader>
            <CardContent className="pb-1">
              <div className="text-lg font-bold text-gray-900">18</div>
              <p className="text-xs text-gray-600">This week</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">Firings</CardTitle>
              <Flame className="h-3 w-3 text-orange-600" />
            </CardHeader>
            <CardContent className="pb-1">
              <div className="text-lg font-bold text-gray-900">3</div>
              <p className="text-xs text-orange-600">Scheduled</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium text-gray-600">Revenue</CardTitle>
              <BarChart3 className="h-3 w-3 text-green-600" />
            </CardHeader>
            <CardContent className="pb-1">
              <div className="text-lg font-bold text-gray-900">$12.8k</div>
              <p className="text-xs text-green-600">+8%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Firing Schedule */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Flame className="h-4 w-4 mr-1.5 text-orange-600" />
                Firing Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">Bisque Firing</p>
                  <p className="text-xs text-gray-600">Tomorrow 9AM</p>
                </div>
                <Badge variant="secondary" className="text-xs">12/20</Badge>
              </div>

              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">Glaze Firing</p>
                  <p className="text-xs text-gray-600">June 18</p>
                </div>
                <Badge variant="secondary" className="text-xs">8/15</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1.5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                <div>
                  <p className="text-xs font-medium">New member application</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <div>
                  <p className="text-xs font-medium">Class enrollment</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></div>
                <div>
                  <p className="text-xs font-medium">Firing completed</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Card className="border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-3 text-center">
              <Users className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <p className="text-xs font-medium">Members</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-3 text-center">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <p className="text-xs font-medium">Classes</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-3 text-center">
              <Flame className="h-4 w-4 mx-auto mb-1 text-orange-600" />
              <p className="text-xs font-medium">Firings</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-3 text-center">
              <BarChart3 className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-xs font-medium">Reports</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}