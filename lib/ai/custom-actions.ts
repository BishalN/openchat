import { z } from "zod";
import { customActionsTable } from "@/drizzle/schema";
import { db } from "@/drizzle";
import { eq, and } from "drizzle-orm";

// Helper function to sanitize action names for Gemini compatibility
function sanitizeActionName(name: string): string {
    // Remove or replace invalid characters, ensure it starts with a letter or underscore
    let sanitized = name
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
        .replace(/^[^a-zA-Z_]/, '_') // Ensure it starts with letter or underscore
        .substring(0, 64); // Limit to 64 characters

    // Ensure it's not empty
    if (!sanitized) {
        sanitized = 'custom_action';
    }

    return sanitized;
}

// Helper function to process template variables in strings
function processTemplateVariables(value: string, parameters: Record<string, any>): string {
    let processedValue = value;
    
    // Replace template variables with actual parameter values
    Object.entries(parameters).forEach(([key, value]) => {
        const templateVar = `{{${key}}}`;
        if (processedValue.includes(templateVar)) {
            processedValue = processedValue.replace(new RegExp(templateVar, 'g'), String(value));
        }
    });
    
    return processedValue;
}

// Helper function to execute custom actions
export async function executeCustomAction(action: any, parameters: any, trace: any, identity?: any) {
    const executeActionSpan = trace.span({
        name: "execute-custom-action",
        input: { actionId: action.id, parameters, hasIdentity: !!identity },
    });

    try {
        const { config } = action;

        console.log("Executing custom action:", action.name);
        console.log("Parameters:", parameters);
        console.log("Identity:", identity);

        // Build the request
        const url = new URL(config.apiUrl);

        // Add query parameters
        config.parameters.forEach((param: any) => {
            const paramValue = processTemplateVariables(param.value, parameters);
            url.searchParams.append(param.key, paramValue);
        });

        // Add dynamic parameters from LLM
        Object.entries(parameters).forEach(([key, value]) => {
            url.searchParams.append(key, String(value));
        });

        const headers: Record<string, string> = {};
        config.headers.forEach((header: any) => {
            const headerValue = processTemplateVariables(header.value, parameters);
            headers[header.key] = headerValue;
        });

        // Add identity headers if available
        if (identity) {
            headers['x-user-id'] = identity.user_id;
            headers['x-user-hash'] = identity.user_hash;
            if (identity.user_metadata) {
                headers['x-user-metadata'] = JSON.stringify(identity.user_metadata);
            }
        }

        let body = undefined;
        if (config.apiMethod !== 'GET' && config.body.length > 0) {
            body = JSON.stringify(
                config.body.reduce((acc: any, item: any) => {
                    const bodyValue = processTemplateVariables(item.value, parameters);
                    acc[item.key] = bodyValue;
                    return acc;
                }, {})
            );
            headers['Content-Type'] = 'application/json';
        }

        console.log(`Making ${config.apiMethod} request to: ${url.toString()}`);
        console.log('Headers:', headers);
        if (body) console.log('Body:', body);

        const response = await fetch(url.toString(), {
            method: config.apiMethod,
            headers,
            body,
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            executeActionSpan.end({ output: { error: `HTTP ${response.status}: ${errorText}` } });
            return { error: `HTTP ${response.status}: ${errorText}` };
        }

        let result;
        try {
            result = await response.json();
        } catch (parseError) {
            // If JSON parsing fails, return the text response
            const textResult = await response.text();
            executeActionSpan.end({ output: { result: textResult, parseError: parseError instanceof Error ? parseError.message : 'Unknown error' } });
            return { error: 'Failed to parse JSON response', text: textResult };
        }

        // Filter data if limited access
        if (config.dataAccessType === 'limited' && config.allowedFields) {
            const filteredResult = config.allowedFields.reduce((acc: any, field: string) => {
                if (result[field] !== undefined) {
                    acc[field] = result[field];
                }
                return acc;
            }, {});
            executeActionSpan.end({ output: { result: filteredResult } });
            return filteredResult;
        }

        executeActionSpan.end({ output: { result } });
        return result;
    } catch (error) {
        executeActionSpan.end({ output: { error: error instanceof Error ? error.message : 'Unknown error' } });
        throw error;
    }
}

// Helper function to create dynamic tools from custom actions
export async function createCustomActionTools(agentId: string, trace: any, identity?: any) {
    const getCustomActionsSpan = trace.span({
        name: "get-custom-actions",
        input: { agentId, hasIdentity: !!identity },
    });

    const customActions = await db.query.customActionsTable.findMany({
        where: and(
            eq(customActionsTable.agentId, agentId),
            eq(customActionsTable.isActive, true)
        ),
    });
    if (customActions.length === 0) {
        getCustomActionsSpan.end({ output: { actionCount: 0 } });
        return {};
    }


    getCustomActionsSpan.end({ output: { actionCount: customActions.length } });

    const customTools: Record<string, any> = {};
    const actionNameMapping: Record<string, any> = {};

    for (const action of customActions) {
        // Create dynamic parameter schema
        const parameterSchema: Record<string, any> = {};
        action.config.dataInputs.forEach((input: any) => {
            let schema;
            switch (input.type) {
                case 'Number':
                    schema = z.number();
                    break;
                case 'Boolean':
                    schema = z.boolean();
                    break;
                case 'Date':
                    schema = z.string(); // Date as string
                    break;
                default:
                    schema = z.string();
            }

            if (input.array) {
                schema = z.array(schema);
            }

            parameterSchema[input.name] = schema.describe(input.description);
        });
        // TODO: data inputs are not working here, lets fix this thing, they don't show up in custom tools, right now

        const sanitizedName = sanitizeActionName(action.name);
        actionNameMapping[sanitizedName] = action;

        customTools[sanitizedName] = {
            description: action.whenToUse,
            parameters: z.object(parameterSchema),
            execute: async (params: any) => {
                try {
                    console.log(`Executing custom action: ${action.name} with params:`, params);
                    const result = await executeCustomAction(action, params, trace, identity);
                    console.log(`Custom action result:`, result);
                    return result;
                } catch (error) {
                    console.error(`Error executing custom action ${action.name}:`, error);
                    return {
                        error: error instanceof Error ? error.message : 'Unknown error occurred',
                        actionName: action.name
                    };
                }
            },
        };
    }


    return customTools;
} 