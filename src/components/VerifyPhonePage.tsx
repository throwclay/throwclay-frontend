"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/apis/supabaseClient";
import { PhoneSetup } from "@/components/PhoneSetup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/app/context/AppContext";

interface VerifyPhoneScreenProps {
    onDone: () => void; // what to do after verify/skip
}

export function VerifyPhonePage({ onDone }: VerifyPhoneScreenProps) {
    const router = useRouter();
    const [initialPhone, setInitialPhone] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState("landing");

    useEffect(() => {
        const loadUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                // Not logged in, bounce to login
                // router.replace("/");  // for future
                setCurrentPage("login"); // leaving this for now
                return;
            }

            setInitialPhone(data.user.phone ?? null);
            setLoading(false);
        };

        loadUser();
    }, []);

    const handleVerified = () => {
        // router.replace("/"); // will route to homepage in future
        onDone();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
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
                                You can skip this for now, but you&apos;ll need a verified phone to
                                sign in with OTP later.
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                // onClick={() => router.replace("/")}
                                onClick={handleVerified}
                            >
                                Skip for now
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
