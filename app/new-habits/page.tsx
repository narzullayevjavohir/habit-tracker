// app/habits/new/page.tsx
"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import CreateHabitForm from "@/components/special-components/create-habit-form";
import { ResponsiveContainer } from "@/components/responsive/responsive-container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateHabitPage() {
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

  if (!isSignedIn) return null;

  const handleSuccess = () => {
    router.refresh(); // Refresh the page data
    router.push("/all-habits");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  return (
    <ResponsiveContainer className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Habit</h1>
          <p className="text-gray-600 text-sm mt-1">
            Set up a new habit to track and improve your daily routine
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/all-habits">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Habits
          </Link>
        </Button>
      </div>

      <CreateHabitForm onSuccess={handleSuccess} />

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 text-sm mb-2">
          💡 Quick Tips
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Start with small, achievable habits</li>
          <li>• Be consistent with your chosen frequency</li>
          <li>• Use descriptive titles for better tracking</li>
        </ul>
      </div>
    </ResponsiveContainer>
  );
}
