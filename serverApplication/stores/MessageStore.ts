import type { Message } from "../../src/types";

/**
 * This class is used to store private conversations between users (namespace DMs).
 */
class InMemoryMessageStore {
    private messages: Message[];                        // Conversation messages (only in namespace "DMs").
    private conversations: Map<string, string[]>;       // <userID, roomID[]>

    constructor() {
        this.messages = [];                     // Used for storing private messages between users.
        this.conversations = new Map();         // Used for fast lookup of which conversations a client has.
    }

    saveMessage(message: Message): void {
        this.messages.push(message);
    }

    /**
     *  Retrieve conversation messages between user1 and user2.
     * 
     * @param {*} user1ID One of 2 users in a private conversation
     * @param {*} user2ID The second user in the private conversation
     * @returns all private messages between user1 and user2
     */
    findConversationMessages(user1ID: string, user2ID: string): Message[] {
        return this.messages.filter(
            ({ from, to }: Message) => (from.id === user1ID && to.id === user2ID) || (from.id === user2ID && to.id === user1ID)
        );
    }

    saveConversations(userID: string, conversations: string[]): void {
        this.conversations.set(userID, conversations);
    }

    /**
     * @returns a list of recipientIDs of all conversations supplied userID has.
     */
    findConversations(userID: string): string[] {
        return this.conversations.get(userID) ?? [];
    }

    /**
     * Returns true if any message exists in a conversation between user1 and user2.
     */
    hasConversationMessage(user1ID: string, user2ID: string): boolean {
        return this.messages.find(
            ({ from, to }: Message) => (from.id === user1ID && to.id === user2ID) || (from.id === user2ID && to.id === user1ID)
        ) ? true : false;
    }
}

const messageStore = new InMemoryMessageStore();

export default messageStore;