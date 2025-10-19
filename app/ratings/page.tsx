"use client";

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
  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Achievements & Ratings
        </h1>
        <p className="text-gray-600 text-lg">
          Track your progress and see how you compare to others
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Level Info */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div>
                    <div className="text-4xl font-bold text-blue-600">
                      Level 5
                    </div>
                    <div className="text-gray-600">Current Level</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900">
                      1,250
                    </div>
                    <div className="text-gray-600">Total Points</div>
                  </div>
                </div>

                <Progress value={65} className="h-3 mb-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>65 points</span>
                  <span>100 points to next level</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-gray-600">Habits Created</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">78</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">8</div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                  >
                    <span className="text-3xl">🏆</span>
                    <div className="flex-1">
                      <div className="font-semibold">Fast Learner</div>
                      <div className="text-sm text-gray-600">
                        Completed 5 habits in a week
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1 mt-1">
                        <Crown className="w-4 h-4" />
                        Legendary
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">+100</div>
                      <div className="text-xs text-gray-500">Oct 10, 2025</div>
                    </div>
                  </div>
                ))}
              </div>
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
              <CardDescription>8 of 20 achievements unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border-2 border-green-200 bg-green-50"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">💎</span>
                      <div className="flex-1">
                        <div className="font-semibold">
                          Master Habit Builder
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                          <Gem className="w-4 h-4" />
                          Rare
                        </Badge>
                      </div>
                      <Badge
                        variant="default"
                        className="bg-green-500 text-white"
                      >
                        Unlocked
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Build 30 consistent habits
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Requirement: 30 habits</span>
                      <span className="font-bold text-yellow-600">
                        +200 pts
                      </span>
                    </div>
                  </div>
                ))}
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
              <CardDescription>Top users by points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div
                    key={rank}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      rank === 1
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
                        : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        rank === 1
                          ? "bg-yellow-400 text-white"
                          : rank === 2
                          ? "bg-gray-400 text-white"
                          : rank === 3
                          ? "bg-orange-400 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {rank}
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold">User {rank}</div>
                      <div className="text-sm text-gray-600">
                        user{rank}@mail.com
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {1500 - rank * 100} pts
                      </div>
                      <div className="text-sm text-gray-600">
                        Level {10 - rank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
