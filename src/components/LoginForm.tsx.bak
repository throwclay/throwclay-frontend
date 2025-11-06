import { useState } from 'react';
import { User, Building2, Palette, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface LoginFormProps {
  onLogin: (userData: { email: string; userType: 'artist' | 'studio' }) => void;
  onBack: () => void;
}

export function LoginForm({ onLogin, onBack }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (userType: 'studio' | 'artist') => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onLogin({ email, userType });
    setIsLoading(false);
  };

  const demoLogin = (userType: 'studio' | 'artist') => {
    const demoCredentials = {
      studio: { email: 'admin@clayandfire.com', password: 'demo123' },
      artist: { email: 'alex@artist.com', password: 'demo123' }
    };
    
    setEmail(demoCredentials[userType].email);
    setPassword(demoCredentials[userType].password);
    handleSubmit(userType);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary flex items-center justify-center" style={{ borderRadius: '68% 32% 62% 38% / 55% 48% 52% 45%' }}>
              </div>
              <span className="text-xl font-bold">Throw Clay</span>
            </div>
            <CardTitle>Welcome Back</CardTitle>
            <p className="text-muted-foreground">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="studio" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="studio" className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Studio</span>
                </TabsTrigger>
                <TabsTrigger value="artist" className="flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>Artist</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="studio" className="space-y-4">
                <div className="text-center mb-4">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Studio Login</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your pottery studio, artists, classes, and business operations
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="studio-email">Email</Label>
                    <Input
                      id="studio-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@yourstudio.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studio-password">Password</Label>
                    <Input
                      id="studio-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit('studio')}
                    disabled={isLoading || !email}
                    className="w-full"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in to Studio'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => demoLogin('studio')}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Try Studio Demo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="artist" className="space-y-4">
                <div className="text-center mb-4">
                  <Palette className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Artist Login</h3>
                  <p className="text-sm text-muted-foreground">
                    Access your pottery journal, portfolio, and connect with studios
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="artist-email">Email</Label>
                    <Input
                      id="artist-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist-password">Password</Label>
                    <Input
                      id="artist-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit('artist')}
                    disabled={isLoading || !email}
                    className="w-full"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in as Artist'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => demoLogin('artist')}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Try Artist Demo
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>New to our platform?</p>
              <Button variant="link" className="p-0 h-auto">
                Create an account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}