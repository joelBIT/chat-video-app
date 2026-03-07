import { NEW_ANSWER, NEW_OFFER, SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER } from "../../socketApplication/utils";
import { socket } from "../socket-client";

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

let localStream;            // Hold the local video stream
let remoteStream;           // Hold the remote video stream
let peerConnection;         // The peer connection that the two clients use to talk
let didIOffer = false;      // True if you initiated the call

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

/**
 * A user must approve that the application uses media devices.
 */
function fetchUserMedia() {
    return new Promise( async(resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localVideoEl.srcObject = stream;
            localStream = stream;    
            resolve();          // User approved
        } catch(error) {
            console.log(error);
            reject();           // User did not approve
        }
    });
}

/**
 * Is called by socket listeners when an 'answer-response' event is emitted.
 * At this point, the offer and answer have been exchanged and client 1 needs to set the remote.
 */
export async function addAnswer(offerObject) {
    await peerConnection.setRemoteDescription(offerObject.answer);
    console.log(peerConnection.signalingState);
}

/**
 * RTCPeerConnection creates the connection.
 * We can pass a config object, and that config object can contain stun servers which will fetch us ICE candidates.
 * A WebRTC track represents a single media stream, often audio and video.
 * Tracks are the fundamental, individual components of real-time communication sent between peers, 
 * enabling functionalities like pausing video while keeping audio active, or managing multi-camera setups.
 */
function createPeerConnection(offerObject) {
    return new Promise( async(resolve, reject) => {
        peerConnection = await new RTCPeerConnection(peerConfiguration);
        remoteStream = new MediaStream();
        remoteVideoEl.srcObject = remoteStream;

        localStream.getTracks().forEach( track => {
            //add localtracks so that they can be sent once the connection is established
            peerConnection.addTrack(track, localStream);
        })

        peerConnection.addEventListener("signalingstatechange", e => {
            console.log(e);
            console.log(peerConnection.signalingState);
        });

        peerConnection.addEventListener('icecandidate', e => {
            console.log('........Ice candidate found!......');
            console.log(e);

            if (e.candidate) {
                socket.emit(SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, {
                    iceCandidate: e.candidate,
                    iceUserName: userName,
                    didIOffer
                });
            }
        })
        
        peerConnection.addEventListener('track', e => {
            console.log("Got a track from the other peer");
            console.log(e);

            e.streams[0].getTracks().forEach( track => {
                remoteStream.addTrack(track, remoteStream);
            });
        })

        if (offerObject) {
            // This won't be set when called from call();
            // Will be set when we call from answerOffer()
            // console.log(peerConnection.signalingState) should be stable because no setDesc has been run yet
            await peerConnection.setRemoteDescription(offerObject.offer);
            // console.log(peerConnection.signalingState) should be have-remote-offer, because client2 has setRemoteDesc on the offer
        }
        resolve();
    })
}

export function addNewIceCandidate(iceCandidate) {
    peerConnection.addIceCandidate(iceCandidate);
    console.log("======Added Ice Candidate======");
}

async function answerOffer(offerObject) {
    await fetchUserMedia();                     // Block the application until the user approves
    await createPeerConnection(offerObject);

    const answer = await peerConnection.createAnswer({});       // Just to make the docs happy
    await peerConnection.setLocalDescription(answer);           // This is CLIENT2, and CLIENT2 uses the answer as the localDesc
    console.log(offerObject);
    console.log(answer);
    console.log(peerConnection.signalingState)      // Should be have-local-pranswer because CLIENT2 has set its local desc to it's answer (but it won't be)

    offerObject.answer = answer;                    // Add the answer to the offerObj so the server knows which offer this is related to
    
    // Emit the answer to the signaling server, so it can emit to CLIENT1
    // Expect a response from the server with the already existing ICE candidates
    const offerIceCandidates = await socket.emitWithAck(NEW_ANSWER, offerObject);
    offerIceCandidates.forEach( candidate => {
        peerConnection.addIceCandidate(candidate);
        console.log("======Added Ice Candidate======");
    });

    console.log(offerIceCandidates);
}

export async function call() {
    await fetchUserMedia();

    // peerConnection is all set with our STUN servers sent over
    await createPeerConnection();

    // Create offer
    try {
        const offer = await peerConnection.createOffer();
        console.log(offer);
        peerConnection.setLocalDescription(offer);
        didIOffer = true;
        socket.emit(NEW_OFFER, offer);             // Send offer to signalingServer
    } catch (error) {
        console.log(error);
    }
}