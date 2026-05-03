"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MessageSquare, Send, CheckCircle, AlertCircle, User, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/ui/async-button";
import { useAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ContactProps {
  className?: string;
}

// Zod schema for form validation
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject must be less than 200 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters"),
  inquiryType: z.enum(["sales", "support", "general", "partnership"]),
  consent: z.boolean().refine(val => val === true, "You must agree to the privacy policy")
});

type ContactFormData = z.infer<typeof contactSchema>;

export function Contact({ className }: ContactProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { trackConversion, trackEngagement } = useAnalytics();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange"
  });

  const watchedValues = watch();

  // Handle form submission
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Track form submission start
      trackConversion('form_submit', 'contact_form_start', data.inquiryType);
      trackEngagement('section_view', 'contact_submit', 'contact');

      // POST to /api/leads — data appears in Admin → Leads automatically
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company: data.company ?? '',
          message: data.message,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? 'Submission failed');
      }

      // Track successful submission
      trackConversion('form_submit', 'contact_form_success', data.inquiryType);
      trackEngagement('section_view', 'contact_success', 'contact');

      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('Failed to submit form. Please try again.');
      
      // Track submission error
      trackConversion('form_submit', 'contact_form_error', 'contact');
      trackEngagement('section_view', 'contact_error', 'contact');
    } finally {
      // Done
    }
  };

  // Handle field changes for analytics
  const handleFieldChange = (fieldName: string) => {
    trackEngagement('section_view', `field_${fieldName}`, 'contact');
  };

  // Handle inquiry type change
  const handleInquiryTypeChange = (value: string) => {
    trackConversion('cta_click', 'inquiry_type_select', value);
    trackEngagement('section_view', `inquiry_${value}`, 'contact');
  };

  // Reset form
  const handleReset = () => {
    reset();
    setIsSubmitted(false);
    setSubmitError(null);
    trackConversion('cta_click', 'form_reset', 'contact');
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

  const successVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  if (isSubmitted) {
    return (
      <section
        id="contact"
        className={cn(
          "py-20 bg-background",
          className
        )}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={successVariants}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Thank You for Contacting Us!
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We&apos;ve received your message and will get back to you within 24 hours. 
              Our team is excited to learn more about your needs.
            </p>
            
            <div className="bg-muted/50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Our team reviews your inquiry and assigns it to the right specialist
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll receive a personalized response within 24 hours
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll schedule a demo or call to discuss your specific needs
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Send Another Message
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="w-full sm:w-auto"
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      className={cn(
        "py-20 bg-background",
        className
      )}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Have questions about Nexus AI? Want to see a demo? Our team is here to help. 
            Fill out the form below and we&apos;ll get back to you within 24 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h3 variants={itemVariants} className="text-2xl font-bold text-foreground mb-6">
              Contact Information
            </motion.h3>
            
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Email</h4>
                  <p className="text-muted-foreground">support@nexusai.com</p>
                  <p className="text-sm text-muted-foreground">We respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                  <p className="text-muted-foreground">+1 (800) NEXUS-AI</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Live Chat</h4>
                  <p className="text-muted-foreground">Available on our website</p>
                  <p className="text-sm text-muted-foreground">Instant support during business hours</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8">
              <h4 className="font-semibold text-foreground mb-4">Office Locations</h4>
              <div className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Headquarters</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    123 Tech Street, San Francisco, CA 94105
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">European Office</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    456 Innovation Ave, London, UK EC1A 1BB
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Send us a message</h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Inquiry Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Inquiry Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('inquiryType', { 
                      onChange: (e) => handleInquiryTypeChange(e.target.value)
                    })}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      errors.inquiryType ? "border-red-500" : "border-border"
                    )}
                  >
                    <option value="">Select inquiry type</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="general">General Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                  {errors.inquiryType && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.inquiryType.message}
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      {...register('name', { 
                        onChange: () => handleFieldChange('name')
                      })}
                      type="text"
                      placeholder="Your full name"
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                        errors.name ? "border-red-500" : "border-border"
                      )}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      {...register('email', { 
                        onChange: () => handleFieldChange('email')
                      })}
                      type="email"
                      placeholder="your@email.com"
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                        errors.email ? "border-red-500" : "border-border"
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Company and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company
                    </label>
                    <input
                      {...register('company', { 
                        onChange: () => handleFieldChange('company')
                      })}
                      type="text"
                      placeholder="Your company"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        {...register('phone', { 
                          onChange: () => handleFieldChange('phone')
                        })}
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('subject', { 
                      onChange: () => handleFieldChange('subject')
                    })}
                    type="text"
                    placeholder="How can we help you?"
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      errors.subject ? "border-red-500" : "border-border"
                    )}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('message', { 
                      onChange: () => handleFieldChange('message')
                    })}
                    rows={5}
                    placeholder="Tell us more about your needs..."
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none",
                      errors.message ? "border-red-500" : "border-border"
                    )}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Privacy Consent */}
                <div>
                  <label className="flex items-start gap-3">
                    <input
                      {...register('consent', { 
                        onChange: () => handleFieldChange('consent')
                      })}
                      type="checkbox"
                      className={cn(
                        "mt-1 rounded border-border text-primary focus:ring-primary",
                        errors.consent ? "border-red-500" : ""
                      )}
                    />
                    <span className="text-sm text-muted-foreground">
                      I agree to the <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and 
                      <a href="/terms" className="text-primary hover:underline"> Terms of Service</a>. 
                      I understand that my information will be used to respond to my inquiry.
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.consent.message}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {submitError}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <AsyncButton
                  onClick={async () => {
                    const data = watchedValues;
                    if (!data.name || !data.email || !data.subject || !data.message || !data.inquiryType || !data.consent) {
                      throw new Error('Please fill in all required fields');
                    }
                    
                    setSubmitError(null);

                    try {
                      // Track form submission start
                      trackConversion('form_submit', 'contact_form_start', data.inquiryType);
                      trackEngagement('section_view', 'contact_submit', 'contact');

                      // POST to /api/leads — data appears in Admin → Leads automatically
                      const res = await fetch('/api/leads', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: data.name,
                          email: data.email,
                          company: data.company ?? '',
                          message: data.message,
                        }),
                      });

                      if (!res.ok) {
                        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                        throw new Error(err.error ?? 'Submission failed');
                      }

                      // Track successful submission
                      trackConversion('form_submit', 'contact_form_success', data.inquiryType);
                      trackEngagement('section_view', 'contact_success', 'contact');

                      setIsSubmitted(true);
                      reset();
                    } catch (error) {
                      console.error('Form submission error:', error);
                      setSubmitError('Failed to submit form. Please try again.');
                      
                      // Track submission error
                      trackConversion('form_submit', 'contact_form_error', 'contact');
                      trackEngagement('section_view', 'contact_error', 'contact');
                    } finally {
                      // Done
                    }
                  }}
                  disabled={!isValid || !isDirty}
                  loadingText="Sending message..."
                  className="w-full"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </AsyncButton>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
