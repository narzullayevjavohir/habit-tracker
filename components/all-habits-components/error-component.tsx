import React from "react";
import { Card, CardContent } from "../ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

type ErrorComponentProps = {
  error: string;
  fetchHabits: () => void;
};

function ErrorComponent({ error, fetchHabits }: ErrorComponentProps) {
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

export default ErrorComponent;
