"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Send, X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface EmbeddableChatWidgetProps {
  agentName?: string;
  agentLogo?: string;
  initialMessage?: string;
  suggestedQuestions?: string[];
  privacyPolicyUrl?: string;
}

export default function EmbeddableChatWidget({
  agentName = "OpenChat AI Agent",
  agentLogo = "oC",
  initialMessage = "👋 Hi! I am OpenChat AI, ask me anything about OpenChat!",
  suggestedQuestions = [
    "What is OpenChat?",
    "How do I add data to my agent?",
    "Is there a free plan?",
  ],
  privacyPolicyUrl = "#",
}: EmbeddableChatWidgetProps) {
  const { agentId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chat with AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    error: chatError,
    status: chatStatus,
  } = useChat({
    api: "/api/public-chat",
    body: {
      agentId: Number(agentId),
      stream: true,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: initialMessage,
      },
      {
        id: "create-agent",
        role: "assistant",
        content:
          "By the way, you can create an agent like me for your website! 🤩",
      },
    ],
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Handle click outside to close the widget
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Widget */}
      <div
        ref={chatContainerRef}
        className={cn(
          "bg-white rounded-lg shadow-lg flex flex-col w-[400px] transition-all duration-300 ease-in-out mb-3",
          "overflow-hidden",
          isOpen ? "h-[600px] opacity-100" : "h-0 opacity-0 pointer-events-none"
        )}
        style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)" }}
      >
        {/* Header */}
        <div className="bg-black text-white p-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {agentLogo}
            </div>
            <span className="font-medium">{agentName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white h-8 w-8 hover:bg-white/20"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white h-8 w-8 hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center font-bold mr-2 flex-shrink-0">
                  {agentLogo}
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {/* Loading animation when status is submitting */}
          {chatStatus === "submitted" && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800">
                <div className="flex space-x-1 items-center">
                  <span
                    className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (
          <div className="p-2 border-t border-gray-200 flex gap-2 overflow-x-auto">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                onClick={() => {
                  handleInputChange({ target: { value: question } } as any);
                  handleChatSubmit(new Event("submit") as any);
                }}
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200">
          <form onSubmit={handleChatSubmit} className="flex gap-2 items-center">
            <Textarea
              placeholder="Message..."
              value={input}
              onChange={handleInputChange}
              className="min-h-[40px] max-h-[120px] resize-none text-sm py-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              className="h-10 w-10 rounded-full p-0 flex items-center justify-center"
              disabled={!input.trim() || chatStatus === "submitted"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-xs text-gray-500 mt-2 text-center">
            By chatting, you agree to our{" "}
            <a
              href={privacyPolicyUrl}
              className="underline hover:text-gray-700"
            >
              privacy policy
            </a>
            .
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg",
          "bg-black hover:bg-gray-800 text-white"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
