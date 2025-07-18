"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EmbeddableChatWidget from "./embed";
import { Loader2 } from "lucide-react";
import { trpc } from "@/trpc/client";
import { ChatInterfaceFormValues } from "@/lib/validations/chat-interface";

export default function ChatbotIframe() {
  const { agentId } = useParams<{ agentId: string }>();
  const [settings, setSettings] = useState<ChatInterfaceFormValues | null>(null);

  const { data: config, isLoading, error } = trpc.chatInterface.getByAgentId.useQuery({ agentId }, { enabled: !!agentId });

  useEffect(() => {
    if (config) {
      setSettings(config?.config);
    }
  }, [config]);


  // TODO: remove this u don't want to see this from an embed
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-2 text-xl font-bold">Agent Not Available</h1>
        <p className="text-gray-600">
          This chatbot is either private or doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <EmbeddableChatWidget
      settings={settings ?? {}}
    />
  );
}
