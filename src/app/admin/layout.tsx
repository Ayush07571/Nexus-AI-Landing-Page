"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  Quote,
  Plug,
  HelpCircle,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeProvider, useTheme } from "@/components/ui/providers";

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ElementType;
}

const sidebarLinks: SidebarLink[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Pricing", href: "/admin/pricing", icon: CreditCard },
  { name: "Features", href: "/admin/features", icon: Sparkles },
  { name: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { name: "Integrations", href: "/admin/integrations", icon: Plug },
  { name: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Contact", href: "/admin/contact", icon: Inbox },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <span className="font-bold text-foreground text-lg">Admin</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-linear-to-r from-blue-600/15 to-purple-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active && "text-blue-600 dark:text-blue-400")} />
              <span>{link.name}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          aria-label="Toggle theme"
        >
          {theme.mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme.mode === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Back to Site */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Back to Site</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Get page title from current path
  const getTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/blogs/new")) return "New Blog";
    if (pathname.startsWith("/admin/blogs") && pathname.includes("/edit")) return "Edit Blog";
    if (pathname.startsWith("/admin/blogs")) return "Blog Management";
    if (pathname.startsWith("/admin/pricing")) return "Pricing Management";
    if (pathname.startsWith("/admin/features")) return "Features Management";
    if (pathname.startsWith("/admin/testimonials")) return "Testimonials Management";
    if (pathname.startsWith("/admin/integrations")) return "Integrations Management";
    if (pathname.startsWith("/admin/faq")) return "FAQ Management";
    if (pathname.startsWith("/admin/leads")) return "Leads";
    if (pathname.startsWith("/admin/contact")) return "Contact Responses";
    if (pathname.startsWith("/admin/analytics")) return "Analytics";
    return "Admin";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen">
        <AdminSidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden"
            >
              <AdminSidebar onClose={() => setMobileSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground">{getTitle()}</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ThemeProvider>
  );
}
