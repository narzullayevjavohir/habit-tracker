"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Calendar,
  TrendingUp,
  Target,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Habit, HabitEntry, HabitStatus } from "@/types/habit";

export default function AllHabits() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<HabitStatus>("all");
  const [today] = useState(new Date().toISOString().split("T")[0]);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (habitsError) throw habitsError;

      // Initialize habits with empty habit_entries array
      const habitsWithEntries = habitsData.map((habit) => ({
        ...habit,
        habit_entries: [],
      }));

      // Set the habits
      setHabits(habitsWithEntries);
    } catch (err) {
      console.error("Error fetching habits:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load habits. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      fetchHabits();
    }
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading your habits...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center pt-6">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Habits</h3>
            <p className="text-sm text-gray-500 text-center mb-4">{error}</p>
            <Button onClick={() => fetchHabits()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredHabits = habits.filter((habit: Habit) => {
    const matchesSearch =
      habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (habit.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "active"
        ? habit.is_active
        : activeTab === "archived"
        ? !habit.is_active
        : true;

    return matchesSearch && matchesTab;
  });

  const activeHabitsCount = habits.filter((h: Habit) => h.is_active).length;
  const completedTodayCount = habits.filter((habit: Habit) =>
    habit.habit_entries.some((e) => e.entry_date === today && e.completed)
  ).length;

  const handleTabChange = (value: string) => {
    setActiveTab(value as HabitStatus);
  };

  const handleToggleEntry = async (habitId: string) => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const habit = habits.find((h) => h.id === habitId);
      if (!habit) {
        throw new Error("Habit not found");
      }

      // Optimistically update the UI
      const updatedHabits = habits.map((h) => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          last_completed: today,
          total_completions: (h.total_completions || 0) + 1,
        };
      });

      setHabits(updatedHabits);

      // Update the habit in the database
      const { error: updateError } = await supabase
        .from("habits")
        .update({
          last_completed: today,
          total_completions: (habit.total_completions || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", habitId);

      if (updateError) throw updateError;

      // Refresh habits to get the real server state
      await fetchHabits();
    } catch (err) {
      console.error("Error toggling habit entry:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update habit. Please try again."
      );
      // Revert optimistic update on error
      await fetchHabits();
    }
  };

  const getCompletionRate = (habit: Habit) => {
    const totalEntries = habit.habit_entries.length;
    const completedEntries = habit.habit_entries.filter(
      (entry: HabitEntry) => entry.completed
    ).length;
    return totalEntries > 0
      ? Math.round((completedEntries / totalEntries) * 100)
      : 0;
  };

  const getStreak = (habit: Habit) => {
    const completedEntries = habit.habit_entries
      .filter((entry: HabitEntry) => entry.completed)
      .sort(
        (a: HabitEntry, b: HabitEntry) =>
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );

    if (completedEntries.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();

    for (const entry of completedEntries) {
      const entryDate = new Date(entry.entry_date);
      const diffTime = currentDate.getTime() - entryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1 || (streak === 0 && diffDays === 0)) {
        streak++;
        currentDate = entryDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Habits</h1>
          <p className="text-gray-600 mt-1">
            Track your progress and build lasting habits
          </p>
        </div>
        <Button
          asChild
          className="bg-blue-600 hover:bg-blue-700 transition-colors shrink-0"
        >
          <Link href="/new-habits">
            <Plus className="w-4 h-4 mr-2" />
            Create New Habit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <Target className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{habits.length}</p>
              <p className="text-sm text-gray-600">Total Habits</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{activeHabitsCount}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <Calendar className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{completedTodayCount}</p>
              <p className="text-sm text-gray-600">Completed Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={
                typeof setActiveTab === "string"
                  ? setActiveTab
                  : handleTabChange
              }
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Today</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredHabits.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            {searchTerm ? (
              <>
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No habits found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search term or viewing a different category
                </p>
                {activeTab !== "all" && (
                  <Button variant="outline" onClick={() => setActiveTab("all")}>
                    View All Habits
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Start Building Habits
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first habit and begin tracking your progress
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/new-habits">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Habit
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map((habit) => {
            const todayEntry = habit.habit_entries.find(
              (e: any) => e.entry_date === today
            );
            const isCompleted = todayEntry?.completed || false;
            const completionRate = getCompletionRate(habit);
            const streak = getStreak(habit);

            return (
              <Card
                key={habit.id}
                className={`transition-all hover:shadow-md ${
                  !habit.is_active ? "opacity-60" : ""
                } ${isCompleted ? "border-green-200 bg-green-50" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className="text-2xl p-2 rounded-full"
                        style={{ backgroundColor: habit.color + "20" }}
                      >
                        {habit.icon}
                      </span>
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          {habit.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {habit.target_count} time
                          {habit.target_count > 1 ? "s" : ""} {habit.frequency}
                        </CardDescription>
                      </div>
                    </div>
                    {!habit.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  {habit.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {habit.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>🔥 {streak} day streak</span>
                    <span>{completionRate}% success</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${completionRate}%`,
                        backgroundColor: habit.color,
                      }}
                    ></div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleToggleEntry(habit.id)}
                    variant={isCompleted ? "default" : "outline"}
                    disabled={!habit.is_active}
                    className="w-full"
                    style={isCompleted ? { backgroundColor: habit.color } : {}}
                  >
                    {isCompleted ? (
                      <>
                        <span>✅ Completed</span>
                      </>
                    ) : (
                      <>
                        <span>Mark as Done</span>
                      </>
                    )}
                  </Button>

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`/habits/${habit.id}`}>View</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`/habits/${habit.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
