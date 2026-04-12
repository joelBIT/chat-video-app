import { getHashedPasswordForUsername } from '../dao/userDAO';
import { PasswordManager } from '../utils/passwordManager';

export async function isCorrectPassword(username: string, password: string): Promise<boolean> {
    try {
        const hashedPassword = await getHashedPasswordForUsername(username);
        return await PasswordManager.compare(hashedPassword, password);
    } catch (error) {
        console.log(error);
    }

    return false;
}