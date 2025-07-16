import ReactMarkdown, { type Components } from "react-markdown";
import type { Message } from "ai";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

type MessagePart = NonNullable<Message["parts"]>[number];

interface ChatMessageProps {
    parts: MessagePart[];
    role: string;
    userName: string;
}

const components: Components = {
    // Override default elements with custom styling
    p: ({ children }) => <p className="mb-4 first:mt-0 last:mb-0"> {children} </p>,
    ul: ({ children }) => <ul className="mb-4 list-disc pl-4"> {children} </ul>,
    ol: ({ children }) => <ol className="mb-4 list-decimal pl-4"> {children} </ol>,
    li: ({ children }) => <li className="mb-1"> {children} </li>,
    code: ({ className, children, ...props }) => (
        <code className={`${className ?? ""}`
        } {...props}>
            {children}
        </code>
    ),
    pre: ({ children }) => (
        <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-700 p-4" >
            {children}
        </pre>
    ),
    a: ({ children, ...props }) => (
        <a
            className="text-blue-400 underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        >
            {children}
        </a>
    ),
};

// Fix Markdown children type and whitespace
const Markdown = ({ children }: { children: string }) => {
    return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};

// Subtle ToolInvocation with HoverCard for result citation
const ToolInvocation = ({
    part,
}: {
    part: Extract<MessagePart, { type: "tool-invocation" }>;
}) => {
    const { toolInvocation } = part;
    const { state, toolName, args } = toolInvocation;

    // Only show citation if finalized and result exists
    if (state === "result" && toolInvocation.result) {
        return (
            <span className="inline-block align-baseline ml-1">
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <button
                            className="text-xs text-gray-400 underline decoration-dotted hover:text-blue-500 focus:outline-none"
                            aria-label="Show tool result"
                            tabIndex={0}
                        >
                            tool used to answer: {toolName}
                        </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="text-xs whitespace-pre-wrap max-w-xs">
                        <div className="mb-1 font-semibold text-gray-500">Tool: {toolName}</div>
                        <div className="mb-1 text-gray-500">Args:</div>
                        <pre className="bg-gray-100 rounded p-1 text-gray-700 mb-2 overflow-x-auto">
                            {JSON.stringify(args, null, 2)}
                        </pre>
                        <div className="mb-1 text-gray-500">Result:</div>
                        <pre className="bg-gray-100 rounded p-1 text-gray-700 overflow-x-auto">
                            {JSON.stringify(toolInvocation.result, null, 2)}
                        </pre>
                    </HoverCardContent>
                </HoverCard>
            </span>
        );
    }

    // While running, show a subtle inline status
    return (
        <span className="inline-block align-baseline ml-1 text-xs text-gray-400 bg-gray-100 px-1 rounded">
            using tool: {toolName}, current state: {state}
        </span>
    );
};

export const ChatMessage = ({ parts, role, userName }: ChatMessageProps) => {
    const isAI = role === "assistant";
    return (
        <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
            {isAI && (
                <div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center font-bold mr-2 flex-shrink-0">
                    {userName}
                </div>
            )}
            <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${isAI
                    ? "bg-gray-200 text-gray-800"
                    : "bg-blue-500 text-white"
                    }`}
            >
                {parts.map((part, index) => {
                    if (part.type === "text") {
                        return <Markdown key={index}>{part.text}</Markdown>;
                    }
                    if (part.type === "tool-invocation") {
                        return <ToolInvocation key={index} part={part} />;
                    }
                    return null;
                })}
            </div>
        </div>
    );
};
