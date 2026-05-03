"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Eye,
  EyeOff,
  X,
  Save,
} from "lucide-react";
import { FAQItem } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "Getting Started",
  "Security & Privacy",
  "Pricing & Billing",
  "Features & Functionality",
  "Support",
  "Technical"
];

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

function FAQModal({
  faq,
  isOpen,
  onClose,
  onSave,
}: {
  faq: Partial<FAQItem> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FAQItem>) => void;
}) {
  const [formData, setFormData] = useState<Partial<FAQItem>>({
    question: "",
    answer: "",
    category: "Getting Started",
    order: 0,
    visible: true,
    tags: [],
  });

  useEffect(() => {
    if (faq) {
      setFormData(faq);
    } else {
      setFormData({
        question: "",
        answer: "",
        category: "Getting Started",
        order: 0,
        visible: true,
        tags: [],
      });
    }
  }, [faq, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">
            {faq?.id ? "Edit FAQ" : "Add FAQ"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Question</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 outline-none h-20 resize-none"
              placeholder="How do I...?"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Answer</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 outline-none h-32 resize-none"
              placeholder="You can..."
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Order</label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="faq-visible"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="faq-visible" className="text-sm text-foreground">Visible</label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave(formData)}
            className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
          >
            {faq?.id ? "Update FAQ" : "Create FAQ"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadFaqs = useCallback(async () => {
    try {
      const res = await fetch("/api/faq");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json() as FAQItem[];
      setFaqs(data);
    } catch (err) {
      showToast("Error loading FAQs", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/faq/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setFaqs(prev => prev.filter(f => f.id !== id));
      showToast("FAQ deleted", "success");
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVisible = async (faq: FAQItem) => {
    setActionLoading(`visible-${faq.id}`);
    try {
      const res = await fetch(`/api/faq/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !faq.visible }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json() as FAQItem;
      setFaqs(prev => prev.map(f => f.id === updated.id ? updated : f));
    } catch {
      showToast("Update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFaqs.length) return;

    // Swap order values
    const tempOrder = newFaqs[index].order;
    newFaqs[index].order = newFaqs[targetIndex].order;
    newFaqs[targetIndex].order = tempOrder;

    // Sort by new order
    newFaqs.sort((a, b) => a.order - b.order);
    setFaqs(newFaqs);

    // Save both to API
    try {
      await Promise.all([
        fetch(`/api/faq/${newFaqs[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newFaqs[index].order }),
        }),
        fetch(`/api/faq/${newFaqs[targetIndex].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newFaqs[targetIndex].order }),
        })
      ]);
    } catch {
      showToast("Order update failed on server", "error");
    }
  };

  const handleSave = async (data: Partial<FAQItem>) => {
    const isEditing = !!data.id;
    try {
      const url = isEditing ? `/api/faq/${data.id}` : "/api/faq";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json() as FAQItem;
      
      if (isEditing) {
        setFaqs(prev => prev.map(f => f.id === saved.id ? saved : f).sort((a, b) => a.order - b.order));
        showToast("FAQ updated", "success");
      } else {
        setFaqs(prev => [...prev, saved].sort((a, b) => a.order - b.order));
        showToast("FAQ created", "success");
      }
      setIsModalOpen(false);
    } catch {
      showToast("Failed to save FAQ", "error");
    }
  };

  const filtered = faqs.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
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
          <h2 className="text-xl font-bold text-foreground">FAQ Management</h2>
          <p className="text-sm text-muted-foreground">{faqs.length} total questions</p>
        </div>
        <Button
          onClick={() => {
            setEditingFaq(null);
            setIsModalOpen(true);
          }}
          className="bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search FAQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase w-16">Order</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Question</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((f, i) => (
                <motion.tr
                  key={f.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleMove(i, 'up')}
                        disabled={i === 0}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <span className="text-xs font-bold text-foreground">{f.order}</span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleMove(i, 'down')}
                        disabled={i === filtered.length - 1}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-foreground line-clamp-1 max-w-md">{f.question}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{f.answer}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{f.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      f.visible ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                    )}>
                      {f.visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleVisible(f)}
                        disabled={actionLoading === `visible-${f.id}`}
                      >
                        {actionLoading === `visible-${f.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : f.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingFaq(f);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(f.id)}
                        disabled={actionLoading === f.id}
                        className="hover:text-red-500"
                      >
                        {actionLoading === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No FAQs found</p>
            </div>
          )}
        </div>
      </div>

      <FAQModal
        isOpen={isModalOpen}
        faq={editingFaq}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
