"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Trash } from "lucide-react";

// General Section Component
function GeneralSection() {
    return (
        <div className="space-y-4 py-2">
            <div>
                <label className="block text-sm font-medium mb-1">Action Name</label>
                <Input placeholder="e.g. Get Weather" />
                <p className="text-xs text-muted-foreground mt-1">A descriptive name for this action. This will help the AI agent know when to use it.</p>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">When to use</label>
                <Textarea placeholder="Describe when the AI agent should use this action. Include examples." rows={4} />
                <p className="text-xs text-muted-foreground mt-1">Detailed description explaining when the AI agent should use this action and API. Include examples of the data this action provides and customer queries it helps answer.</p>
            </div>
            <Button className="mt-4">Save and Continue</Button>
        </div>
    );
}

// API Section Component
function ApiSection({
    dataInputs,
    addDataInput,
    removeDataInput,
    updateDataInput,
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
}: {
    dataInputs: Array<{ name: string; type: string; description: string; array: boolean }>;
    addDataInput: () => void;
    removeDataInput: (idx: number) => void;
    updateDataInput: (idx: number, field: string, value: any) => void;
    apiMethod: string;
    setApiMethod: (m: string) => void;
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
}) {
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
            </div>

            {/* API Request */}
            <div className="pt-6 border-t">
                <div className="font-medium mb-1">API request</div>
                <div className="text-xs text-muted-foreground mb-2 max-w-2xl">The API endpoint that should be called by the AI Agent to retrieve data or to send updates. You can include data inputs (variables) collected from the user in the URL or the request body.</div>
                <div className="flex gap-2 mb-2 items-center">
                    <select className="border rounded px-2 py-1 text-sm" value={apiMethod} onChange={e => setApiMethod(e.target.value)}>
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>
                    <Input placeholder="https://api.example.com/endpoint/{{item_id}}" value={apiUrl} onChange={e => setApiUrl(e.target.value)} className="flex-1" />
                    <Button size="sm" variant="outline">+ Add variable</Button>
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
                </div>
            </div>
            <Button className="mt-4">Save and continue</Button>
        </div>
    );
}

function flattenJson(obj: any, prefix = "", res: Record<string, string> = {}) {
    for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
            flattenJson(obj[key], prefix ? `${prefix}.${key}` : key, res);
        } else {
            res[prefix ? `${prefix}.${key}` : key] = String(obj[key]);
        }
    }
    return res;
}

