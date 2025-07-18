"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomAction, useCustomActions } from "@/hooks/use-custom-actions";
import { extractQueryParameters, getBaseUrl, buildUrlWithParams } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GeneralSection, ApiSection, TestResponseSection, DataAccessSection } from "../../create/page";

// Skeleton component for the edit page
function EditCustomActionSkeleton() {
    return (
        <div>
            {/* Header skeleton */}
            <div className="flex items-center gap-4 mb-2">
                <Skeleton className="h-8 w-64" />
            </div>

            {/* Accordion sections skeleton */}
            <div className="w-full max-w-4xl space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="px-4">
                        <div className="py-4">
                            <Skeleton className="h-6 w-24 mb-4" />
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function EditCustomActionPage() {
    const router = useRouter();
    const params = useParams();
    const agentId = params.agentId as string;
    const actionId = params.actionId as string;

    const { action, isLoading, error } = useCustomAction(actionId);



    // Use the custom actions hook
    const { updateAction, isUpdating } = useCustomActions(agentId);

    const [openSection, setOpenSection] = useState("general");

    // Form state
    const [actionName, setActionName] = useState(action?.name || "");
    const [whenToUse, setWhenToUse] = useState(action?.whenToUse || "");

    // Data input table state
    const [dataInputs, setDataInputs] = useState<Array<{ name: string; type: "Text" | "Number" | "Boolean" | "Date"; description: string; array: boolean }>>(action?.config.dataInputs || []);

    // API request state
    const [apiMethod, setApiMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">(action?.config.apiMethod || "GET");
    const [apiUrl, setApiUrl] = useState(action?.config.apiUrl || "");

    // Tabs for params/headers/body
    const [apiTab, setApiTab] = useState("parameters");
    const [parameters, setParameters] = useState<Array<{ key: string; value: string }>>(action?.config.parameters || []);
    const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(action?.config.headers || []);
    const [body, setBody] = useState<Array<{ key: string; value: string }>>(action?.config.body || []);

    // Test response state
    const [kvPairs, setKvPairs] = useState<{ key: string; value: string }[]>([]);

    // Data access state
    const [dataAccessType, setDataAccessType] = useState<"full" | "limited">(action?.config.dataAccessType || "full");
    const [allowedFields, setAllowedFields] = useState<string[]>(action?.config.allowedFields || []);

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
        const config = {
            ...createConfig(),
            ...action?.config,
        };
        console.log("config", JSON.stringify(config, null, 2));
        updateAction({
            id: actionId,
            name: actionName,
            whenToUse,
            config,
        });
    };

    // Show skeleton when loading
    if (isLoading) return <EditCustomActionSkeleton />;

    // Show error state
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <h1 className="text-xl font-bold">Edit Custom Action: {action?.name}</h1>
            </div>

            {/* Accordion Sections */}
            <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection} className="w-full max-w-4xl space-y-4">
                {/* General Section */}
                <Card className="px-4">
                    <AccordionItem value="general">
                        <AccordionTrigger>General</AccordionTrigger>
                        <AccordionContent className="">
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
                                isSaving={isUpdating}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            </Accordion>
        </div>
    );
}