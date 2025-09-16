import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { flattenJson } from "@/lib/utils";
import { useState, useEffect } from "react";

export function TestResponseSection({
    dataInputs,
    config,
    onTestResult,
}: {
    dataInputs: Array<{ name: string; type: string; description: string; array: boolean }>;
    config: any;
    onTestResult: (pairs: { key: string; value: string }[]) => void;
}) {
    const [tokenValues, setTokenValues] = useState<{ [key: string]: string }>({});
    const [jsonResponse, setJsonResponse] = useState("");
    const [kvPairs, setKvPairs] = useState<{ key: string; value: string }[]>([]);

    const [error, setError] = useState<string | null>(null);
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