function TestResponseSection({
    dataInputs,
}: {
    dataInputs: Array<{ name: string; type: string; description: string; array: boolean }>;
}) {
    // Mode: "live" or "example"
    const [mode, setMode] = useState("live");
    // Token values
    const [tokenValues, setTokenValues] = useState<{ [key: string]: string }>({});
    // JSON response (mock for now)
    const [jsonResponse, setJsonResponse] = useState(`{
  "data": {
    "id": 9,
    "created_at": "2024-12-02T23:13:19.856188+00:00",
    "user_id": "user-1",
    "status": "active",
    "plan": "premium"
  }
}`);
    // Key-value pairs from response
    const [kvPairs, setKvPairs] = useState<{ key: string; value: string }[]>([]);
    // Example JSON textarea (for example mode)
    const [exampleJson, setExampleJson] = useState(jsonResponse);
    // Error state
    const [error, setError] = useState<string | null>(null);

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

    // Helper for syntax highlighting JSON (very basic)
    function highlightJson(json: string) {
        return json
            .replace(/("[^"]+":)/g, '<span class="text-blue-700">$1</span>') // keys
            .replace(/("[^"]*")/g, '<span class="text-green-700">$1</span>') // strings
            .replace(/(:\s)(\d+)/g, '$1<span class="text-purple-700">$2</span>'); // numbers
    }

    // Line numbers for code block
    const lines = (mode === "example" ? exampleJson : jsonResponse).split("\n");

    // Handle test response
    const handleTestResponse = () => {
        setError(null);
        let jsonStr = mode === "example" ? exampleJson : jsonResponse;
        try {
            const parsed = JSON.parse(jsonStr);
            const flat = flattenJson(parsed);
            setKvPairs(Object.entries(flat).map(([key, value]) => ({ key, value })));
        } catch (e: any) {
            setError("Invalid JSON");
            setKvPairs([]);
        }
    };

    return (
        <div className="space-y-6 py-2">
            {/* Radio group for mode */}
            <div className="flex flex-col gap-2 mb-2">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="radio"
                        name="test-mode"
                        checked={mode === "live"}
                        onChange={() => setMode("live")}
                        className="accent-primary mt-1"
                    />
                    <span>
                        <span className="font-medium block">Live response</span>
                        <span className="text-xs text-muted-foreground block">Test with live data from the API to make sure it is configured correctly.</span>
                    </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="radio"
                        name="test-mode"
                        checked={mode === "example"}
                        onChange={() => setMode("example")}
                        className="accent-primary mt-1"
                    />
                    <span>
                        <span className="font-medium block">Example response</span>
                        <span className="text-xs text-muted-foreground block">Use example JSON data if the API is not ready.</span>
                    </span>
                </label>
            </div>

            {/* Example JSON textarea */}
            {mode === "example" && (
                <div>
                    <label className="block text-xs font-medium mb-1">Example JSON</label>
                    <textarea
                        className="w-full font-mono text-xs rounded border border-border bg-muted p-2"
                        rows={8}
                        value={exampleJson}
                        onChange={e => setExampleJson(e.target.value)}
                    />
                </div>
            )}

            {/* Test response button */}
            <Button className="mt-2" size="sm" variant="outline" onClick={handleTestResponse}>Test response</Button>
            {error && <div className="text-red-600 text-xs mt-1">{error}</div>}

            {/* Key-value table from response */}
            {kvPairs.length > 0 && (
                <div className="overflow-x-auto rounded border border-border">
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
            <div className="bg-[#f8fafc] border border-border rounded-md overflow-x-auto text-xs font-mono relative">
                <div className="flex">
                    <div className="py-2 px-2 text-right select-none bg-[#f3f4f6] text-muted-foreground rounded-l-md border-r border-border">
                        {lines.map((_, i) => (
                            <div key={i} className="h-5 leading-5">{i + 1}</div>
                        ))}
                    </div>
                    <pre className="py-2 px-2 whitespace-pre-wrap overflow-x-auto" style={{ minWidth: 0 }}>
                        <code dangerouslySetInnerHTML={{ __html: highlightJson(mode === "example" ? exampleJson : jsonResponse) }} />
                    </pre>
                </div>
            </div>
        </div>
    );
}

function DataAccessSection({
    responsePairs,
}: {
    responsePairs: { key: string; value: string }[];
}) {
    const [access, setAccess] = useState("full");
    return (
        <div className="space-y-6 py-2">
            {/* Radio group for data access */}
            <div className="flex flex-col gap-2 mb-2">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="radio"
                        name="data-access"
                        checked={access === "full"}
                        onChange={() => setAccess("full")}
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
                        checked={access === "limited"}
                        onChange={() => setAccess("limited")}
                        className="accent-primary mt-1"
                    />
                    <span>
                        <span className="font-medium block">Limited data access</span>
                        <span className="text-xs text-muted-foreground block">Limit the information the AI agent can access, providing more controlled and specific replies while protecting sensitive data.</span>
                    </span>
                </label>
            </div>

            {/* Table for response pairs */}
            <div className="overflow-x-auto rounded border border-border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/2">Name</TableHead>
                            <TableHead>Test response</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {responsePairs.map(({ key, value }) => (
                            <TableRow key={key}>
                                <TableCell>{key}</TableCell>
                                <TableCell>{value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Button className="mt-2" size="sm" variant="default">Save</Button>
        </div>
    );
}

export default function CreateCustomActionPage() {
    const router = useRouter();
    const [openSection, setOpenSection] = useState("general");

    // Data input table state
    const [dataInputs, setDataInputs] = useState([
        { name: "", type: "Text", description: "", array: false },
    ]);
    // API request state
    const [apiMethod, setApiMethod] = useState("GET");
    const [apiUrl, setApiUrl] = useState("");
    // Tabs for params/headers/body
    const [apiTab, setApiTab] = useState("parameters");
    const [parameters, setParameters] = useState<Array<{ key: string; value: string }>>([]); // [{key, value}]
    const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);
    const [body, setBody] = useState<Array<{ key: string; value: string }>>([]);

    // Data input handlers
    const addDataInput = () => setDataInputs([...dataInputs, { name: "", type: "Text", description: "", array: false }]);
    const removeDataInput = (idx: number) => setDataInputs(dataInputs.filter((_, i) => i !== idx));
    const updateDataInput = (idx: number, field: string, value: any) => setDataInputs(dataInputs.map((row, i) => i === idx ? { ...row, [field]: value } : row));

    // Key-value pair handlers
    const addKeyValue = (type: string) => {
        if (type === "parameters") setParameters([...parameters, { key: "", value: "" }]);
        if (type === "headers") setHeaders([...headers, { key: "", value: "" }]);
        if (type === "body") setBody([...body, { key: "", value: "" }]);
    };
    const removeKeyValue = (type: string, idx: number) => {
        if (type === "parameters") setParameters(parameters.filter((_, i) => i !== idx));
        if (type === "headers") setHeaders(headers.filter((_, i) => i !== idx));
        if (type === "body") setBody(body.filter((_, i) => i !== idx));
    };
    const updateKeyValue = (type: string, idx: number, field: string, value: any) => {
        if (type === "parameters") setParameters(parameters.map((row, i) => i === idx ? { ...row, [field]: value } : row));
        if (type === "headers") setHeaders(headers.map((row, i) => i === idx ? { ...row, [field]: value } : row));
        if (type === "body") setBody(body.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };

    // For DataAccessSection, use kvPairs from TestResponseSection as mock
    const [kvPairs, setKvPairs] = useState<{ key: string; value: string }[]>([
        { key: "success", value: "true" },
    ]);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
                    <span className="text-lg">←</span>
                </Button>
                <h1 className="text-xl font-bold">Create Custom Action</h1>
            </div>

            {/* Accordion Sections */}
            <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection} className="w-full max-w-4xl space-y-4">
                {/* General Section */}
                <Card className="px-4">
                    <AccordionItem value="general">
                        <AccordionTrigger>General</AccordionTrigger>
                        <AccordionContent>
                            <GeneralSection />
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
                                apiMethod={apiMethod}
                                setApiMethod={setApiMethod}
                                apiUrl={apiUrl}
                                setApiUrl={setApiUrl}
                                apiTab={apiTab}
                                setApiTab={setApiTab}
                                parameters={parameters}
                                headers={headers}
                                body={body}
                                addKeyValue={addKeyValue}
                                removeKeyValue={removeKeyValue}
                                updateKeyValue={updateKeyValue}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                {/* Test Response Section */}
                <Card className="px-4">
                    <AccordionItem value="test">
                        <AccordionTrigger>Test Response</AccordionTrigger>
                        <AccordionContent>
                            <TestResponseSection dataInputs={dataInputs} />
                        </AccordionContent>
                    </AccordionItem>
                </Card>

                {/* Data Access Section */}
                <Card className="px-4">
                    <AccordionItem value="data-access">
                        <AccordionTrigger>Data access</AccordionTrigger>
                        <AccordionContent>
                            <DataAccessSection responsePairs={kvPairs} />
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            </Accordion>
        </div>
    );
}
