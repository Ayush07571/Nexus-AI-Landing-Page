"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LucideIcon, Moon, Sun, X, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/providers";
import { useAnalytics } from "@/lib/analytics";
import { variants } from "@/lib/animations";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items?: NavItem[];
  className?: string;
}

// Navigation items for Nexus AI
const navItems: NavItem[] = [
  {
    name: 'The Productivity Crisis',
    url: '#problem',
    icon: 'AlertTriangle' as any
  },
  {
    name: 'Features',
    url: '#features',
    icon: 'Star' as any
  },
  {
    name: 'Testimonials',
    url: '#testimonials',
    icon: 'MessageSquare' as any
  },
  {
    name: 'How It Works',
    url: '#how-it-works',
    icon: 'Zap' as any
  },
  {
    name: 'Integrations',
    url: '#integrations',
    icon: 'Globe' as any
  },
  {
    name: 'Demo',
    url: '#demo',
    icon: 'Play' as any
  },
  {
    name: 'Pricing',
    url: '#pricing',
    icon: 'CreditCard' as any
  },
  {
    name: 'FAQ',
    url: '#faq',
    icon: 'HelpCircle' as any
  },
  {
    name: 'Contact',
    url: '#contact',
    icon: 'Mail' as any
  }
];

export function NavBar({ items = navItems, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name || '');
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { trackConversion, trackEngagement } = useAnalytics();

  // Responsive detection and scroll tracking
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Determine active section based on scroll position
      const sections = items.map(item => ({
        id: item.url.replace('#', ''),
        name: item.name,
        element: document.getElementById(item.url.replace('#', ''))
      })).filter(section => section.element);

      if (sections.length === 0) return;

      // Find the section that's currently in view
      const scrollPosition = window.scrollY + 100; // Offset for navbar height
      
      let currentSection = sections[0];
      
      for (const section of sections) {
        const element = section.element;
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        
        if (elementTop <= scrollPosition) {
          currentSection = section;
        } else {
          break;
        }
      }
      
      setActiveTab(currentSection.name);
    };

    handleResize();
    handleScroll(); // Initial call
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [items]);

  // Smooth scroll to section
  const scrollToSection = (url: string) => {
    const targetId = url.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      trackEngagement('section_view', targetId);
    }
  };

  // Handle navigation click
  const handleNavClick = (item: NavItem) => {
    setActiveTab(item.name);
    scrollToSection(item.url);
    trackConversion('cta_click', `nav_${item.name.toLowerCase()}`, item.name);
    
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // Animation configuration
  const navbarAnimation = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }
  };

  const itemAnimation = {
    whileHover: { scale: 1.05 },
    transition: { duration: 0.3, type: "spring" as const, stiffness: 300, damping: 20 }
  };

  return (
    <motion.nav
      {...navbarAnimation}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-lg"
          : "bg-background/80 backdrop-blur-md",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/" 
              className="flex items-center gap-2 group"
              onClick={() => trackConversion('cta_click', 'nav_logo', 'Nexus AI')}
            >
              {/* Tubelight effect for logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 via-purple-600/20 to-transparent opacity-60 blur-md group-hover:opacity-80 transition-opacity duration-300" />
                <div className="relative">
                  <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                    Nexus AI
                  </span>
                  {/* Animated underline */}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-linear-to-r from-blue-600 to-purple-600"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <motion.div
                  key={item.name}
                  {...itemAnimation}
                  className="relative"
                >
                  <Link
                    href={item.url}
                    onClick={() => handleNavClick(item)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      "text-foreground/80 hover:text-foreground",
                      isActive && "bg-primary/10 text-primary",
                      "hover:bg-muted/50"
                    )}
                  >
                    <Icon size={18} strokeWidth={2} />
                    <span>{item.name}</span>
                    
                    {/* Tubelight effect for active item */}
                    {isActive && (
                      <motion.div
                        layoutId="tubelight"
                        className="absolute inset-0 w-full bg-linear-to-r from-primary/20 via-primary/10 to-transparent rounded-full -z-10"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        {/* Glow effect */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full">
                          <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                          <div className="absolute w-8 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                        </div>
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
            
            {/* Blog Link */}
            <motion.div {...itemAnimation} className="relative ml-2">
              <Link
                href="/blog"
                className="relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 text-foreground/80 hover:text-foreground hover:bg-muted/50"
              >
                <BookOpen size={16} strokeWidth={2} />
                <span>Blog</span>
              </Link>
            </motion.div>

            {/* Admin Button */}
            <motion.div {...itemAnimation} className="relative">
              <Link
                href="/admin"
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all duration-300"
              >
                <Settings size={13} strokeWidth={2} />
                <span>Admin</span>
              </Link>
            </motion.div>

            {/* Theme Toggle Button */}
            <motion.div {...itemAnimation} className="relative ml-1">
              <motion.button
                onClick={toggleTheme}
                className="relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 text-foreground/80 hover:text-foreground hover:bg-muted/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
              >
                <AnimatePresence>
                  {theme.mode === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sun size={18} strokeWidth={2} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Moon size={18} strokeWidth={2} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
              <motion.div
                className="w-full h-0.5 bg-foreground rounded-full"
                animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="w-full h-0.5 bg-foreground rounded-full"
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="w-full h-0.5 bg-foreground rounded-full"
                animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobile && isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Sidebar */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="md:hidden fixed top-0 right-0 h-full w-80 bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Nexus AI
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted/80 transition-colors"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Navigation Items */}
                <div className="p-4 space-y-2">
                  {items.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;

                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Link
                          href={item.url}
                          onClick={() => handleNavClick(item)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                            "text-foreground/80 hover:text-foreground hover:bg-muted/50",
                            isActive && "bg-primary/10 text-primary border-l-2 border-primary"
                          )}
                        >
                          <Icon size={20} strokeWidth={2.5} />
                          <span>{item.name}</span>
                          
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="mobile-sidebar-indicator"
                              className="ml-auto w-2 h-2 bg-primary rounded-full"
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Blog Link (Mobile) */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: items.length * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href="/blog"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-foreground/80 hover:text-foreground hover:bg-muted/50"
                    >
                      <BookOpen size={20} strokeWidth={2.5} />
                      <span>Blog</span>
                    </Link>
                  </motion.div>

                  {/* Admin Link (Mobile) */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (items.length + 1) * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      <Settings size={20} strokeWidth={2.5} />
                      <span>Admin</span>
                    </Link>
                  </motion.div>
                </div>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      © 2024 Nexus AI
                    </span>
                    <motion.button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg hover:bg-muted/80 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Toggle theme"
                    >
                      <AnimatePresence mode="wait">
                        {theme.mode === 'dark' ? (
                          <motion.div
                            key="sun"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Sun size={18} strokeWidth={2} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Moon size={18} strokeWidth={2} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

// Export the component as default for easier importing
export default NavBar;
