import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useCustomActions(agentId: string) {
    const queryClient = useQueryClient();

    // Get all custom actions for an agent
    const {
        data: actions,
        isLoading,
        error,
    } = trpc.customActions.getAll.useQuery({ agentId });

    // Create a new custom action
    const createMutation = trpc.customActions.create.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customActions", agentId] });
            toast.success("Custom action created successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create custom action");
        },
    });

    // Update an existing custom action
    const updateMutation = trpc.customActions.update.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customActions", agentId] });
            toast.success("Custom action updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update custom action");
        },
    });

    // Delete a custom action
    const deleteMutation = trpc.customActions.delete.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customActions", agentId] });
            toast.success("Custom action deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete custom action");
        },
    });

    // Test a custom action
    const testMutation = trpc.customActions.test.useMutation({
        onError: (error) => {
            toast.error(error.message || "Failed to test custom action");
        },
    });

    return {
        actions,
        isLoading,
        error,
        createAction: createMutation.mutate,
        updateAction: updateMutation.mutate,
        deleteAction: deleteMutation.mutate,
        testAction: testMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isTesting: testMutation.isPending,
    };
}

export function useCustomAction(id: string) {
    const queryClient = useQueryClient();

    // Get a single custom action
    const {
        data: action,
        isLoading,
        error,
    } = trpc.customActions.getById.useQuery({ id }, {
        enabled: !!id,
    });

    // Update the custom action
    const updateMutation = trpc.customActions.update.useMutation({
        onSuccess: (updatedAction) => {
            queryClient.setQueryData(["customAction", id], updatedAction);
            queryClient.invalidateQueries({ queryKey: ["customActions"] });
            toast.success("Custom action updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update custom action");
        },
    });

    return {
        action,
        isLoading,
        error,
        updateAction: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
    };
} 