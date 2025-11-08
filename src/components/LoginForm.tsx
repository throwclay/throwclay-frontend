import { useState } from "react";
import { User, Building2, Palette, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

import { supabase } from "../lib/apis/supabaseClient";
import { ensureProfile } from "../lib/ensureProfile";

interface LoginFormProps {
  onLogin: (userData: { email: string; userType: "artist" | "studio" }) => void;
  onBack: () => void;
}

export function LoginForm({ onLogin, onBack }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [selectedUserType, setSelectedUserType] = useState<"artist" | "studio">(
    "studio"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (userType: "studio" | "artist") => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (authMode === "login") {
        // --- LOGIN FLOW ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (!data.session) {
          // If email confirmations are enabled and user hasn't confirmed yet
          setMessage(
            "Check your email to verify your account before signing in."
          );
          return;
        }

        // ✅ User is logged in, make sure profile exists
        await ensureProfile(userType);

        // Then bubble up to parent
        onLogin({ email, userType });
      } else {
        // --- SIGNUP FLOW ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { user_type: userType },
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (!data.session) {
          // Email confirmation ON
          setMessage(
            "Account created! Please check your email and click the verification link to activate your account."
          );
        } else {
          // Email confirmation OFF: user already logged in
          await ensureProfile(userType);
          onLogin({ email, userType });
        }
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // (Optional) if you want to keep demo buttons later, you can re-wire them
  const demoLogin = (userType: "studio" | "artist") => {
    // For now this is just a helper to quickly fill in the fields;
    // it will still hit real Supabase auth when you click Sign in.
    const demoCredentials = {
      studio: { email: "admin@clayandfire.com", password: "demo123" },
      artist: { email: "alex@artist.com", password: "demo123" },
    };

    setEmail(demoCredentials[userType].email);
    setPassword(demoCredentials[userType].password);
    setSelectedUserType(userType);
    // Then user clicks the normal button to actually auth
  };

  const title =
    authMode === "login" ? "Welcome Back" : "Create your Throw Clay account";
  const subtitle =
    authMode === "login"
      ? "Sign in to your account"
      : "Sign up to start managing your studio or pottery practice";

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
              <div
                className="w-8 h-8 bg-primary flex items-center justify-center"
                style={{
                  borderRadius: "68% 32% 62% 38% / 55% 48% 52% 45%",
                }}
              />
              <span className="text-xl font-bold">Throw Clay</span>
            </div>
            <CardTitle>{title}</CardTitle>
            <p className="text-muted-foreground">{subtitle}</p>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="studio"
              className="w-full"
              onValueChange={(val) =>
                setSelectedUserType(val as "studio" | "artist")
              }
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="studio"
                  className="flex items-center space-x-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Studio</span>
                </TabsTrigger>
                <TabsTrigger
                  value="artist"
                  className="flex items-center space-x-2"
                >
                  <Palette className="w-4 h-4" />
                  <span>Artist</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="studio" className="space-y-4">
                <div className="text-center mb-4">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">
                    Studio {authMode === "login" ? "Login" : "Sign Up"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your pottery studio, artists, classes, and operations
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
                    onClick={() => handleSubmit("studio")}
                    disabled={isLoading || !email || !password}
                    className="w-full"
                  >
                    {isLoading
                      ? authMode === "login"
                        ? "Signing in..."
                        : "Creating account..."
                      : authMode === "login"
                      ? "Sign in to Studio"
                      : "Create Studio Account"}
                  </Button>

                  {/* Optional demo button */}
                  {/* 
                  <Button
                    variant="outline"
                    onClick={() => demoLogin("studio")}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Try Studio Demo
                  </Button>
                  */}
                </div>
              </TabsContent>

              <TabsContent value="artist" className="space-y-4">
                <div className="text-center mb-4">
                  <Palette className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">
                    Artist {authMode === "login" ? "Login" : "Sign Up"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Access your pottery journal, portfolio, and connect with
                    studios
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
                      placeholder=""
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
                      placeholder=""
                      required
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit("artist")}
                    disabled={isLoading || !email || !password}
                    className="w-full"
                  >
                    {isLoading
                      ? authMode === "login"
                        ? "Signing in..."
                        : "Creating account..."
                      : authMode === "login"
                      ? "Sign in as Artist"
                      : "Create Artist Account"}
                  </Button>

                  {/* Optional demo button */}
                  {/* 
                  <Button
                    variant="outline"
                    onClick={() => demoLogin("artist")}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Try Artist Demo
                  </Button>
                  */}
                </div>
              </TabsContent>
            </Tabs>

            {/* Status / error messages */}
            {error && (
              <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
            )}
            {message && !error && (
              <p className="mt-4 text-sm text-emerald-600 text-center">
                {message}
              </p>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {authMode === "login" ? (
                <>
                  <p>New to our platform?</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => {
                      setAuthMode("signup");
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    Create an account
                  </Button>
                </>
              ) : (
                <>
                  <p>Already have an account?</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => {
                      setAuthMode("login");
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
