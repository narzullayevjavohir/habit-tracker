import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { Habit } from "@/types/habit";

type HabitCardProps = {
  habit: Habit;
  streak: number;
  completionRate: number;
  isCompleted: boolean;
  handleToggleEntry: (habitId: string) => void;
};

function HabitCard({
  habit,
  streak,
  completionRate,
  isCompleted,
  handleToggleEntry,
}: HabitCardProps) {
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
            className="flex-1 hover:bg-gray-400 hover:text-white"
          >
            <Link href={`/habits/${habit.id}`}>View</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="flex-1 hover:bg-yellow-400 hover:text-white"
          >
            <Link href={`/habits/${habit.id}/edit`}>Edit</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="flex-1 hover:bg-red-400 hover:text-white"
          >
            <Link href={`/habits/${habit.id}/delete`}>Delete</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default HabitCard;
