"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoMeetingProps {
  meetingUrl: string;
  meetingTitle: string;
}

export default function VideoMeeting({
  meetingUrl,
  meetingTitle,
}: VideoMeetingProps) {
  const callFrameRef = useRef<any>(null);

  const startMeeting = async () => {
    if (typeof window !== "undefined") {
      const { DailyIframe } = await import("@daily-co/daily-js");

      callFrameRef.current = DailyIframe.createFrame({
        url: meetingUrl,
        iframeStyle: {
          width: "100%",
          height: "500px",
          border: "none",
          borderRadius: "8px",
        },
        showLeaveButton: true,
      });

      callFrameRef.current.join();
    }
  };

  const leaveMeeting = () => {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    }
  };

  useEffect(() => {
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.leave();
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meetingTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div id="daily-meeting-container"></div>
        <div className="flex space-x-2">
          <Button onClick={startMeeting}>Join Meeting</Button>
          <Button variant="outline" onClick={leaveMeeting}>
            Leave Meeting
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
