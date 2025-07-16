"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EmbeddableChatWidget from "./embed";
import { Loader2 } from "lucide-react";
import { trpc } from "@/trpc/client";

export default function ChatbotIframe() {
  const { agentId } = useParams<{ agentId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [agentData, setAgentData] = useState<{
    name?: string;
    logo?: string;
    initialMessage?: string;
    suggestedQuestions?: string[];
    privacyPolicyUrl?: string;
  } | null>(null);

  // Fetch agent data using tRPC
  const {
    data,
    isLoading: isFetching,
    error,
  } = trpc.agent.getPublicAgentById.useQuery(
    { id: agentId },
    {
      // Only run query if we have an agentId
      enabled: !!agentId,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!isFetching) {
      setIsLoading(false);

      if (data && data.isPublic) {
        setIsPublic(true);
        setAgentData({
          name: data.name,
          logo: data.name?.charAt(0) || "A",
        });
      }
    }
  }, [data, isFetching, error]);

  // TODO: remove this u don't want to see this from an embed
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!isPublic) {
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
      agentName={agentData?.name}
      agentLogo={agentData?.logo}
      initialMessage={agentData?.initialMessage}
      suggestedQuestions={agentData?.suggestedQuestions}
      privacyPolicyUrl={agentData?.privacyPolicyUrl}
    />
  );
}
