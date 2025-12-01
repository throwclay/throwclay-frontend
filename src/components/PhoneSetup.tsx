"use client";

import { useState } from "react";
import { supabase } from "@/lib/apis/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PhoneSetupProps {
  initialPhone?: string | null;
  onVerified?: (phone: string) => void;
}

export function PhoneSetup({ initialPhone, onVerified }: PhoneSetupProps) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"idle" | "code_sent" | "verified">(
    initialPhone ? "verified" : "idle"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetStatus = () => {
    setError(null);
    setMessage(null);
  };

  const handleSendCode = async () => {
    resetStatus();

    if (!phone) {
      setError("Please enter a phone number.");
      return;
    }

    setIsLoading(true);
    try {
      // Must be logged in for this to work
      const { error } = await supabase.auth.updateUser({ phone });

      if (error) {
        setError(error.message);
        return;
      }

      setStep("code_sent");
      setMessage(
        "We sent a verification code via SMS. Enter it below to verify your phone."
      );
    } catch (err: any) {
      setError(err.message ?? "Something went wrong sending the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    resetStatus();

    if (!phone || !otp) {
      setError("Please enter both your phone number and the verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "phone_change", // important for phone update flow
      });

      if (error) {
        setError(error.message);
        return;
      }

      setStep("verified");
      setMessage("Your phone number has been verified 🎉");

      if (onVerified) {
        onVerified(phone);
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong verifying the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSendDisabled = !phone || isLoading;
  const isVerifyDisabled = !phone || !otp || isLoading;

  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 123 4567"
        />
        <p className="text-xs text-muted-foreground">
          Use E.164 format (e.g. +15551234567). We&apos;ll send an SMS to verify.
        </p>
      </div>

      <div className="flex gap-2 items-center">
        <Button
          type="button"
          onClick={handleSendCode}
          disabled={isSendDisabled}
        >
          {step === "code_sent" ? "Resend code" : "Send verification code"}
        </Button>

        {step === "verified" && (
          <span className="text-xs text-emerald-600">
            Verified phone on file
          </span>
        )}
      </div>

      {step === "code_sent" && (
        <div className="space-y-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
          />
          <Button
            type="button"
            className="mt-2"
            onClick={handleVerifyCode}
            disabled={isVerifyDisabled}
          >
            Verify phone
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && !error && (
        <p className="text-sm text-emerald-600">{message}</p>
      )}
    </div>
  );
}
