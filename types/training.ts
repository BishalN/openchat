export interface TrainingStatus {
  status: "processing" | "complete" | "error";
  progress: number;
  message: string;
  step: string;
  runId?: string;
  agentId?: number;
}
