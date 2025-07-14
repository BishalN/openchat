"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfoIcon as InfoCircle, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSourcesStore } from "@/store/use-sources-store";
import { nanoid } from "nanoid";

export default function WebsitePage() {
  // TODO: Will enable this when the feature is ready
  if (true) {
    return <div>Coming soon</div>;
  }

  const { sources, addSource, removeSource } = useSourcesStore();
  const websiteSources = sources.filter((s) => s.type === "website");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");

  const handleAddUrl = () => {
    if (websiteUrl) {
      addSource({
        id: nanoid(),
        type: "website",
        name: new URL(websiteUrl).hostname,
        url: websiteUrl,
        size: 0,
      });
      setWebsiteUrl("");
    }
  };

  const handleLoadSitemap = () => {
    if (sitemapUrl) {
      addSource({
        id: nanoid(),
        type: "website",
        name: new URL(sitemapUrl).hostname,
        url: sitemapUrl,
        size: 0,
      });
      setSitemapUrl("");
    }
  };

  const handleDeleteWebsite = (id: string) => {
    removeSource(id);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">Website</h2>

      {/* Crawl section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Crawl</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-80 text-sm">
                  This will crawl all the links starting with the URL
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="https://www.example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddUrl}>Add URL</Button>
        </div>
      </div>

      {/* OR separator */}
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      {/* Sitemap section */}
      <div className="space-y-4">
        <div className="font-medium">Submit Sitemap</div>

        <div className="flex gap-2">
          <Input
            placeholder="https://www.example.com/sitemap.xml"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleLoadSitemap}>Load sitemap</Button>
        </div>
      </div>

      {/* Added URLs section */}
      {websiteSources.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h3 className="font-medium">Added URLs</h3>
          <div className="space-y-2">
            {websiteSources.map((website) => (
              <div
                key={website.id}
                className="flex items-center justify-between border rounded-md p-3"
              >
                <span className="text-sm font-medium">{website.url}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteWebsite(website.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
