"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { supabase } from "@/lib/apis/supabaseClient";
import { SignupFlow, type SignupData } from "@/components/SignupFlow";
import { useAppContext } from "@/app/context/AppContext";

import { DefaultLayout } from "@/components/layout/DefaultLayout";
import type { User as UserType, Studio, StudioLocation, StudioMembership } from "@/types";


export default function LoginForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

    const [otpRequested, setOtpRequested] = useState(false);
    const [otpCode, setOtpCode] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSignup, setShowSignup] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const context = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Open signup flow when arriving via "Get Started" (e.g. /login?mode=signup)
    useEffect(() => {
        if (searchParams.get("mode") === "signup") {
            setShowSignup(true);
        }
    }, [searchParams]);

    // Redirect to app home if user already has an active session
    useEffect(() => {
        if (context.isInitializing) return;
        if (context.currentUser) {
            const destination =
                context.currentUser.activeMode === "studio" ? "/dashboard" : "/profile";
            router.replace(destination);
        }
    }, [context.isInitializing, context.currentUser, router]);

    const fetchLocationsForStudio = async (
        studioId: string,
        token: string
    ): Promise<StudioLocation[]> => {
        console.log(`Fetching Locations | Studio ID: ${studioId}`);

        try {
            const res = await fetch(`/api/studios/${studioId}/locations`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error("Error fetching studio locations", body);
                return [];
            }

            const body = await res.json();
            const data = (body.locations || []) as StudioLocation[];

            console.log(`Studio Locations: ${data.length}`);
            return data;
        } catch (err) {
            console.error("Error fetching studio locations", err);
            return [];
        }
    };


    const handleLogin = async (userData: { email: string; phone?: string; session: any }) => {
        const { session } = userData;

        if (!session || !session.user) {
            console.error("handleLogin: missing session or user");
            return;
        }

        const user = session.user;
        const accessToken = session.access_token;

        // 1) Store access token in AppContext for API routes
        context.setAuthToken(accessToken);

        // 2) Parallel fetch: profile, active subscription, memberships
        const [
            { data: profileRow, error: profileError },
            { data: profileSub, error: subError },
            { data: memberships, error: membershipError }
        ] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
            supabase
                .from("subscriptions")
                .select("*")
                .eq("owner_type", "profile")
                .eq("owner_id", user.id)
                .eq("status", "active")
                .maybeSingle(),
            supabase
                .from("studio_memberships")
                .select(
                    `
        id,
        user_id,
        studio_id,
        role,
        status,
        location_id,
        membership_type,
        created_at,
        studios:studio_id (
          id,
          name,
          handle,
          email,
          description,
          is_active,
          plan,
          created_at
        ),
        studio_locations:location_id (
          id,
          name
        )
      `
                )
                .eq("user_id", user.id)
                .eq("status", "active")
        ]);

        console.log(`Prof name: ${profileRow?.name}`);

        if (profileError) {
            console.error("handleLogin: error fetching profile", profileError);
        }
        if (membershipError) {
            console.error("handleLogin: error fetching memberships", membershipError);
        }
        if (subError) {
            console.error("handleLogin: error fetching subscription", subError);
        }

        const email = user.email ?? userData.email;
        const phone = (user as any).phone ?? userData.phone;
        const fallbackName = email?.split("@")[0] ?? "Unnamed";

        const name =
            (profileRow as any)?.name ?? (user.user_metadata as any)?.full_name ?? fallbackName;

        const handle =
            (profileRow as any)?.handle ?? fallbackName.toLowerCase().replace(/[^a-z0-9_]+/g, "_");

        const artistPlan = (profileRow as any)?.artist_plan ?? "artist-free";

        // 3) Build front-end User object
        const appUser: UserType = {
            id: user.id,
            name,
            handle,
            email,
            phone,
            type: "artist",
            subscription: profileSub?.plan_code ?? null,
            artistPlan,
            subscriptionLimits: undefined,
            usageStats: undefined,
            profile: {
                bio: (profileRow as any)?.bio ?? "",
                socialMedia: (profileRow as any)?.social_media ?? {},
                branding: {
                    primaryColor: (profileRow as any)?.branding?.primaryColor ?? "#030213",
                    secondaryColor: (profileRow as any)?.branding?.secondaryColor,
                    logoUrl: (profileRow as any)?.branding?.logoUrl
                }
            },
            createdAt: (profileRow as any)?.created_at ?? new Date().toISOString(),
            lastLogin: (profileRow as any)?.last_login ?? user.last_sign_in_at ?? undefined,
            isActive: (profileRow as any)?.is_active ?? true
        };

        console.log(`User ${appUser.name} last logged in ${appUser.lastLogin}`);

        // 4) Build studio (if any memberships)

        // Normalize memberships
        const normalizedMemberships: StudioMembership[] = (memberships ?? []).map(
            (m: any): StudioMembership => ({
                id: m.id,
                userId: m.user_id,
                studioId: m.studio_id,
                role: m.role, // StudioRole
                status: m.status,
                locationId: m.location_id,
                locationName: m.studio_locations?.name ?? null,
                membershipType: m.membership_type,
                startDate: m.created_at,
                lastActivity: profileRow?.last_login ?? null,
                createdAt: m.created_at,
                shelfNumber: null,
                monthlyRate: null,
                passionProjectsUpgrade: null,
                studioName: m.studios?.name,
                studioHandle: m.studios?.handle
            })
        );

        context.setStudioMemberships(normalizedMemberships);

        let studioForState: Studio | null = null;
        let studioRoleForCurrentUser: string | null = null;
        let membershipForState: StudioMembership | null = null;

        if (normalizedMemberships.length > 0) {
            // For now: just pick the first active membership as the "current" one
            const membership = normalizedMemberships[0];
            const raw = (memberships ?? [])[0] as any; // original row to grab studios + locations
            const s = raw?.studios;

            if (s) {
                studioRoleForCurrentUser = membership.role ?? null;

                const studioLocations = await fetchLocationsForStudio(s.id, session.access_token);

                studioForState = {
                    id: s.id,
                    name: s.name,
                    handle: s.handle,
                    email: s.email ?? "",
                    website: (s as any).website ?? "",
                    description: s.description ?? "",
                    locations: studioLocations,
                    isActive: s.is_active ?? true,
                    plan: (s.plan as Studio["plan"]) ?? "studio-free",
                    createdAt: s.created_at,
                    memberCount: 0,
                    classCount: 0,
                    glazes: [],
                    firingSchedule: [],
                    roleForCurrentUser: studioRoleForCurrentUser as any
                };

                membershipForState = membership;
            }
        }

        // 5) Derive modes
        const hasStudioRole = (memberships ?? []).some((m: any) =>
            ["owner", "admin"].includes(m.role)
        );

        appUser.availableModes = hasStudioRole ? ["artist", "studio"] : ["artist"];
        appUser.activeMode = hasStudioRole ? "studio" : "artist";

        // Did they have *any* studio membership (any role)?
        (appUser as any).hasStudioMemberships = (memberships ?? []).length > 0;

        // 6) Push into context + app state
        context.setCurrentStudio(studioForState);
        context.setCurrentUser(appUser);
        context.setCurrentMembership(membershipForState);
        setIsLoggedIn(true);

        // 7) Fetch user-level invites with the *fresh* token
        await context.refreshInvites({
            status: "pending",
            tokenOverride: accessToken
        });

        const userPhone = user?.phone ?? phone ?? null;
        if (!userPhone) {
            // No phone on file -> send them to phone verification
            router.push("/verify-phone");
            return;
        }
       router.push("/dashboard");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        context.setCurrentUser(null);
        context.setCurrentStudio(null);
        context.setAuthToken(null);
        context.setPendingInvites([]);
        setIsLoggedIn(false);
        router.push("/");
    };

    const resetStatus = () => {
        setError(null);
        setMessage(null);
    };

    const handleEmailPasswordLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setError(error.message);
            return;
        }

        if (!data.session) {
            setMessage("Check your email to verify your account before signing in.");
            return;
        }

        handleLogin({ email, phone, session: data.session });
    };

    // Step 1: send OTP
    const handleSendOtp = async () => {
        if (!phone) {
            setError("Please enter your phone number.");
            return;
        }

        // NOTE: phone must match what’s stored on the Supabase auth user
        const { error } = await supabase.auth.signInWithOtp({
            phone,
            options: {
                channel: "sms"
            }
        });

        if (error) {
            setError(error.message);
            return;
        }

        setOtpRequested(true);
        setMessage("We sent you a code via SMS. Enter it below to sign in.");
    };

    // Step 2: verify OTP
    const handleVerifyOtp = async () => {
        if (!phone || !otpCode) {
            setError("Please enter both your phone number and the code we sent.");
            return;
        }

        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token: otpCode,
            type: "sms"
        });

        if (error) {
            setError(error.message);
            return;
        }

        if (!data.session) {
            setMessage(
                "We verified your code but couldn’t create a session. Check your account status or try again."
            );
            return;
        }

        handleLogin({ email: data.session.user.email ?? "", phone, session: data.session });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        resetStatus();

        try {
            if (authMode === "login") {
                if (authMethod === "email") {
                    await handleEmailPasswordLogin();
                } else {
                    // phone + OTP
                    if (!otpRequested) {
                        await handleSendOtp();
                    } else {
                        await handleVerifyOtp();
                    }
                }
            }
        } catch (err: any) {
            setError(err.message ?? "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const title = authMode === "login" ? "Welcome Back" : "Create your Throw Clay account";
    const subtitle =
        authMode === "login" ? "Sign in to your account" : "Sign up to start using Throw Clay";

    const handleSignupComplete = async (signupData: SignupData) => {
        setIsLoading(true);
        resetStatus();

        try {
            const { data, error } = await supabase.auth.signUp({
                email: signupData.email,
                password: signupData.password,
                options: {
                    data: {
                        name: signupData.name,
                        account_type: signupData.accountType,
                        handle:
                            signupData.accountType === "studio"
                                ? signupData.studioHandle
                                : signupData.artistHandle,
                        city: signupData.city,
                        state: signupData.state,
                        country: signupData.country,
                        selected_plan: signupData.selectedPlan,
                        studio_name: signupData.studioName,
                        studio_type: signupData.studioType
                    }
                }
            });

            if (error) {
                setError(error.message);
                return;
            }

            if (!data.session) {
                setMessage(
                    "Account created! Please check your email and click the verification link to activate your account."
                );
                setShowSignup(false);
                return;
            }

            if (signupData.accountType === "studio") {
                try {
                    const res = await fetch("/api/studios", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${data.session.access_token}`
                        },
                        body: JSON.stringify({
                            studioName: signupData.studioName,
                            studioHandle: signupData.studioHandle,
                            city: signupData.city,
                            state: signupData.state,
                            selectedPlan: signupData.selectedPlan,
                            locationName: signupData.locationName,
                            locationAddress: signupData.locationAddress,
                            locationZip: signupData.locationZip,
                            locationPhone: signupData.locationPhone
                        })
                    });

                    if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        console.error("Failed to create studio on signup", body);
                    }
                } catch (studioErr) {
                    console.error("Error calling /api/studios during signup", studioErr);
                }
            }

            handleLogin({
                email: signupData.email,
                session: data.session
            });
            setShowSignup(false);
        } catch (err: any) {
            setError(err.message ?? "Something went wrong during signup");
        } finally {
            setIsLoading(false);
        }
    };

    // Don't show login/signup UI while checking session or when redirecting logged-in users
    if (context.isInitializing || context.currentUser) {
        return (
            <DefaultLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </DefaultLayout>
        );
    }

    if (showSignup) {
        return (
            <DefaultLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                    <SignupFlow
                        onComplete={handleSignupComplete}
                        onBack={() => {
                            setShowSignup(false);
                            router.push("/login");
                        }}
                    />
                </div>
            </DefaultLayout>
        );
    }

    const isEmailLoginDisabled = authMethod === "email" && (!email || !password);
    const isPhoneLoginDisabled = authMethod === "phone" && (!phone || (otpRequested && !otpCode));

    return (
        <DefaultLayout>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <div className="w-full max-w-md">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
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
                            {/* Only show auth method toggle on login */}
                            {authMode === "login" && (
                                <div className="mb-4 flex justify-center gap-2 text-sm">
                                    <Button
                                        type="button"
                                        variant={authMethod === "email" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            setAuthMethod("email");
                                            setOtpRequested(false);
                                            setOtpCode("");
                                            resetStatus();
                                        }}
                                    >
                                        Email &amp; password
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={authMethod === "phone" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            setAuthMethod("phone");
                                            setOtpRequested(false);
                                            setOtpCode("");
                                            resetStatus();
                                        }}
                                    >
                                        Phone &amp; OTP
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Email/password login fields */}
                                {authMode === "login" && authMethod === "email" && (
                                    <>
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
                                    </>
                                )}

                                {/* Phone + OTP login fields */}
                                {authMode === "login" && authMethod === "phone" && (
                                    <>
                                        <div>
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+1 555 123 4567"
                                                required
                                            />
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Use the same phone number you registered with.
                                            </p>
                                        </div>

                                        {otpRequested && (
                                            <div>
                                                <Label htmlFor="otp">Verification code</Label>
                                                <Input
                                                    id="otp"
                                                    type="text"
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                    placeholder="6-digit code"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Legacy signup fields (if we ever re-enable authMode === "signup") */}
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
                                            <Label htmlFor="phone-signup">Phone</Label>
                                            <Input
                                                id="phone-signup"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="(555) 123-4567"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email-signup">Email</Label>
                                            <Input
                                                id="email-signup"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="password-signup">Password</Label>
                                            <Input
                                                id="password-signup"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <Button
                                    onClick={handleSubmit}
                                    disabled={
                                        isLoading ||
                                        (authMode === "login" &&
                                            ((authMethod === "email" && isEmailLoginDisabled) ||
                                                (authMethod === "phone" &&
                                                    isPhoneLoginDisabled))) ||
                                        (authMode === "signup" &&
                                            (!name || !phone || !email || !password))
                                    }
                                    className="w-full"
                                >
                                    {isLoading
                                        ? authMode === "login"
                                            ? authMethod === "email"
                                                ? "Signing in..."
                                                : otpRequested
                                                  ? "Verifying code..."
                                                  : "Sending code..."
                                            : "Creating account..."
                                        : authMode === "login"
                                          ? authMethod === "email"
                                              ? "Sign in"
                                              : otpRequested
                                                ? "Verify & sign in"
                                                : "Send code"
                                          : "Create account"}
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
                                                setShowSignup(true);
                                                resetStatus();
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
                                                resetStatus();
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
        </DefaultLayout>
    );
}
