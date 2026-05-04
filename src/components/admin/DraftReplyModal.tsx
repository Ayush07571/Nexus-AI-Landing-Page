"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DraftReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    name: string;
    company?: string | null;
    message: string;
  };
}

export function DraftReplyModal({ isOpen, onClose, lead }: DraftReplyModalProps) {
  const [tone, setTone] = useState<"professional" | "friendly">("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/lead-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          company: lead.company || "Unknown",
          message: lead.message,
          tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate");
      if (!data || typeof data !== 'object') throw new Error("No data received from AI");
      setDraft(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate reply. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    const text = `Subject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-bold text-foreground">AI Draft Reply</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tone Selector */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reply Tone</label>
            <div className="flex gap-2">
              {(["professional", "friendly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-xl border text-sm font-medium capitalize transition-all",
                    tone === t
                      ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-border text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {!draft && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Generate a draft reply</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  AI will analyze the lead&apos;s message and write a personalized response.
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-linear-to-r from-blue-600 to-purple-600 text-white gap-2 h-11 px-8 rounded-xl shadow-lg"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Draft
              </Button>
            </div>
          )}

          {draft && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
                <div className="p-3 rounded-xl border border-border bg-muted/30 text-sm font-medium">
                  {draft.subject}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Body</label>
                <div className="p-4 rounded-xl border border-border bg-muted/30 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[200px]">
                  {draft.body}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCopy}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white gap-2 rounded-xl"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-2 rounded-xl"
                >
                  <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                  Regenerate
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end bg-muted/20">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">Close</Button>
        </div>
      </motion.div>
    </div>
  );
}
