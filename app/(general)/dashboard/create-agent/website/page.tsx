"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfoIcon as InfoCircle, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WebsitePage() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");

  // TODO: Will enable this when the feature is ready
  if (true) {
    return <div>Coming soon</div>;
  }

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
          <Button>Fetch links</Button>
        </div>

        <p className="text-sm text-muted-foreground">
          This will crawl all the links starting with the URL (not including
          files on the website).
        </p>
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
          <Button variant="secondary">Load sitemap</Button>
        </div>
      </div>

      {/* Included Links section */}
      <div className="space-y-4">
        <Separator />
        <div className="font-medium text-center">Included Links</div>
        <Separator />

        <div className="flex justify-end">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            <span className="sr-only">Add link</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
