import { LangfuseExporter } from "langfuse-vercel";
import { registerOTel } from "@vercel/otel";

export function register() {
    registerOTel({
        serviceName: "OpenChat-ai",
        traceExporter: new LangfuseExporter({
            environment: process.env.NODE_ENV ?? "development",
        }),
    });
}
