import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { AgentConfig, DEFAULT_AGENT_CONFIG } from "@/lib/schemas/agent-config";

export interface UseAgentQueryResult {
  agent: any;
  isLoading: boolean;
  error: Error | null;
  //   updateAgentConfig: (config: AgentConfig) => Promise<void>;
  initialConfig: AgentConfig | null;
}

export function useAgentQuery(agentId: string) {
  const [initialConfig, setInitialConfig] = useState<AgentConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Fetch agent data with TRPC
  const {
    data: agent,
    isLoading,
    error: trpcError,
  } = trpc.agent.getById.useQuery(
    { id: agentId },
    {
      enabled: !!agentId,
    }
  );

  // Handle successful data fetch
  useEffect(() => {
    if (agent && agent.config) {
      // Extract and normalize config with defaults
      const normalizedConfig: AgentConfig = {
        model: agent.config.model || DEFAULT_AGENT_CONFIG.model,
        temperature:
          agent.config.temperature ?? DEFAULT_AGENT_CONFIG.temperature,
        systemPrompt:
          agent.config.systemPrompt || DEFAULT_AGENT_CONFIG.systemPrompt,
      };
      setInitialConfig(normalizedConfig);
    }
  }, [agent]);

  // Handle error
  useEffect(() => {
    if (trpcError) {
      setError(trpcError as unknown as Error);
    }
  }, [trpcError]);

  //   // TRPC mutation for updating agent configuration
  //   const updateAgentMutation = trpc.agent.updateConfig.useMutation({
  //     onSuccess: () => {
  //       refetch();
  //     },
  //     onError: (err) => {
  //       setError(err);
  //     }
  //   });

  //   // Function to update agent configuration
  //   const updateAgentConfig = async (config: AgentConfig) => {
  //     try {
  //       await updateAgentMutation.mutateAsync({
  //         id: numericAgentId,
  //         config
  //       });
  //     } catch (err) {
  //       console.error('Error updating agent config:', err);
  //       throw err;
  //     }
  //   };

  return {
    agent,
    isLoading,
    error: error || trpcError,
    // updateAgentConfig,
    initialConfig,
  };
}
