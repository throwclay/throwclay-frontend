import { useState } from "react";
import { ArrowLeft, Building2, Palette } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { supabase } from "../lib/apis/supabaseClient";
import { ensureProfile } from "../lib/ensureProfile";

interface LoginFormProps {
  onLogin: (userData: { email: string; phone?: string }) => void;
  onBack: () => void;
}

export function LoginForm({ onLogin, onBack }: LoginFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
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
          setMessage(
            "Check your email to verify your account before signing in."
          );
          return;
        }

        // make sure profile exists (always artist + artist_plan default)
        await ensureProfile();

        onLogin({ email });
      } else {
        // --- SIGNUP FLOW ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // metadata is optional now – we can still store name/phone here
            data: { name, phone },
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (!data.session) {
          setMessage(
            "Account created! Please check your email and click the verification link to activate your account."
          );
        } else {
          await ensureProfile();
          onLogin({ email, phone });
        }
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const title =
    authMode === "login" ? "Welcome back" : "Create your Throw Clay account";
  const subtitle =
    authMode === "login"
      ? "Sign in to manage your pottery practice and studio tools."
      : "Sign up once, then switch between artist and studio modes as you grow.";

  const buttonLabel =
    authMode === "login"
      ? isLoading
        ? "Signing in..."
        : "Sign in"
      : isLoading
      ? "Creating account..."
      : "Create account";

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
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </CardHeader>
          <CardContent>
            {/* Little “what you can do” row */}
            <div className="flex items-center justify-center gap-6 mb-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>Track your pottery & classes</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Manage studio members</span>
              </div>
            </div>

            <div className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              {authMode === "signup" && (
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !email ||
                  !password ||
                  (authMode === "signup" && !name)
                }
                className="w-full"
              >
                {buttonLabel}
              </Button>
            </div>

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
                  <p>New to Throw Clay?</p>
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
