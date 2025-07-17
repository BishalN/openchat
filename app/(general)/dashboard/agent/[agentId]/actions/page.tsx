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

// Mock actions data
const mockActions = [
    {
        id: "1",
        name: "Get Weather",
        description: "Use this action to fetch the current weather for a given city.",
        whenToUse:
            "Use when the user asks about the weather in a specific city. Example: 'What's the weather in London?'",
        type: "GET",
        url: "https://wttr.in/{{city}}?format=j1",
        createdAt: "2024-06-01",
        status: "active",
    },
    {
        id: "2",
        name: "Upgrade Subscription",
        description: "Upgrade the user's subscription to premium.",
        whenToUse:
            "Use when the user wants to upgrade their subscription. Example: 'Upgrade me to premium.'",
        type: "POST",
        url: "https://demo-rhythmbox.chatbase.fyi/api/update-subscription",
        createdAt: "2024-06-02",
        status: "active",
    },
];

export default function ActionsPage() {
    // Toggle this to [] to test empty state
    const [actions] = useState(mockActions); // or [] for empty

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Custom Actions</h2>
                <Button size="sm" className="ml-auto space-x-2">
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
                                    <Badge variant="secondary">{action.type}</Badge>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        {action.createdAt}
                                    </span>
                                </div>
                                <CardTitle>{action.name}</CardTitle>
                                <CardDescription>{action.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2">
                                    <span className="font-semibold">When to use:</span>
                                    <div className="mt-1 text-xs">
                                        <Markdown>{action.whenToUse}</Markdown>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-semibold">API:</span> {action.url}
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
