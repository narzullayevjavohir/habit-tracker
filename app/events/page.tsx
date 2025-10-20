"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MessageSquare, Calendar, Users } from "lucide-react";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [search, setSearch] = useState("");

  const events = [
    {
      id: 1,
      title: "Frontend Meetup",
      description: "Discuss React and UI trends",
      location: "Tashkent",
      date: "2025-10-20",
    },
    {
      id: 2,
      title: "Design Sprint",
      description: "Collaborate with designers",
      location: "Online",
      date: "2025-10-25",
    },
    {
      id: 3,
      title: "Hackathon",
      description: "24-hour coding challenge",
      location: "TUIT Campus",
      date: "2025-11-01",
    },
  ];

  const chats = [
    { id: 1, name: "Frontend Developers", unread: 3 },
    { id: 2, name: "UI/UX Designers", unread: 0 },
    { id: 3, name: "Startup Founders", unread: 1 },
  ];

  const meetings = [
    {
      id: 1,
      topic: "Weekly Standup",
      time: "Mon, 10:00 AM",
      platform: "Google Meet",
    },
    { id: 2, topic: "UI Review", time: "Wed, 5:00 PM", platform: "Zoom" },
    {
      id: 3,
      topic: "Project Demo",
      time: "Fri, 2:00 PM",
      platform: "Microsoft Teams",
    },
  ];

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Community</h1>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Suggest an Event
        </Button>
      </div>

      <Tabs
        defaultValue="events"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Meetings
          </TabsTrigger>
        </TabsList>

        {/* EVENTS TAB */}
        <TabsContent value="events" className="pt-6">
          <div className="max-w-sm mb-4">
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">
                    {event.description}
                  </p>
                  <p className="text-sm font-medium">
                    📍 {event.location} • 🗓 {event.date}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* CHAT TAB */}
        <TabsContent value="chat" className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chats.map((chat) => (
              <Card key={chat.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {chat.name}
                    {chat.unread > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {chat.unread} unread
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Open Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* MEETINGS TAB */}
        <TabsContent value="meetings" className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardHeader>
                  <CardTitle>{meeting.topic}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">🕒 {meeting.time}</p>
                  <p className="text-sm text-gray-600">💻 {meeting.platform}</p>
                  <Button variant="outline" className="w-full">
                    Join Meeting
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
