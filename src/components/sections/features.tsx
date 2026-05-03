"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Zap, Shield, Globe, BarChart3, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Feature } from "@/types";

interface FeaturesProps {
  className?: string;
}

// Map icon string names (stored in JSON) back to Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Users,
};

function FeaturesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-8 rounded-2xl bg-background border border-border animate-pulse">
          <div className="w-16 h-16 rounded-xl bg-muted mb-6" />
          <div className="h-5 bg-muted rounded w-2/3 mb-4" />
          <div className="h-4 bg-muted rounded w-full mb-2" />
          <div className="h-4 bg-muted rounded w-5/6 mb-6" />
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-2/5" />
            <div className="h-3 bg-muted rounded w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Features({ className }: FeaturesProps) {
  const { trackConversion, trackEngagement } = useAnalytics();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/features')
      .then(r => r.json())
      .then((data: Feature[]) => setFeatures(data.filter(f => f.visible)))
      .catch(() => setFeatures([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLearnMore = (featureTitle: string) => {
    trackConversion('cta_click', 'feature_learn_more', featureTitle);
    // Scroll to how-it-works section
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    trackConversion('cta_click', 'features_get_started', 'Get Started');
    // Scroll to pricing section
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
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

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'yellow':
        return 'from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'green':
        return 'from-green-500 to-green-600 text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'purple':
        return 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
      case 'orange':
        return 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
      case 'red':
        return 'from-red-500 to-red-600 text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'from-gray-500 to-gray-600 text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <section
      id="features"
      className={cn(
        "py-20 bg-background",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Nexus AI combines cutting-edge artificial intelligence with intuitive design 
            to deliver a productivity platform that actually works for you.
          </p>
        </motion.div>

        {/* Features Grid */}
        {loading ? (
          <FeaturesSkeleton />
        ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {features.map((feature) => {
            const Icon = ICON_MAP[feature.icon] ?? Brain;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className="relative group"
              >
                <div className={cn(
                  "p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 glow-effect zoom-effect card-hover",
                  "glass-effect"
                )}>
                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-xl bg-linear-to-br flex items-center justify-center mb-6",
                    getColorClasses(feature.color)
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-3 mb-6">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-primary/10 transition-colors"
                    onClick={() => handleLearnMore(feature.title)}
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </motion.div>
            );
          })}
        </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">10M+</div>
            <p className="text-muted-foreground">Tasks automated daily</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">50K+</div>
            <p className="text-muted-foreground">Active users</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
            <p className="text-muted-foreground">Uptime guarantee</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
            <p className="text-muted-foreground">User satisfaction</p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="p-8 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 glass-effect">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Productivity?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who have already revolutionized their workflow with Nexus AI.
            </p>
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 glow-effect zoom-effect"
              onClick={handleGetStarted}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Features;
