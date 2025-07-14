import { trpc } from "@/trpc/client";

export function useGetAgents() {
  const {
    data: agents = [],
    isLoading,
    error,
    refetch,
  } = trpc.agent.getAll.useQuery();

  return {
    agents,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
