const MAX_FAILURES = 5;
const WINDOW_MS = 60_000;
const failures = new Map<string, { count: number, resetAt: number }>();

export function isLockedOut(key: string): boolean {
    const entry = failures.get(key);
    if (!entry || entry.resetAt < Date.now()) {
        failures.delete(key);
        return false;
    }
    return entry.count >= MAX_FAILURES;
}

// Limits failed password attempts per user.

export function registerFailure(key: string): void {
    const entry = failures.get(key);
    if (!entry || entry.resetAt < Date.now()) {
        failures.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
    } else {
        entry.count++;
    }
}