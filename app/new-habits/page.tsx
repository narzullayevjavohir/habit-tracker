// app/habits/new/page.tsx
"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import CreateHabitForm from "@/components/special-components/create-habit-form";
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
    console.log("Habit created successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Habit</h1>
          <p className="text-gray-600 text-sm mt-1">
            Build a new habit in minutes
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/all-habits">← Back to Habits</Link>
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
    </div>
  );
}
