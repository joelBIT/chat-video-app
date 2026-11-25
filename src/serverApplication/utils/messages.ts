import type { Message } from "../../types";

const MAX_MESSAGE_LENGTH = 2000;

/**
 * Build trusted messages. The server decides from, public and date. The client only supplies to and text. 
 * This also stops whitespace-only messages, oversized text and client-forged timestamps.
 */
export function buildMessage(from: string, input: unknown, isPublic: boolean): Message | null {
    if (typeof input !== "object" || input === null) {
        return null;
    }

    const { to, text } = input as Record<string, unknown>;
    if (typeof to !== "string" || typeof text !== "string") {
        return null;
    }

    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) {
        return null;
    }

    return { from, to, public: isPublic, text: trimmed, date: Date.now() };
}