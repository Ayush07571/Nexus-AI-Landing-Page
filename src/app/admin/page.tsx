"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  Eye,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Analytics, Blog, Lead } from "@/types";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
  index: number;
}

function StatCard({ title, value, subtitle, icon: Icon, color, href, index }: StatCardProps) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={cn(
        "relative bg-card border border-border rounded-2xl p-6 overflow-hidden group transition-all duration-200",
        href && "hover:border-blue-500/30 hover:shadow-lg cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-5 h-5" />
        </div>
        {href && (
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </motion.div>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, blogsRes, leadsRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/blogs"),
          fetch("/api/leads"),
        ]);

        if (!analyticsRes.ok || !blogsRes.ok || !leadsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [analyticsData, blogsData, leadsData] = await Promise.all([
          analyticsRes.json() as Promise<Analytics>,
          blogsRes.json() as Promise<Blog[]>,
          leadsRes.json() as Promise<Lead[]>,
        ]);

        setAnalytics(analyticsData);
        setBlogs(blogsData);
        setLeads(leadsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-xl">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  const publishedBlogs = blogs.filter((b) => b.status === "published").length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const conversionRate = analytics && analytics.totalVisits > 0
    ? ((leads.length / analytics.totalVisits) * 100).toFixed(2)
    : "0.00";

  const stats: StatCardProps[] = [
    {
      title: "Total Blogs",
      value: blogs.length,
      subtitle: `${publishedBlogs} published`,
      icon: FileText,
      color: "bg-blue-500/15 text-blue-500",
      href: "/admin/blogs",
      index: 0,
    },
    {
      title: "Published Blogs",
      value: publishedBlogs,
      subtitle: `${blogs.length - publishedBlogs} drafts`,
      icon: CheckCircle2,
      color: "bg-green-500/15 text-green-500",
      href: "/admin/blogs",
      index: 1,
    },
    {
      title: "Total Leads",
      value: leads.length,
      subtitle: `${newLeads} new`,
      icon: Users,
      color: "bg-purple-500/15 text-purple-500",
      href: "/admin/leads",
      index: 2,
    },
    {
      title: "New Leads",
      value: newLeads,
      subtitle: "Awaiting contact",
      icon: AlertCircle,
      color: "bg-orange-500/15 text-orange-500",
      href: "/admin/leads",
      index: 3,
    },
    {
      title: "Total Visitors",
      value: analytics?.totalVisits.toLocaleString() ?? 0,
      subtitle: "All time",
      icon: Eye,
      color: "bg-cyan-500/15 text-cyan-500",
      href: "/admin/analytics",
      index: 4,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      subtitle: "Leads / Visitors",
      icon: TrendingUp,
      color: "bg-pink-500/15 text-pink-500",
      href: "/admin/analytics",
      index: 5,
    },
  ];

  // Recent items
  const recentLeads = leads.slice(0, 5);
  const recentBlogs = blogs.slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s what&apos;s happening with Nexus AI today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Recent Leads
            </h3>
            <Link href="/admin/leads" className="text-xs text-blue-500 hover:underline">
              View all
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-muted-foreground text-sm">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium shrink-0",
                      lead.status === "new" && "bg-orange-500/15 text-orange-600 dark:text-orange-400",
                      lead.status === "contacted" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                      lead.status === "closed" && "bg-green-500/15 text-green-600 dark:text-green-400"
                    )}
                  >
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Blogs */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Recent Blogs
            </h3>
            <Link href="/admin/blogs" className="text-xs text-blue-500 hover:underline">
              View all
            </Link>
          </div>
          {recentBlogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No blogs yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{blog.title}</p>
                    <p className="text-xs text-muted-foreground">{blog.category}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BarChart3 className="w-3 h-3" />
                      {blog.views}
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        blog.status === "published"
                          ? "bg-green-500/15 text-green-600 dark:text-green-400"
                          : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                      )}
                    >
                      {blog.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
