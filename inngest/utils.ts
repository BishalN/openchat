
export function extractTextFromRtf(buffer: Buffer): string {
    let rtfContent = buffer.toString("utf-8");

    // Remove font tables, color tables, and other metadata groups
    rtfContent = rtfContent.replace(
        /{\\(?:fonttbl|colortbl|stylesheet)[^}]*}/gi,
        "",
    );

    // Remove RTF header
    rtfContent = rtfContent.replace(/^{\\rtf1[^}]*}/i, "");

    // Remove embedded pictures, objects
    rtfContent = rtfContent.replace(/{\\\*\\shppict[^}]*}/gi, "");
    rtfContent = rtfContent.replace(/{\\object[^}]*}/gi, "");
    rtfContent = rtfContent.replace(/{\\pict[^}]*}/gi, "");

    // Remove Unicode characters like \u1234? (keep the fallback '?')
    rtfContent = rtfContent.replace(/\\u-?\d+\??/g, "");

    // Remove all other RTF control words
    rtfContent = rtfContent.replace(/\\[a-z]+\d* ?/gi, "");

    // Remove escaped hex like \'ab
    rtfContent = rtfContent.replace(/\\'[0-9a-f]{2}/gi, "");

    // Remove any leftover braces
    rtfContent = rtfContent.replace(/[{}]/g, "");

    // Replace known RTF newline/tab symbols
    rtfContent = rtfContent
        .replace(/\\par[d]?/gi, "\n")
        .replace(/\\tab/gi, "\t")
        .replace(/\\line/gi, "\n");

    // Collapse multiple spaces and newlines
    rtfContent = rtfContent.replace(/\r?\n\s*\r?\n/g, "\n"); // multiple newlines -> single
    rtfContent = rtfContent.replace(/[ \t]{2,}/g, " "); // multiple spaces/tabs -> single

    // Final clean trim§
    return rtfContent.trim();
}

export function cleanText(text: string): string {
    // Remove control characters (C0 and C1 controls)
    // Using Unicode escapes to avoid eslint `no-control-regex` error
    // \u0000-\u001F corresponds to \x00-\x1F
    // \u007F-\u009F corresponds to \x7F-\x9F
    // Remove control characters (C0 and C1 controls) using Unicode escapes to avoid eslint `no-control-regex` error
    let cleanedText = text.replace(
        new RegExp(
            [
                "[",
                "\\u0000-\\u001F", // C0 controls
                "\\u007F-\\u009F", // C1 controls
                "]",
            ].join(""),
            "g",
        ),
        "",
    );

    // Normalize spaces: replace multiple spaces, tabs, or line breaks with a single space
    cleanedText = cleanedText.replace(/\s+/g, " ").trim();

    // The previous version removed too many characters with /[^\x20-\x7E]/g
    // It also had potentially overly aggressive punctuation cleaning.
    // This simpler version focuses on removing control chars and normalizing space.

    // Optional: Further specific cleaning can be added here if needed,
    // for example, removing zero-width spaces:
    // cleanedText = cleanedText.replace(/[\u200B-\u200D\uFEFF]/g, '');

    return cleanedText;
}
