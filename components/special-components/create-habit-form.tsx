"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

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
const QUICK_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#EC4899",
  "#6366F1",
];

interface HabitFormData {
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  target_count: number;
  color: string;
  icon: string;
}

interface CreateHabitFormProps {
  onSuccess?: () => void;
}

export default function CreateHabitForm({ onSuccess }: CreateHabitFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<HabitFormData>({
    title: "",
    description: "",
    frequency: "daily",
    target_count: 1,
    color: "#3B82F6",
    icon: "💪",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Habit title is required";
    } else if (formData.title.length > 50) {
      newErrors.title = "Title must be less than 50 characters";
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (!user?.id) {
      setError("You must be logged in to create a habit");
      return;
    }

    setIsLoading(true);
    try {
      // Create the habit in Supabase
      const { data, error: supabaseError } = await supabase
        .from("habits")
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            frequency: formData.frequency,
            target_count: formData.target_count,
            color: formData.color,
            icon: formData.icon,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            active: true,
            current_streak: 0,
            best_streak: 0,
            total_completions: 0,
          },
        ])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setFormData({
        title: "",
        description: "",
        frequency: "daily",
        target_count: 1,
        color: "#3B82F6",
        icon: "💪",
      });
      setErrors({});

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh(); // Refresh the page data
        router.push("/all-habits");
      }
    } catch (error) {
      console.error("Failed to create habit:", error);
      setError("Failed to create habit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="pt-14 h-screen">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Create New Habit</CardTitle>
          <CardDescription>
            Quickly set up a new habit with this compact form
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Main Horizontal Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                {/* Title & Description */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Habit Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Morning Meditation"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your habit..."
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={2}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formData.description?.length || 0}/200</span>
                      {errors.description && (
                        <span className="text-red-500">
                          {errors.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Frequency & Target Count - Side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value: "daily" | "weekly" | "monthly") =>
                        handleInputChange("frequency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_count">Target Count</Label>
                    <Select
                      value={formData.target_count.toString()}
                      onValueChange={(value) =>
                        handleInputChange("target_count", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} time{num > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Right Column - Visual Customization */}
              <div className="space-y-6">
                {/* Icon Selection */}
                <div className="space-y-3">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {QUICK_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleInputChange("icon", icon)}
                        className={`p-2 text-xl rounded border transition-all ${
                          formData.icon === icon
                            ? "border-blue-500 bg-blue-50 scale-110"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <Label>Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {QUICK_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleInputChange("color", color)}
                        className={`p-3 rounded border-2 transition-all ${
                          formData.color === color
                            ? "border-gray-800 scale-110"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {formData.color === color && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <Label className="text-sm text-gray-600 mb-2 block">
                    Preview
                  </Label>
                  <div className="flex items-center space-x-3">
                    <span
                      className="text-xl p-2 rounded-full"
                      style={{ backgroundColor: formData.color + "20" }}
                    >
                      {formData.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">
                        {formData.title || "New Habit"}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">
                        {formData.target_count} time
                        {formData.target_count > 1 ? "s" : ""}{" "}
                        {formData.frequency}
                        {formData.description && ` • ${formData.description}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Habit"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
