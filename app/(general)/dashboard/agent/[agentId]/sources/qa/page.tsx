"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { useSourcesStore } from "@/store/use-sources-store";
import { nanoid } from "nanoid";

const calculateSize = (text: string) => new TextEncoder().encode(text).length;

interface QAPair {
  question: string;
  answer: string;
}

export default function QAPage() {
  const { sources, addSource, updateSource, removeSource } = useSourcesStore();
  const qaSource = sources.find((s) => s.type === "qa");

  const handleAddPair = () => {
    if (!qaSource) {
      addSource({
        id: nanoid(),
        type: "qa",
        name: "Q&A Pairs",
        qaPairs: [{ question: "", answer: "" }],
        size: 0,
      });
    } else {
      const newPairs = [
        ...(qaSource.qaPairs || []),
        { question: "", answer: "" },
      ];
      updateSource(qaSource.id, {
        qaPairs: newPairs,
        size: calculateTotalSize(newPairs),
      });
    }
  };

  const handleDeletePair = (index: number) => {
    if (qaSource && qaSource.qaPairs) {
      const newPairs = qaSource.qaPairs.filter((_, i) => i !== index);
      if (newPairs.length === 0) {
        removeSource(qaSource.id);
      } else {
        updateSource(qaSource.id, {
          qaPairs: newPairs,
          size: calculateTotalSize(newPairs),
        });
      }
    }
  };

  const calculateTotalSize = (pairs: QAPair[]) => {
    return pairs.reduce((total, pair) => {
      return total + calculateSize(pair.question) + calculateSize(pair.answer);
    }, 0);
  };

  const handleUpdateQuestion = (index: number, question: string) => {
    if (qaSource && qaSource.qaPairs) {
      const newPairs = qaSource.qaPairs.map((pair, i) =>
        i === index ? { ...pair, question } : pair
      );
      updateSource(qaSource.id, {
        qaPairs: newPairs,
        size: calculateTotalSize(newPairs),
      });
    }
  };

  const handleUpdateAnswer = (index: number, answer: string) => {
    if (qaSource && qaSource.qaPairs) {
      const newPairs = qaSource.qaPairs.map((pair, i) =>
        i === index ? { ...pair, answer } : pair
      );
      updateSource(qaSource.id, {
        qaPairs: newPairs,
        size: calculateTotalSize(newPairs),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Q&A Pairs</h2>
        <Button onClick={handleAddPair} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Pair
        </Button>
      </div>

      {qaSource?.qaPairs && qaSource.qaPairs.length > 0 ? (
        <div className="space-y-8">
          {qaSource.qaPairs.map((pair, index) => (
            <div key={index} className="space-y-4 border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Question</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePair(index)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <Textarea
                placeholder="Enter your question here..."
                value={pair.question}
                onChange={(e) => handleUpdateQuestion(index, e.target.value)}
                className="min-h-[100px]"
              />

              <div className="font-medium">Answer</div>

              <Textarea
                placeholder="Enter your answer here..."
                value={pair.answer}
                onChange={(e) => handleUpdateAnswer(index, e.target.value)}
                className="min-h-[100px]"
              />

              <div className="text-xs text-muted-foreground">
                Question: {calculateSize(pair.question)} bytes (
                {pair.question.length} chars) • Answer:{" "}
                {calculateSize(pair.answer)} bytes ({pair.answer.length} chars)
                • Total:{" "}
                {calculateSize(pair.question) + calculateSize(pair.answer)}{" "}
                bytes
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No Q&A pairs added yet. Click the button above to add one.</p>
        </div>
      )}
    </div>
  );
}
