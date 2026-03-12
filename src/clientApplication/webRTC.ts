import { multiplexSockets } from "../socket-client";
import { NAMESPACE_ID_DM, NEW_ANSWER, NEW_OFFER, SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER } from "../../socketApplication/utils";
import type { Offer } from "../types";

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

let localStream: MediaStream;            // Hold the local video stream
let remoteStream: MediaStream;           // Hold the remote video stream
let peerConnection: RTCPeerConnection;   // The peer connection that the two clients use to talk
let didIOffer: boolean = false;          // True if you initiated the call

/**
 * A user must approve that the application uses media devices. 
 * The 'video' parameter is true if it is a video call, otherwise false (audio only).
 */
function fetchUserMedia(video: boolean): Promise<void> {
    return new Promise( async(resolve, reject) => {
        try {
            const videosEl: HTMLElement | null = document.querySelector('#videos');
            if (videosEl) {
                videosEl.style.display = "flex";
            }
            
            const localVideoEl: HTMLVideoElement | null = document.querySelector('#local-video');
            const stream: MediaStream = await navigator.mediaDevices.getUserMedia(video ? {
                video: true,
                audio: true
            } : {
                audio: true
            });

            if (localVideoEl) {
                localVideoEl.style.display = "flex";
                localVideoEl.srcObject = stream;
            }
            
            localStream = stream;    
            resolve();          // User approved
        } catch (error) {
            console.log(error);
            reject();           // User did not approve
        }
    });
}

/**
 * Is called by socket listeners when an 'answer-response' event is emitted.
 * At this point, the offer and answer have been exchanged and client 1 needs to set the remote.
 */
export async function addAnswer(offer: Offer) {
    if (offer && offer.answer) {
        await peerConnection.setRemoteDescription(offer.answer);
    }
}

/**
 * RTCPeerConnection creates the connection.
 * We can pass a config object, and that config object can contain stun servers which will fetch us ICE candidates.
 * A WebRTC track represents a single media stream, often audio and video.
 * Tracks are the fundamental, individual components of real-time communication sent between peers, 
 * enabling functionalities like pausing video while keeping audio active, or managing multi-camera setups.
 */
function createPeerConnection(username: string, offer?: Offer): Promise<void> {
    return new Promise( async(resolve, reject) => {
        try {
            peerConnection = await new RTCPeerConnection(peerConfiguration);
            remoteStream = new MediaStream();
        } catch (error) {
            reject();
        }
        
        const remoteVideoEl: HTMLVideoElement | null = document.querySelector('#remote-video');
        if (remoteVideoEl) {
            remoteVideoEl.srcObject = remoteStream;
        }

        localStream.getTracks().forEach((track: MediaStreamTrack) => {
            //add localtracks so that they can be sent once the connection is established
            peerConnection.addTrack(track, localStream);
        })

        peerConnection.addEventListener("signalingstatechange", e => {
            console.log(e);
            console.log(peerConnection.signalingState);
        });

        peerConnection.addEventListener('icecandidate', (e: RTCPeerConnectionIceEvent) => {
            if (e.candidate) {
                multiplexSockets[NAMESPACE_ID_DM].emit(SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, {
                    iceCandidate: e.candidate,
                    iceUserName: username,
                    didIOffer
                });
            }
        })
        
        peerConnection.addEventListener('track', (e: RTCTrackEvent) => {
            e.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
                remoteStream.addTrack(track);
            });
        })

        if (offer) {
            // This won't be set when called from call();
            // Will be set when we call from answerOffer()
            // console.log(peerConnection.signalingState) should be stable because no setDesc has been run yet
            await peerConnection.setRemoteDescription(offer.offer);
            // console.log(peerConnection.signalingState) should be have-remote-offer, because client2 has setRemoteDesc on the offer
        }

        resolve();
    });
}

export function addNewIceCandidate(iceCandidate: RTCIceCandidateInit) {
    peerConnection.addIceCandidate(iceCandidate);
}

export async function answerOffer(offer: Offer): Promise<void> {
    await fetchUserMedia(offer.video);                     // Block the application until the user approves
    await createPeerConnection(offer.answererUserName, offer);

    const answer: RTCSessionDescriptionInit = await peerConnection.createAnswer({});
    await peerConnection.setLocalDescription(answer);           // This is CLIENT2, and CLIENT2 uses the answer as the localDesc

    offer.answer = answer;                    // Add the answer to the offer so the server knows which offer this is related to
    
    // Emit the answer to the signaling server, so it can emit to CLIENT1
    // Expect a response from the server with the already existing ICE candidates
    const offerIceCandidates = await multiplexSockets[NAMESPACE_ID_DM].emitWithAck(NEW_ANSWER, offer);
    offerIceCandidates.forEach((candidate: RTCIceCandidateInit) => {
        peerConnection.addIceCandidate(candidate);
    });

    const localVideoEl: HTMLVideoElement | null = document.querySelector('#local-video');
    if (localVideoEl) {
        localVideoEl.srcObject = localStream;
    }

    const remoteVideoEl: HTMLVideoElement | null = document.querySelector('#remote-video');
    if (remoteVideoEl) {
        remoteVideoEl.srcObject = remoteStream;
    }
}

/**
 * Initiate a video or audio (video = false) call to a remote user.
 */
export async function call(fromUsername: string, toUsername: string, video: boolean) {
    await fetchUserMedia(video);

    // peerConnection is all set with our STUN servers sent over
    await createPeerConnection(fromUsername);

    try {
        const offer: RTCSessionDescriptionInit = await peerConnection.createOffer();
        peerConnection.setLocalDescription(offer);
        didIOffer = true;
        multiplexSockets[NAMESPACE_ID_DM].emit(NEW_OFFER, fromUsername, toUsername, video, offer);             // Send offer to signalingServer
    } catch (error) {
        console.log(error);
    }
}

export function closeVideoCall(): void {
    if (peerConnection) {
        peerConnection.ontrack = null;
        peerConnection.onicecandidate = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.onsignalingstatechange = null;
        peerConnection.onicegatheringstatechange = null;
        peerConnection.onnegotiationneeded = null;

        const remoteVideoEl: HTMLVideoElement | null = document.querySelector('#remote-video');
        if (remoteVideoEl && remoteVideoEl.srcObject && remoteVideoEl.srcObject instanceof MediaStream) {
            remoteVideoEl.srcObject.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            remoteVideoEl.srcObject = null;
            remoteVideoEl.removeAttribute("src");
            remoteVideoEl.removeAttribute("srcObject");
        }

        const localVideoEl: HTMLVideoElement | null = document.querySelector('#local-video');
        if (localVideoEl && localVideoEl.srcObject && localVideoEl.srcObject instanceof MediaStream) {
            localVideoEl.srcObject.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            localVideoEl.srcObject = null;
            localVideoEl.removeAttribute("src");
            localVideoEl.removeAttribute("srcObject");
        }

        peerConnection.close();
    }

    const videosEl: HTMLElement | null = document.querySelector('#videos');
    if (videosEl) {
        videosEl.style.display = "none";
    }
}