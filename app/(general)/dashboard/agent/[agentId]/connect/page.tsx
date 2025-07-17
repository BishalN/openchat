"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  FramerIcon,
  CircleCheck,
  Copy,
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
    agent,
    handleMakeAgentPublic,
    isMakeAgentPublicLoading,
    isLoading,
  } = useAgentSettings(agentId as string);

  const { toast } = useToast();

  // Embed option state
  const [selectedEmbed, setSelectedEmbed] = useState<"chatbubble" | "iframe">("chatbubble");

  const chatBubbleCode = useMemo(
    () => {
      // Example identity data
      const data = {
        user_id: "1234567890",
        user_hash: "1234567890", // hash of user_id, generated on the server
        user_metadata: {
          name: "John Doe",
          email: "john@example.com",
          company: "Acme Inc",
          // Add any other relevant user information
        },
      };
      const encodedData = encodeURIComponent(JSON.stringify(data));
      return `<iframe
  src="${process.env.NEXT_PUBLIC_BASE_URL}/chatbot-iframe/${agentId}/?data=${encodedData}"
  width="100%"
  style="height: 95vh"
  frameborder="0"
></iframe>`;
    },
    [agentId]
  );

  // Iframe embed code
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

  // Secret key logic
  const secretKey = agent?.secretKey || "";
  const maskedSecret = secretKey ? secretKey.slice(0, 4) + "••••••••" + secretKey.slice(-4) : "••••••••••";
  const copySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      toast({ title: "Secret key copied", description: "Keep it safe!", duration: 4000 });
    }
  };
  const codeSample = `const crypto = require('crypto');\nconst secret = '${secretKey || "••••••••••"}'; // Your verification secret key\nconst userId = current_user.id; // A string UUID to identify your user\nconst hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');`;
  const copyCode = () => {
    navigator.clipboard.writeText(codeSample);
    toast({ title: "Code copied to clipboard", description: "Paste it into your server code.", duration: 4000 });
  };

  // Copy embed code
  const copyEmbedCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied to clipboard", description: "You can now paste it into your website.", duration: 5000 });
  };

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
            The AI agent is private. To share the agent, change the visibility to public.
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
          <p className="text-muted-foreground">Your agent is public and can be shared with others.</p>
        </div>
        {/* Radio group card style for embed options */}
        <div className="flex gap-4 mb-6">
          <div
            className={`flex-1 border rounded-lg p-4 cursor-pointer transition ring-2 ${selectedEmbed === "chatbubble" ? "ring-primary bg-primary/5" : "ring-border bg-background"}`}
            onClick={() => setSelectedEmbed("chatbubble")}
            role="radio"
            aria-checked={selectedEmbed === "chatbubble"}
            tabIndex={0}
          >
            <div className="flex items-center gap-3 mb-2">
              <FramerIcon className="h-6 w-6 text-primary" />
              <span className="font-medium">Embed a chat bubble</span>
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Recommended</span>
            </div>
            <div className="text-sm text-muted-foreground">Embed a chat bubble on your website. Allows you to use all the advanced features of the agent.</div>
          </div>
          <div
            className={`flex-1 border rounded-lg p-4 cursor-pointer transition ring-2 ${selectedEmbed === "iframe" ? "ring-primary bg-primary/5" : "ring-border bg-background"}`}
            onClick={() => setSelectedEmbed("iframe")}
            role="radio"
            aria-checked={selectedEmbed === "iframe"}
            tabIndex={0}
          >
            <div className="flex items-center gap-3 mb-2">
              <FramerIcon className="h-6 w-6 text-primary" />
              <span className="font-medium">Embed the iframe directly</span>
            </div>
            <div className="text-sm text-muted-foreground">Add the agent anywhere on your website as a customizable iframe.</div>
          </div>
        </div>
        {/* Conditionally render embed code and identity verification */}
        {selectedEmbed === "chatbubble" && (
          <>
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Embed a chat bubble</CardTitle>
                  <CardDescription>Paste this code before the closing <code>&lt;/body&gt;</code> tag on your website.<br />
                    <span className="block mt-2 text-xs text-muted-foreground">
                      <b>Identity Verification:</b> You can pass user info for identity verification using the <code>data</code> query parameter. Example below:
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-w-xl">
                  <div className="mb-4 bg-muted/50 rounded-md p-4 font-mono text-sm overflow-auto">
                    {chatBubbleCode}
                  </div>
                  <Button variant="secondary" onClick={() => copyEmbedCode(chatBubbleCode)}>
                    Copy Code
                  </Button>
                  <div className="mt-4">
                    <div className="mb-2 font-semibold text-sm">Example <code>data</code> object:</div>
                    <pre className="bg-muted/50 rounded-md p-4 font-mono text-xs overflow-auto whitespace-pre-wrap">{`
{
  user_id: "1234567890",
  user_hash: "1234567890", // this is the hash of the user_id, should be generated on the server
  user_metadata: {
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Inc"
    // Add any other relevant user information
  }
}`}</pre>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <b>How to use:</b> JSON.stringify your data object, then encodeURIComponent it, and append as <code>?data=...</code> in the iframe <code>src</code>.<br />
                      <b>Example in JS:</b>
                      <pre className="bg-muted/50 rounded-md p-4 font-mono text-xs overflow-auto whitespace-pre-wrap">{`const data = {
  user_id: "1234567890",
  user_hash: "1234567890",
  user_metadata: {
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Inc"
  }
};
const encodedData = encodeURIComponent(JSON.stringify(data));
const iframeSrc = \
  \`${process.env.NEXT_PUBLIC_BASE_URL}/chatbot-iframe/${agentId}/?data=\${encodedData}\`;
`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Divider */}
            <div className="my-8 border-t" />
            {/* For identity verification section */}
            <div>
              <h3 className="font-semibold text-lg mb-2">For identity verification</h3>
              <div className="mb-2 text-sm text-muted-foreground">On the server</div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-base bg-muted/50 px-3 py-1 rounded select-all">{maskedSecret}</span>
                <Button size="icon" variant="ghost" onClick={copySecret} title="Copy secret key" disabled={!secretKey}>
                  <Copy className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">Secret key</span>
              </div>
              <div className="mb-2 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
                <b>Keep your secret key safe!</b> Never commit it directly to your repository, client-side code, or anywhere a third party can find it.
              </div>
              <div className="mb-2 text-sm">You'll need to generate an HMAC on your server for each logged-in user and send it to Chatbuddy.</div>
              <div className="relative mb-4">
                <pre className="bg-muted/50 rounded-md p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">{codeSample}</pre>
                <Button size="icon" variant="ghost" onClick={copyCode} className="absolute top-2 right-2" title="Copy code sample">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
        {selectedEmbed === "iframe" && (
          <EmbedCodeDisplay
            title="Embed the iframe directly"
            description="Add the agent anywhere on your website as a customizable iframe."
            code={iframeCode}
          />
        )}
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
