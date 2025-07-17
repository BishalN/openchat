"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Type,
  Globe,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { cn, formatSize } from "@/lib/utils";
import { TrainingProgress } from "@/components/training-progress";
import { useAgentCreation } from "@/hooks/use-agent-creation";

export default function CreateAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Create new agent</h1>

      <div className="grid grid-cols-1 md:grid-cols-[250px_minmax(500px,1fr)_300px] gap-6">
        {/* Left sidebar navigation */}
        <div className="space-y-1 w-[250px]">
          <NavItem
            href="/dashboard/create-agent/files"
            icon={<FileText className="h-5 w-5" />}
            label="Files"
            active={pathname === "/dashboard/create-agent/files"}
          />
          <NavItem
            href="/dashboard/create-agent/text"
            icon={<Type className="h-5 w-5" />}
            label="Text"
            active={pathname === "/dashboard/create-agent/text"}
          />
          <NavItem
            href="/dashboard/create-agent/qa"
            icon={<HelpCircle className="h-5 w-5" />}
            label="Q&A"
            active={pathname === "/dashboard/create-agent/qa"}
          />
          {/* TODO: Add to roadmap */}
          {/* <NavItem
            href="/dashboard/create-agent/website"
            icon={<Globe className="h-5 w-5" />}
            label="Website"
            active={pathname === "/dashboard/create-agent/website"}
          />
          <NavItem
            href="/dashboard/create-agent/notion"
            icon={<FileStack className="h-5 w-5" />}
            label="Notion"
            active={pathname === "/dashboard/create-agent/notion"}
          /> */}
        </div>

        {/* Main content area */}
        <div className="border rounded-lg p-6 min-h-[600px] w-full">
          {children}
        </div>

        {/* Right sidebar */}
        <div className="w-[300px]">
          <SourcesSidebar />
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

function SourcesSidebar() {
  const {
    sources,
    isCreating,
    trainingData,
    trainingStatus,
    handleCreateAgent,
  } = useAgentCreation();

  const {
    text,
    files,
    websites,
    qa,
    totalFileSize,
    totalSize,
    maxSize,
    hasAnySource,
    isSizeLimitExceeded,
  } = sources;

  return (
    <div className="border rounded-lg p-6 space-y-6 w-full h-full sticky top-6">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Sources
      </h2>

      <div className="space-y-4">
        {text && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Text</span>
            </div>
            <span className="text-sm">{formatSize(text.size)}</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {files.length} File{files.length > 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-sm">{formatSize(totalFileSize)}</span>
          </div>
        )}

        {websites.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {websites.length} Website
                {websites.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {qa && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {qa.qaPairs.length} Q&A
                {qa.qaPairs.length > 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-sm">{formatSize(qa.size)}</span>
          </div>
        )}

      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Total size:</span>
          <span className="text-sm">{formatSize(totalSize)}</span>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-xs text-muted-foreground">
            / {formatSize(maxSize)}
          </span>
        </div>
      </div>

      {trainingData ? (
        // Show training progress when training has started
        <div className="space-y-4">
          <TrainingProgress
            status={trainingStatus?.status || "processing"}
            progress={trainingStatus?.progress || 0}
            message={trainingStatus?.message || "Starting training..."}
            step={trainingStatus?.step || "initialize"}
          />
        </div>
      ) : (
        // Show create button when not yet training
        <button
          onClick={handleCreateAgent}
          disabled={isCreating || !hasAnySource || isSizeLimitExceeded}
          className={cn(
            "w-full bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 dark:text-black text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center",
            (isCreating || !hasAnySource || isSizeLimitExceeded) &&
            "opacity-70 cursor-not-allowed"
          )}
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create agent"
          )}
        </button>
      )}
    </div>
  );
}
