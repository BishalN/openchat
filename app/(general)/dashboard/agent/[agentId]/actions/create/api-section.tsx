
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash } from "lucide-react";
import { toast } from "sonner";

// TODO: while sending the api url to back remove the params from the url, just send the url
export function ApiSection({
    dataInputs,
    addDataInput,
    removeDataInput,
    updateDataInput,
    setDataInputs,
    apiMethod,
    setApiMethod,
    apiUrl,
    setApiUrl,
    apiTab,
    setApiTab,
    parameters,
    headers,
    body,
    addKeyValue,
    removeKeyValue,
    updateKeyValue,
    onSave,
    isSaving,
}: {
    dataInputs: Array<{ name: string; type: "Text" | "Number" | "Boolean" | "Date"; description: string; array: boolean }>;
    addDataInput: () => void;
    removeDataInput: (idx: number) => void;
    updateDataInput: (idx: number, field: string, value: any) => void;
    setDataInputs: (inputs: Array<{ name: string; type: "Text" | "Number" | "Boolean" | "Date"; description: string; array: boolean }>) => void;
    apiMethod: "GET" | "POST" | "PUT" | "DELETE";
    setApiMethod: (m: "GET" | "POST" | "PUT" | "DELETE") => void;
    apiUrl: string;
    setApiUrl: (u: string) => void;
    apiTab: string;
    setApiTab: (t: string) => void;
    parameters: Array<{ key: string; value: string }>;
    headers: Array<{ key: string; value: string }>;
    body: Array<{ key: string; value: string }>;
    addKeyValue: (type: string) => void;
    removeKeyValue: (type: string, idx: number) => void;
    updateKeyValue: (type: string, idx: number, field: string, value: any) => void;
    onSave: () => void;
    isSaving: boolean;
}) {
    const handleAddVariable = () => {
        // Generate a default variable name
        const variableCount = dataInputs.length + 1;
        const variableName = `variable_${variableCount}`;

        // Add variable placeholder to API URL
        const placeholder = `{{${variableName}}}`;
        setApiUrl(apiUrl + placeholder);

        // Add corresponding data input with default values directly
        const newDataInput = {
            name: variableName,
            type: "Text" as const,
            description: `Value for ${variableName}`,
            array: false
        };

        // Add the new data input directly to the state
        setDataInputs([...dataInputs, newDataInput]);

        toast("Variable added successfully", {
            description: `Added ${placeholder} to API URL and created data input`,
        });
    };
    return (
        <div className="space-y-6 py-2">
            {/* Data Inputs */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <div className="font-medium">Collect data inputs for action <span className="text-xs text-muted-foreground">(optional)</span></div>
                        <div className="text-xs text-muted-foreground max-w-2xl">List any information the AI Agent needs to perform the action. The agent can find the data in the chat history, request it from the user, or retrieve it from the user's metadata if available.</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={addDataInput}>
                        + Add data input
                    </Button>
                </div>
                {dataInputs.length > 0 && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-center">Array</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dataInputs.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <Input value={row.name} onChange={e => updateDataInput(idx, "name", e.target.value)} placeholder="e.g. status" />
                                        </TableCell>
                                        <TableCell>
                                            <select className="border rounded px-2 py-1 text-sm w-full" value={row.type} onChange={e => updateDataInput(idx, "type", e.target.value)}>
                                                <option>Text</option>
                                                <option>Number</option>
                                                <option>Boolean</option>
                                                <option>Date</option>
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <Input value={row.description} onChange={e => updateDataInput(idx, "description", e.target.value)} placeholder="e.g. active | canceled" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <input type="checkbox" checked={row.array} onChange={e => updateDataInput(idx, "array", e.target.checked)} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button size="icon" variant="ghost" onClick={() => removeDataInput(idx)} aria-label="Remove row">
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* API Request */}
            <div className="pt-6 border-t">
                <div className="font-medium mb-1">API request</div>
                <div className="text-xs text-muted-foreground mb-2 max-w-2xl">The API endpoint that should be called by the AI Agent to retrieve data or to send updates. You can include data inputs (variables) collected from the user in the URL or the request body.</div>
                <div className="flex gap-2 mb-2 items-center">
                    <select className="border rounded px-2 py-1 text-sm" value={apiMethod} onChange={e => setApiMethod(e.target.value as "GET" | "POST" | "PUT" | "DELETE")}>
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>
                    <Input placeholder="https://api.example.com/endpoint/{{item_id}}" value={apiUrl} onChange={e => setApiUrl(e.target.value)} className="flex-1" />
                    <Button size="sm" variant="outline" onClick={handleAddVariable}>+ Add variable</Button>
                </div>
                {/* Tabs for Parameters, Headers, Body */}
                <div className="flex gap-4 mb-2 mt-4">
                    <button type="button" className={`text-sm px-2 py-1 rounded ${apiTab === "parameters" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"}`} onClick={() => setApiTab("parameters")}>Parameters {parameters.length > 0 ? `(${parameters.length})` : ""}</button>
                    <button type="button" className={`text-sm px-2 py-1 rounded ${apiTab === "headers" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"}`} onClick={() => setApiTab("headers")}>Headers {headers.length > 0 ? `(${headers.length})` : ""}</button>
                    <button type="button" className={`text-sm px-2 py-1 rounded ${apiTab === "body" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"}`} onClick={() => setApiTab("body")}>Body {body.length > 0 ? `(${body.length})` : ""}</button>
                </div>
                <div>
                    {/* Key-value table for current tab */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(apiTab === "parameters" ? parameters : apiTab === "headers" ? headers : body).map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <Input value={row.key} onChange={e => updateKeyValue(apiTab, idx, "key", e.target.value)} placeholder="Key" />
                                    </TableCell>
                                    <TableCell>
                                        <Input value={row.value} onChange={e => updateKeyValue(apiTab, idx, "value", e.target.value)} placeholder="Value" />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button size="icon" variant="ghost" onClick={() => removeKeyValue(apiTab, idx)} aria-label="Remove row">
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => addKeyValue(apiTab)}>
                        + Add key value pair
                    </Button>
                    {apiTab === "parameters" && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Parameters are synchronized with the API URL. Changes here will update the URL above.
                        </p>
                    )}
                </div>
            </div>
            <Button onClick={onSave} className="mt-4">Save and continue</Button>
        </div>
    );
}