"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  X,
} from "lucide-react";
import { Integration } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  "Communication",
  "Project Management",
  "Development",
  "Productivity",
  "CRM & Sales",
  "Analytics & Data",
  "Other"
];

const COLOR_OPTIONS = ["blue", "purple", "green", "orange", "gray", "pink", "red", "yellow"];

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

function IntegrationModal({
  integration,
  isOpen,
  onClose,
  onSave,
}: {
  integration: Partial<Integration> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Integration>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Integration>>(
    integration || {
      name: "",
      category: "Other",
      logo: "",
      description: "",
      color: "blue",
      visible: true,
    }
  );

  if (!isOpen) return null;

  const fieldClass = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">
            {integration?.id ? "Edit Integration" : "Add Integration"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={fieldClass}
                placeholder="e.g. Slack"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={fieldClass}
              >
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Logo (Emoji or Char)</label>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className={fieldClass}
                placeholder="💬"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Color Theme</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className={fieldClass}
              >
                {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description (Short)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={fieldClass}
              placeholder="e.g. Real-time team communication"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="int-visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="int-visible" className="text-sm text-foreground">Visible on public site</label>
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-foreground">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
          >
            {integration?.id ? "Update" : "Create"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadIntegrations = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json() as Integration[];
      setIntegrations(data);
    } catch {
      showToast("Error loading integrations", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this integration?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/integrations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setIntegrations(prev => prev.filter(i => i.id !== id));
      showToast("Integration deleted", "success");
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVisible = async (integration: Integration) => {
    setActionLoading(`visible-${integration.id}`);
    try {
      const res = await fetch(`/api/integrations/${integration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !integration.visible }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json() as Integration;
      setIntegrations(prev => prev.map(i => i.id === updated.id ? updated : i));
    } catch {
      showToast("Toggle visibility failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (data: Partial<Integration>) => {
    const isEditing = !!data.id;
    try {
      const url = isEditing ? `/api/integrations/${data.id}` : "/api/integrations";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json() as Integration;
      
      if (isEditing) {
        setIntegrations(prev => prev.map(i => i.id === saved.id ? saved : i));
        showToast("Integration updated", "success");
      } else {
        setIntegrations(prev => [saved, ...prev]);
        showToast("Integration created", "success");
      }
      setIsModalOpen(false);
    } catch {
      showToast("Failed to save integration", "error");
    }
  };

  const filtered = integrations.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const getColorClass = (color: string) => {
    switch (color) {
      case "blue": return "from-blue-500 to-blue-600";
      case "purple": return "from-purple-500 to-purple-600";
      case "green": return "from-green-500 to-green-600";
      case "orange": return "from-orange-500 to-orange-600";
      case "pink": return "from-pink-500 to-pink-600";
      case "red": return "from-red-500 to-red-600";
      case "yellow": return "from-yellow-500 to-yellow-600";
      default: return "from-gray-500 to-gray-600";
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Integrations Management</h2>
          <p className="text-sm text-muted-foreground">{integrations.length} total integrations</p>
        </div>
        <button
          onClick={() => {
            setEditingIntegration(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search integrations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((integration, i) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "p-4 rounded-2xl bg-card border border-border flex flex-col gap-3 group transition-all",
              !integration.visible && "opacity-60 grayscale-[0.5]"
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn(
                "w-12 h-12 rounded-xl bg-linear-to-br flex items-center justify-center text-xl text-white shadow-sm",
                getColorClass(integration.color)
              )}>
                {integration.logo}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggleVisible(integration)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  {integration.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setEditingIntegration(integration);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-blue-500"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(integration.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground">{integration.name}</h4>
              <p className="text-xs text-blue-500 font-medium mb-1">{integration.category}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{integration.description}</p>
            </div>

            {!integration.visible && (
              <div className="mt-auto pt-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                <EyeOff className="w-3 h-3" /> Hidden
              </div>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No integrations found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <IntegrationModal
            key={editingIntegration?.id || "new"}
            isOpen={isModalOpen}
            integration={editingIntegration}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
