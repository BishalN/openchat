"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { useCustomActions } from "@/hooks/use-custom-actions";
import { toast } from "sonner";
import { extractQueryParameters, buildUrlWithParams, getBaseUrl } from "@/lib/utils";
import { GeneralSection } from "./general-section";
import { ApiSection } from "./api-section";
import { TestResponseSection } from "./test-response-section";
import { DataAccessSection } from "./data-access-section";

// TODO: by default keep actions as inactive and user should make it active
// also bunch of ui / testing is not working, fix that

// TODO: use react-hook-form with zod resolver to validate the form
export default function CreateCustomActionPage() {
    const router = useRouter();
    const params = useParams();
    const agentId = params.agentId as string;

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
        if (dataAccessType === "limited" && allowedFields.length === 0) {
            toast("Please select at least one field for limited access", {
                description: "At least one field is required for limited access",
                className: "bg-red-500 text-white",
            });
            return;
        }

        const config = createConfig();
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
