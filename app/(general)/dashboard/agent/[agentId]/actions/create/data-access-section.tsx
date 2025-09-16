import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useState, useEffect } from "react";

export function DataAccessSection({
    responsePairs,
    dataAccessType,
    setDataAccessType,
    allowedFields,
    setAllowedFields,
    onSave,
    isSaving,
}: {
    responsePairs: { key: string; value: string }[];
    dataAccessType: "full" | "limited";
    setDataAccessType: (type: "full" | "limited") => void;
    allowedFields: string[];
    setAllowedFields: (fields: string[]) => void;
    onSave: () => void;
    isSaving: boolean;
}) {
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(allowedFields));

    // Handle field selection
    const toggleField = (fieldKey: string) => {
        const newSelected = new Set(selectedFields);
        if (newSelected.has(fieldKey)) {
            newSelected.delete(fieldKey);
        } else {
            newSelected.add(fieldKey);
        }
        setSelectedFields(newSelected);
    };

    // Select all fields when switching to limited access
    const handleAccessChange = (newAccess: "full" | "limited") => {
        setDataAccessType(newAccess);
        if (newAccess === "limited") {
            // Pre-select all fields when switching to limited
            const allFields = responsePairs.map(pair => pair.key);
            setSelectedFields(new Set(allFields));
            setAllowedFields(allFields);
        } else {
            setSelectedFields(new Set());
            setAllowedFields([]);
        }
    };

    // Update allowed fields when selection changes
    useEffect(() => {
        setAllowedFields(Array.from(selectedFields));
    }, [selectedFields, setAllowedFields]);

    return (
        <div className="space-y-6 py-2">
            {/* Radio group for data access */}
            <div className="flex flex-col gap-2 mb-2">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="radio"
                        name="data-access"
                        checked={dataAccessType === "full"}
                        onChange={() => handleAccessChange("full")}
                        className="accent-primary mt-1"
                    />
                    <span>
                        <span className="font-medium block">Full data access</span>
                        <span className="text-xs text-muted-foreground block">Allow the AI agent to access all available information, ensuring comprehensive responses based on complete data.</span>
                    </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="radio"
                        name="data-access"
                        checked={dataAccessType === "limited"}
                        onChange={() => handleAccessChange("limited")}
                        className="accent-primary mt-1"
                    />
                    <span>
                        <span className="font-medium block">Limited data access</span>
                        <span className="text-xs text-muted-foreground block">Limit the information the AI agent can access, providing more controlled and specific replies while protecting sensitive data.</span>
                    </span>
                </label>
            </div>

            {/* Field selection for limited access */}
            {dataAccessType === "limited" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Select accessible fields</div>
                            <div className="text-xs text-muted-foreground">Choose which fields the AI agent can access from the API response</div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedFields(new Set(responsePairs.map(pair => pair.key)))}
                            >
                                Select All
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedFields(new Set())}
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded border border-border bg-background" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedFields.size === responsePairs.length && responsePairs.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedFields(new Set(responsePairs.map(pair => pair.key)));
                                                } else {
                                                    setSelectedFields(new Set());
                                                }
                                            }}
                                            className="rounded"
                                        />
                                    </TableHead>
                                    <TableHead className="w-1/2">Field Name</TableHead>
                                    <TableHead>Test Value</TableHead>
                                    <TableHead className="w-24">Access</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {responsePairs.map(({ key, value }) => (
                                    <TableRow key={key}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.has(key)}
                                                onChange={() => toggleField(key)}
                                                className="rounded"
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{key}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{value}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs px-2 py-1 rounded-full ${selectedFields.has(key)
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}>
                                                {selectedFields.has(key) ? "Allowed" : "Blocked"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Summary for full access */}
            {dataAccessType === "full" && (
                <div className="overflow-x-auto rounded border border-border bg-background" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/2">Field Name</TableHead>
                                <TableHead>Test Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {responsePairs.map(({ key, value }) => (
                                <TableRow key={key}>
                                    <TableCell className="font-mono text-sm">{key}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Button disabled={isSaving} onClick={onSave} className="mt-2" size="sm" variant="default">
                {isSaving ? "Saving..." : "Save"}
            </Button>
        </div>
    );
}
