"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, CheckCircle2, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Integration } from "@/types";

interface IntegrationsProps {
  className?: string;
}

// Integration categories extracted from data for filter buttons
function IntegrationsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-16">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="p-6 rounded-xl bg-background border border-border animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-muted" />
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-2 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function Integrations({ className }: IntegrationsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { trackConversion, trackEngagement } = useAnalytics();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/integrations')
      .then(r => r.json())
      .then((data: Integration[]) => setIntegrations(data.filter(i => i.visible)))
      .catch(() => setIntegrations([]))
      .finally(() => setLoading(false));
  }, []);

  // Derive unique categories from loaded data
  const integrationCategories = Array.from(new Set(integrations.map(i => i.category)));

  const filteredPlatforms = integrations.filter(platform => {
    const matchesSearch = !searchTerm || platform.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || platform.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlatformClick = (platformName: string) => {
    trackConversion('cta_click', 'integration_platform', platformName);
    trackEngagement('section_view', platformName, 'integrations');
  };

  const handleRequestIntegration = () => {
    trackConversion('cta_click', 'integrations_request', 'Request Integration');
    // Open email to request integration
    const emailSubject = encodeURIComponent('Integration Request - Nexus AI');
    const emailBody = encodeURIComponent(`Hi Nexus AI Team,

I would like to request an integration with the following tool/platform:

Tool Name: 
Tool Website: 
Integration Type: (API, OAuth, Webhook, etc.)
Use Case: 

Thank you!`);
    window.location.href = `mailto:integrations@nexusai.com?subject=${emailSubject}&body=${emailBody}`;
  };

  const handleGetStarted = () => {
    trackConversion('cta_click', 'integrations_get_started', 'Get Started');
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
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  const getPlatformColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'purple':
        return 'from-purple-500 to-purple-600';
      case 'green':
        return 'from-green-500 to-green-600';
      case 'red':
        return 'from-red-500 to-red-600';
      case 'orange':
        return 'from-orange-500 to-orange-600';
      case 'yellow':
        return 'from-yellow-500 to-yellow-600';
      case 'pink':
        return 'from-pink-500 to-pink-600';
      case 'gray':
        return 'from-gray-500 to-gray-600';
      case 'black':
        return 'from-gray-900 to-black';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <section
      id="integrations"
      className={cn(
        "py-20 bg-muted/50",
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
            Integrations That Work With Your Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Nexus AI seamlessly integrates with 100+ popular tools and platforms. 
            Connect your existing workflow and start seeing results immediately.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <p className="text-muted-foreground">Platform integrations</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5 min</div>
              <p className="text-muted-foreground">Average setup time</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <p className="text-muted-foreground">Uptime guarantee</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                className={cn(
                  "px-4 py-2 rounded-lg border transition-colors",
                  selectedCategory === "All"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-muted"
                )}
                onClick={() => setSelectedCategory("All")}
              >
                All
              </button>
              {integrationCategories.map((category) => (
                <button
                  key={category}
                  className={cn(
                    "px-4 py-2 rounded-lg border transition-colors",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-muted"
                  )}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-center text-muted-foreground">
            Showing {filteredPlatforms.length} of {integrations.length} integrations
          </div>
        </motion.div>

        {/* Integration Grid */}
        {loading ? (
          <IntegrationsSkeleton />
        ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-16"
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {filteredPlatforms.map((platform) => (
            <motion.div
              key={platform.id}
              variants={itemVariants}
              className="relative group"
            >
              <motion.button
                className="w-full p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-all duration-300 glow-effect zoom-effect glass-effect"
                onClick={() => handlePlatformClick(platform.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Logo */}
                <div className={cn(
                  "w-16 h-16 rounded-xl bg-linear-to-br flex items-center justify-center text-2xl mb-4 mx-auto",
                  getPlatformColor(platform.color)
                )}>
                  {platform.logo}
                </div>

                {/* Name */}
                <h4 className="text-sm font-medium text-foreground text-center mb-2">
                  {platform.name}
                </h4>

                {/* Category */}
                <div className="text-xs text-muted-foreground text-center">
                  {platform.category}
                </div>

                {/* Check Mark */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* Benefits Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Global Compatibility
            </h3>
            <p className="text-muted-foreground">
              Works with tools from around the world, supporting multiple languages and regions.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Enterprise Ready
            </h3>
            <p className="text-muted-foreground">
              Built for scale with enterprise-grade security and compliance certifications.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Easy Setup
            </h3>
            <p className="text-muted-foreground">
              Get connected in minutes with our guided setup process and comprehensive documentation.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="p-8 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 glass-effect">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Don't See Your Tool?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're constantly adding new integrations. Request your tool and we'll prioritize it for development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 glow-effect zoom-effect"
                onClick={handleGetStarted}
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-medium border-2 border-border hover:bg-muted/50"
                onClick={handleRequestIntegration}
              >
                Request Integration
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Integrations;
