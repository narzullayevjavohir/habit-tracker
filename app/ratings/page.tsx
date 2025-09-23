"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useRatingsStore } from "@/store/ratings-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  TrendingUp,
  Users,
  Award,
  Zap,
  Target,
  Crown,
  Gem,
  Sparkles,
} from "lucide-react";

export default function RatingsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const {
    userLevel,
    achievements,
    userAchievements,
    leaderboard,
    isLoading,
    fetchUserLevel,
    fetchAchievements,
    fetchUserAchievements,
    fetchLeaderboard,
    calculateLevel,
  } = useRatingsStore();

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserLevel();
      fetchAchievements();
      fetchUserAchievements();
      fetchLeaderboard();
    }
  }, [
    isLoaded,
    isSignedIn,
    fetchUserLevel,
    fetchAchievements,
    fetchUserAchievements,
    fetchLeaderboard,
  ]);

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

  const levelInfo = userLevel
    ? calculateLevel(userLevel.points)
    : { level: 1, current: 0, next: 100 };
  const progressPercentage = userLevel
    ? (levelInfo.current / levelInfo.next) * 100
    : 0;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800";
      case "rare":
        return "bg-blue-100 text-blue-800";
      case "epic":
        return "bg-purple-100 text-purple-800";
      case "legendary":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return <Star className="w-4 h-4" />;
      case "rare":
        return <Gem className="w-4 h-4" />;
      case "epic":
        return <Zap className="w-4 h-4" />;
      case "legendary":
        return <Crown className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Achievements & Ratings
        </h1>
        <p className="text-gray-600">
          Track your progress and compete with other users
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* User Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Level Progress */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      Level {levelInfo.level}
                    </div>
                    <div className="text-gray-600">Current Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {userLevel?.points || 0}
                    </div>
                    <div className="text-gray-600">Total Points</div>
                  </div>
                </div>

                <Progress value={progressPercentage} className="h-3 mb-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{levelInfo.current} points</span>
                  <span>{levelInfo.next} points to next level</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {userLevel?.total_habits_created || 0}
                  </div>
                  <div className="text-sm text-gray-600">Habits Created</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {userLevel?.total_habits_completed || 0}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {userLevel?.current_streak || 0}
                  </div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {userAchievements.length}
                  </div>
                  <div className="text-sm text-gray-600">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-500" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Your latest unlocked achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userAchievements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    No achievements yet. Keep building habits to unlock
                    achievements!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userAchievements.slice(0, 4).map((userAchievement) => (
                    <div
                      key={userAchievement.id}
                      className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                    >
                      <span className="text-3xl">
                        {userAchievement.achievement.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold">
                          {userAchievement.achievement.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {userAchievement.achievement.description}
                        </div>
                        <Badge
                          className={`mt-1 ${getRarityColor(
                            userAchievement.achievement.rarity
                          )}`}
                        >
                          {getRarityIcon(userAchievement.achievement.rarity)}
                          <span className="ml-1">
                            {userAchievement.achievement.rarity}
                          </span>
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          +{userAchievement.achievement.points_reward}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(
                            userAchievement.earned_at
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-500" />
                All Achievements
              </CardTitle>
              <CardDescription>
                {userAchievements.length} of {achievements.length} achievements
                unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                  const isUnlocked = userAchievements.some(
                    (ua) => ua.achievement_id === achievement.id
                  );

                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isUnlocked
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-gray-50 opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold">
                            {achievement.name}
                          </div>
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {getRarityIcon(achievement.rarity)}
                            <span className="ml-1">{achievement.rarity}</span>
                          </Badge>
                        </div>
                        {isUnlocked && (
                          <Badge variant="default" className="bg-green-500">
                            Unlocked
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        {achievement.description}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Requirement: {achievement.requirement_value}{" "}
                          {achievement.requirement_type}
                        </span>
                        <span className="font-bold text-yellow-600">
                          +{achievement.points_reward} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>Top users by points and streaks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((user, index) => {
                    const isCurrentUser = userLevel?.user_id === user.user_id;

                    return (
                      <div
                        key={user.user_id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          isCurrentUser
                            ? "border-blue-300 bg-blue-50 shadow-sm"
                            : "border-gray-200"
                        } ${
                          index < 3
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                            : ""
                        }`}
                      >
                        {/* Rank */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? "bg-yellow-400 text-white"
                              : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                              ? "bg-orange-400 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">
                              {user.first_name || "Anonymous"}{" "}
                              {user.last_name || "User"}
                            </div>
                            {isCurrentUser && (
                              <Badge variant="default" className="bg-blue-500">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.email}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {user.points} pts
                          </div>
                          <div className="text-sm text-gray-600">
                            Level {user.level} • 🔥 {user.current_streak}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
