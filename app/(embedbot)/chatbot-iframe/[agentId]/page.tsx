"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EmbeddableChatWidget from "./embed";
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


  if (isLoading) {
    return null;
  }

  if (error || !settings) {
    console.log(`Agent ${agentId} not available`);
    return null;
  }

  return (
    <EmbeddableChatWidget
      settings={settings ?? {}}
    />
  );
}
