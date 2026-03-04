import type { TriviaUser } from "../../../types";

/**
 * Keeps track of application users. Update user information (e.g., online status or username/avatar changes).
 * Instead of retrieving information all the time from the server, data sent from the server is stored on the client. 
 * The server sends updates when something of importance happens. Then the client updates this data.
 */
class InMemoryUserStore {
    users: Map<string, TriviaUser>;                       // <userID, TriviaUser>

    constructor() {
        this.users = new Map();
    }

    saveUser(user: TriviaUser): void {
        this.users.set(user.id, user);
    };

    getUserById(userID: string): TriviaUser {
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
    addAllUsers(users: TriviaUser[]): void {
        users.forEach((user: TriviaUser) => {
            this.users.set(user.id, user);
        });
    }

    /**
     * @returns an empty placeholder user representing someone who is logged out.
     */
    getSignedOutUser(): TriviaUser {
        return {username: '', avatar: "businessman_avatar.svg", online: false, id: ""};
    }
}

const userStore = new InMemoryUserStore();

export default userStore;