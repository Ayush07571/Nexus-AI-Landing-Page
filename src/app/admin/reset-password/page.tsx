"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setSuccess(data.message);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Password Reset</h2>
          <p className="text-muted-foreground mt-2 text-sm">{success}</p>
        </div>
        <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-500">
          <Link href="/admin/login">Log in now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="newPassword" title="New Password" className="block text-sm font-medium text-foreground mb-2">
            New Password
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              className="pr-12 h-11"
              disabled={!token}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" title="Confirm Password" className="block text-sm font-medium text-foreground mb-2">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            required
            className="h-11"
            disabled={!token}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !token || !newPassword || !confirmPassword}
          className="w-full h-11 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg text-white font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      {!token && (
        <div className="mt-6 pt-6 border-t border-border text-center">
          <Link
            href="/admin/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Request a new link
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 mb-4 shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Set New Password
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Choose a secure password for your admin account
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
