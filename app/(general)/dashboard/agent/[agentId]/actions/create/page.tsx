"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Trash } from "lucide-react";
import { useCustomActions } from "@/hooks/use-custom-actions";
import { toast } from "sonner";
import { extractQueryParameters, buildUrlWithParams, getBaseUrl, flattenJson } from "@/lib/utils";

// TODO: by default keep actions as inactive and user should make it active
// also bunch of ui / testing is not working, fix that

// General Section Component
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

// TODO: while sending the api url to back remove the params from the url, just send the url
// API Section Component
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


export function TestResponseSection({
    dataInputs,
    config,
    onTestResult,
}: {
    dataInputs: Array<{ name: string; type: string; description: string; array: boolean }>;
    config: any;
    onTestResult: (pairs: { key: string; value: string }[]) => void;
}) {
    // Token values
    const [tokenValues, setTokenValues] = useState<{ [key: string]: string }>({});
    // JSON response from actual API call
    const [jsonResponse, setJsonResponse] = useState("");
    // Key-value pairs from response
    const [kvPairs, setKvPairs] = useState<{ key: string; value: string }[]>([]);

    // Error state
    const [error, setError] = useState<string | null>(null);
    // Loading state for API calls
    const [isLoading, setIsLoading] = useState(false);

    // Sync token values with dataInputs
    useEffect(() => {
        const initial: { [key: string]: string } = {};
        dataInputs.forEach((input) => {
            if (!(input.name in tokenValues)) {
                initial[input.name] = "";
            } else {
                initial[input.name] = tokenValues[input.name];
            }
        });
        setTokenValues(initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataInputs]);



    // Line numbers for code block
    const lines = (jsonResponse || "").split("\n");

    // Handle test response
    const handleTestResponse = async () => {
        setError(null);
        setIsLoading(true);

        // Live mode - make actual API call
        try {
            if (!config.apiUrl) {
                setError("API URL is required");
                setIsLoading(false);
                return;
            }

            // Build the URL with token replacements
            let url = config.apiUrl;
            Object.entries(tokenValues).forEach(([key, value]) => {
                const placeholder = `{{${key}}}`;
                url = url.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
            });

            // Build request options
            const requestOptions: RequestInit = {
                method: config.apiMethod || 'GET',
                headers: {},
            };

            // Add headers
            if (config.headers) {
                config.headers.forEach((header: { key: string; value: string }) => {
                    if (header.key && header.value) {
                        requestOptions.headers = {
                            ...requestOptions.headers,
                            [header.key]: header.value
                        };
                    }
                });
            }

            // Add query parameters
            if (config.parameters && config.parameters.length > 0) {
                const urlObj = new URL(url);
                config.parameters.forEach((param: { key: string; value: string }) => {
                    if (param.key && param.value) {
                        // Replace tokens in parameter values
                        let paramValue = param.value;
                        Object.entries(tokenValues).forEach(([key, value]) => {
                            const placeholder = `{{${key}}}`;
                            paramValue = paramValue.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
                        });
                        urlObj.searchParams.append(param.key, paramValue);
                    }
                });
                url = urlObj.toString();
            }

            // Add body for POST/PUT requests
            if ((config.apiMethod === 'POST' || config.apiMethod === 'PUT') && config.body && config.body.length > 0) {
                const bodyObj: any = {};
                config.body.forEach((item: { key: string; value: string }) => {
                    if (item.key && item.value) {
                        // Replace tokens in body values
                        let bodyValue = item.value;
                        Object.entries(tokenValues).forEach(([key, value]) => {
                            const placeholder = `{{${key}}}`;
                            bodyValue = bodyValue.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
                        });
                        bodyObj[item.key] = bodyValue;
                    }
                });
                requestOptions.body = JSON.stringify(bodyObj);
                requestOptions.headers = {
                    ...requestOptions.headers,
                    'Content-Type': 'application/json'
                };
            }

            console.log('Making API request:', { url, options: requestOptions });

            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            let responseData;

            try {
                responseData = JSON.parse(responseText);
                setJsonResponse(JSON.stringify(responseData, null, 2));
            } catch {
                // If not JSON, show as text
                setJsonResponse(responseText);
                responseData = { raw: responseText };
            }

            const flat = flattenJson(responseData);
            const pairs = Object.entries(flat).map(([key, value]) => ({ key, value }));
            setKvPairs(pairs);
            onTestResult(pairs);

        } catch (e: any) {
            console.error('API call failed:', e);
            setError(e.message || "Failed to make API request");
            setKvPairs([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 py-2">
            {/* Radio group for mode */}
            <div className="flex flex-col gap-2 mb-2">
                <label className="flex items-start gap-3 cursor-pointer">
                    <span>
                        <span className="font-medium block">Live response</span>
                        <span className="text-xs text-muted-foreground block">Test with live data from the API to make sure it is configured correctly.</span>
                    </span>
                </label>
            </div>


            {/* Data Input Values */}
            {dataInputs.length > 0 ? (
                <div className="space-y-3">
                    <div className="font-medium">Data Input Values</div>
                    <div className="text-xs text-muted-foreground mb-2">Enter values for the data inputs to test the API call</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dataInputs.map((input) => (
                            <div key={input.name} className="space-y-1">
                                <label className="text-sm font-medium">{input.name}</label>
                                <Input
                                    placeholder={`Enter ${input.name.toLowerCase()}`}
                                    value={tokenValues[input.name] || ""}
                                    onChange={(e) => setTokenValues({
                                        ...tokenValues,
                                        [input.name]: e.target.value
                                    })}
                                />
                                <p className="text-xs text-muted-foreground">{input.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground">
                    No data inputs configured. The API will be called without any dynamic parameters.
                </div>
            )}

            {/* Test response button */}
            <Button
                className="mt-2"
                size="sm"
                variant="outline"
                onClick={handleTestResponse}
                disabled={isLoading}
            >
                {isLoading ? "Testing..." : "Test response"}
            </Button>
            {error && <div className="text-red-600 text-xs mt-1">{error}</div>}

            {/* Key-value table from response */}
            {kvPairs.length > 0 && (
                <div className="overflow-x-auto rounded border border-border" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/3">Key</TableHead>
                                <TableHead>Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kvPairs.map(({ key, value }) => (
                                <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>{value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* JSON response viewer with line numbers and syntax highlighting */}
            {jsonResponse && (
                <div className="bg-[#f8fafc] border border-border rounded-md overflow-x-auto text-xs font-mono relative" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="flex">
                        <div className="py-2 px-2 text-right select-none bg-[#f3f4f6] text-muted-foreground rounded-l-md border-r border-border">
                            {lines.map((_, i: number) => (
                                <div key={i} className="h-5 leading-5">{i + 1}</div>
                            ))}
                        </div>
                        <pre className="py-2 px-2 whitespace-pre-wrap overflow-x-auto" style={{ minWidth: 0 }}>
                            <code dangerouslySetInnerHTML={{ __html: jsonResponse }} />
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

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



// TODO: use react-hook-form with zod resolver to validate the form
export default function CreateCustomActionPage() {
    const router = useRouter();
    const params = useParams();
    const agentId = params.agentId as string;

    // Use the custom actions hook
    const { createAction, isCreating, } = useCustomActions(agentId);

    const [openSection, setOpenSection] = useState("general");

    // Form state
    const [actionName, setActionName] = useState("");
    const [whenToUse, setWhenToUse] = useState("");

    // Data input table state
    const [dataInputs, setDataInputs] = useState<Array<{ name: string; type: "Text" | "Number" | "Boolean" | "Date"; description: string; array: boolean }>>([]);

    // API request state
    const [apiMethod, setApiMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
    const [apiUrl, setApiUrl] = useState("");

    // Tabs for params/headers/body
    const [apiTab, setApiTab] = useState("parameters");
    const [parameters, setParameters] = useState<Array<{ key: string; value: string }>>([]);
    const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);
    const [body, setBody] = useState<Array<{ key: string; value: string }>>([]);

    // Test response state
    const [kvPairs, setKvPairs] = useState<{ key: string; value: string }[]>([]);

    // Data access state
    const [dataAccessType, setDataAccessType] = useState<"full" | "limited">("full");
    const [allowedFields, setAllowedFields] = useState<string[]>([]);

    // Synchronize URL with parameters
    useEffect(() => {
        if (apiUrl) {
            const urlParams = extractQueryParameters(apiUrl);
            setParameters(urlParams);
        }
    }, [apiUrl]);

    // Data input handlers
    const addDataInput = () => setDataInputs([...dataInputs, { name: "", type: "Text", description: "", array: false }]);
    const removeDataInput = (idx: number) => setDataInputs(dataInputs.filter((_, i) => i !== idx));
    const updateDataInput = (idx: number, field: string, value: any) => setDataInputs(dataInputs.map((row, i) => i === idx ? { ...row, [field]: value } : row));

    // Key-value pair handlers
    const addKeyValue = (type: string) => {
        if (type === "parameters") {
            const newParameters = [...parameters, { key: "", value: "" }];
            setParameters(newParameters);
            // Update URL with new parameters
            const baseUrl = getBaseUrl(apiUrl);
            const newUrl = buildUrlWithParams(baseUrl, newParameters);
            setApiUrl(newUrl);
        }
        if (type === "headers") setHeaders([...headers, { key: "", value: "" }]);
        if (type === "body") setBody([...body, { key: "", value: "" }]);
    };
    const removeKeyValue = (type: string, idx: number) => {
        if (type === "parameters") {
            const newParameters = parameters.filter((_, i) => i !== idx);
            setParameters(newParameters);
            // Update URL with new parameters
            const baseUrl = getBaseUrl(apiUrl);
            const newUrl = buildUrlWithParams(baseUrl, newParameters);
            setApiUrl(newUrl);
        }
        if (type === "headers") setHeaders(headers.filter((_, i) => i !== idx));
        if (type === "body") setBody(body.filter((_, i) => i !== idx));
    };
    const updateKeyValue = (type: string, idx: number, field: string, value: any) => {
        if (type === "parameters") {
            const newParameters = parameters.map((row, i) => i === idx ? { ...row, [field]: value } : row);
            setParameters(newParameters);
            // Update URL with new parameters
            const baseUrl = getBaseUrl(apiUrl);
            const newUrl = buildUrlWithParams(baseUrl, newParameters);
            setApiUrl(newUrl);
        }
        if (type === "headers") setHeaders(headers.map((row, i) => i === idx ? { ...row, [field]: value } : row));
        if (type === "body") setBody(body.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };

    // Handle test result
    const handleTestResult = (pairs: { key: string; value: string }[]) => {
        console.log("test result", pairs);
        setKvPairs(pairs);
    };

    // Create config object
    const createConfig = () => ({
        dataInputs,
        apiMethod,
        apiUrl: getBaseUrl(apiUrl), // Use base URL without parameters for API calls
        parameters, // Parameters are handled separately
        headers,
        body,
        dataAccessType,
        allowedFields: dataAccessType === "limited" ? allowedFields : undefined,
    });

    // Handle save for each section
    const handleGeneralSave = () => {
        console.log("general save");
        if (!actionName.trim() || !whenToUse.trim()) {
            toast("Please fill in all required fields", {
                description: "Action name and when to use are required",
                className: "bg-red-500 text-white",
            });
            return;
        }
        setOpenSection("api");
    };

    const handleApiSave = () => {
        console.log("api save");
        if (!apiUrl.trim()) {
            toast("Please enter a valid API URL", {
                description: "The API URL is required",
                className: "bg-red-500 text-white",
            });
            return;
        }
        setOpenSection("test");
    };


    const handleDataAccessSave = () => {
        console.log("data access save");
        if (dataAccessType === "limited" && allowedFields.length === 0) {
            toast("Please select at least one field for limited access", {
                description: "At least one field is required for limited access",
                className: "bg-red-500 text-white",
            });
            return;
        }

        // TODO: toast error message on failure is not showing up
        // Create the custom action
        const config = createConfig();
        console.log("config", JSON.stringify(config, null, 2));
        createAction({
            agentId,
            name: actionName,
            whenToUse,
            config,
        });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <h1 className="text-xl font-bold">Create Custom Action</h1>
            </div>

            {/* Accordion Sections */}
            <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection} className="w-full max-w-4xl space-y-4">
                {/* General Section */}
                <Card className="px-4">
                    <AccordionItem value="general">
                        <AccordionTrigger>General</AccordionTrigger>
                        <AccordionContent>
                            <GeneralSection
                                actionName={actionName}
                                setActionName={setActionName}
                                whenToUse={whenToUse}
                                setWhenToUse={setWhenToUse}
                                onSave={handleGeneralSave}
                                isSaving={false}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                {/* API Section */}
                <Card className="px-4">
                    <AccordionItem value="api">
                        <AccordionTrigger>API</AccordionTrigger>
                        <AccordionContent>
                            <ApiSection
                                dataInputs={dataInputs}
                                addDataInput={addDataInput}
                                removeDataInput={removeDataInput}
                                updateDataInput={updateDataInput}
                                setDataInputs={setDataInputs}
                                apiMethod={apiMethod}
                                setApiMethod={(m: "GET" | "POST" | "PUT" | "DELETE") => setApiMethod(m)}
                                apiUrl={apiUrl}
                                setApiUrl={setApiUrl}
                                apiTab={apiTab}
                                setApiTab={setApiTab}
                                // Parameters are now synchronized with the API URL
                                // When URL changes → parameters update automatically
                                // When parameters change → URL updates automatically 
                                parameters={parameters}
                                headers={headers}
                                body={body}
                                addKeyValue={addKeyValue}
                                removeKeyValue={removeKeyValue}
                                updateKeyValue={updateKeyValue}
                                onSave={handleApiSave}
                                isSaving={false}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                {/* Test Response Section */}
                <Card className="px-4">
                    <AccordionItem value="test">
                        <AccordionTrigger>Test Response</AccordionTrigger>
                        <AccordionContent>
                            <TestResponseSection
                                dataInputs={dataInputs}
                                config={createConfig()}
                                onTestResult={handleTestResult}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                {/* Data Access Section */}
                <Card className="px-4">
                    <AccordionItem value="data-access">
                        <AccordionTrigger>Data access</AccordionTrigger>
                        <AccordionContent>
                            <DataAccessSection
                                responsePairs={kvPairs}
                                dataAccessType={dataAccessType}
                                setDataAccessType={setDataAccessType}
                                allowedFields={allowedFields}
                                setAllowedFields={setAllowedFields}
                                onSave={handleDataAccessSave}
                                isSaving={isCreating}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            </Accordion>
        </div>
    );
}
