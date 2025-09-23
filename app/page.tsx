import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default async function HomePage() {
  const user = await currentUser();

  // If user is not authenticated, show the landing/auth page
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Build Better Habits
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Track your progress, stay motivated, and transform your life with
              consistent daily habits.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">📊</span> Visual Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  See your improvement with beautiful charts and streak
                  tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🔄</span> Smart Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Customizable notifications that help you build consistency.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🎯</span> Proven Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Based on scientific research and successful habit-building
                  strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the dashboard
  const userData = {
    streak: 12,
    todayProgress: { completed: 3, total: 5 },
    recentActivities: [
      {
        habit: "Morning Meditation",
        time: "Today, 7:30 AM",
        status: "completed" as const,
      },
      {
        habit: "Exercise",
        time: "Yesterday, 6:00 PM",
        status: "completed" as const,
      },
      {
        habit: "Reading",
        time: "Yesterday, 9:00 PM",
        status: "missed" as const,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {user.firstName || "Friend"}! 👋
        </h1>
        <p className="text-xl text-gray-600">
          Ready to continue your habit-building journey?
        </p>
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Completed</span>
                  <span>
                    {userData.todayProgress.completed}/
                    {userData.todayProgress.total} habits
                  </span>
                </div>
                <Progress
                  value={
                    (userData.todayProgress.completed /
                      userData.todayProgress.total) *
                    100
                  }
                />
              </div>
              <Button asChild className="w-full">
                <Link href="/habits">Check-in Habits</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {userData.streak}
              </div>
              <p className="text-gray-600">days in a row! 🔥</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/habits/new">Add New Habit</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/stats">View Statistics</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings">Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userData.recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.habit}
                    </p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activity.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {activity.status === "completed"
                      ? "✅ Completed"
                      : "❌ Missed"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
