import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { TabType } from "@/app/(general)/dashboard/agent/[agentId]/settings/page";

interface AgentGeneralSettings {
  name: string;
  isCreditLimitEnabled: boolean;
  creditLimit: number;
  isPublic: boolean; // Add isPublic property
}

export function useAgentSettings(agentId: string | number) {
  const router = useRouter();
  const { toast } = useToast();
  const numericAgentId =
    typeof agentId === "string" ? Number(agentId) : agentId;

  const [activeTab, setActiveTab] = useState<TabType>("general");

  // State for form fields
  const [settings, setSettings] = useState<AgentGeneralSettings>({
    name: "",
    isCreditLimitEnabled: false,
    creditLimit: 0,
    isPublic: false, // Default to private
  });

  // State for delete agent confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // State for delete conversations confirmation
  const [isDeleteConversationsDialogOpen, setIsDeleteConversationsDialogOpen] =
    useState(false);
  const [isDeletingConversations, setIsDeletingConversations] = useState(false);

  // Fetch agent data
  const {
    data,
    isLoading,
    error: fetchError,
    refetch,
  } = trpc.agent.getById.useQuery(
    { id: numericAgentId },
    {
      enabled: !!agentId,
      refetchOnWindowFocus: false,
    }
  );

  // Update mutation
  const {
    mutateAsync: updateAgent,
    isPending: isUpdating,
    error: updateError,
  } = trpc.agent.generalUpdate.useMutation({
    onSuccess: () => {
      toast({
        title: "Agent updated",
        description: "Your agent has been updated.",
        variant: "default",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle visibility mutation
  const {
    mutateAsync: makeAgentPublic,
    isPending: isMakeAgentPublicLoading,
    error: makeAgentPublicError,
  } = trpc.agent.generalUpdate.useMutation({
    onSuccess: (data) => {
      const newStatus = data.isPublic ? "public" : "private";
      toast({
        title: `Agent is now ${newStatus}`,
        description: data.isPublic
          ? "Your agent is now accessible to others."
          : "Your agent is now private.",
        variant: "default",
      });

      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update agent visibility",
        variant: "destructive",
      });
    },
  });

  // Delete agent mutation
  const { mutateAsync: deleteAgent, isPending: isDeletingMutation } =
    trpc.agent.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Agent deleted",
          description: "Your agent has been permanently deleted.",
          variant: "default",
        });
        // Redirect to agents list after successful deletion
        router.push("/dashboard/agents");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete agent",
          variant: "destructive",
        });
        setIsDeleting(false);
      },
    });

  // Delete all conversations mutation
  const {
    mutateAsync: deleteAllConversations,
    isPending: isDeletingConversationsMutation,
  } = trpc.agent.deleteAllConversations.useMutation({
    onSuccess: () => {
      toast({
        title: "Conversations deleted",
        description: "All conversations for this agent have been deleted.",
        variant: "default",
      });
      setIsDeleteConversationsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete conversations",
        variant: "destructive",
      });
      setIsDeletingConversations(false);
    },
  });

  // Initialize settings from data
  useEffect(() => {
    if (data) {
      setSettings({
        name: data.name || "",
        isCreditLimitEnabled: !!data.isCreditsLimitEnabled,
        creditLimit: data.creditLimit || 0,
        isPublic: !!data.isPublic, // Get visibility status
      });
    }
  }, [data]);

  // Update individual setting fields
  const updateSetting = <K extends keyof AgentGeneralSettings>(
    key: K,
    value: AgentGeneralSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save all settings
  const saveSettings = async () => {
    await updateAgent({
      id: numericAgentId,
      name: settings.name,
      creditLimit: settings.isCreditLimitEnabled
        ? settings.creditLimit
        : undefined,
    });
  };

  // Make agent public or private
  const handleMakeAgentPublic = async () => {
    await makeAgentPublic({
      id: numericAgentId,
      isPublic: !settings.isPublic,
    });
  };

  // Open delete agent confirmation dialog
  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
    setDeleteConfirmationText("");
  };

  // Close delete agent confirmation dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteConfirmationText("");
  };

  // Handle agent deletion with confirmation
  const handleDeleteAgent = async () => {
    if (!data || !data.name) return;

    // Verify confirmation text matches agent name exactly
    if (deleteConfirmationText !== data.name) {
      toast({
        title: "Confirmation failed",
        description:
          "The agent name you entered doesn't match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Proceed with deletion
    setIsDeleting(true);
    try {
      await deleteAgent({ id: numericAgentId });
    } catch (error) {
      // Error is handled in the onError callback
      setIsDeleting(false);
    }
  };

  // Open delete conversations dialog
  const openDeleteConversationsDialog = () => {
    setIsDeleteConversationsDialogOpen(true);
  };

  // Close delete conversations dialog
  const closeDeleteConversationsDialog = () => {
    setIsDeleteConversationsDialogOpen(false);
  };

  // Handle delete all conversations
  const handleDeleteAllConversations = async () => {
    setIsDeletingConversations(true);
    try {
      await deleteAllConversations({ id: numericAgentId });
    } catch (error) {
      // Error is handled in the onError callback
      setIsDeletingConversations(false);
    }
  };

  return {
    // Data
    agent: data,
    settings,
    isLoading,
    isUpdating,
    error: fetchError || updateError,

    // Actions
    updateSetting,
    saveSettings,

    // Visibility toggle
    handleMakeAgentPublic,
    isMakeAgentPublicLoading,

    // Field-specific updaters (for convenience)
    setName: (name: string) => updateSetting("name", name),
    setCreditLimitEnabled: (enabled: boolean) =>
      updateSetting("isCreditLimitEnabled", enabled),
    setCreditLimit: (limit: number) => updateSetting("creditLimit", limit),

    // Delete agent functionality
    isDeleteDialogOpen,
    deleteConfirmationText,
    setDeleteConfirmationText,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteAgent,
    isDeleting: isDeleting || isDeletingMutation,

    // Delete all conversations functionality
    isDeleteConversationsDialogOpen,
    isDeletingConversations:
      isDeletingConversations || isDeletingConversationsMutation,
    openDeleteConversationsDialog,
    closeDeleteConversationsDialog,
    handleDeleteAllConversations,

    // Tab management
    activeTab,
    setActiveTab,
  };
}
