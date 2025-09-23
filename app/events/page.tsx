"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCommunityStore } from "@/store/community-store";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  MessageSquare,
  Users,
  Video,
  Plus,
  Clock,
  MapPin,
  User,
  Send,
  Calendar as CalendarIcon,
  MessageCircle,
} from "lucide-react";

export default function CommunityPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const {
    events,
    chatRooms,
    currentRoom,
    roomMessages,
    isLoading,
    error,
    fetchEvents,
    fetchChatRooms,
    fetchRoomMessages,
    joinEvent,
    leaveEvent,
    sendMessage,
    joinRoom,
    subscribeToMessages,
    subscribeToEvents,
    setCurrentRoom,
    clearError,
  } = useCommunityStore();

  const [activeTab, setActiveTab] = useState("events");
  const [newMessage, setNewMessage] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("all");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchEvents();
      fetchChatRooms();
      const unsubscribeEvents = subscribeToEvents();

      return () => {
        unsubscribeEvents();
      };
    }
  }, [isLoaded, isSignedIn, fetchEvents, fetchChatRooms, subscribeToEvents]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (currentRoom) {
      fetchRoomMessages(currentRoom.id);
      const unsubscribe = subscribeToMessages(currentRoom.id);

      return unsubscribe;
    }
  }, [currentRoom, fetchRoomMessages, subscribeToMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom) return;

    await sendMessage(currentRoom.id, newMessage.trim());
    setNewMessage("");
  };

  const handleJoinRoom = async (room: any) => {
    await joinRoom(room.id);
    setCurrentRoom(room);
  };

  const filteredEvents = events.filter(
    (event) =>
      selectedEventType === "all" || event.event_type === selectedEventType
  );

  const eventTypes = [
    { id: "all", name: "All Events", icon: "📅" },
    { id: "webinar", name: "Webinars", icon: "💻" },
    { id: "workshop", name: "Workshops", icon: "🛠️" },
    { id: "challenge", name: "Challenges", icon: "🏆" },
    { id: "meetup", name: "Meetups", icon: "👥" },
    { id: "qna", name: "Q&A Sessions", icon: "❓" },
  ];

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "webinar":
        return "💻";
      case "workshop":
        return "🛠️";
      case "challenge":
        return "🏆";
      case "meetup":
        return "👥";
      case "qna":
        return "❓";
      default:
        return "📅";
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Community</h1>
        <p className="text-xl text-gray-600">
          Connect, learn, and grow with fellow habit builders
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={clearError}
            className="ml-auto"
          >
            Dismiss
          </Button>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Group Chat
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Meetings
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          {/* Event Type Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {eventTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedEventType === type.id ? "default" : "outline"}
                onClick={() => setSelectedEventType(type.id)}
                className="flex items-center gap-2"
              >
                <span>{type.icon}</span>
                {type.name}
              </Button>
            ))}
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No events scheduled
                </h3>
                <p className="text-gray-600 mb-4">
                  Check back later for upcoming community events
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Suggest an Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">
                        {getEventIcon(event.event_type)}
                      </span>
                      <Badge variant="secondary" className="capitalize">
                        {event.event_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(event.start_time).toLocaleString()}
                    </div>

                    {event.is_online ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <Video className="w-4 h-4 mr-2" />
                        Online Event
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      Hosted by {event.host?.first_name} {event.host?.last_name}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        👥 {event.participants_count} participants
                      </Badge>

                      {event.is_joined ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => leaveEvent(event.id)}
                        >
                          Leave Event
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => joinEvent(event.id)}>
                          Join Event
                        </Button>
                      )}
                    </div>

                    {event.meeting_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={event.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Meeting
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Chat Rooms List */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat Rooms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {chatRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleJoinRoom(room)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        currentRoom?.id === room.id
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">{room.name}</div>
                      <div className="text-sm text-gray-600 truncate">
                        {room.last_message?.content || "No messages yet"}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>👥 {room.member_count}</span>
                        {room.last_message && (
                          <span>
                            {new Date(
                              room.last_message.created_at
                            ).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-3 flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">
                    {currentRoom ? currentRoom.name : "Select a Chat Room"}
                  </CardTitle>
                  <CardDescription>
                    {currentRoom?.description ||
                      "Choose a room to start chatting"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden flex flex-col">
                  {currentRoom ? (
                    <>
                      {/* Messages Container */}
                      <div className="flex-1 overflow-y-auto space-y-4 p-4">
                        {roomMessages.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          roomMessages.map((message) => (
                            <div key={message.id} className="flex space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium">
                                    {message.user?.first_name}{" "}
                                    {message.user?.last_name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      message.created_at
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-gray-800">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Message Input */}
                      <form
                        onSubmit={handleSendMessage}
                        className="border-t pt-4"
                      >
                        <div className="flex space-x-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1"
                          />
                          <Button type="submit" disabled={!newMessage.trim()}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Select a chat room to start messaging</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Meetings & Conferences</CardTitle>
              <CardDescription>
                Join live video sessions with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Meetings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Upcoming Meetings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {events
                        .filter(
                          (e) =>
                            e.event_type === "webinar" ||
                            e.event_type === "workshop"
                        )
                        .slice(0, 3)
                        .map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-sm text-gray-600">
                                {new Date(event.start_time).toLocaleString()}
                              </div>
                            </div>
                            <Button size="sm" asChild>
                              <a
                                href={event.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Join
                              </a>
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Meeting */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Start Quick Meeting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" size="lg">
                      <Video className="w-4 h-4 mr-2" />
                      Start Instant Meeting
                    </Button>
                    <div className="text-sm text-gray-600">
                      Start a quick video call with your accountability partners
                      or create a public meeting.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
