"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Loader2,
  AlertCircle,
  Mail,
  X,
  Eye,
  Calendar,
  Building2,
} from "lucide-react";
import { Lead } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function MessageModal({
  lead,
  onClose,
}: {
  lead: Lead | null;
  onClose: () => void;
}) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">Message Details</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {lead.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">{lead.name}</h4>
              <p className="text-sm text-muted-foreground">{lead.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{lead.company || "No Company"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {lead.message}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end bg-muted/20">
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const loadSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json() as Lead[];
      // Filter for submissions (if needed, but task says use data/leads.json)
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleExportCSV = () => {
    if (submissions.length === 0) return;

    const headers = ["Name", "Email", "Company", "Message", "Date"];
    const rows = submissions.map(s => [
      s.name,
      s.email,
      s.company || "",
      s.message.replace(/,/g, " "), // Basic CSV cleanup
      new Date(s.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nexus_contact_responses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = submissions.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.company?.toLowerCase().includes(search.toLowerCase())
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
          <h2 className="text-xl font-bold text-foreground">Contact Responses</h2>
          <p className="text-sm text-muted-foreground">{submissions.length} total messages</p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
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
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Sender</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Company</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Message</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-muted/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedLead(s)}
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {s.company || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">{s.message}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No messages found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedLead && (
          <MessageModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
