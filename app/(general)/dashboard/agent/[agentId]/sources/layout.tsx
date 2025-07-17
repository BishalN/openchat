"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  FileText,
  Type,
  Globe,
  HelpCircle,
  FileStack,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSources } from "@/hooks/use-sources";
import { cn } from "@/lib/utils";
import { TrainingProgress } from "@/components/training-progress";
import type { Source } from "@/store/use-sources-store";
import { formatSize } from "@/lib/utils";

const SourceIcon = ({ type }: { type: Source["type"] }) => {
  switch (type) {
    case "file":
      return <FileText className="h-4 w-4 text-muted-foreground" />;
    case "text":
      return <Type className="h-4 w-4 text-muted-foreground" />;
    case "website":
      return <Globe className="h-4 w-4 text-muted-foreground" />;
    case "qa":
      return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    case "notion":
      return <FileStack className="h-4 w-4 text-muted-foreground" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function SourcesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { agentId } = useParams();
  const agentIdNumber = agentId as string;

  const {
    sources,
    totalSize,
    isLoading,
    isRetraining,
    retrainingData,
    retrainingStatus,
    handleRetrainAgent,
    isUploading,
  } = useSources({
    agentId: agentIdNumber,
  });

  const basePath = `/dashboard/agent/${agentId}/sources`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sources</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6">
        {/* Left sidebar */}
        <div className="space-y-1">
          <NavItem
            href={`${basePath}/files`}
            icon={<FileText className="h-5 w-5" />}
            label="Files"
            active={pathname === `${basePath}/files`}
          />
          <NavItem
            href={`${basePath}/text`}
            icon={<Type className="h-5 w-5" />}
            label="Text"
            active={pathname === `${basePath}/text`}
          />
          <NavItem
            href={`${basePath}/qa`}
            icon={<HelpCircle className="h-5 w-5" />}
            label="Q&A"
            active={pathname === `${basePath}/qa`}
          />
          <NavItem
            href={`${basePath}/website`}
            icon={<Globe className="h-5 w-5" />}
            label="Website"
            active={pathname === `${basePath}/website`}
          />
        </div>

        {/* Main content */}
        <div className="border rounded-lg p-6 min-h-[600px]">{children}</div>

        {/* Right sidebar */}
        <div className="border rounded-lg p-6 space-y-6 sticky top-6 h-fit">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Current Sources
          </h2>

          <div className="space-y-4 min-h-[100px]">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </>
            ) : sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sources added.</p>
            ) : (
              sources.map((source) => (
                <div
                  key={source.id || source.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <SourceIcon type={source.type} />
                    <span className="text-sm truncate" title={source.name}>
                      {source.name}
                    </span>
                  </div>
                  {source.size !== undefined && source.size !== null && (
                    <span className="text-sm flex-shrink-0 ml-2">
                      {formatSize(source.size)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Total size:</span>
              {isLoading ? (
                <Skeleton className="h-4 w-[60px]" />
              ) : (
                <span className="text-sm">{formatSize(totalSize)}</span>
              )}
            </div>
          </div>

          {retrainingData && retrainingStatus ? (
            <div className="space-y-4">
              <TrainingProgress
                status={retrainingStatus.status}
                progress={retrainingStatus.progress}
                message={retrainingStatus.message}
                step={retrainingStatus.step}
              />
            </div>
          ) : (
            <Button
              onClick={handleRetrainAgent}
              className="w-full bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 dark:text-black text-white font-medium"
              disabled={
                isLoading || isRetraining || sources.length === 0 || isUploading
              }
            >
              {isRetraining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retraining...
                </>
              ) : (
                "Retrain agent"
              )}
            </Button>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-amber-800 dark:text-amber-300 text-sm flex items-start gap-2">
            <div className="rounded-full bg-amber-500/20 p-1 mt-0.5 flex-shrink-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-amber-600 dark:text-amber-400"
              >
                <path
                  d="M12 16V16.01M12 8V12M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p>
              Any changes made to sources require retraining the agent to take
              effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
        "hover:bg-muted/50 transition-colors",
        active && "bg-primary/10 text-primary"
      )}
    >
      <div className={cn("text-muted-foreground", active && "text-primary")}>
        {icon}
      </div>
      {label}
    </Link>
  );
}
