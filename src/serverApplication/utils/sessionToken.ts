import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// Read lazily: app.ts calls dotenv.config() after the imports have been evaluated.
function getSecret(): string {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
        throw new Error("SESSION_SECRET is not set");
    }
    return secret;
}

function sign(data: string): string {
    return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function issueToken(userID: string): string {
    const payload = Buffer.from(JSON.stringify({ uid: userID, exp: Date.now() + TOKEN_TTL_MS })).toString("base64url");
    return `${payload}.${sign(payload)}`;
}

/**
 * @returns the user ID inside a valid, unexpired token, otherwise null.
 */
export function verifyToken(token: unknown): string | null {
    if (typeof token !== "string") {
        return null;
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
        return null;
    }

    const [payload, signature] = parts;
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
        return null;
    }

    try {
        const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
        return typeof uid === "string" && typeof exp === "number" && exp > Date.now() ? uid : null;
    } catch {
        return null;
    }
}