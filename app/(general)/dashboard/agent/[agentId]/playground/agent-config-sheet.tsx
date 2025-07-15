import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAgentQuery } from "@/hooks/use-agent/use-agent-query";
import { agentConfigActionSchema, DEFAULT_AGENT_CONFIG } from "@/lib/schemas/agent-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { updateAgentConfig } from "./actions";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Slider } from "@radix-ui/react-slider";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { Loader2, Book, HelpCircle, RefreshCw } from "lucide-react";



// Form schema derived from the server action schema
const formSchema = agentConfigActionSchema.omit({ agentId: true });
type FormValues = z.infer<typeof formSchema>;

export function AgentConfigSheet() {
  const { agentId } = useParams();

  // Use our custom hook instead of direct TRPC calls
  const { agent, initialConfig } = useAgentQuery(agentId as string);

  // Initialize form with values from our custom hook
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      config: DEFAULT_AGENT_CONFIG,
    },
  });

  // Update form when initialConfig is loaded
  useEffect(() => {
    if (agent && initialConfig) {
      reset({ config: initialConfig }, { keepDirty: false });
    }
  }, [agent, initialConfig, reset]);
  // Setup the update action with loading/error states
  const { execute, status } = useAction(updateAgentConfig, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast({
          title: "Success",
          description: "Agent configuration saved successfully",
        });
        if (data.data) {
          reset({ config: data.data.config }, { keepDirty: false });
        }
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to save agent configuration",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.error.serverError || error.error.bindArgsValidationErrors,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    execute({
      agentId: agentId as string,
      config: data.config,
    });
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  disabled={!isDirty || status === "executing"}
                >
                  {status === "executing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Book className="h-4 w-4" />
                      <span>Save to agent</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm">Trained</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Model</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80 text-sm">
                          The AI model used to generate responses.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Controller
                  name="config.model"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="claude-3-5-sonnet">
                          Claude 3.5 Sonnet
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.config?.model && (
                  <p className="text-xs text-red-500">
                    {errors.config.model.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Temperature</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80 text-sm">
                          Controls randomness: 0 is deterministic, higher values
                          are more creative.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Controller
                  name="config.temperature"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                        max={1}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-6">
                        {field.value}
                      </span>
                    </div>
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Reserved</span>
                  <span>Creative</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <div className="space-y-2">
            <h3 className="text-sm font-medium">AI Actions</h3>
            <Card className="p-4 text-center text-sm text-muted-foreground">
              No actions found
            </Card>
          </div> */}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">System prompt</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                type="button"
                onClick={() => {
                  if (initialConfig) {
                    setValue(
                      "config.systemPrompt",
                      initialConfig.systemPrompt || "",
                      { shouldDirty: true }
                    );
                  }
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Controller
              name="config.systemPrompt"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-agent">AI agent</SelectItem>
                    <SelectItem value="customer-support">
                      Customer Support
                    </SelectItem>
                    <SelectItem value="sales-agent">Sales Agent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Instructions</h3>
            <Controller
              name="config.instructions"
              control={control}
              render={({ field }) => (
                <Textarea {...field} className="min-h-[200px] text-sm" />
              )}
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
