import { loadDocument } from "./loaders";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FileSource, QASource, Sources, TextSource, WebsiteSource } from "./client";

export type Chunk = {
    sourceId: string;
    content: string;
    metadata: Record<string, any>;
    chunkIndex: number;
};


export class SourceProcessor {
    constructor(
        private textSplitter: RecursiveCharacterTextSplitter,
        private supabaseAdmin: any // Should be typed as SupabaseClient if available
    ) { }

    async chunkFile(file: FileSource): Promise<Chunk[]> {
        // Download file as Blob using supabaseAdmin
        const splitResult = file.fileUrl.split("files/");
        if (!splitResult[1]) {
            throw new Error(`Invalid fileUrl: ${file.fileUrl}`);
        }
        const filepath: string = splitResult[1];
        const { data: signedUrl, error } = await this.supabaseAdmin.storage
            .from("files")
            .createSignedUrl(filepath, 60);
        if (error || !signedUrl) {
            throw new Error(`Failed to generate signed URL: ${error?.message}`);
        }
        const response = await fetch(signedUrl.signedUrl);
        const blob = await response.blob();
        // Use loadDocument to extract text
        const document = await loadDocument({
            content: blob,
            metadata: { mimetype: file.mimeType ?? "application/pdf" },
        });
        if (!document) return [];
        const textChunks = await this.textSplitter.splitText(document);
        return textChunks.map((chunk, idx) => ({
            sourceId: file.id,
            content: chunk,
            metadata: {
                type: "file",
                name: file.name,
                mimeType: file.mimeType,
            },
            chunkIndex: idx,
        }));
    }

    async chunkText(textSource: TextSource): Promise<Chunk[]> {
        if (!textSource?.content) return [];
        const textChunks = await this.textSplitter.splitText(textSource.content);
        return textChunks.map((chunk, idx) => ({
            sourceId: textSource.id,
            content: chunk,
            metadata: {
                type: "text",
                name: textSource.name,
            },
            chunkIndex: idx,
        }));
    }

    chunkQA(qaSource: QASource): Chunk[] {
        if (!qaSource?.pairs) return [];
        return qaSource.pairs.map((pair, idx) => ({
            sourceId: qaSource.id,
            content: `Question: ${pair.question}\nAnswer: ${pair.answer}`,
            metadata: {
                type: "qa",
                name: qaSource.name,
            },
            chunkIndex: idx,
        }));
    }

    async chunkWebsite(websiteSource: WebsiteSource): Promise<Chunk[]> {
        if (!websiteSource?.content) return [];
        const textChunks = await this.textSplitter.splitText(websiteSource.content);
        return textChunks.map((chunk, idx) => ({
            sourceId: websiteSource.id,
            content: chunk,
            metadata: {
                type: "website",
                url: websiteSource.url,
            },
            chunkIndex: idx,
        }));
    }

    async chunkSource(source: Sources): Promise<Chunk[]> {
        let allChunks: Chunk[] = [];
        if (source.files && source.files.length > 0) {
            for (const file of source.files) {
                const fileChunks = await this.chunkFile(file);
                allChunks.push(...fileChunks);
            }
        }
        if (source.text) {
            const textChunks = await this.chunkText(source.text);
            allChunks.push(...textChunks);
        }
        if (source.qa) {
            const qaChunks = this.chunkQA(source.qa);
            allChunks.push(...qaChunks);
        }

        if (source.websites && source.websites.length > 0) {
            // since the website content is just a markdown string, we can use the same text splitter
            // and just split the markdown string into chunks
            for (const website of source.websites) {
                const websiteChunks = await this.chunkWebsite(website);
                allChunks.push(...websiteChunks);
            }
        }

        return allChunks;
    }
} 