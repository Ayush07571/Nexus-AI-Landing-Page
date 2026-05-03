"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Home, RefreshCw, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NotFoundProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  errorCode?: string;
}

export function NotFound({ 
  title = "Page not found",
  description = "Lost, this page is. In another system, it may be.",
  showSearch = true,
  errorCode = "404"
}: NotFoundProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Simulate search delay
      setTimeout(() => {
        window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
      }, 1000);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };



  return (
    <div className="relative text-center z-1 pt-52 min-h-svh" suppressHydrationWarning>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-linear-to-br from-blue-50/20 via-purple-50/20 to-pink-50/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Floating Error Elements */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 backdrop-blur-sm rounded-full"
            style={{
              width: `${2 + i * 0.75}rem`,
              height: `${2 + i * 0.75}rem`,
              left: `${20 + i * 15}%`,
              top: `${20 + i * 15}%`,
            }}
            initial={{ 
              opacity: 0, 
              scale: 0,
              rotate: (i * 60) % 360 
            }}
            animate={{ 
              opacity: [0, 1, 0.5, 0],
              scale: [0, 1, 0.8, 0.5],
              rotate: [0, (i * 60) % 360, 180, (i * 60) % 360]
            }}
            transition={{ 
              duration: 3 + i * 0.5,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto w-full"
        >
          {/* Error Code Display */}
          <motion.div
            className="mb-8 inline-flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="relative">
              <AlertTriangle className="w-12 h-12 text-red-500 mr-4" />
              <div className="text-left">
                <h1 className="text-6xl font-bold text-red-600 mb-2">
                  Error {errorCode}
                </h1>
                <div className="text-red-500 text-sm font-mono bg-red-50 px-3 py-1 rounded inline-block">
                  {errorCode}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mt-6 text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {description}
          </motion.p>

          {/* Search Section */}
          {showSearch && (
            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-y-3 sm:space-x-2 mx-auto sm:max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      handleSearch(e);
                    }
                  }}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                  disabled={isSearching}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="w-full sm:w-auto"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-y-3 sm:space-x-6 items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button 
              variant="secondary" 
              asChild 
              className="group"
            >
              <Link 
                href="/"
                className="flex items-center gap-2"
              >
                <ArrowLeft
                  className="me-2 opacity-60 transition-transform group-hover:-translate-x-0.5"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Go back
              </Link>
            </Button>
            
            <Button 
              onClick={handleRefresh}
              className="group"
            >
              <RefreshCw
                  className="me-2 opacity-60 transition-transform group-hover:rotate-180"
                  size={16}
                  strokeWidth={2}
                />
              Try again
            </Button>
            
            <Button 
              asChild 
              className="group"
            >
              <Link 
                href="/"
                className="flex items-center gap-2"
              >
                <Home
                  className="me-2 opacity-60 transition-transform group-hover:scale-110"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Take me home
              </Link>
            </Button>
          </motion.div>

          {/* Help Text */}
          <motion.div
            className="mt-8 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p>
              If you believe this is an error, please{" "}
              <a 
                href="mailto:support@nexusai.com" 
                className="text-primary hover:underline"
              >
                contact our support team
              </a>
              {" "}or try searching for what you&apos;re looking for.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
