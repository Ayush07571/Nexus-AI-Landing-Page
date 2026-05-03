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
  Zap,
  Brain,
  Shield,
  Globe,
  BarChart3,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { Feature } from "@/types";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  { name: "Brain", icon: Brain },
  { name: "Zap", icon: Zap },
  { name: "Shield", icon: Shield },
  { name: "Globe", icon: Globe },
  { name: "BarChart3", icon: BarChart3 },
  { name: "Users", icon: Users },
];

const COLOR_OPTIONS = ["blue", "yellow", "green", "purple", "orange", "red"];

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

function FeatureCard({
  feature,
  onChange,
  onDelete,
}: {
  feature: Feature;
  onChange: (updated: Feature) => void;
  onDelete: () => void;
}) {
  const updateField = <K extends keyof Feature>(key: K, value: Feature[K]) => {
    onChange({ ...feature, [key]: value });
  };

  const updateBenefit = (index: number, text: string) => {
    const benefits = [...feature.benefits];
    benefits[index] = text;
    onChange({ ...feature, benefits });
  };

  const addBenefit = () => {
    onChange({ ...feature, benefits: [...feature.benefits, ""] });
  };

  const removeBenefit = (index: number) => {
    const benefits = feature.benefits.filter((_, i) => i !== index);
    onChange({ ...feature, benefits });
  };

  const fieldClass =
    "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div
      className={cn(
        "bg-card border-2 rounded-2xl p-6 space-y-5 transition-all",
        feature.visible ? "border-border" : "border-dashed border-muted-foreground/30 opacity-75"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-white",
            feature.color === "blue" && "bg-blue-500",
            feature.color === "yellow" && "bg-yellow-500",
            feature.color === "green" && "bg-green-500",
            feature.color === "purple" && "bg-purple-500",
            feature.color === "orange" && "bg-orange-500",
            feature.color === "red" && "bg-red-500"
          )}>
            {React.createElement(ICON_OPTIONS.find(o => o.name === feature.icon)?.icon || Zap, { className: "w-5 h-5" })}
          </div>
          <input
            type="text"
            value={feature.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="text-lg font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-blue-500 focus:outline-none transition-all px-1 py-0.5"
            placeholder="Feature title"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateField("visible", !feature.visible)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={feature.visible ? "Hide from public site" : "Show on public site"}
          >
            {feature.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
            title="Delete feature"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
        <textarea
          value={feature.description}
          onChange={(e) => updateField("description", e.target.value)}
          className={cn(fieldClass, "resize-none h-20")}
          placeholder="Feature description"
        />
      </div>

      {/* Icon & Color */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Icon</label>
          <select
            value={feature.icon}
            onChange={(e) => updateField("icon", e.target.value)}
            className={fieldClass}
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.name} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Color Theme</label>
          <select
            value={feature.color}
            onChange={(e) => updateField("color", e.target.value)}
            className={fieldClass}
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Benefits */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Benefits / Bullet Points</label>
        <div className="space-y-2">
          {feature.benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <input
                type="text"
                value={benefit}
                onChange={(e) => updateBenefit(i, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Benefit text"
              />
              <button
                type="button"
                onClick={() => removeBenefit(i)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBenefit}
          className="mt-2 flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add benefit
        </button>
      </div>
    </div>
  );
}

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadFeatures = useCallback(async () => {
    try {
      const res = await fetch("/api/features");
      if (!res.ok) throw new Error("Failed to load features");
      const data = await res.json() as Feature[];
      setFeatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const updateFeature = (id: string, updated: Feature) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? updated : f)));
  };

  const deleteFeature = (id: string) => {
    if (!confirm("Are you sure you want to delete this feature?")) return;
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const addFeature = () => {
    const newFeature: Feature = {
      id: `feature-${Date.now()}`,
      title: "New Feature",
      description: "Enter feature description here",
      icon: "Zap",
      color: "blue",
      benefits: ["Benefit 1"],
      visible: false,
    };
    setFeatures((prev) => [newFeature, ...prev]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/features", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Features saved successfully!", "success");
    } catch {
      showToast("Failed to save features. Please try again.", "error");
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

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Features Management</h2>
          <p className="text-sm text-muted-foreground">
            {features.length} total features · {features.filter(f => f.visible).length} visible
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addFeature}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/25"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Grid */}
      {features.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <Zap className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-medium">No features defined</p>
          <button
            onClick={addFeature}
            className="mt-3 text-blue-500 text-sm hover:underline"
          >
            Add your first feature
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <FeatureCard
                feature={feature}
                onChange={(updated) => updateFeature(feature.id, updated)}
                onDelete={() => deleteFeature(feature.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
