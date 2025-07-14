"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useGetAgents } from "@/hooks/use-agent/use-get-agents";
import { useRouter } from "next/navigation";
import { AppRouterOutput } from "@/trpc/client";

type Agent = AppRouterOutput["agent"]["getAll"][number];

function SkeletonCard() {
  return (
    <Card className="cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function AgentsPage() {
  const { agents, isLoading, error } = useGetAgents();

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-destructive">
          Error loading agents: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">AI Agents</h1>
      </div>

      {agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
          <Link href="/dashboard/create-agent" className="block">
            <Card className="border-dashed border-2 flex flex-col items-center justify-center h-[220px] bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="text-center font-medium">New AI agent</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No agents found</h3>
          <p className="text-muted-foreground mb-6">
            Create your first AI agent to get started
          </p>
          <div className="text-center">
            <Link href="/dashboard/create-agent">
              <Button size="lg" className="rounded-full">
                <Plus className="h-5 w-5 mr-2" />
                New AI agent
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const router = useRouter();
  return (
    <Card
      onClick={() => router.push(`/dashboard/agent/${agent.id}/playground`)}
      className="cursor-pointer hover:bg-muted/30 transition-colors"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-1">
                {agent.description || "No description"}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
