import { scrypt, randomBytes, timingSafeEqual} from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class PasswordManager {
    static async toHash(password: string): Promise<string> {
        const salt = randomBytes(16).toString('hex');
        const buffer = (await scryptAsync(password, salt, 64)) as Buffer;

        return `${buffer.toString('hex')}.${salt}`;
    }

    static async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {
        const [hashedPassword, salt] = storedPassword.split('.');
        if (!hashedPassword || !salt) {
            return false;                       // Missing user or malformed/unhashed password
        }

        const suppliedBuffer = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
        const storedBuffer = Buffer.from(hashedPassword, 'hex');

        return storedBuffer.length === suppliedBuffer.length && timingSafeEqual(storedBuffer, suppliedBuffer);
    }
}