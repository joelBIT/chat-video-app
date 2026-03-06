/**
 * The client will send a request to a STUN server on the Internet who will reply with the 
 * client's public address and whether or not the client is accessible behind the router's NAT.
 */
const peerConfiguration = {
    iceServers:[
        {
            urls:[
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302'
            ]
        }
    ]
}

export function call() {
    
}