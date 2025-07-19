"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Send, Loader2 } from "lucide-react";
import { updateAgentConfig } from "./actions";
import { useAction } from "next-safe-action/hooks";
import { useAgentQuery } from "@/hooks/use-agent/use-agent-query";
import {
  agentConfigActionSchema,
  DEFAULT_AGENT_CONFIG,
} from "@/lib/schemas/agent-config";
import { ChatMessage } from "./chat-message";
import { isNewConversationCreated } from "@/lib/utils";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { toast } from "sonner";

// Form schema derived from the server action schema
const formSchema = agentConfigActionSchema.omit({ agentId: true });
type FormValues = z.infer<typeof formSchema>;

export default function PlaygroundPage() {
  const { agentId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { agent, initialConfig } = useAgentQuery(agentId as string);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      config: DEFAULT_AGENT_CONFIG,
    },
  });

  // Update form when initialConfig is loaded
  useEffect(() => {
    if (agent && initialConfig) {
      reset({ config: initialConfig }, { keepDirty: false });
    }
  }, [agent, initialConfig, reset]);

  // Setup the update action with loading/error states
  const { execute, status } = useAction(updateAgentConfig, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Agent configuration saved successfully");
        if (data.data) {
          reset({ config: data.data.config }, { keepDirty: false });
        }
      } else {
        toast.error(data?.error || "Failed to save agent configuration");
      }
    },
    onError: (error) => {
      toast.error(
        error.error.serverError || error.error.bindArgsValidationErrors
      );
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    execute({
      agentId: agentId as string,
      config: data.config,
    });
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  // Chat integration with Vercel AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    error: chatError,
    status: chatStatus,
    data,
  } = useChat({
    api: "/api/chat",
    body: {
      agentId: agentId,
      conversationId,
    },
    initialMessages: [
      {
        id: "1",
        role: "system",
        content: "Hello, how can i help you?",
      },
    ],
  });
  useEffect(() => {
    const lastDataItem = data?.[data.length - 1];
    if (lastDataItem && isNewConversationCreated(lastDataItem)) {
      router.push(`?conversationId=${lastDataItem.conversationId}`);
    }
  }, [data, router]);



  // Show chat error if any
  useEffect(() => {
    if (chatError) {
      toast.error(chatError.message || "Failed to connect to chat API");
    }
  }, [chatError]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      chatContainer?.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 max-w-sm w-full">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Agent Configuration</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        disabled={!isDirty || status === "executing"}
                      >
                        {status === "executing" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Book className="h-4 w-4" />
                            <span>Save to agent</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Model</span>
                      </div>
                      <Controller
                        name="config.model"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                              <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                              <SelectItem value="gemini-2.0-pro">Gemini 2.0 Pro</SelectItem>
                              <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.config?.model && (
                        <p className="text-xs text-red-500">
                          {errors.config.model.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Temperature</span>
                      </div>
                      <Controller
                        name="config.temperature"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[field.value]}
                              onValueChange={([value]) => field.onChange(value)}
                              max={1}
                              step={0.1}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-6">
                              {field.value}
                            </span>
                          </div>
                        )}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Reserved</span>
                        <span>Creative</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">System prompt</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      type="button"
                      onClick={() => {
                        if (initialConfig) {
                          setValue(
                            "config.systemPrompt",
                            initialConfig.systemPrompt || "",
                            { shouldDirty: true }
                          );
                        }
                      }}
                    >
                    </Button>
                  </div>
                  <Controller
                    name="config.systemPrompt"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select prompt" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai-agent">AI agent</SelectItem>
                          <SelectItem value="customer-support">
                            Customer Support
                          </SelectItem>
                          <SelectItem value="sales-agent">Sales Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Instructions</h3>
                  <Controller
                    name="config.instructions"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} className="min-h-[200px] text-sm" />
                    )}
                  />
                </div>
              </form>
            </SheetContent>
          </Sheet>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Playground
          </h1>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* Right side chat interface */}
        <div className="border rounded-lg flex flex-col h-[600px] bg-muted/10">
          <div
            className="mx-auto w-full max-w-[65ch] flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
            role="log"
            aria-label="Chat messages"
          >
            {messages.map((message, index) => {
              return (
                <ChatMessage
                  key={index}
                  parts={message.parts ?? []}
                  role={message.role}
                  userName={"You"}
                />
              );
            })}
            {chatStatus === "submitted" && (
              <span className="p-4 text-xs text-muted-foreground animate-pulse">
                Thinking...
              </span>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="">
            <form onSubmit={handleChatSubmit} className="relative">
              <Textarea
                placeholder="Message..."
                value={input}
                onChange={handleInputChange}
                className="min-h-[50px] p-4 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                className="absolute right-2 bottom-4"
                disabled={!input.trim()}
                variant="ghost"
              >
                <Send className="h-4 w-4" />
              </Button>
              <div className="absolute right-10 left-0 bottom-0 flex justify-center mt-3 p-2">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>Powered By OpenChat.co</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}