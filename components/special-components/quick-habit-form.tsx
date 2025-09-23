"use client";

import { useState } from "react";
import { useHabitStore } from "@/store/habit-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const QUICK_ICONS = [
  "💪",
  "🧠",
  "📚",
  "🏃",
  "💤",
  "🥗",
  "💧",
  "🧘",
  "📱",
  "✍️",
];

export default function QuickHabitForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { createHabit, isLoading } = useHabitStore();
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("💪");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createHabit({
      title: title.trim(),
      icon,
      frequency: "daily",
      target_count: 1,
    });

    setTitle("");
    setIcon("💪");
    onSuccess?.();
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="quick-title" className="text-sm">
            Habit Name
          </Label>
          <Input
            id="quick-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter habit name..."
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Quick Icon</Label>
          <div className="grid grid-cols-5 gap-1">
            {QUICK_ICONS.map((ico) => (
              <button
                key={ico}
                type="button"
                onClick={() => setIcon(ico)}
                className={`p-2 text-lg rounded border transition-all ${
                  icon === ico
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                {ico}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="w-full"
        >
          {isLoading ? "Adding..." : "Add Habit"}
        </Button>
      </form>
    </div>
  );
}
