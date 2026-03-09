import type { ChatUser } from "../../types";

/**
 * Keeps track of application users. Update user information (e.g., online status or username/avatar changes).
 * Instead of retrieving information all the time from the server, data sent from the server is stored on the client. 
 * The server sends updates when something of importance happens. Then the client updates this data.
 */
class InMemoryUserStore {
    users: Map<string, ChatUser>;                       // <userID, TriviaUser>

    constructor() {
        this.users = new Map();
    }

    saveUser(user: ChatUser): void {
        this.users.set(user.id, user);
    };

    getUserById(userID: string): ChatUser {
        const user = this.users.get(userID);
        if (user) {
            return user;
        }
        
        throw new Error(`No user found with id ${userID}`);
    }

    /**
     * Store all users of the application (does not matter which rooms they are member of). This function is executed when the client
     * connects to the server and retrieves a list of all application users.
     */
    addAllUsers(users: ChatUser[]): void {
        users.forEach((user: ChatUser) => {
            this.users.set(user.id, user);
        });
    }

    /**
     * @returns an empty placeholder user representing someone who is logged out.
     */
    getSignedOutUser(): ChatUser {
        return {username: '', avatar: "mario.png", online: false, id: ""};
    }
}

const userStore = new InMemoryUserStore();

export default userStore;