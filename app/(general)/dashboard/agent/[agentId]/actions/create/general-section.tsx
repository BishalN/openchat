import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function GeneralSection({
    actionName,
    setActionName,
    whenToUse,
    setWhenToUse,
    onSave,
    isSaving,
}: {
    actionName: string;
    setActionName: (name: string) => void;
    whenToUse: string;
    setWhenToUse: (text: string) => void;
    onSave: () => void;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-4 py-2">
            <div>
                <label className="block text-sm font-medium mb-1">Action Name</label>
                <Input
                    placeholder="e.g. Get Weather"
                    value={actionName}
                    onChange={(e) => setActionName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">A descriptive name for this action. This will help the AI agent know when to use it.</p>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">When to use</label>
                <Textarea
                    placeholder="Describe when the AI agent should use this action. Include examples."
                    rows={4}
                    value={whenToUse}
                    onChange={(e) => setWhenToUse(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Detailed description explaining when the AI agent should use this action and API. Include examples of the data this action provides and customer queries it helps answer.</p>
            </div>
            <Button
                className="mt-4"
                onClick={onSave}
                disabled={isSaving || !actionName.trim() || !whenToUse.trim()}
            >
                {isSaving ? "Saving..." : "Save and Continue"}
            </Button>
        </div>
    );
}