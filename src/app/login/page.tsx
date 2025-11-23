"use client"

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { supabase } from "@/lib/apis/supabaseClient";

interface LoginFormProps {
    onLogin: (userData: { email: string; phone?: string; session: any }) => void;
    onBack: () => void;
}

export default function LoginForm({ onLogin, onBack }: LoginFormProps) {
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
                    password
                });

                if (error) {
                    setError(error.message);
                    return;
                }

                if (!data.session) {
                    // If email confirmations are enabled and user hasn't confirmed yet
                    setMessage("Check your email to verify your account before signing in.");
                    return;
                }

                // Bubble up to parent with session info
                onLogin({ email, phone, session: data.session });
            } else {
                // --- SIGNUP FLOW ---
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name,
                            profile_phone: phone
                        }
                    }
                });

                if (error) {
                    setError(error.message);
                    return;
                }

                if (!data.session) {
                    // Email confirmation ON: user must verify before logging in
                    setMessage(
                        "Account created! Please check your email and click the verification link to activate your account."
                    );
                } else {
                    // Email confirmation OFF: user already logged in
                    onLogin({ email, phone, session: data.session });
                }
            }
        } catch (err: any) {
            setError(err.message ?? "Something went wrong");
        } finally {
            // setIsLoading(false);
        }
    };

    const title = authMode === "login" ? "Welcome Back" : "Create your Throw Clay account";
    const subtitle =
        authMode === "login" ? "Sign in to your account" : "Sign up to start using Throw Clay";

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
                                    borderRadius: "68% 32% 62% 38% / 55% 48% 52% 45%"
                                }}
                            />
                            <span className="text-xl font-bold">Throw Clay</span>
                        </div>
                        <CardTitle>{title}</CardTitle>
                        <p className="text-muted-foreground text-sm">{subtitle}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {authMode === "signup" && (
                                <>
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
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="(555) 123-4567"
                                            required
                                        />
                                    </div>
                                </>
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
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    isLoading ||
                                    !email ||
                                    !password ||
                                    (authMode === "signup" && (!name || !phone))
                                }
                                className="w-full"
                            >
                                {isLoading
                                    ? authMode === "login"
                                        ? "Signing in..."
                                        : "Creating account..."
                                    : authMode === "login"
                                      ? "Sign in"
                                      : "Create account"}
                            </Button>
                        </div>

                        {/* Status / error messages */}
                        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
                        {message && !error && (
                            <p className="mt-4 text-sm text-emerald-600 text-center">{message}</p>
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
