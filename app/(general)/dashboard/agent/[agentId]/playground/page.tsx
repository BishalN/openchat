"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Book, RefreshCw, HelpCircle, Send, Loader2 } from "lucide-react";
import { updateAgentConfig } from "./actions";
import { useAction } from "next-safe-action/hooks";
import { useAgentQuery } from "@/hooks/use-agent/use-agent-query";
import {
  agentConfigActionSchema,
  DEFAULT_AGENT_CONFIG,
} from "@/lib/schemas/agent-config";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";
import {
  Message,
} from "@/components/ui/message";
import { Loader } from "@/components/ui/loader";

// Form schema derived from the server action schema
const formSchema = agentConfigActionSchema.omit({ agentId: true });
type FormValues = z.infer<typeof formSchema>;

export default function PlaygroundPage() {
  const { agentId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use our custom hook instead of direct TRPC calls
  const { agent, initialConfig } = useAgentQuery(agentId as string);

  // Initialize form with values from our custom hook
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
        toast({
          title: "Success",
          description: "Agent configuration saved successfully",
        });
        if (data.data) {
          reset({ config: data.data.config }, { keepDirty: false });
        }
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to save agent configuration",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.error.serverError || error.error.bindArgsValidationErrors,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    execute({
      agentId: agentId as string,
      config: data.config,
    });
  };

  // Chat integration with Vercel AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    error: chatError,
    status: chatStatus,
    metadata,
    data,
  } = useChat({
    api: "/api/chat",
    streamProtocol: 'text',
    body: {
      agentId: agentId,
      //TODO: Hmm thats why a good idea for a client to give back a uuid type backend
      // conversationId: null,
      // Include optional conversationId to save conversation history
      // conversationId: "unique-conversation-id",
    },
    initialMessages: [
      {
        id: "1",
        role: "system",
        content: "Hello, how can i help you?",
      },
    ],
  });
  // Add setInput for direct input state update
  const setInput = (val: string) => handleInputChange({ target: { value: val } } as any);

  console.log('metadata:', JSON.stringify(metadata, null, 2))
  console.log('data:', JSON.stringify(data, null, 2))

  // Show chat error if any
  useEffect(() => {
    if (chatError) {
      toast({
        title: "Chat Error",
        description: chatError.message || "Failed to connect to chat API",
        variant: "destructive",
      });
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Playground
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-80 text-sm">
                  Test your AI agent with different settings and prompts.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* Left sidebar with configuration */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm">Trained</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Model</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80 text-sm">
                          The AI model used to generate responses.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="claude-3-5-sonnet">
                          Claude 3.5 Sonnet
                        </SelectItem>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80 text-sm">
                          Controls randomness: 0 is deterministic, higher values
                          are more creative.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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

          {/* <div className="space-y-2">
            <h3 className="text-sm font-medium">AI Actions</h3>
            <Card className="p-4 text-center text-sm text-muted-foreground">
              No actions found
            </Card>
          </div> */}

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
                <RefreshCw className="h-4 w-4" />
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

        {/* Right side chat interface */}
        <div className="border rounded-lg flex flex-col h-[600px] bg-muted/10">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((message) => {
              return (
                <Message
                  key={message.id}
                  className={message.role === "user" ? "justify-end" : "justify-start"}
                >
                  {message.content}
                </Message>
              );
            })}
            {/* Loading animation when status is submitting */}
            {chatStatus === "submitted" && (
              <Loader variant="typing" />
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t bg-background">
            <PromptInput
              value={input}
              onValueChange={setInput}
              isLoading={chatStatus === "streaming"}
              onSubmit={() => {
                if (input.trim()) handleChatSubmit();
              }}
              className="w-full"
            >
              <PromptInputTextarea
                placeholder="Message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) handleChatSubmit(e);
                  }
                }}
                className="min-h-[50px]"
              />
              <PromptInputActions>
                <PromptInputAction tooltip="Send">
                  <Button
                    type="submit"
                    disabled={!input.trim()}
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>
            <div className="flex justify-center mt-3 p-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>Powered By OpenChat.co</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
