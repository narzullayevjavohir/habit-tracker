"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Target,
  TrendingUp,
  Edit2,
  Archive,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Habit, HabitEntry } from "@/types/habit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchHabit = async () => {
    try {
      const { data: habitData, error: habitError } = await supabase
        .from("habits")
        .select(
          `
          *,
          habit_entries (*)
        `
        )
        .eq("id", params.id)
        .eq("user_id", user?.id)
        .single();

      if (habitError) throw habitError;
      setHabit(habitData);
    } catch (err) {
      console.error("Error fetching habit:", err);
      setError("Failed to load habit details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!habit) return;
    setIsUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from("habits")
        .update({ is_active: !habit.is_active })
        .eq("id", habit.id);

      if (updateError) throw updateError;
      await fetchHabit();
    } catch (err) {
      console.error("Error updating habit status:", err);
      setError("Failed to update habit status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!habit) return;
    setIsUpdating(true);
    try {
      // Delete all related habit entries first
      const { error: entriesError } = await supabase
        .from("habit_entries")
        .delete()
        .eq("habit_id", habit.id);

      if (entriesError) throw entriesError;

      // Then delete the habit
      const { error: habitError } = await supabase
        .from("habits")
        .delete()
        .eq("id", habit.id);

      if (habitError) throw habitError;

      router.push("/all-habits");
      router.refresh();
    } catch (err) {
      console.error("Error deleting habit:", err);
      setError("Failed to delete habit. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      fetchHabit();
    }
  }, [isLoaded, isSignedIn, user?.id, params.id]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !habit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {error || "Habit Not Found"}
            </h3>
            <p className="text-gray-600 mb-4">
              The habit you're looking for might have been deleted or you don't
              have permission to view it.
            </p>
            <Button asChild>
              <Link href="/all-habits">Back to Habits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/all-habits">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Habits
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActive}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : habit.is_active ? (
              <Archive className="w-4 h-4 mr-2" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-2" />
            )}
            {habit.is_active ? "Archive" : "Reactivate"}
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/all-habits/${habit.id}/edit`}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isUpdating}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span
              className="text-3xl p-3 rounded-full"
              style={{ backgroundColor: habit.color + "20" }}
            >
              {habit.icon}
            </span>
            <div>
              <CardTitle className="text-2xl">{habit.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">
                  {habit.target_count}x {habit.frequency}
                </Badge>
                {!habit.is_active && (
                  <Badge
                    variant="outline"
                    className="text-yellow-600 bg-yellow-50"
                  >
                    Archived
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {habit.description && (
            <p className="text-gray-600">{habit.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Target className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold">{habit.habit_entries.length}</p>
              <p className="text-sm text-gray-600">Total Entries</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold">
                {
                  habit.habit_entries.filter(
                    (entry: HabitEntry) => entry.completed
                  ).length
                }
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto text-purple-500 mb-1" />
              <p className="text-2xl font-bold">
                {habit.habit_entries.length > 0
                  ? Math.round(
                      (habit.habit_entries.filter(
                        (entry: HabitEntry) => entry.completed
                      ).length /
                        habit.habit_entries.length) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="font-semibold mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {habit.habit_entries
                .sort(
                  (a: HabitEntry, b: HabitEntry) =>
                    new Date(b.entry_date).getTime() -
                    new Date(a.entry_date).getTime()
                )
                .slice(0, 5)
                .map((entry: HabitEntry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span>
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </span>
                    <Badge variant={entry.completed ? "default" : "outline"}>
                      {entry.completed ? "Completed" : "Missed"}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the habit and all its history. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Habit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
