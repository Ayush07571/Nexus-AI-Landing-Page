"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Testimonial } from "@/types";

interface TestimonialsProps {
  className?: string;
}

// Testimonials data fetched from API
function TestimonialsSkeleton() {
  return (
    <div className="relative h-[600px] mb-12 flex items-center justify-center">
      <div className="w-96 h-[500px] rounded-3xl bg-background border border-border animate-pulse flex flex-col items-center p-8 gap-4">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="mt-auto flex gap-3 w-full">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials({ className }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { trackConversion, trackEngagement } = useAnalytics();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch testimonials from API on mount
  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then((data: Testimonial[]) => setTestimonials(data.filter(t => t.visible)))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    trackConversion('cta_click', 'testimonial_previous', 'Previous Testimonial');
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    trackConversion('cta_click', 'testimonial_next', 'Next Testimonial');
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    trackConversion('cta_click', 'testimonial_dot', `Testimonial ${index + 1}`);
  };

  const currentTestimonial = testimonials[currentIndex];
  const nextTestimonial = testimonials[(currentIndex + 1) % (testimonials.length || 1)];
  const prevTestimonial = testimonials[(currentIndex - 1 + (testimonials.length || 1)) % (testimonials.length || 1)];

  // Animation variants
  const carouselVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45
    })
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleSwipe = (newDirection: number) => {
    paginate(newDirection);
    if (newDirection > 0) {
      handleNext();
    } else {
      handlePrevious();
    }
  };

  return (
    <section
      id="testimonials"
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
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join thousands of professionals who have transformed their productivity with Nexus AI
          </p>
        </motion.div>

        {/* 3D Carousel */}
        {loading || testimonials.length === 0 ? (
          <TestimonialsSkeleton />
        ) : (
        <div className="relative h-[600px] mb-12">
          <div className="absolute inset-0 flex items-center justify-center perspective-1000">
            {/* Previous Testimonial (Side) */}
            <motion.div
              className="absolute w-80 h-96 -left-10 top-1/2 -translate-y-1/2 opacity-50"
              animate={{
                x: -320,
                y: 0,
                z: -200,
                rotateY: 25,
                scale: 0.8
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <div className="w-full h-full p-8 rounded-2xl bg-background/80 backdrop-blur-md border border-border glass-effect">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {prevTestimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{prevTestimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{prevTestimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(prevTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground line-clamp-3">{prevTestimonial.quote}</p>
              </div>
            </motion.div>

            {/* Current Testimonial (Center) */}
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={page}
                className="absolute w-96 h-[500px] z-10"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 },
                  rotateY: { type: "spring", stiffness: 300, damping: 30 }
                }}
              >
                <div className="w-full h-full p-8 rounded-3xl bg-background border border-border shadow-2xl glass-effect glow-effect">
                  {/* Quote Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Quote className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <blockquote className="text-lg text-foreground mb-8 text-center leading-relaxed">
                    "{currentTestimonial.quote}"
                  </blockquote>

                  {/* Results */}
                  <div className="mb-8">
                    <div className="grid grid-cols-1 gap-2">
                      {currentTestimonial.results.map((result, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {result}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                        {currentTestimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{currentTestimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
                        <p className="text-xs text-primary font-medium">{currentTestimonial.company}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next Testimonial (Side) */}
            <motion.div
              className="absolute w-80 h-96 -right-10 top-1/2 -translate-y-1/2 opacity-50"
              animate={{
                x: 320,
                y: 0,
                z: -200,
                rotateY: -25,
                scale: 0.8
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <div className="w-full h-full p-8 rounded-2xl bg-background/80 backdrop-blur-md border border-border glass-effect">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {nextTestimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{nextTestimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{nextTestimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(nextTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground line-clamp-3">{nextTestimonial.quote}</p>
              </div>
            </motion.div>
          </div>
        </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.button
            className="p-3 rounded-full bg-background border border-border hover:bg-muted/50 transition-colors glow-effect zoom-effect"
            onClick={handlePrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                )}
                onClick={() => handleDotClick(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <motion.button
            className="p-3 rounded-full bg-background border border-border hover:bg-muted/50 transition-colors glow-effect zoom-effect"
            onClick={handleNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Auto-play Toggle */}
        <div className="text-center">
          <motion.button
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAutoPlaying ? 'Pause' : 'Play'} Auto-play
          </motion.button>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
