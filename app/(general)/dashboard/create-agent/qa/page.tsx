"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import {
  useSourceStore,
  calculateTextSize,
} from "@/store/use-agent-creation/use-source-store";

export default function QAPage() {
  const { qa, setQASource, addQAPair, updateQAPair, removeQAPair } =
    useSourceStore();

  const handleAddPair = () => {
    if (!qa) {
      // Initialize QA source if it doesn't exist
      setQASource([{ question: "", answer: "" }]);
    } else {
      addQAPair("", "");
    }
  };

  const handleDeletePair = (index: number) => {
    removeQAPair(index);
  };

  const handleDeleteAll = () => {
    setQASource([]);
  };

  const handleUpdateQuestion = (index: number, question: string) => {
    if (qa) {
      updateQAPair(index, question, qa.qaPairs[index].answer);
    }
  };

  const handleUpdateAnswer = (index: number, answer: string) => {
    if (qa) {
      updateQAPair(index, qa.qaPairs[index].question, answer);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Q&A</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDeleteAll}>
            Delete all
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddPair}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!qa || qa.qaPairs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No Q&A pairs added. Click the + button to add one.
        </div>
      ) : (
        <div className="space-y-8">
          {qa.qaPairs.map((pair, index) => (
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
                Question: {calculateTextSize(pair.question)} B (
                {pair.question.length}) • Answer:{" "}
                {calculateTextSize(pair.answer)} B ({pair.answer.length}) •
                {calculateTextSize(pair.question) +
                  calculateTextSize(pair.answer)}{" "}
                B total
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
