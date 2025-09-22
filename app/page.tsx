// app/page.tsx - Generic home page structure
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function HomePage() {
  // Mock data - replace with your actual data source
  const userData = {
    isLoggedIn: false, // Change based on your auth state
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
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Build Better Habits,{" "}
          <span className="text-primary">One Day at a Time</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Track your progress, stay motivated, and transform your life with
          consistent daily habits.
        </p>
        {!userData.isLoggedIn ? (
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/all-habits">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/methods">Learn More</Link>
            </Button>
          </div>
        ) : (
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/habits">View My Habits</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/new-habits">Add New Habit</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Stats Overview - Only show if logged in */}
      {userData.isLoggedIn && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                <div className="text-4xl font-bold text-primary">
                  {userData.streak}
                </div>
                <p className="text-muted-foreground">days in a row! 🔥</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/new-habits">Add New Habit</Link>
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
      )}

      {/* Features Section - Show for all users */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          Why Choose HabitTracker?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">📊</span> Visual Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                See your improvement with beautiful charts and streak tracking
                that motivates you to keep going.
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
                Customizable notifications that help you build consistency
                without feeling overwhelmed.
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
                strategies from experts.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity - Only show if logged in */}
      {userData.isLoggedIn && userData.recentActivities.length > 0 && (
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{activity.habit}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
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
      )}

      {/* CTA Section */}
      {!userData.isLoggedIn && (
        <section className="text-center bg-muted rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Transform Your Habits?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of users building better lives one habit at a time.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">Start Your Journey Today</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
