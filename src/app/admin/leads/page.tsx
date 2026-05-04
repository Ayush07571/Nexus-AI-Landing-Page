"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  Loader2,
  AlertCircle,
  Users,
  Filter,
} from "lucide-react";
import { Lead, LeadStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useAIMode } from "@/hooks/useAIMode";
import { AIToggle } from "@/components/admin/AIToggle";
import { DraftReplyModal } from "@/components/admin/DraftReplyModal";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const STATUS_OPTIONS: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "text-xs px-2.5 py-1 rounded-full font-medium capitalize",
        status === "new" && "bg-orange-500/15 text-orange-600 dark:text-orange-400",
        status === "contacted" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        status === "closed" && "bg-green-500/15 text-green-600 dark:text-green-400"
      )}
    >
      {status}
    </span>
  );
}

function StatusSelect({
  value,
  leadId,
  onChange,
}: {
  value: LeadStatus;
  leadId: string;
  onChange: (id: string, status: LeadStatus) => void;
}) {
  const [updating, setUpdating] = useState(false);

  const handleChange = async (newStatus: LeadStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      onChange(leadId, newStatus);
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative">
      {updating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        </div>
      )}
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value as LeadStatus)}
        disabled={updating}
        className={cn(
          "text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer",
          updating && "opacity-0"
        )}
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  );
}

function exportToCSV(leads: Lead[]) {
  const headers = ["ID", "Name", "Email", "Company", "Message", "Status", "Date"];
  const rows = leads.map((l) => [
    l.id,
    l.name,
    l.email,
    l.company,
    `"${l.message.replace(/"/g, '""')}"`,
    l.status,
    new Date(l.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexus-leads-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const { aiMode, toggleAIMode } = useAIMode();
  const [replyingTo, setReplyingTo] = useState<Lead | null>(null);

  const loadLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json() as Lead[];
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleStatusChange = (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground">
            {leads.length} total · {leads.filter((l) => l.status === "new").length} new
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIToggle aiMode={aiMode} onToggle={toggleAIMode} />
          <button
            onClick={() => exportToCSV(filtered)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-medium">No leads found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Name", "Email", "Company", "Message", "Date", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {lead.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{lead.email}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {lead.company || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <p
                        className="text-sm text-muted-foreground max-w-[200px] truncate"
                        title={lead.message}
                      >
                        {lead.message}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <StatusSelect
                          value={lead.status}
                          leadId={lead.id}
                          onChange={handleStatusChange}
                        />
                        {aiMode && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setReplyingTo(lead)}
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                            title="Draft AI Reply"
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-border">
            {filtered.map((lead) => (
              <div key={lead.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                    {lead.company && (
                      <p className="text-xs text-muted-foreground">{lead.company}</p>
                    )}
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{lead.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusSelect
                      value={lead.status}
                      leadId={lead.id}
                      onChange={handleStatusChange}
                    />
                    {aiMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(lead)}
                        className="text-blue-500 gap-1.5"
                      >
                        <Sparkles className="w-3 h-3" />
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <DraftReplyModal
        isOpen={!!replyingTo}
        onClose={() => setReplyingTo(null)}
        lead={replyingTo || { name: "", message: "" }}
      />
    </div>
  );
}
