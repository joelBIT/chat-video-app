import { getHashedPasswordForUsername } from '../dao/userDAO';
import { Password } from '../services/passwordService';

export async function isCorrectPassword(username: string, password: string): Promise<boolean> {
    try {
        const hashedPassword = await getHashedPasswordForUsername(username);
        return await Password.compare(hashedPassword, password);
    } catch (error) {
        console.log(error);
    }

    return false;
}