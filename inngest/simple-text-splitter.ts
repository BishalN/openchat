export interface TextSplitterParams {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

export class SimpleTextSplitter {
  chunkSize: number;
  chunkOverlap: number;
  separators: string[];

  constructor(params: TextSplitterParams) {
    this.chunkSize = params.chunkSize;
    this.chunkOverlap = params.chunkOverlap;
    this.separators = params.separators || ["\n\n", "\n", " ", ""];

    if (this.chunkOverlap >= this.chunkSize) {
      throw new Error("Cannot have chunkOverlap >= chunkSize");
    }
  }

  private splitOnSeparator(text: string, separator: string): string[] {
    if (separator) {
      return text.split(separator).filter((s) => s !== "");
    } else {
      return text.split("").filter((s) => s !== "");
    }
  }

  private joinDocs(docs: string[], separator: string): string | null {
    const text = docs.join(separator).trim();
    return text === "" ? null : text;
  }

  private async mergeSplits(splits: string[], separator: string): Promise<string[]> {
    const docs: string[] = [];
    const currentDoc: string[] = [];
    let total = 0;

    for (const d of splits) {
      const _len = d.length; // Simple character length function
      
      if (total + _len + currentDoc.length * separator.length > this.chunkSize) {
        if (total > this.chunkSize) {
          console.warn(
            `Created a chunk of size ${total}, which is longer than the specified ${this.chunkSize}`
          );
        }
        
        if (currentDoc.length > 0) {
          const doc = this.joinDocs(currentDoc, separator);
          if (doc !== null) {
            docs.push(doc);
          }
          
          // Keep on popping if:
          // - we have a larger chunk than in the chunk overlap
          // - or if we still have any chunks and the length is long
          while (
            total > this.chunkOverlap ||
            (total + _len + currentDoc.length * separator.length > this.chunkSize && total > 0)
          ) {
            total -= currentDoc[0].length;
            currentDoc.shift();
          }
        }
      }
      
      currentDoc.push(d);
      total += _len;
    }
    
    const doc = this.joinDocs(currentDoc, separator);
    if (doc !== null) {
      docs.push(doc);
    }
    
    return docs;
  }

  private async _splitText(text: string, separators: string[]): Promise<string[]> {
    const finalChunks: string[] = [];

    // Get appropriate separator to use
    let separator: string = separators[separators.length - 1];
    let newSeparators: string[] | undefined;
    
    for (let i = 0; i < separators.length; i += 1) {
      const s = separators[i];
      if (s === "") {
        separator = s;
        break;
      }
      if (text.includes(s)) {
        separator = s;
        newSeparators = separators.slice(i + 1);
        break;
      }
    }

    // Now that we have the separator, split the text
    const splits = this.splitOnSeparator(text, separator);

    // Now go merging things, recursively splitting longer texts.
    let goodSplits: string[] = [];
    const _separator = separator;
    
    for (const s of splits) {
      if (s.length < this.chunkSize) {
        goodSplits.push(s);
      } else {
        if (goodSplits.length) {
          const mergedText = await this.mergeSplits(goodSplits, _separator);
          finalChunks.push(...mergedText);
          goodSplits = [];
        }
        if (!newSeparators) {
          finalChunks.push(s);
        } else {
          const otherInfo = await this._splitText(s, newSeparators);
          finalChunks.push(...otherInfo);
        }
      }
    }
    
    if (goodSplits.length) {
      const mergedText = await this.mergeSplits(goodSplits, _separator);
      finalChunks.push(...mergedText);
    }
    
    return finalChunks;
  }

  async splitText(text: string): Promise<string[]> {
    return this._splitText(text, this.separators);
  }
} 