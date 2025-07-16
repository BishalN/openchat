"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  FramerIcon,
  CircleCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAgentSettings } from "@/hooks/use-settings-mutation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface EmbedOption {
  value: "iframe";
  label: string;
  description: string;
  icon: React.ReactNode;
  isRecommended: boolean;
}

// Component for the tab buttons
const TabButton = ({ icon, label, active, onClick }: TabButtonProps) => {
  return (
    <button
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left",
        active
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      )}
      onClick={onClick}
    >
      <div className={active ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </div>
      {label}
    </button>
  );
};

// Component for the embed code display
const EmbedCodeDisplay = ({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code: string;
}) => {
  const { toast } = useToast();
  const copyCode = () => {
    navigator.clipboard.writeText(code);

    toast({
      title: "Code copied to clipboard",
      description: "You can now paste it into your website.",
      duration: 5000,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 bg-muted/50 rounded-md p-4 font-mono text-sm overflow-auto">
          {code}
        </div>
        <Button variant="secondary" onClick={copyCode}>
          Copy Code
        </Button>
      </CardContent>
    </Card>
  );
};

// Main component
export default function ConnectPage() {

  const { agentId } = useParams();

  const {
    settings,
    handleMakeAgentPublic,
    isMakeAgentPublicLoading,
    isLoading,
  } = useAgentSettings(agentId as string);

  const iframeCode = useMemo(
    () =>
      `<iframe
  src="${process.env.NEXT_PUBLIC_BASE_URL}/chatbot-iframe/${agentId}"
  width="100%"
  style="height: 95vh"
  frameborder="0"
></iframe>`,
    [agentId]
  );




  // Render embed content based on privacy status
  const renderEmbedContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!settings.isPublic) {
      return (
        <>
          <p className="text-muted-foreground mb-6">
            The AI agent is private. To share the agent, change the visibility
            to public.
          </p>

          <Button
            variant="default"
            className="bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 dark:text-black"
            onClick={handleMakeAgentPublic}
            disabled={isMakeAgentPublicLoading}
          >
            {isMakeAgentPublicLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Making Public...
              </>
            ) : (
              "Make Public"
            )}
          </Button>
        </>
      );
    }

    // Show embed options when agent is public
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Your agent is public and can be shared with others.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative ring-[1px] ring-border rounded-lg py-4 px-4 text-start">
            <CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-primary fill-primary stroke-white" />
            <FramerIcon className="h-8 w-8 mb-2" />
            <div className="flex items-center mb-1">
              <span className="font-medium">Embed with iframe</span>
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Add the agent anywhere on your website as a customizable iframe.
            </p>
          </div>

          <EmbedCodeDisplay
            title="Embed the iframe directly"
            description="Add the agent anywhere on your website as a customizable iframe."
            code={iframeCode}
          />
        </div>
      </>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Connect</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left sidebar */}
        <div className="space-y-1">
          <TabButton
            icon={<FramerIcon className="mb-2.5 text-muted-foreground" />}
            label="Embed"
            active={true}
            onClick={() => { }}
          />
        </div>

        {/* Main content */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Embed</h2>
          {renderEmbedContent()}
        </div>
      </div>
    </div>
  );
}
