"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Trash } from "lucide-react";
import { extractQueryParameters, buildUrlWithParams, getBaseUrl, flattenJson } from "@/lib/utils";

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
                <p className="text-xs text-muted-foreground mt-1">Be specific about when this action should be triggered.</p>
            </div>
            <Button onClick={onSave} disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save General Info"}
            </Button>
        </div>
    );
}

// API Section Component
export function ApiSection({
    dataInputs,
    addDataInput,
    removeDataInput,
    updateDataInput,
    apiUrl,
    setApiUrl,
    httpMethod,
    setHttpMethod,
    headers,
    setHeaders,
    bodyType,
    setBodyType,
    requestBody,
    setRequestBody,
    onSave,
    isSaving,
}: {
    dataInputs: { key: string; description: string }[];
    addDataInput: () => void;
    removeDataInput: (index: number) => void;
    updateDataInput: (index: number, field: 'key' | 'description', value: string) => void;
    apiUrl: string;
    setApiUrl: (url: string) => void;
    httpMethod: string;
    setHttpMethod: (method: string) => void;
    headers: string;
    setHeaders: (headers: string) => void;
    bodyType: string;
    setBodyType: (type: string) => void;
    requestBody: string;
    setRequestBody: (body: string) => void;
    onSave: () => void;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-6 py-2">
            {/* Data Inputs Section */}
            <div>
                <label className="block text-sm font-medium mb-3">Data Inputs</label>
                <p className="text-xs text-muted-foreground mb-4">
                    Define what data the AI agent needs to provide when using this action. These will be automatically filled by the agent.
                </p>
                
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-20">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dataInputs.map((input, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Input
                                        placeholder="e.g. city"
                                        value={input.key}
                                        onChange={(e) => updateDataInput(index, 'key', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="e.g. The city name"
                                        value={input.description}
                                        onChange={(e) => updateDataInput(index, 'description', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeDataInput(index)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                <Button onClick={addDataInput} variant="outline" className="mt-2">
                    Add Data Input
                </Button>
            </div>

            {/* API Configuration */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">API URL</label>
                    <Input
                        placeholder="https://api.example.com/endpoint"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Use {"{key}"} placeholders for data inputs (e.g., https://api.weather.com/{"{city}"})
                    </p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">HTTP Method</label>
                    <select
                        value={httpMethod}
                        onChange={(e) => setHttpMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md"
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Headers (JSON)</label>
                    <Textarea
                        placeholder='{"Authorization": "Bearer {token}", "Content-Type": "application/json"}'
                        rows={3}
                        value={headers}
                        onChange={(e) => setHeaders(e.target.value)}
                    />
                </div>
                
                {(httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'PATCH') && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Body Type</label>
                            <select
                                value={bodyType}
                                onChange={(e) => setBodyType(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md"
                            >
                                <option value="json">JSON</option>
                                <option value="form">Form Data</option>
                                <option value="text">Text</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Request Body</label>
                            <Textarea
                                placeholder={
                                    bodyType === 'json' 
                                        ? '{"key": "{value}"}' 
                                        : bodyType === 'form'
                                        ? 'key1=value1&key2=value2'
                                        : 'Request body content'
                                }
                                rows={4}
                                value={requestBody}
                                onChange={(e) => setRequestBody(e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>
            
            <Button onClick={onSave} disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save API Configuration"}
            </Button>
        </div>
    );
}

// Test Response Section Component  
export function TestResponseSection({
    dataInputs,
    config,
    onTestResult,
}: {
    dataInputs: { key: string; description: string }[];
    config: any;
    onTestResult: (result: any) => void;
}) {
    const [testInputs, setTestInputs] = useState<Record<string, string>>({});
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);

    const handleTest = async () => {
        setIsTestLoading(true);
        try {
            // Build the test URL with inputs
            let testUrl = config.url || '';
            Object.entries(testInputs).forEach(([key, value]) => {
                testUrl = testUrl.replace(`{${key}}`, encodeURIComponent(value));
            });

            const headers: Record<string, string> = {};
            try {
                if (config.headers) {
                    const parsedHeaders = JSON.parse(config.headers);
                    Object.assign(headers, parsedHeaders);
                }
            } catch (e) {
                console.warn('Invalid headers JSON');
            }

            const requestOptions: RequestInit = {
                method: config.method || 'GET',
                headers,
            };

            if (config.body && (config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH')) {
                let body = config.body;
                Object.entries(testInputs).forEach(([key, value]) => {
                    body = body.replace(`{${key}}`, value);
                });
                requestOptions.body = body;
            }

            const response = await fetch(testUrl, requestOptions);
            const result = await response.json();
            
            setTestResult(result);
            onTestResult(result);
        } catch (error) {
            console.error('Test failed:', error);
            setTestResult({ error: 'Test failed', details: error });
        } finally {
            setIsTestLoading(false);
        }
    };

    return (
        <div className="space-y-4 py-2">
            <div>
                <label className="block text-sm font-medium mb-3">Test Inputs</label>
                <div className="space-y-2">
                    {dataInputs.map((input, index) => (
                        <div key={index}>
                            <label className="block text-xs font-medium mb-1">{input.key}</label>
                            <Input
                                placeholder={input.description}
                                value={testInputs[input.key] || ''}
                                onChange={(e) => setTestInputs(prev => ({
                                    ...prev,
                                    [input.key]: e.target.value
                                }))}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            <Button onClick={handleTest} disabled={isTestLoading} className="w-full">
                {isTestLoading ? "Testing..." : "Test API"}
            </Button>
            
            {testResult && (
                <div>
                    <label className="block text-sm font-medium mb-1">Test Result</label>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                        {JSON.stringify(testResult, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

// Data Access Section Component
export function DataAccessSection({
    responsePairs,
    dataAccessType,
    setDataAccessType,
    allowedFields,
    setAllowedFields,
    onSave,
    isSaving,
}: {
    responsePairs: { key: string; value: any }[];
    dataAccessType: string;
    setDataAccessType: (type: string) => void;
    allowedFields: string[];
    setAllowedFields: (fields: string[]) => void;
    onSave: () => void;
    isSaving: boolean;
}) {
    const toggleField = (field: string) => {
        setAllowedFields(
            allowedFields.includes(field)
                ? allowedFields.filter(f => f !== field)
                : [...allowedFields, field]
        );
    };

    return (
        <div className="space-y-4 py-2">
            <div>
                <label className="block text-sm font-medium mb-1">Data Access Type</label>
                <select
                    value={dataAccessType}
                    onChange={(e) => setDataAccessType(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md"
                >
                    <option value="all">Allow all fields</option>
                    <option value="selected">Allow selected fields only</option>
                </select>
            </div>
            
            {dataAccessType === 'selected' && responsePairs.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-2">Select allowed fields</label>
                    <div className="space-y-2 max-h-64 overflow-auto">
                        {responsePairs.map((pair, index) => (
                            <label key={index} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={allowedFields.includes(pair.key)}
                                    onChange={() => toggleField(pair.key)}
                                    className="rounded"
                                />
                                <span className="text-sm">{pair.key}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                    {JSON.stringify(pair.value)}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
            
            <Button onClick={onSave} disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save Data Access"}
            </Button>
        </div>
    );
}