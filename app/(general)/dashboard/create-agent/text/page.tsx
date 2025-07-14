"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSourceStore } from "@/store/use-agent-creation/use-source-store";
import { useState, useEffect } from "react";

export default function TextPage() {
  const { setTextSource, text } = useSourceStore();
  const [content, setContent] = useState(text?.content || "");

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    // Update store directly when content changes
    setTextSource(newContent);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Text</h2>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          placeholder="Enter text ..."
          className="min-h-[300px] resize-none"
        />
      </div>
    </div>
  );
}
