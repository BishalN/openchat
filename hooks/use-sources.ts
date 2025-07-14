//@ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // Keep if needed for navigation on completion
import { useToast } from "@/hooks/use-toast";
import { useSourcesStore } from "@/store/use-sources-store";
import { trpc } from "@/trpc/client";
import { retrainAgent } from "@/app/(general)/dashboard/agent/[agentId]/sources/actions";
import { TrainingStatus } from "@/types/training";

// Re-use or define the TrainingStatus type

interface UseSourcesProps {
  agentId: number;
}

export function useSources({ agentId }: UseSourcesProps) {
  const sourcesStore = useSourcesStore();
  const router = useRouter(); // Keep if needed
  const { toast } = useToast();

  // State for retraining
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainingData, setRetrainingData] = useState<{
    runId: string;
    agentId?: number;
  } | null>(null);
  const [hasHandledRetrainingCompletion, setHasHandledRetrainingCompletion] =
    useState(false);

  // Fetch existing sources using tRPC
  const {
    data: fetchedSources,
    isLoading: isLoadingSources,
    refetch: refetchSources, // Add refetch function
  } = trpc.agent.getSources.useQuery(
    { id: agentId },
    {
      enabled: !!agentId,
      staleTime: 5 * 60 * 1000, // Keep data fresh for 5 mins
    }
  );

  // Update sources store when data changes
  useEffect(() => {
    if (fetchedSources) {
      // Get actions directly from the store hook or use getState if needed,
      // but they don't need to be dependencies here.
      const resetSources = useSourcesStore.getState().resetSources;
      const addSource = useSourcesStore.getState().addSource;

      resetSources(); // Clear existing sources first
      fetchedSources.forEach((source) => {
        addSource({
          id: String(source.id),
          type: source.type,
          name: source.name,
          content: source.content || undefined,
          url: source.url || undefined,
          fileUrl: source.fileUrl || undefined,
          size: source.fileSize || source.characterCount || undefined, // Use fileSize or characterCount
          mimeType: source.mimeType || undefined,
          qaPairs: source.type === "qa" ? source.qaPairs : undefined, // Make sure qaPairs are correctly mapped if needed
        });
      });
    }
    // Only depend on fetchedSources changing.
  }, [fetchedSources]);

  // Retraining status query
  const {
    data: retrainingStatus,
    isLoading: isLoadingRetrainingStatus,
    error: retrainingStatusError,
  } = useQuery<TrainingStatus>({
    queryKey: ["retraining-status", retrainingData?.runId],
    queryFn: async () => {
      if (!retrainingData?.runId) {
        // Should not happen if query is enabled correctly, but good practice
        return {
          status: "processing",
          progress: 0,
          message: "Initializing...",
          step: "initialize",
        };
      }
      // Assuming the same API endpoint works for retraining status
      const response = await fetch(
        `/api/agent/training-status?runId=${retrainingData.runId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch retraining status");
      }
      return response.json();
    },
    enabled: !!retrainingData?.runId && !hasHandledRetrainingCompletion, // Enable only when retraining and not completed/errored
    refetchInterval: (data) => {
      if (
        data?.state.data?.status === "complete" ||
        data?.state.data?.status === "error"
      ) {
        return false; // Stop polling on completion or error
      }
      return 3000; // Poll every 3 seconds
    },
    refetchOnWindowFocus: false, // Prevent refetching on window focus during polling
  });

  // Handle retraining status changes
  useEffect(() => {
    if (!retrainingStatus || hasHandledRetrainingCompletion) return;

    if (retrainingStatus.status === "complete") {
      setHasHandledRetrainingCompletion(true);
      setIsRetraining(false); // Ensure retraining state is reset
      setRetrainingData(null); // Clear retraining data
      toast({
        title: "Success",
        description: "Agent retrained successfully!",
        variant: "default",
      });
      refetchSources(); // Refetch sources to show updated state
      // Optionally navigate or perform other actions
      // router.push(`/dashboard/agent/${agentId}/playground`);
    } else if (retrainingStatus.status === "error") {
      setHasHandledRetrainingCompletion(true);
      setIsRetraining(false); // Ensure retraining state is reset
      setRetrainingData(null); // Clear retraining data
      toast({
        title: "Error",
        description:
          retrainingStatus.message || "Retraining failed. Please try again.",
        variant: "destructive",
      });
      refetchSources(); // Refetch sources to show state before failed attempt
    }
  }, [
    retrainingStatus,
    hasHandledRetrainingCompletion,
    toast,
    agentId,
    refetchSources,
    // router // Add router if navigation is used
  ]);

  // Function to trigger retraining
  const handleRetrainAgent = useCallback(async () => {
    // Get current sources from the store to send for retraining
    const currentSources = sourcesStore.sources;
    if (currentSources.length === 0 || isRetraining) {
      toast({
        title: "Cannot Retrain",
        description: "No sources to retrain or retraining already in progress.",
        variant: "destructive",
      });
      return;
    }

    setIsRetraining(true);
    setHasHandledRetrainingCompletion(false); // Reset completion flag
    setRetrainingData(null); // Clear previous retraining data if any

    // Prepare data in the format expected by the retrainAgent action
    const sourcesPayload = {
      text: currentSources.find((s) => s.type === "text") || null,
      file: currentSources
        .filter((s) => s.type === "file")
        .map((s) => ({
          ...s,
          fileSize: s.size,
          createdAt: Date.now(), // Assuming createdAt is required
        })),
      websites: currentSources.filter((s) => s.type === "website"),
      qa: currentSources.find((s) => s.type === "qa") || null,
      notion: currentSources.find((s) => s.type === "notion") || null,
    };

    try {
      const result = await retrainAgent({
        agentId: agentId,
        ...(sourcesPayload as any),
      });

      if (result?.data?.success) {
        // If it is success and there is no runId than it means retraining is not needed so we can just return
        if (!result.data.runId) {
          setIsRetraining(false);
          toast({
            title: "No Retraining Needed",
            description: "The agent is already up to date.",
            variant: "default",
          });
          return;
        }
        setRetrainingData({
          runId: result.data.runId,
          agentId: agentId, // Agent ID is known
        });
        toast({
          title: "Retraining Started",
          description: "Agent retraining process has begun.",
          variant: "default",
        });
      } else {
        throw new Error(result?.error || "Failed to start retraining.");
      }
    } catch (error) {
      console.error("Error starting retraining:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsRetraining(false); // Reset state on error
      setHasHandledRetrainingCompletion(true); // Prevent polling
    }
  }, [agentId, sourcesStore, isRetraining, toast]);

  // Calculate total size from store data
  const storeSources = sourcesStore.sources;
  const totalSize = storeSources.reduce(
    (acc, source) => acc + (source.size || 0),
    0
  );

  // Memoized reset function
  const reset = useCallback(() => {
    sourcesStore.resetSources();
    // Optionally reset retraining state as well if needed
    // setIsRetraining(false);
    // setRetrainingData(null);
    // setHasHandledRetrainingCompletion(false);
  }, [sourcesStore]);

  return {
    // Source data from store (reflects UI changes before saving)
    sources: storeSources,
    isLoading: isLoadingSources && storeSources.length === 0, // Loading if initial fetch is happening and store is empty
    totalSize,

    // Retraining state
    isRetraining,
    retrainingData,
    retrainingStatus,
    isLoadingRetrainingStatus,
    retrainingStatusError,

    // Actions
    addSource: sourcesStore.addSource,
    updateSource: sourcesStore.updateSource,
    removeSource: sourcesStore.removeSource,
    handleRetrainAgent,
    reset,

    // Upload state from store
    isUploading: sourcesStore.isUploading,
    setIsUploading: sourcesStore.setIsUploading,
  };
}
