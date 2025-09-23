"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ContactForm from "@/components/special-components/contact-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle, Heart } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <MessageCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Have questions, feedback, or need support? We're here to help you on
          your habit-building journey.
        </p>
      </div>

      {/* Main Content */}
      <ContactForm />

      {/* Additional Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">
              Get detailed help with specific issues via email
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="mailto:support@habittracker.com">
                support@habittracker.com
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">
              Get instant help during business hours
            </p>
            <Button asChild variant="outline" size="sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Live chat coming soon!");
                }}
              >
                Start Chat
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Community</h3>
            <p className="text-gray-600 mb-4">
              Join our community for tips and support
            </p>
            <Button asChild variant="outline" size="sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Community forum coming soon!");
                }}
              >
                Join Community
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Back to Dashboard */}
      <div className="text-center mt-8">
        <Button asChild variant="ghost">
          <Link href="/">← Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
