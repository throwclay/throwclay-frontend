"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/apis/supabaseClient";
import { PhoneSetup } from "@/components/PhoneSetup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/app/context/AppContext";

import { DefaultLayout } from "@/components/layout/DefaultLayout";

export default function VerifyPhonePage() {
    const router = useRouter();
    const context = useAppContext();
    const [initialPhone, setInitialPhone] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                router.replace("/login");
                return;
            }

            // User already has phone verified → skip this page and go to app home
            if (data.user.phone) {
                router.replace("/dashboard");
                return;
            }

            setInitialPhone(data.user.phone ?? null);
            setLoading(false);
        };

        loadUser();
    }, [router]);

    const handleVerified = () => {
        const nextRoute = context.currentUser?.activeMode === "studio" ? "/dashboard" : "/profile";

        router.push(nextRoute);
    };

    if (loading) {
        return (
            <DefaultLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 p-4">
                <div className="w-full max-w-lg">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Verify your phone</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add and verify your phone so you can log in with SMS codes.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <PhoneSetup
                                initialPhone={initialPhone}
                                onVerified={handleVerified}
                            />

                            <div className="pt-2 border-t mt-6">
                                <p className="text-xs text-muted-foreground mb-2">
                                    You can skip this for now, but you&apos;ll need a verified phone
                                    to sign in with OTP later.
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleVerified}
                                >
                                    Skip for now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DefaultLayout>
    );
}
