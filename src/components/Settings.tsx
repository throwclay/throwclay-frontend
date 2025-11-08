import { useState } from "react";
import { User, Building2, Bell, Shield, Palette, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { StudioSettings } from "./StudioSettings";

import type { User as UserType } from "@/types";

interface SettingsProps {
  currentUser: UserType | null;
}

export function Settings({ currentUser }: SettingsProps) {
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1>Settings</h1>
          <p className="text-muted-foreground">
            Please log in to access settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1>Settings</h1>
        <p className="text-muted-foreground">
          Manage your {currentUser.type === "studio" ? "studio" : "account"}{" "}
          settings and preferences
        </p>
      </div>

      <Tabs
        defaultValue={currentUser.type === "studio" ? "studio" : "profile"}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          {currentUser.type === "studio" && (
            <TabsTrigger value="studio" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Studio</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center space-x-2"
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Studio Settings Tab */}
        {currentUser.type === "studio" && (
          <TabsContent value="studio">
            <StudioSettings />
          </TabsContent>
        )}

        {/* Profile Settings Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-sm text-muted-foreground bg-accent/50 p-2 rounded mt-1">
                    {currentUser.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground bg-accent/50 p-2 rounded mt-1">
                    {currentUser.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Handle</label>
                  <p className="text-sm text-muted-foreground bg-accent/50 p-2 rounded mt-1">
                    @{currentUser.handle}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Account Type</label>
                  <p className="text-sm text-muted-foreground bg-accent/50 p-2 rounded mt-1 capitalize">
                    {currentUser.type}
                  </p>
                </div>
                {currentUser.subscription && (
                  <div>
                    <label className="text-sm font-medium">Subscription</label>
                    <p className="text-sm text-muted-foreground bg-accent/50 p-2 rounded mt-1 capitalize">
                      {currentUser.subscription.replace("-", " ")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Notification settings will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Security settings will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
