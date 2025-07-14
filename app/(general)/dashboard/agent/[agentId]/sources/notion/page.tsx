"use client";

import { Button } from "@/components/ui/button";
import { useSourcesStore } from "@/store/use-sources-store";
import { nanoid } from "nanoid";

export default function NotionPage() {
  // TODO: Will enable this when the feature is ready
  if (true) {
    return <div>Coming soon</div>;
  }

  const { addSource } = useSourcesStore();

  const handleConnectNotion = async () => {
    // This would typically connect to Notion's OAuth flow
    // For now, we'll just add a placeholder source
    addSource({
      id: nanoid(),
      type: "notion",
      name: "Notion Integration",
      url: "",
      size: 0,
    });
  };

  return (
    <div className="space-y-6 flex flex-col items-center justify-center min-h-[300px]">
      <h2 className="text-xl font-semibold">Notion</h2>

      <Button className="flex items-center gap-2" onClick={handleConnectNotion}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 7V17M15 7V17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 7H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 17H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Connect to Notion
      </Button>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        Connect your Notion workspace to import pages and databases as training
        data for your AI agent.
      </p>
    </div>
  );
}
