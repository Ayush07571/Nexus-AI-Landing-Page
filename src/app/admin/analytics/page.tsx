"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { Eye, Users, TrendingUp, BarChart3, Loader2, AlertCircle } from "lucide-react";
import { Analytics, Lead } from "@/types";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  index: number;
}

function StatCard({ title, value, subtitle, icon: Icon, color, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </motion.div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-foreground">{payload[0].value.toLocaleString()} visits</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, leadsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/leads"),
      ]);
      if (!analyticsRes.ok || !leadsRes.ok) throw new Error("Failed to load data");
      const [analyticsData, leadsData] = await Promise.all([
        analyticsRes.json() as Promise<Analytics>,
        leadsRes.json() as Promise<Lead[]>,
      ]);
      setAnalytics(analyticsData);
      setLeads(leadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
        <AlertCircle className="w-4 h-4" />
        {error ?? "Failed to load analytics"}
      </div>
    );
  }

  // Last 14 days of data
  const chartData = analytics.dailyVisits
    .slice(-14)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: d.count,
    }));

  const weekVisits = analytics.dailyVisits
    .slice(-7)
    .reduce((sum, d) => sum + d.count, 0);

  const conversionRate =
    analytics.totalVisits > 0
      ? ((leads.length / analytics.totalVisits) * 100).toFixed(2)
      : "0.00";

  const stats: StatCardProps[] = [
    {
      title: "Total Visitors",
      value: analytics.totalVisits.toLocaleString(),
      subtitle: "All time",
      icon: Eye,
      color: "bg-blue-500/15 text-blue-500",
      index: 0,
    },
    {
      title: "This Week",
      value: weekVisits.toLocaleString(),
      subtitle: "Last 7 days",
      icon: BarChart3,
      color: "bg-purple-500/15 text-purple-500",
      index: 1,
    },
    {
      title: "Total Leads",
      value: leads.length,
      subtitle: `${leads.filter((l) => l.status === "new").length} new`,
      icon: Users,
      color: "bg-green-500/15 text-green-500",
      index: 2,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      subtitle: "Leads / Visitors",
      icon: TrendingUp,
      color: "bg-orange-500/15 text-orange-500",
      index: 3,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Daily Visits Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-semibold text-foreground mb-6">Daily Visits (Last 14 Days)</h3>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            No visit data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#visitGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Lead Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-semibold text-foreground mb-5">Lead Status Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          {(["new", "contacted", "closed"] as const).map((status) => {
            const count = leads.filter((l) => l.status === status).length;
            const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
            const colors = {
              new: { bar: "bg-orange-500", badge: "text-orange-500" },
              contacted: { bar: "bg-blue-500", badge: "text-blue-500" },
              closed: { bar: "bg-green-500", badge: "text-green-500" },
            };
            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn("font-medium capitalize", colors[status].badge)}>
                    {status}
                  </span>
                  <span className="text-muted-foreground text-xs">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className={cn("h-full rounded-full", colors[status].bar)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{pct}%</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
