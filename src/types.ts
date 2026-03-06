export type Room = {
    id: string,                 // the ID of the room is the recipient's ID if private conversation (private = true)
    name: string,               // the name of the room is the recipient's username if private conversation (private = true)
    namespaceId: number,   // the namespace ID of the room is 1 if private conversation (private = true)
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
    from: ChatUser,
    to: Room;           // In public message it is a chat room, and in private message 
    text: string,
    date: number
}

export type ChatUser = {
    id: string,
    username: string,
    avatar: string,
    online: boolean
}

export type ActionState = {
    message: string,
    success: boolean
}

export type Offer = {
    offererUserName: string,
    offer: RTCSessionDescriptionInit,
    offerIceCandidates: RTCIceCandidate[],
    answererUserName: string,
    answer: RTCSessionDescriptionInit | null,       // An answer may be null if the Offer is new
    answererIceCandidates: RTCIceCandidate[]
}