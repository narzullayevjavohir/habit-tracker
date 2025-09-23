"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useHabitStore } from "@/store/habit-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Calendar, Target, TrendingUp } from "lucide-react";

export default function HabitDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { currentHabit, isLoading, error, fetchHabit } = useHabitStore();

  useEffect(() => {
    if (isLoaded && isSignedIn && id) {
      fetchHabit(id as string);
    }
  }, [isLoaded, isSignedIn, id, fetchHabit]);

  if (!isLoaded || isLoading) {
    return (
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mt-8"></div>
    );
  }

  if (error || !currentHabit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold mb-2">Habit Not Found</h3>
            <Button asChild>
              <Link href="/habits">Back to Habits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/habits">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Habits
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span
              className="text-3xl p-3 rounded-full"
              style={{ backgroundColor: currentHabit.color + "20" }}
            >
              {currentHabit.icon}
            </span>
            <div>
              <CardTitle className="text-2xl">{currentHabit.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">
                  {currentHabit.target_count}x {currentHabit.frequency}
                </Badge>
                {!currentHabit.is_active && (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {currentHabit.description && (
            <p className="text-gray-600">{currentHabit.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Target className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold">
                {currentHabit.habit_entries.length}
              </p>
              <p className="text-sm text-gray-600">Total Entries</p>
            </div>

            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold">
                {currentHabit.habit_entries.filter((e) => e.completed).length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>

            <div className="text-center">
              <Calendar className="w-6 h-6 mx-auto text-purple-500 mb-1" />
              <p className="text-2xl font-bold">
                {Math.round(
                  (currentHabit.habit_entries.filter((e) => e.completed)
                    .length /
                    currentHabit.habit_entries.length) *
                    100
                ) || 0}
                %
              </p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="font-semibold mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {currentHabit.habit_entries
                .sort(
                  (a, b) =>
                    new Date(b.entry_date).getTime() -
                    new Date(a.entry_date).getTime()
                )
                .slice(0, 5)
                .map((entry) => (
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
    </div>
  );
}
