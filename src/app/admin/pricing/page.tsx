"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Star,
} from "lucide-react";
import { PricingData, PricingPlan, PricingFeature } from "@/types";
import { cn } from "@/lib/utils";

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className={cn(
        "fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium z-50",
        type === "success"
          ? "bg-green-500 text-white"
          : "bg-destructive text-destructive-foreground"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {message}
    </motion.div>
  );
}

function PlanCard({
  plan,
  onChange,
}: {
  plan: PricingPlan;
  onChange: (updated: PricingPlan) => void;
}) {
  const updateField = <K extends keyof PricingPlan>(key: K, value: PricingPlan[K]) => {
    onChange({ ...plan, [key]: value });
  };

  const updateFeature = (index: number, text: string) => {
    const features = [...plan.features];
    features[index] = { ...features[index], text };
    onChange({ ...plan, features });
  };

  const toggleFeature = (index: number) => {
    const features = [...plan.features];
    features[index] = { ...features[index], included: !features[index].included };
    onChange({ ...plan, features });
  };

  const addFeature = () => {
    onChange({ ...plan, features: [...plan.features, { text: "", included: true }] });
  };

  const removeFeature = (index: number) => {
    const features = plan.features.filter((_, i) => i !== index);
    onChange({ ...plan, features });
  };

  const fieldClass =
    "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div
      className={cn(
        "bg-card border-2 rounded-2xl p-6 space-y-5",
        plan.highlighted ? "border-blue-500/50" : "border-border"
      )}
    >
      {/* Plan Header */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={plan.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="text-lg font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-blue-500 focus:outline-none transition-all px-1 py-0.5 w-auto"
          placeholder="Plan name"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Featured</span>
          <button
            type="button"
            onClick={() => updateField("highlighted", !plan.highlighted)}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative",
              plan.highlighted ? "bg-blue-500" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                plan.highlighted ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
        <input
          type="text"
          value={plan.description}
          onChange={(e) => updateField("description", e.target.value)}
          className={fieldClass}
          placeholder="Plan description"
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Monthly Price ($)
          </label>
          <input
            type="number"
            min="0"
            value={plan.monthlyPrice}
            onChange={(e) => updateField("monthlyPrice", Number(e.target.value))}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Annual Price ($)
          </label>
          <input
            type="number"
            min="0"
            value={plan.annualPrice}
            onChange={(e) => updateField("annualPrice", Number(e.target.value))}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Badge + CTA */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Badge Text (optional)
          </label>
          <input
            type="text"
            value={plan.badge ?? ""}
            onChange={(e) => updateField("badge", e.target.value || null)}
            className={fieldClass}
            placeholder="e.g. Most Popular"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            CTA Button Text
          </label>
          <input
            type="text"
            value={plan.cta}
            onChange={(e) => updateField("cta", e.target.value)}
            className={fieldClass}
            placeholder="Get Started"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Features</label>
        <div className="space-y-2">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleFeature(i)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                  feature.included
                    ? "border-green-500 bg-green-500"
                    : "border-muted-foreground/40 bg-transparent"
                )}
              >
                {feature.included && <CheckCircle2 className="w-3 h-3 text-white" />}
              </button>
              <input
                type="text"
                value={feature.text}
                onChange={(e) => updateFeature(i, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Feature description"
              />
              <button
                type="button"
                onClick={() => removeFeature(i)}
                className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFeature}
          className="mt-2 flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add feature
        </button>
      </div>
    </div>
  );
}

export default function AdminPricingPage() {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadPricing = useCallback(async () => {
    try {
      const res = await fetch("/api/pricing");
      if (!res.ok) throw new Error("Failed to load pricing");
      const data = await res.json() as PricingData;
      setPricingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const updatePlan = (index: number, updated: PricingPlan) => {
    if (!pricingData) return;
    const plans = [...pricingData.plans];
    plans[index] = updated;
    setPricingData({ ...pricingData, plans });
  };

  const handleSave = async () => {
    if (!pricingData) return;
    setSaving(true);
    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingData),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Pricing saved! Landing page will update within 60 seconds.", "success");
    } catch {
      showToast("Failed to save pricing. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !pricingData) {
    return (
      <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
        <AlertCircle className="w-4 h-4" />
        {error ?? "Failed to load pricing data"}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Pricing Management</h2>
          <p className="text-sm text-muted-foreground">
            Edit pricing plans inline. Changes reflect on the landing page within 60 seconds.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/25"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {pricingData.plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <PlanCard plan={plan} onChange={(updated) => updatePlan(i, updated)} />
          </motion.div>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
