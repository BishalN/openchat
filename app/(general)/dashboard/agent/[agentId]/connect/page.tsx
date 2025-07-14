"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  MessageCircleIcon,
  FramerIcon,
  CircleCheck,
} from "lucide-react";
import * as RadixRadioGroup from "@radix-ui/react-radio-group";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAgentSettings } from "@/hooks/use-settings-mutation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Define types
type TabType = "embed" | "share" | "integrations";
type EmbedType = "bubble" | "iframe";

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface EmbedOption {
  value: EmbedType;
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
  const [activeTab, setActiveTab] = useState<TabType>("embed");
  const [embedType, setEmbedType] = useState<EmbedType>("iframe");

  const { agentId } = useParams();

  const {
    settings,
    handleMakeAgentPublic,
    isMakeAgentPublicLoading,
    isLoading,
  } = useAgentSettings(agentId as string);

  // Define embed options - moved outside the render cycle
  const embedOptions: EmbedOption[] = useMemo(
    () => [
      // {
      //   value: "bubble",
      //   label: "Embed a chat bubble",
      //   description:
      //     "Embed a chat bubble on your website. Allows users to interact with your agent.",
      //   icon: <MessageCircleIcon className="mb-2.5 text-muted-foreground" />,
      //   isRecommended: true,
      // },
      {
        value: "iframe",
        label: "Embed the iframe directly",
        description:
          "Add the agent anywhere on your website as a customizable iframe.",
        icon: <FramerIcon className="mb-2.5 text-muted-foreground" />,
        isRecommended: false,
      },
    ],
    []
  );

  // Build embed codes based on agentId
  const bubbleCode = useMemo(
    () =>
      `<script src="https://cdn.openchat.co/widget.js" id="openchat-widget" data-id="${agentId}"></script>`,
    [agentId]
  );

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

  // Handler for changing the embed type
  const handleEmbedTypeChange = (value: string) => {
    setEmbedType(value as EmbedType);
  };

  // SVG icons for tabs
  const embedIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 20L14 4M18 8L22 12L18 16M6 16L2 12L6 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const shareIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.68387 13.3419C8.88616 12.9381 9 12.4824 9 12C9 11.5176 8.88616 11.0619 8.68387 10.6581M8.68387 13.3419C8.19134 14.3251 7.17449 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.17449 9 8.19134 9.67492 8.68387 10.6581M8.68387 13.3419L15.3161 16.6581M8.68387 10.6581L15.3161 7.34193M15.3161 7.34193C15.8087 8.32508 16.8255 9 18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 6.48237 15.1138 6.93815 15.3161 7.34193ZM15.3161 16.6581C15.1138 17.0619 15 17.5176 15 18C15 19.6569 16.3431 21 18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C16.8255 15 15.8087 15.6749 15.3161 16.6581Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const integrationsIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 3V19M15 19L9 13M15 19L21 13M9 21V5M9 5L3 11M9 5L15 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
          <RadixRadioGroup.Root
            value={embedType}
            onValueChange={handleEmbedTypeChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {embedOptions.map((option) => (
              <RadixRadioGroup.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative group ring-[1px] ring-border rounded-lg py-4 px-4 text-start",
                  "data-[state=checked]:ring-2 data-[state=checked]:ring-primary"
                )}
              >
                <CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-primary fill-primary stroke-white group-data-[state=unchecked]:hidden" />

                {option.icon}
                <div className="flex items-center mb-1">
                  <span className="font-medium">{option.label}</span>
                  {option.isRecommended && option.value === embedType && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </RadixRadioGroup.Item>
            ))}
          </RadixRadioGroup.Root>

          {embedType === "bubble" && (
            <EmbedCodeDisplay
              title="Embed a chat bubble"
              description="Embed a chat bubble on your website. Allows users to interact with your agent."
              code={bubbleCode}
            />
          )}

          {embedType === "iframe" && (
            <EmbedCodeDisplay
              title="Embed the iframe directly"
              description="Add the agent anywhere on your website as a customizable iframe."
              code={iframeCode}
            />
          )}
        </div>
      </>
    );
  };

  const renderShareContent = () => {
    if (settings.isPublic) {
      const shareUrl = `https://www.openchat.co/chatbot/${agentId}`;
      return (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Share your agent with others using this unique link:
          </p>

          <div className="flex items-center space-x-2">
            <Input readOnly value={shareUrl} className="font-mono text-sm" />
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      );
    }

    return (
      <p className="text-muted-foreground">
        Make your agent public first to get a shareable link.
      </p>
    );
  };

  const renderIntegrationsContent = () => (
    <>
      <p className="text-muted-foreground">
        Connect your agent with other platforms and services.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Discord</CardTitle>
            <CardDescription>Add your chatbot to Discord</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled={!settings.isPublic}>
              {settings.isPublic ? "Connect" : "Make Public First"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slack</CardTitle>
            <CardDescription>
              Add your chatbot to Slack workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled={!settings.isPublic}>
              {settings.isPublic ? "Connect" : "Make Public First"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Connect</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left sidebar */}
        <div className="space-y-1">
          <TabButton
            icon={embedIcon}
            label="Embed"
            active={activeTab === "embed"}
            onClick={() => setActiveTab("embed")}
          />
          {/* TODO: Add this to roadmap */}
          {/* <TabButton
            icon={shareIcon}
            label="Share"
            active={activeTab === "share"}
            onClick={() => setActiveTab("share")}
          />
          <TabButton
            icon={integrationsIcon}
            label="Integrations"
            active={activeTab === "integrations"}
            onClick={() => setActiveTab("integrations")}
          /> */}
        </div>

        {/* Main content */}
        <div className="border rounded-lg p-6">
          {activeTab === "embed" && (
            <>
              <h2 className="text-xl font-semibold mb-6">Embed</h2>
              {renderEmbedContent()}
            </>
          )}

          {activeTab === "share" && (
            <>
              <h2 className="text-xl font-semibold mb-6">Share</h2>
              {renderShareContent()}
            </>
          )}

          {activeTab === "integrations" && (
            <>
              <h2 className="text-xl font-semibold mb-6">Integrations</h2>
              {renderIntegrationsContent()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
