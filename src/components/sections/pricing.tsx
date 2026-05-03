"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Star, ArrowRight, Zap, Shield, Users, Crown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { PricingData, PricingPlan } from "@/types";

interface PricingProps {
  className?: string;
}

const PLAN_DEFAULTS: Record<string, { image: string; color: string }> = {
  starter: { image: "🌱", color: "green" },
  professional: { image: "🚀", color: "blue" },
  enterprise: { image: "🏢", color: "purple" }
};

function PricingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-8 rounded-2xl bg-background border border-border animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-muted mb-6" />
          <div className="h-6 bg-muted rounded w-1/2 mb-4" />
          <div className="h-4 bg-muted rounded w-5/6 mb-8" />
          <div className="h-10 bg-muted rounded w-full mb-10" />
          <div className="space-y-3 w-full">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Pricing({ className }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const { trackConversion, trackEngagement } = useAnalytics();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pricing')
      .then(r => r.json())
      .then((data: PricingData) => setPlans(data.plans))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const handlePlanSelect = (planId: string, planName: string) => {
    trackConversion('pricing_click', planId, planName);
    trackEngagement('section_view', planId, 'pricing');
    
    // Track billing cycle preference
    trackConversion('pricing_click', 'billing_preference', billingCycle);
    
    // Handle different plan actions
    if (planId === "enterprise") {
      // Scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Scroll to signup or pricing page
      console.log(`Selected ${planName} plan`);
    }
  };

  const handleBillingToggle = () => {
    const newCycle = billingCycle === "monthly" ? "annual" : "monthly";
    setBillingCycle(newCycle);
    trackConversion('pricing_click', 'billing_toggle', newCycle);
    trackEngagement('section_view', newCycle, 'pricing');
  };

  const getPlanPrice = (plan: PricingPlan) => {
    return billingCycle === "annual" ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice;
  };

  const getPeriodText = () => {
    return "month"; // Displayed as /month but price changes based on billing cycle
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

  return (
    <section
      id="pricing"
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
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your needs. All plans include our core AI features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn(
              "text-sm font-medium",
              billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
            )}>
              Monthly
            </span>
            <motion.button
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors bg-muted border border-border",
                billingCycle === "annual" ? "bg-primary/20" : ""
              )}
              onClick={handleBillingToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{
                  x: billingCycle === "annual" ? 32 : 4
                }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
            <span className={cn(
              "text-sm font-medium",
              billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"
            )}>
              Annual
              <span className="ml-1 text-xs text-primary font-semibold">Save 17%</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        {loading ? (
          <PricingSkeleton />
        ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {plans.map((plan) => {
            const currentPrice = getPlanPrice(plan);
            const defaults = PLAN_DEFAULTS[plan.id] || { image: "📦", color: "gray" };
            
            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className={cn(
                  "relative",
                  plan.highlighted && "md:-translate-y-4"
                )}
              >
                {/* Featured Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-4 py-1 rounded-full bg-linear-to-r from-primary to-primary/60 text-white text-sm font-semibold shadow-lg">
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Pricing Card */}
                <div
                  className={cn(
                    "relative p-8 rounded-2xl border-2 transition-all duration-300 h-full flex flex-col",
                    plan.highlighted
                      ? "border-primary bg-card/50 shadow-xl shadow-primary/10"
                      : "border-border bg-card/30 hover:border-primary/50"
                  )}
                >
                  {/* Plan Image */}
                  <div className="text-6xl mb-6 text-center">
                    <motion.div
                      className="inline-block"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {defaults.image}
                    </motion.div>
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-foreground mb-2 text-center">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 text-center text-sm min-h-[3rem]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="inline-block">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl font-bold text-foreground">₹</span>
                        <span className="text-5xl font-bold text-foreground">
                          {currentPrice}
                        </span>
                        <span className="text-lg font-normal text-muted-foreground">
                          /{getPeriodText()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Annual Savings Badge */}
                    {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                      <div className="mt-2 text-xs text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full inline-block">
                        Billed annually (₹{plan.annualPrice}/yr)
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-8 flex-1">
                    <h4 className="font-semibold text-foreground mb-4 text-sm">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle2 className={cn(
                            "w-5 h-5 shrink-0 mt-0.5",
                            feature.included ? "text-green-500" : "text-muted-foreground/30"
                          )} />
                          <span className={cn(
                            "text-sm",
                            feature.included ? "text-foreground" : "text-muted-foreground line-through"
                          )}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    className={cn(
                      "w-full mt-auto",
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                        : "bg-background border-2 border-border text-foreground hover:bg-muted/50"
                    )}
                    onClick={() => handlePlanSelect(plan.id, plan.name)}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        )}

        {/* Trust Indicators */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/20 border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm">30-Day Guarantee</h4>
              <p className="text-xs text-muted-foreground">
                Full refund if you're not satisfied
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/20 border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm">Instant Setup</h4>
              <p className="text-xs text-muted-foreground">
                Get started in minutes, not hours
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/20 border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm">24/7 Support</h4>
              <p className="text-xs text-muted-foreground">
                Get help whenever you need it
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Preview */}
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Have questions about our pricing?
          </h3>
          <p className="text-muted-foreground mb-8">
            Check our frequently asked questions or reach out to our team for a custom quote.
          </p>
          <Button
            variant="outline"
            className="rounded-full px-8"
            onClick={() => {
              const faqSection = document.getElementById('faq');
              if (faqSection) faqSection.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View Pricing FAQ
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default Pricing;
