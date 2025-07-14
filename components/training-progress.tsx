import React from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingProgressProps {
  status: "processing" | "complete" | "error";
  progress: number;
  message: string;
  step: string;
}

export function TrainingProgress({
  status,
  progress,
  message,
  step,
}: TrainingProgressProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "processing" && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          {status === "complete" && (
            <svg
              className="h-4 w-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {status === "error" && (
            <svg
              className="h-4 w-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <span
            className={cn(
              "font-medium",
              status === "complete" && "text-green-600",
              status === "error" && "text-red-600"
            )}
          >
            {status === "processing"
              ? "Training in progress..."
              : status === "complete"
                ? "Training complete!"
                : "Training error"}
          </span>
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="text-sm text-muted-foreground">{message}</div>

      <div className="pt-2">
        <div className="flex space-x-2 text-xs">
          <div
            className={cn(
              "px-2 py-1 rounded-full",
              step === "initialize"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            Initialize
          </div>
          <div
            className={cn(
              "px-2 py-1 rounded-full",
              step === "chunking"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            Chunking
          </div>
          <div
            className={cn(
              "px-2 py-1 rounded-full",
              step === "embedding"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            Embedding
          </div>
          <div
            className={cn(
              "px-2 py-1 rounded-full",
              step === "complete"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            Complete
          </div>
        </div>
      </div>
    </div>
  );
}
