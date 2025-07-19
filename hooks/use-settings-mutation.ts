import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { TabType } from "@/app/(general)/dashboard/agent/[agentId]/settings/page";
import { toast } from "sonner";

interface AgentGeneralSettings {
  name: string;
  isPublic: boolean; // Add isPublic property
}

export function useAgentSettings(agentId: string) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("general");

  // State for form fields
  const [settings, setSettings] = useState<AgentGeneralSettings>({
    name: "",
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
    { id: agentId },
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
      toast.success("Agent updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
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
      toast.success(`Agent is now ${newStatus}`);

      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update agent visibility");
    },
  });

  // Delete agent mutation
  const { mutateAsync: deleteAgent, isPending: isDeletingMutation } =
    trpc.agent.delete.useMutation({
      onSuccess: () => {
        toast.success("Agent deleted");
        // Redirect to agents list after successful deletion
        router.push("/dashboard/agents");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete agent");
        setIsDeleting(false);
      },
    });

  // Delete all conversations mutation
  const {
    mutateAsync: deleteAllConversations,
    isPending: isDeletingConversationsMutation,
  } = trpc.agent.deleteAllConversations.useMutation({
    onSuccess: () => {
      toast.success("Conversations deleted");
      setIsDeleteConversationsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete conversations");
      setIsDeletingConversations(false);
    },
  });

  // Initialize settings from data
  useEffect(() => {
    if (data) {
      setSettings({
        name: data.name || "",
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
      id: agentId,
      name: settings.name,
    });
  };

  // Make agent public or private
  const handleMakeAgentPublic = async () => {
    await makeAgentPublic({
      id: agentId,
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
      toast.error("The agent name you entered doesn't match. Please try again.");
      return;
    }

    // Proceed with deletion
    setIsDeleting(true);
    try {
      await deleteAgent({ id: agentId });
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
      await deleteAllConversations({ id: agentId });
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
