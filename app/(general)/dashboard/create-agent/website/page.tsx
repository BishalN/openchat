"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { GitBranch } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useSourceStore } from "@/store/use-agent-creation/use-source-store";

function FloatingActionBar({ count, onDelete, onRestore, onClose }: { count: number; onDelete: () => void; onRestore: () => void; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 32,
        transform: "translateX(-50%)",
        zIndex: 50,
        background: "var(--background)",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        border: "1px solid var(--muted)"
      }}
      className="shadow-lg border dark:bg-muted"
    >
      <span className="font-medium text-base">{count} selected</span>
      <Button variant="destructive" onClick={onDelete} className="flex items-center gap-2 px-4">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Delete
      </Button>
      <Button variant="outline" onClick={onRestore} className="flex items-center gap-2 px-4 text-green-600 border-green-400">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 12V7m0 5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Restore
      </Button>
      <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Button>
    </div>
  );
}

export default function WebsitePage() {
  const { websites, addWebsiteSource, removeWebsiteSource, updateWebsiteSource } = useSourceStore();
  const websiteSources = websites;
  const [websiteUrl, setWebsiteUrl] = useState("https://www.google.com");


  const { isPending, mutateAsync: addWebsiteSourceAsync } = trpc.agent.addWebsiteSource.useMutation();
  const [pendingWebsiteId, setPendingWebsiteId] = useState<string | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allIds = websiteSources.map((w) => w.url);
  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? allIds : []);
  };
  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };
  const handleDelete = () => {
    selectedIds.forEach((id) => removeWebsiteSource(id));
    setSelectedIds([]);
  };
  const handleRestore = () => {
    // Placeholder: implement restore logic if needed
    setSelectedIds([]);
  };
  const handleCloseBar = () => setSelectedIds([]);

  const handleFetchLink = async () => {
    if (websiteUrl) {
      try {
        addWebsiteSource(websiteUrl, websiteUrl);
        setPendingWebsiteId(websiteUrl);
        const data = await addWebsiteSourceAsync({ url: websiteUrl });
        // update the source with data from backend, delete the client side one,
        // TODO: persist this to local storage, with url as a key for later
        updateWebsiteSource(websiteUrl, data.markdown || "");
      } catch (error) {
        console.error("Error fetching links:", error);
      }
      setPendingWebsiteId(null);
      setWebsiteUrl("");
    }
  };

  return (
    <Card className="w-full p-8">
      <h2 className="text-2xl font-bold mb-6">Link</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Scrape a website and add it to your agent.
      </p>
      <form
        onSubmit={async e => {
          e.preventDefault();
          if (websiteUrl) {
            await handleFetchLink();
          }
        }}
        className="space-y-6"
      >
        <div>
          <Label htmlFor="individual-url" className="mb-2 block">URL</Label>
          <div className="flex gap-2">
            <Input
              id="individual-url"
              placeholder="www.example.com"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding..." : "Add link"}
          </Button>
        </div>
      </form>
      {/* Link sources section (shown if there are website sources) */}
      {websiteSources.length > 0 && (
        <div className="mt-10 border rounded-xl p-6 bg-background">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Link sources</h2>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm">Select all</Label>
          </div>
          <div className="space-y-2">
            {websiteSources.map((website) => {
              const checked = selectedIds.includes(website.url);
              return (
                <div key={website.url} className="flex items-center justify-between border rounded-md p-3 bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(checked) => handleSelectOne(website.url, !!checked)}
                    />
                    <div className="flex items-center gap-2">
                      {pendingWebsiteId === website.url ? (
                        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <GitBranch className="h-6 w-6 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium truncate max-w-[200px]">{website.url}</span>
                          <Badge variant="outline" className="text-green-700 border-green-400 bg-green-50">New</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {pendingWebsiteId === website.url ? (
                            <span className="text-orange-600">Crawling in-progress</span>
                          ) : (
                            <span>Last crawled Just now</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Floating action bar */}
      {selectedIds.length > 0 && (
        <FloatingActionBar
          count={selectedIds.length}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onClose={handleCloseBar}
        />
      )}
    </Card>
  );
}
