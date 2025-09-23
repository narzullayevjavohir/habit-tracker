"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: "general" | "support" | "feature" | "bug" | "feedback";
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate API call - replace with your actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would typically send the data to your backend
      console.log("Form submitted:", formData);

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "general",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "support@habittracker.com",
      href: "mailto:support@habittracker.com",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Address",
      value: "123 Habit Street, Productivity City, PC 12345",
      href: "#",
    },
  ];

  const categoryOptions = [
    { value: "general", label: "General Inquiry" },
    { value: "support", label: "Technical Support" },
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Bug Report" },
    { value: "feedback", label: "Feedback" },
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Contact Information */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Get in Touch</CardTitle>
            <CardDescription>
              We'd love to hear from you. Send us a message and we'll respond as
              soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactInfo.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
              >
                <div className="text-blue-600">{item.icon}</div>
                <div>
                  <div className="font-medium text-sm text-gray-600">
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="text-gray-900">{item.value}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Response Time Info */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-800">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Response Time</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Send us a Message
            </CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you promptly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status Alerts */}
              {submitStatus === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Thank you for your message! We'll get back to you within 24
                    hours.
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert variant="destructive">
                  <AlertDescription>
                    There was an error sending your message. Please try again or
                    contact us directly.
                  </AlertDescription>
                </Alert>
              )}

              {/* Name and Email - Side by side on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Subject and Category - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    placeholder="What is this regarding?"
                    className={errors.subject ? "border-red-500" : ""}
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500">{errors.subject}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: ContactFormData["category"]) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Please describe your inquiry in detail..."
                  className={errors.message ? "border-red-500" : ""}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    {errors.message ? (
                      <span className="text-red-500">{errors.message}</span>
                    ) : (
                      `Minimum 10 characters (${formData.message.length}/10)`
                    )}
                  </span>
                  <span>{formData.message.length}/1000</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto min-w-[200px]"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm">
                How long does it take to get a response?
              </h4>
              <p className="text-sm text-gray-600">
                We typically respond within 24 hours during business days.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm">
                Do you offer technical support?
              </h4>
              <p className="text-sm text-gray-600">
                Yes, we provide technical support for all users. Please select
                "Technical Support" as your category.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm">
                Can I request new features?
              </h4>
              <p className="text-sm text-gray-600">
                Absolutely! We love hearing feature requests. Use the "Feature
                Request" category.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
