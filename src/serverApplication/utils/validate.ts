import { AppError } from "../errors/AppError";

export function assertString(value: unknown, name: string): asserts value is string {
    if (typeof value !== "string") {
        throw new AppError(`${name} must be a string.`, 400);
    }
}