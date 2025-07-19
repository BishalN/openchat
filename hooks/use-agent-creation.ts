// @ts-nocheck

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSourceStore } from "@/store/use-agent-creation/use-source-store";
import { createAgent } from "@/app/(general)/dashboard/create-agent/actions";
import { TrainingStatus } from "@/types/training";
import { toast } from "sonner";

export function useAgentCreation() {
  const router = useRouter();
  const sourceStore = useSourceStore();
  const { text, file: files, websites, qa } = sourceStore;

  // Local state
  const [isCreating, setIsCreating] = useState(false);
  const [trainingData, setTrainingData] = useState<{
    runId: string;
    agentId?: number;
  } | null>(null);

  // State to track if we've already handled a completion
  const [hasHandledCompletion, setHasHandledCompletion] = useState(false);

  // Calculate file sizes
  const totalFileSize = files.reduce(
    (sum, file) => sum + (file.fileSize || 0),
    0
  );
  const totalSize = (text?.size || 0) + totalFileSize + (qa?.size || 0);
  const maxSize = 400 * 1024; // 400 KB in bytes

  // Memoize the reset function to avoid recreation on each render
  const resetAll = useCallback(() => {
    setTrainingData(null);
    setIsCreating(false);
    setHasHandledCompletion(false);
    sourceStore.resetSourceData();
  }, [sourceStore]);

  // Training status query
  const {
    data: trainingStatus,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery<TrainingStatus>({
    queryKey: ["training-status", trainingData?.runId],
    queryFn: async () => {
      if (!trainingData?.runId) {
        return {
          status: "processing",
          progress: 0,
          message: "Initializing...",
          step: "initialize",
        };
      }

      const response = await fetch(
        `/api/agent/training-status?runId=${trainingData.runId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch training status");
      }

      return response.json();
    },
    enabled: !!trainingData?.runId,
    refetchInterval: (data) => {
      // Stop polling when training completes or errors
      if (
        data?.state.data?.status === "complete" ||
        data?.state.data?.status === "error"
      ) {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });

  // Handle status changes with useEffect, but use a flag to prevent multiple executions
  useEffect(() => {
    // Skip if we don't have training status or we've already handled completion
    if (!trainingStatus || hasHandledCompletion) return;

    if (trainingStatus.status === "complete" && trainingStatus.agentId) {
      // Mark that we've handled completion to prevent infinite loop
      setHasHandledCompletion(true);

      // Show success toast
      toast.success("Agent created and trained successfully!");

      // Reset source store
      sourceStore.resetSourceData();

      // Navigate to playground
      router.push(`/dashboard/agent/${trainingStatus.agentId}/playground`);
    } else if (trainingStatus.status === "error" && !hasHandledCompletion) {
      // Mark that we've handled completion to prevent infinite loop
      setHasHandledCompletion(true);

      // Show error toast
      toast.error(trainingStatus.message || "Training failed. Please try again.");

      // Reset creation state to allow retry
      setIsCreating(false);
      setTrainingData(null);
    }
  }, [trainingStatus, hasHandledCompletion, toast, router, sourceStore]);

  // Create agent function - use useCallback to prevent recreation on each render
  const handleCreateAgent = useCallback(async () => {
    if (
      (!text &&
        files.length === 0 &&
        websites.length === 0 &&
        !qa) ||
      isCreating ||
      totalSize > maxSize
    ) {
      return;
    }

    try {
      setIsCreating(true);
      // Reset the completion flag when starting a new agent creation
      setHasHandledCompletion(false);

      const result = await createAgent({
        text: text,
        file: files,
        websites: websites,
        qa: qa,
      });

      if (result && result.data && result.data.success) {
        setTrainingData({
          //@ts-ignore
          runId: result.data.runId,
          agentId: result.data.agent?.id,
        });

        toast.success("Agent Created");
      } else {
        toast.error(result?.data?.error || "Failed to create agent. Please try again.");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsCreating(false);
    }
  }, [
    text,
    files,
    websites,
    qa,
    isCreating,
    totalSize,
    maxSize,
    toast,
  ]);

  // Check if sources are available
  const hasAnySource =
    !!text || files.length > 0 || websites.length > 0 || !!qa;

  // Check if size limit is exceeded
  const isSizeLimitExceeded = totalSize > maxSize;

  return {
    // Sources data
    sources: {
      text,
      files,
      websites,
      qa,
      totalFileSize,
      totalSize,
      maxSize,
      hasAnySource,
      isSizeLimitExceeded,
    },

    // Creation state
    isCreating,
    trainingData,

    // Training status
    trainingStatus,
    isLoadingStatus,
    statusError,

    // Actions
    handleCreateAgent,
    reset: resetAll,

    // Source store's reset function for direct access
    resetSources: sourceStore.resetSourceData,
  };
}
