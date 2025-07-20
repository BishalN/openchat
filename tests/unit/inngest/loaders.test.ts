import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadDocument } from "../../../inngest/loaders";
import { extractTextFromRtf, cleanText } from "../../../inngest/utils";

// Mock external dependencies
vi.mock("@langchain/community/document_loaders/fs/csv", () => ({
    CSVLoader: vi.fn().mockImplementation(() => ({
        load: vi.fn().mockResolvedValue([
            { pageContent: "test,csv,content" }
        ])
    }))
}));

vi.mock("@langchain/community/document_loaders/fs/pptx", () => ({
    PPTXLoader: vi.fn().mockImplementation(() => ({
        load: vi.fn().mockResolvedValue([
            { pageContent: "test pptx content" }
        ])
    }))
}));

vi.mock("langchain/document_loaders/fs/text", () => ({
    TextLoader: vi.fn().mockImplementation(() => ({
        load: vi.fn().mockResolvedValue([
            { pageContent: "test text content" }
        ])
    }))
}));

vi.mock("officeparser", () => ({
    parseOfficeAsync: vi.fn().mockResolvedValue("test office content")
}));

vi.mock("unpdf", () => ({
    getDocumentProxy: vi.fn().mockResolvedValue({}),
    extractText: vi.fn().mockResolvedValue({ text: "test pdf content" })
}));

vi.mock("@mistralai/mistralai", () => ({
    Mistral: vi.fn().mockImplementation(() => ({
        ocr: {
            process: vi.fn().mockResolvedValue({
                pages: [{ markdown: "test ocr content" }]
            })
        }
    }))
}));

describe("RTF Processing", () => {
    describe("extractTextFromRtf", () => {

        it("should handle RTF with font tables", () => {
            const rtfContent = "{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} This is text with font info.}";
            const buffer = Buffer.from(rtfContent, "utf-8");
            
            const result = extractTextFromRtf(buffer);
            
            expect(result).toBe("This is text with font info.");
        });


        it("should handle empty RTF content", () => {
            const rtfContent = "{\\rtf1\\ansi\\deff0}";
            const buffer = Buffer.from(rtfContent, "utf-8");
            
            const result = extractTextFromRtf(buffer);
            
            expect(result).toBe("");
        });

        it("should handle RTF with only formatting commands", () => {
            const rtfContent = "{\\rtf1\\ansi\\deff0 \\b\\i\\cf1}";
            const buffer = Buffer.from(rtfContent, "utf-8");
            
            const result = extractTextFromRtf(buffer);
            
            expect(result).toBe("");
        });
    });

    describe("cleanText", () => {
        it("should remove control characters", () => {
            const text = "Hello\u0000World\u001FTest\u007F";
            const result = cleanText(text);
            
            expect(result).toBe("HelloWorldTest");
        });


        it("should handle empty string", () => {
            const result = cleanText("");
            expect(result).toBe("");
        });

        it("should handle string with only control characters", () => {
            const text = "\u0000\u001F\u007F";
            const result = cleanText(text);
            
            expect(result).toBe("");
        });
    });

    describe("loadDocument - RTF handling", () => {
        it("should throw error for unsupported file type", async () => {
            const blob = new Blob(["test"], { type: "application/unknown" });
            
            await expect(loadDocument({
                content: blob,
                metadata: { mimetype: "application/unknown" }
            })).rejects.toThrow("Unsupported file type: application/unknown");
        });
    });

    describe("loadDocument - other file types", () => {
        it("should process CSV files", async () => {
            const csvContent = "name,age\nJohn,30";
            const blob = new Blob([csvContent], { type: "text/csv" });
            
            const result = await loadDocument({
                content: blob,
                metadata: { mimetype: "text/csv" }
            });
            
            expect(result).toBe("test,csv,content");
        });

        it("should process text files", async () => {
            const textContent = "Hello world";
            const blob = new Blob([textContent], { type: "text/plain" });
            
            const result = await loadDocument({
                content: blob,
                metadata: { mimetype: "text/plain" }
            });
            
            expect(result).toBe("test text content");
        });

        it("should process markdown files", async () => {
            const mdContent = "# Hello\nWorld";
            const blob = new Blob([mdContent], { type: "text/markdown" });
            
            const result = await loadDocument({
                content: blob,
                metadata: { mimetype: "text/markdown" }
            });
            
            expect(result).toBe("test text content");
        });
    });
}); 