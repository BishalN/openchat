"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSourcesStore } from "@/store/use-sources-store";
import { nanoid } from "nanoid";

const calculateSize = (text: string) => new TextEncoder().encode(text).length;

export default function TextPage() {
  const { sources, addSource, updateSource, removeSource } = useSourcesStore();
  const textSource = sources.find((s) => s.type === "text");
  const [content, setContent] = useState(textSource?.content || "");

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (textSource) {
      updateSource(textSource.id, {
        content: newContent,
        size: calculateSize(newContent),
      });
    } else {
      addSource({
        id: nanoid(),
        type: "text",
        name: "Text Content",
        content: newContent,
        size: calculateSize(newContent),
      });
    }
  };

  const handleClear = () => {
    setContent("");
    if (textSource) {
      removeSource(textSource.id);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Text</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          placeholder="Enter text content..."
          className="min-h-[400px] resize-none"
        />
        {content && (
          <p className="text-xs text-muted-foreground">
            Size: {calculateSize(content)} bytes ({content.length} characters)
          </p>
        )}
      </div>
    </div>
  );
}
