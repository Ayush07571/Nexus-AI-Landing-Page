"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Key, AlertCircle, Loader2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(data.message);
      setIdentifier("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 mb-4 shadow-lg">
            <Key className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter your admin username or email to receive a reset link
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Admin username or email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@nexus-ai.com"
                  required
                  className="pl-10 h-12"
                />
              </div>
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {success}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !identifier || !!success}
              className="w-full h-12 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg text-white font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Requesting...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
