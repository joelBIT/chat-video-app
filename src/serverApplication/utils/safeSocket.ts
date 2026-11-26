import type { Socket } from "socket.io";

/**
 * Registers an event handler whose failures are logged instead of crashing the server:
 * synchronous throws and rejected promises are both caught.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeOn(socket: Socket, event: string, handler: (...args: any[]) => unknown): void {
    socket.on(event, (...args: unknown[]) => {
        try {
            const result = handler(...args);
            if (result instanceof Promise) {
                result.catch((error: unknown) => console.log(`Error in "${event}" handler:`, error));
            }
        } catch (error) {
            console.log(`Error in "${event}" handler:`, error);
        }
    });
}

/**
 * Drops events from a socket that sends more than maxPerSecond events per second.
 */
export function limitEvents(socket: Socket, maxPerSecond: number = 30): void {
    let windowStart = Date.now();
    let count = 0;

    socket.on("error", () => { });          // Without a listener, Socket.IO prints a warning for every rejected packet

    socket.use((_packet, next) => {
        const now = Date.now();
        if (now - windowStart >= 1000) {
            windowStart = now;
            count = 0;
        }

        if (++count > maxPerSecond) {
            return next(new Error("Rate limit exceeded."));
        }
        next();
    });
}