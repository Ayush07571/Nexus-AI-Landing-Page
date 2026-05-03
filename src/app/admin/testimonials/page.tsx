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
  X,
  Star,
  Eye,
  EyeOff,
  Quote,
} from "lucide-react";
import { Testimonial } from "@/types";
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

function TestimonialModal({
  testimonial,
  isOpen,
  onClose,
  onSave,
}: {
  testimonial: Partial<Testimonial> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Testimonial>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: "",
    role: "",
    company: "",
    quote: "",
    rating: 5,
    results: [],
    visible: true,
    avatar: "",
  });

  useEffect(() => {
    if (testimonial) {
      setFormData(testimonial);
    } else {
      setFormData({
        name: "",
        role: "",
        company: "",
        quote: "",
        rating: 5,
        results: [],
        visible: true,
        avatar: "",
      });
    }
  }, [testimonial, isOpen]);

  if (!isOpen) return null;

  const handleAddResult = () => {
    setFormData(prev => ({ ...prev, results: [...(prev.results || []), ""] }));
  };

  const handleUpdateResult = (index: number, value: string) => {
    const results = [...(formData.results || [])];
    results[index] = value;
    setFormData(prev => ({ ...prev, results }));
  };

  const handleRemoveResult = (index: number) => {
    setFormData(prev => ({ ...prev, results: (prev.results || []).filter((_, i) => i !== index) }));
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
          <h3 className="text-xl font-bold text-foreground">
            {testimonial?.id ? "Edit Testimonial" : "Add Testimonial"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Sarah Chen"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Product Manager"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="TechCorp"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Rating (1-5)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Quote</label>
            <textarea
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Enter testimonial content..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Results / Proof Points</label>
            <div className="space-y-2">
              {formData.results?.map((res, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={res}
                    onChange={(e) => handleUpdateResult(i, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 40% more productive"
                  />
                  <button onClick={() => handleRemoveResult(i)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddResult}
                className="text-xs text-blue-500 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add result
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="visible" className="text-sm text-foreground">Visible on landing page</label>
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
            {testimonial?.id ? "Update Testimonial" : "Create Testimonial"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTestimonials = useCallback(async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json() as Testimonial[];
      setTestimonials(data);
    } catch (err) {
      showToast("Error loading testimonials", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setTestimonials(prev => prev.filter(t => t.id !== id));
      showToast("Testimonial deleted", "success");
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVisible = async (testimonial: Testimonial) => {
    setActionLoading(`visible-${testimonial.id}`);
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !testimonial.visible }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json() as Testimonial;
      setTestimonials(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {
      showToast("Toggle visibility failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (data: Partial<Testimonial>) => {
    const isEditing = !!data.id;
    try {
      const url = isEditing ? `/api/testimonials/${data.id}` : "/api/testimonials";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json() as Testimonial;
      
      if (isEditing) {
        setTestimonials(prev => prev.map(t => t.id === saved.id ? saved : t));
        showToast("Testimonial updated", "success");
      } else {
        setTestimonials(prev => [saved, ...prev]);
        showToast("Testimonial created", "success");
      }
      setIsModalOpen(false);
    } catch {
      showToast("Failed to save testimonial", "error");
    }
  };

  const filtered = testimonials.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.company.toLowerCase().includes(search.toLowerCase()) ||
    t.quote.toLowerCase().includes(search.toLowerCase())
  );

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
          <h2 className="text-xl font-bold text-foreground">Testimonials Management</h2>
          <p className="text-sm text-muted-foreground">{testimonials.length} total testimonials</p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search testimonials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Author</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Quote</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Rating</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {t.avatar || t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role} @ {t.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">{t.quote}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={cn("w-3.5 h-3.5", idx < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")} />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      t.visible ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                    )}>
                      {t.visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleVisible(t)}
                        disabled={actionLoading === `visible-${t.id}`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {actionLoading === `visible-${t.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : t.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingTestimonial(t);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-blue-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={actionLoading === t.id}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                      >
                        {actionLoading === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Quote className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No testimonials found</p>
            </div>
          )}
        </div>
      </div>

      <TestimonialModal
        isOpen={isModalOpen}
        testimonial={editingTestimonial}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
