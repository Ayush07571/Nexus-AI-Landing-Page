"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
}

// Rotating keywords for the headline
const rotatingKeywords = [
  "emails",
  "meetings", 
  "tasks",
  "deadlines",
  "projects",
  "deadlines"
];

export function Hero({ className }: HeroProps) {
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const { trackConversion } = useAnalytics();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setWindowWidth(window.innerWidth);
    }, 0);
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Rotate keywords
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeout(() => {
        setCurrentKeywordIndex((prev) => (prev + 1) % rotatingKeywords.length);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle scroll for parallax
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mouse movement for parallax
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle CTA clicks
  const handleGetStarted = () => {
    trackConversion('cta_click', 'hero_get_started', 'Get Started');
    // Scroll to features or pricing
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    trackConversion('cta_click', 'hero_learn_more', 'Learn More');
    // Scroll to features
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  const keywordVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className={cn(
        "min-h-screen flex items-center justify-center relative overflow-hidden",
        "hero-gradient",
        className
      )}
    >
      {/* Parallax Background Layers - Client Only */}
      <div className="absolute inset-0">
        {/* Static background for SSR fallback */}
        <div className="absolute inset-0 bg-linear-to-b from-sky-1900 to-sky-1700 opacity-50" />
        
        {/* Dynamic layers - only render on client */}
        {isMounted && (
          <>
            {/* Layer 1 - Slow moving shapes */}
            <div 
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{
                transform: `translateY(${scrollY * 0.2}px) translateX(${(mousePosition.x - windowWidth / 2) * 0.02}px)`
              }}
            >
              <div className="absolute top-20 left-10 w-32 h-32 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
              <div className="absolute top-1/2 right-20 w-48 h-48 bg-linear-to-tr from-purple-500/15 to-pink-500/15 rounded-full blur-3xl" />
              <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-linear-to-bl from-cyan-500/10 to-blue-500/10 rounded-full blur-xl" />
            </div>

            {/* Layer 2 - Medium speed shapes */}
            <div 
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{
                transform: `translateY(${scrollY * 0.5}px) translateX(${(mousePosition.x - windowWidth / 2) * 0.05}px)`
              }}
            >
              <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-linear-to-r from-indigo-500/20 to-blue-500/20 rounded-lg blur-lg rotate-45" />
              <div className="absolute top-2/3 right-1/3 w-36 h-36 bg-linear-to-l from-pink-500/15 to-purple-500/15 rounded-full blur-xl rotate-12" />
              <div className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-linear-to-t from-cyan-500/15 to-teal-500/15 rounded-lg blur-lg rotate-45" />
            </div>

            {/* Layer 3 - Fast moving shapes */}
            <div 
              className="absolute inset-0 transition-transform duration-100 ease-out"
              style={{
                transform: `translateY(${scrollY * 0.8}px) translateX(${(mousePosition.x - windowWidth / 2) * 0.1}px)`
              }}
            >
              <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-linear-to-br from-violet-500/25 to-fuchsia-500/25 rounded-md blur-md rotate-12" />
              <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-linear-to-tl from-rose-500/20 to-pink-500/20 rounded-full blur-lg rotate-45" />
            </div>
          </>
        )}

        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/30" />
      </div>

      {/* Hero content */}
      <motion.div
        className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary mb-8 shadow-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300"
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered Productivity</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
        >
          <span className="block">Transform your</span>
          <span className="block text-gradient">
            <AnimatePresence>
              <motion.span
                key={currentKeywordIndex}
                variants={keywordVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="inline-block"
              >
                {rotatingKeywords[currentKeywordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="block">with AI</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Nexus AI is your intelligent productivity assistant that automates repetitive tasks, 
          streamlines workflows, and helps you focus on what matters most. 
          Experience the future of work today.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            className="px-8 py-4 text-lg font-medium bg-white/20 backdrop-blur-lg border border-white/30 text-primary-foreground hover:bg-white/30 hover:border-white/40 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={handleGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
            <CheckCircle className="w-5 h-5 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-4 text-lg font-medium bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground hover:bg-white/20 hover:border-white/30 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={handleLearnMore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
            <Calendar className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex flex-col sm:flex-row gap-8 items-center justify-center"
        >
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">14-day free trial</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">No credit card required</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Cancel anytime</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full blur-xl float-animation"
        animate={{
          y: [-10, 10, -10],
          x: [-5, 5, -5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-10 w-32 h-32 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full blur-2xl float-animation"
        animate={{
          y: [10, -10, 10],
          x: [5, -5, 5]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full blur-xl float-animation"
        animate={{
          y: [-15, 15, -15],
          x: [-10, 10, -10]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </section>
  );
}

export default Hero;
