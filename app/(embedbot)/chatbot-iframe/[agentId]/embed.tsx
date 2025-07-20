"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Send, X, MessageCircle } from "lucide-react";
import { cn, isNewConversationCreated } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChatMessage } from "./chat-message";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { ChatInterfaceFormValues } from "@/lib/validations/chat-interface";


interface EmbeddableChatWidgetProps {
  settings: ChatInterfaceFormValues;
  isCustomizingView?: boolean;
}

// TODO: fix the profile image and icon chat seems to be pixalated
export default function EmbeddableChatWidget({
  settings,
  isCustomizingView = false,
}: EmbeddableChatWidgetProps) {
  const { agentId } = useParams();
  const [isOpen, setIsOpen] = useState(isCustomizingView ? true : false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  // Parse identity data from query param
  let identityData: any = undefined;
  const dataParam = searchParams.get("data");
  if (dataParam) {
    try {
      identityData = JSON.parse(decodeURIComponent(dataParam));
    } catch (e) {
      identityData = undefined;
    }
  }

  // Use settings for initial message(s)
  const initialMessages = settings.initialMessages
    ? settings.initialMessages.split("\n").filter(Boolean).map((msg, i) => ({
      id: `welcome-${i}`,
      role: "assistant" as const,
      content: msg,
    }))
    : [
      {
        id: "welcome",
        role: "assistant" as const,
        content: "👋 Hi! I am your assistant. How can I help you?",
      },
    ];

  // Initialize chat with AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    status: chatStatus,
    data,
  } = useChat({
    api: "/api/public-chat",
    body: {
      agentId: agentId,
      stream: true,
      conversationId,
      ...(identityData ? { identity: identityData } : {}),
    },
    initialMessages,
  });

  useEffect(() => {
    const lastDataItem = data?.[data.length - 1];
    if (lastDataItem && isNewConversationCreated(lastDataItem)) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("conversationId", lastDataItem.conversationId);
      router.push(`?${params.toString()}`);
    }
  }, [data, router, searchParams]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (!isCustomizingView) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isCustomizingView]);

  // Handle click outside to close the widget
  useEffect(() => {
    if (!isCustomizingView) {
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
    }
  }, [isOpen, isCustomizingView]);

  // Theme and color settings
  const headerBg = settings.syncUserMessageColorWithAgentHeader ? settings.userMessageColor : "#34312d"; // Orange as in screenshot
  const chatBubbleButtonColor = settings.chatBubbleButtonColor || "#000000";
  const displayName = settings.displayName || "Generic Resume.pdf";
  const profilePicture = settings.profilePicture;
  const chatBubbleTriggerIcon = settings.chatBubbleTriggerIcon;
  const messagePlaceholder = settings.messagePlaceholder || "Message...";
  const footer = settings.footer || "";
  const suggestedMessages = settings.suggestedMessages || [];

  // Dismissible notice
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const dismissibleNotice = settings.dismissibleNotice;


  return (
    <div className={cn(
      !isCustomizingView ? "fixed bottom-5 right-5 z-50 flex flex-col items-end" : "",
    )}>
      {/* Chat Widget */}
      <div
        ref={chatContainerRef}
        className={cn(
          "rounded-2xl shadow-lg flex flex-col w-[400px] transition-all duration-300 ease-in-out mb-3 border border-gray-200",
          "overflow-hidden",
          isOpen ? "h-[600px] opacity-100" : "h-0 opacity-0 pointer-events-none"
        )}
        style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl px-4 py-3" style={{ background: headerBg }}>
          <div className="flex items-center gap-2">
            <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold overflow-hidden">
              {profilePicture ? (
                typeof profilePicture === "string" ? (
                  <img src={profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <img src={URL.createObjectURL(profilePicture)} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                )
              ) : (
                <span>{displayName?.[0] || "A"}</span>
              )}
            </div>
            <span className="font-medium text-white">{displayName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white h-8 w-8 hover:bg-white/20"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
            </Popover>
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

        {/* Dismissible Notice */}
        {dismissibleNotice && !noticeDismissed && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-xs flex items-center justify-between">
            <span>{dismissibleNotice}</span>
            <button onClick={() => setNoticeDismissed(true)} className="ml-2 text-xs">Dismiss</button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => {
            return (
              <ChatMessage
                key={index}
                parts={message.parts ?? []}
                role={message.role}
                userName={message.role === "user" ? "You" : displayName}
                userColor={settings.userMessageColor ?? "black"}
              />
            );
          })}

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

        {/* Suggested Messages - now just above the input area, horizontal scroll */}
        {suggestedMessages.length > 0 && (messages.length === initialMessages.length) && (
          <div
            className="flex gap-2 mt-2 mb-2 justify-start overflow-x-auto px-3"
            style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
          >
            {suggestedMessages.map((msg, idx) => (
              <button
                key={idx}
                className="px-3 py-1 rounded-full text-xs whitespace-nowrap transition border border-gray-200 hover:opacity-90"
                style={{ background: settings.userMessageColor || '#000', color: '#fff' }}
                onClick={() => handleInputChange({ target: { value: msg.value } } as React.ChangeEvent<HTMLTextAreaElement>)}
                type="button"
                tabIndex={0}
                aria-label={`Use suggested message: ${msg.value}`}
              >
                {msg.value}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200">
          <form onSubmit={handleChatSubmit} className="flex gap-2 items-center">
            <Textarea
              placeholder={messagePlaceholder}
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
              style={{ background: settings.syncUserMessageColorWithAgentHeader ? settings.userMessageColor : "#000", color: "#fff" }}
              disabled={!input.trim() || chatStatus === "submitted"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {footer && (
            <div className="text-xs text-gray-500 mt-2 text-center">
              {footer}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-2 text-center">
            Powered by Chatbase
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg",
          "bg-black hover:bg-gray-800 text-white",
          "self-end mr-2"
        )}
        style={{ background: chatBubbleButtonColor, color: "#fff" }}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          chatBubbleTriggerIcon ? (
            typeof chatBubbleTriggerIcon === "string" ? (
              <img src={chatBubbleTriggerIcon} alt="Chat Icon" className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <img src={URL.createObjectURL(chatBubbleTriggerIcon)} alt="Chat Icon" className="h-6 w-6 rounded-full object-cover" />
            )
          ) : (
            <MessageCircle className="h-6 w-6" />
          )
        )}
      </Button>
    </div>
  );
}
