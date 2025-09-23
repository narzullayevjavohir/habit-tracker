// app/habits/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useHabitStore } from "@/store/habit-store";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Calendar, TrendingUp, Target } from "lucide-react";
import Link from "next/link";

export default function AllHabits() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { habits, isLoading, error, fetchHabits, toggleHabitEntry } =
    useHabitStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [today] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchHabits();
    }
  }, [isLoaded, isSignedIn, fetchHabits]);

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

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch =
      habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      habit.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "active"
        ? habit.is_active
        : activeTab === "completed"
        ? habit.habit_entries.some((e) => e.entry_date === today && e.completed)
        : true;

    return matchesSearch && matchesTab;
  });

  const activeHabitsCount = habits.filter((h) => h.is_active).length;
  const completedTodayCount = habits.filter((habit) =>
    habit.habit_entries.some((e) => e.entry_date === today && e.completed)
  ).length;

  const handleToggleEntry = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const todayEntry = habit.habit_entries.find(
      (entry) => entry.entry_date === today
    );
    const currentlyCompleted = todayEntry?.completed || false;

    await toggleHabitEntry({
      habitId,
      date: today,
      completed: !currentlyCompleted,
    });
  };

  const getCompletionRate = (habit: any) => {
    const totalEntries = habit.habit_entries.length;
    const completedEntries = habit.habit_entries.filter(
      (e: any) => e.completed
    ).length;
    return totalEntries > 0
      ? Math.round((completedEntries / totalEntries) * 100)
      : 0;
  };

  const getStreak = (habit: any) => {
    const completedEntries = habit.habit_entries
      .filter((e: any) => e.completed)
      .sort(
        (a: any, b: any) =>
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Habits</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchHabits()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-600 mt-1">
            Track your progress and build consistency
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/habits/new">
            <Plus className="w-4 h-4 mr-2" />
            New Habit
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
              onValueChange={setActiveTab}
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
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? "No habits found" : "No habits yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start building your first habit to see it here"}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/habits/new">Create Your First Habit</Link>
              </Button>
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
