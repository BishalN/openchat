"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  score?: number;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
}

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<"chat-logs" | "leads">(
    "chat-logs"
  );

  const chatSessions: ChatSession[] = [
    {
      id: "1",
      title: "Bishal Neupane is a Full Stack Engineer",
      timestamp: "Just now",
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "Hi! What can I help you with?",
        },
        { id: "2", role: "user", content: "hello" },
        {
          id: "3",
          role: "assistant",
          content: "Hello! How can I assist you today?",
          score: 0.552,
        },
        { id: "4", role: "user", content: "is bishal idiot" },
        {
          id: "5",
          role: "assistant",
          content:
            "It seems like you might be expressing a playful sentiment. If you have any specific questions or topics you'd like to discuss about Bishal or anything else, feel free to share! I'm here to help.",
          score: 0.897,
        },
        { id: "6", role: "user", content: "who is bishal" },
        {
          id: "7",
          role: "assistant",
          content:
            "Bishal Neupane is a Full Stack Engineer specializing in the JavaScript ecosystem. He has experience in developing applications using technologies like TypeScript, React, Next.js, and more. He has worked on various projects and has expertise in web development.",
        },
      ],
    },
  ];

  // TODO: Will enable this when the feature is ready
  if (true) {
    return <div>Coming soon</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Activity</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left sidebar */}
        <div className="space-y-1">
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left ${
              activeTab === "chat-logs"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("chat-logs")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M8 9H16M8 13H14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Chat Logs
          </button>

          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left ${
              activeTab === "leads"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("leads")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-muted-foreground"
            >
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Leads
          </button>
        </div>

        {/* Main content */}
        <div className="border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chat logs</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6H21M7 6V4M17 6V4M3 10H21M3 14H21M3 18H21M3 22H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Filter
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {chatSessions.map((session) => (
            <div key={session.id} className="border-b">
              <div className="p-4 flex items-center justify-between hover:bg-muted/20">
                <div>
                  <div className="font-medium">{session.title}</div>
                  <div className="text-sm text-muted-foreground">
                    who is bishal
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {session.timestamp}
                  </div>
                  <div className="text-sm">Source: Playground</div>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {session.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[80%]">
                      {message.role === "user" ? (
                        <div className="bg-black text-white dark:bg-white dark:text-black rounded-lg px-4 py-2 mb-1">
                          {message.content}
                        </div>
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 mb-1">
                          {message.content}
                        </div>
                      )}

                      {message.score && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          >
                            {message.score}
                          </Badge>
                          <button className="text-xs text-muted-foreground hover:text-foreground">
                            Revise answer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
