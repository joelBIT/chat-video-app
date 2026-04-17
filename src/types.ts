export type Room = {
    id: string,
    name: string,
    namespaceId: number,
    private: boolean,
    members: string[],          // List of userIDs for each member of the room
    history: Message[]
}

export type Namespace = {
    id: number,
    name: string,
    image: string,
    endpoint: string,
    rooms: Room[]
}

export type Message = {
    from: string,           // User ID of the sender
    to: string,             // Room ID or user ID (DM) of the recipient
    public: boolean,        // true if the message was sent to a room, false if the message is sent in a private conversation between two users (DM).
    text: string,
    date: number
}

export type ChatUser = {
    id: string,
    username: string,
    avatar: string,
    inCall: boolean,
    online: boolean,
    lastActive: number      // When the user was last active (datetime when logging in/logging out)
}

export type ActionState = {
    message: string,
    success: boolean
}




 /***************
 * WebRTC types *
 ***************/

export type Offer = {
    offererUserName: string,
    offer: RTCSessionDescriptionInit,
    offerIceCandidates: RTCIceCandidate[],
    answererUserName: string,
    answer: RTCSessionDescriptionInit | null,       // An answer may be null if the Offer is new
    answererIceCandidates: RTCIceCandidate[],
    video:  boolean                                 // True if video, otherwise only audio
}