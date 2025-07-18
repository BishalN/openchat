"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { AIIcon } from "../settings/icons";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";

export default function ActionsPage() {
    const router = useRouter();
    const params = useParams();
    const agentId = params.agentId as string;

    // Fetch custom actions using tRPC
    const {
        data: actions = [],
        isLoading,
        error,
    } = trpc.customActions.getAll.useQuery(
        { agentId },
        {
            enabled: !!agentId,
        }
    );

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Custom Actions</h2>
                    <Button size="sm" className="ml-auto space-x-2" disabled>
                        <span>+</span>
                        <span>Create Action</span>
                    </Button>
                </div>
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Custom Actions</h2>
                    <Button size="sm" className="ml-auto space-x-2" onClick={() => router.push(`/dashboard/agent/${agentId}/actions/create`)}>
                        <span>+</span>
                        <span>Create Action</span>
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-4 border border-dashed rounded-lg bg-muted/30">
                    <span className="inline-block mb-2">
                        <AIIcon />
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">Error loading actions</h3>
                    <p className="max-w-md mx-auto text-sm">
                        {error.message || "Failed to load custom actions. Please try again."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Custom Actions</h2>
                <Button size="sm" className="ml-auto space-x-2" onClick={() => router.push(`/dashboard/agent/${agentId}/actions/create`)}>
                    <span>
                        +
                    </span>
                    <span>
                        Create Action
                    </span>
                </Button>
            </div>

            {actions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-4 border border-dashed rounded-lg bg-muted/30">
                    <span className="inline-block mb-2">
                        <AIIcon />
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">No actions yet</h3>
                    <p className="max-w-md mx-auto text-sm">
                        You haven't created any custom actions for this agent yet. <br />
                        Click <span className="font-semibold">Create Action</span> to get started!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {actions.map((action) => (
                        <Card key={action.id} className="flex flex-col h-full">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary">{action.config.apiMethod}</Badge>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        {new Date(action.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <CardTitle>{action.name}</CardTitle>
                                <CardDescription>{action.description || "No description provided"}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2">
                                    <span className="font-semibold">When to use:</span>
                                    <div className="mt-1 text-xs">
                                        <Markdown>{action.whenToUse}</Markdown>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-semibold">API:</span> {action.config.apiUrl}
                                </div>
                            </CardContent>
                            <CardFooter className="mt-auto flex justify-end">
                                <Button size="sm" variant="outline">
                                    Edit
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
