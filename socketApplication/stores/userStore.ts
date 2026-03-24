import type { ChatUser } from "../../src/types";

class InMemoryUserStore {
    private users: Map<string, ChatUser>;                     // <userID, TriviaUser>

    constructor() {
        this.users = new Map();
    }

    saveUser(user: ChatUser): void {
        this.users.set(user.id, user);
    }

    /**
     * This function throws an error if a userID does not exist because this application should not handle non-existent userIDs.
     * If a non-existent userID appears in the application, something is wrong.
     */
    findUserByID(userID: string): ChatUser {
        const user: ChatUser | undefined = this.users.get(userID);
        if (user) {
            return user;
        }
        throw new Error(`Could not find user with id ${userID}`);
    }

    /**
     * Thus function may return undefined if a user has not been created yet. Usernames are tested when authenticating to see if a username is available
     * or not when signing in/creating a user.
     */
    findUserByUsername(username: string): ChatUser | undefined {      // TODO: Throw error if username does not exist and create a new auth check in auth.ts
        return this.users.values().toArray().find((user: ChatUser) => user.username === username);
    }

    getAllUsers(): ChatUser[] {
        return this.users.values().toArray() ?? [];
    }
}

const userStore = new InMemoryUserStore();

export default userStore;