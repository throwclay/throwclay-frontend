"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Users, BarChart3, MessageCircle, Calendar, Camera, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

// TODO: validate the need for this
function DashboardMockup() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Artist Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Recent Projects</h3>
            <p className="text-muted-foreground">
              View and manage your pottery projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Upcoming Classes</h3>
            <p className="text-muted-foreground">
              Your scheduled pottery classes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Community</h3>
            <p className="text-muted-foreground">
              Connect with other ceramic artists
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [email, setEmail] = useState('');

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle waitlist signup
    alert(`Thank you! We'll notify ${email} when we launch.`);
    setEmail('');
  };

  const handleGetStarted = () => {
    onNavigate('login');
  };

  const handleLogin = () => {
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary flex items-center justify-center" style={{ borderRadius: '68% 32% 62% 38% / 55% 48% 52% 45%' }}>
              </div>
              <span className="text-xl font-bold">Throw Clay</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" onClick={() => onNavigate('studios')}>Find Studios</Button>
              <Button variant="ghost" onClick={() => onNavigate('ceramics')}>Ceramics Marketplace</Button>
              <Button variant="outline" onClick={handleLogin}>Sign In</Button>
              <Button onClick={handleGetStarted}>Get Started</Button>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="outline" onClick={handleLogin}>Sign In</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  🎉 Now Available for Studios & Artists
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  The Complete Platform for
                  <span className="text-primary"> Pottery Studios</span> &
                  <span className="text-primary"> Ceramic Artists</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Manage your studio, document your ceramic journey, connect with artists, and sell your work — all in one powerful platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate('studios')} className="text-lg px-8">
                  Explore Studios
                </Button>
              </div>

              {/* Mobile App Download Buttons */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Also available on mobile:</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* iOS App Store Button */}
                  <a
                    href="#"
                    className="flex items-center space-x-3 bg-foreground text-background px-4 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors w-fit"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>

                  {/* Google Play Store Button */}
                  <a
                    href="#"
                    className="flex items-center space-x-3 bg-foreground text-background px-4 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors w-fit"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <DashboardMockup />

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-background border rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Studio Online</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-background border rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">47 Active Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <p className="text-muted-foreground">Trusted by pottery studios and ceramic artists worldwide</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              {/* Artisan Clay Co. */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-sm"
                    style={{ borderRadius: '65% 35% 70% 30% / 60% 40% 60% 40%' }}
                  >
                    <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
                  </div>
                  <span className="font-semibold text-base">Artisan Clay Co.</span>
                </div>
              </div>

              {/* Kiln & Wheel */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-sm"
                    style={{ borderRadius: '50% 50% 70% 30% / 40% 60% 40% 60%' }}
                  >
                    <div className="w-6 h-1 bg-white rounded-full opacity-90"></div>
                  </div>
                  <span className="font-semibold text-base">Kiln & Wheel</span>
                </div>
              </div>

              {/* Ceramic Collective */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm"
                    style={{ borderRadius: '75% 25% 60% 40% / 50% 70% 30% 50%' }}
                  >
                    <div className="flex space-x-0.5">
                      <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
                    </div>
                  </div>
                  <span className="font-semibold text-base">Ceramic Collective</span>
                </div>
              </div>

              {/* Clay Studio Pro */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-sm"
                    style={{ borderRadius: '45% 55% 65% 35% / 70% 30% 70% 30%' }}
                  >
                    <div className="w-3 h-5 bg-white opacity-90" style={{ borderRadius: '50% 50% 0 0' }}></div>
                  </div>
                  <span className="font-semibold text-base">Clay Studio Pro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Everything You Need in One Platform</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're running a studio or creating as an independent artist, Throw Clay has the tools you need to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Studio Management */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Studio Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                  Complete studio operations with member management, class scheduling, firing calendars, and staff coordination.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Member & Staff Management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Class & Event Scheduling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Firing Schedule Coordination</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Time Tracking & Payroll</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Digital Pottery Journal */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Digital Pottery Journal</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                  Document your ceramic journey with photos, sketches, notes, and detailed project tracking with our innovative whiteboard interface.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Visual Whiteboard Mode</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Photo & Sketch Upload</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Project Organization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Collaboration Tools</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Artist Portfolios */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Artist Portfolios</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                  Showcase your work with beautiful, customizable portfolios and connect with other artists and potential customers.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Customizable Portfolios</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Social Media Integration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Artist Networking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Custom Domains</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* E-commerce & Sales */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>E-commerce & Sales</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                  Sell your ceramic pieces through integrated marketplace with built-in payment processing and commission management.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Integrated Marketplace</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Payment Processing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Commission Tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Inventory Management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Communication */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Communication Hub</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                  Stay connected with integrated messaging, class discussions, announcements, and community features.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Direct Messaging</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Class Group Chats</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Studio Announcements</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Community Forums</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Security & Reliability */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Security & Reliability</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                  Enterprise-grade security with automatic backups, data protection, and reliable uptime for your business.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>99.9% Uptime Guarantee</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Automatic Backups</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Data Encryption</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>24/7 Support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">
              Start free and scale as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Free Plan */}
            <Card className="relative p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-center">Free</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground"> forever</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">Perfect for getting started</p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>2 projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>9 total throws</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Basic portfolio</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Community access</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={handleGetStarted}>
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Passion Plan */}
            <Card className="relative p-6 border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-center">Passion</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold">$12</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">For serious ceramic artists</p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>15 projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>135 total throws</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Advanced portfolio</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Photo uploads</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Collaboration tools</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>PDF exports</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={handleGetStarted}>
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Artists Plan */}
            <Card className="relative p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-center">Artists</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">For professional artists</p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>30 projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>340 total throws</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Premium portfolio</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Custom domain</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>E-commerce integration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={handleGetStarted}>
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Studio Plan */}
            <Card className="relative p-6 bg-primary/5 border-primary">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-center">Studio</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold">$249</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">For pottery studios</p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Unlimited projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Studio management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Member management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Class scheduling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Firing coordination</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>White-label branding</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={handleGetStarted}>
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Hear from studios and artists using Throw Clay
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Throw Clay has revolutionized how we manage our studio. The firing coordination and member management features have saved us countless hours."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-semibold">Sarah Martinez</p>
                    <p className="text-sm text-muted-foreground">Clay & Fire Studio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The digital journal is incredible. I can document my entire ceramic journey with photos and notes. The whiteboard mode is a game-changer."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary rounded-full"></div>
                  <div>
                    <p className="font-semibold">Alex Rivera</p>
                    <p className="text-sm text-muted-foreground">Independent Artist</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Our students love the portfolio features and being able to track their progress. It's helped build a stronger community around our studio."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-full"></div>
                  <div>
                    <p className="font-semibold">Mike Chen</p>
                    <p className="text-sm text-muted-foreground">Eastside Ceramics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Transform Your Ceramic Journey?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of studios and artists who are already using Throw Clay to manage their pottery practice and grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate('studios')} className="text-lg px-8">
                Explore Studios
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center" style={{ borderRadius: '68% 32% 62% 38% / 55% 48% 52% 45%' }}>
                </div>
                <span className="text-xl font-bold">Throw Clay</span>
              </div>
              <p className="text-muted-foreground">
                The complete platform for pottery studios and ceramic artists.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Button variant="link" className="p-0 h-auto" onClick={() => onNavigate('studios')}>Find Studios</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => onNavigate('ceramics')}>Ceramics Marketplace</Button></li>
                <li><a href="#" className="hover:text-foreground">Mobile App</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Throw Clay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}