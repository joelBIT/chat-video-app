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

function fetchUserMedia() {
    return new Promise( async(resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                // audio: true,
            });

            localVideoEl.srcObject = stream;
            localStream = stream;    
            resolve();    
        } catch(error) {
            console.log(error);
            reject();
        }
    });
}

/**
 * Is called by socket listeners when an answerResponse is emitted.
 * At this point, the offer and answer have been exchanged and client 1 needs to set the remote.
 */
async function addAnswer(offerObject) {
    await peerConnection.setRemoteDescription(offerObject.answer);
    console.log(peerConnection.signalingState);
}

/**
 * RTCPeerConnection is the thing that creates the connection.
 * We can pass a config object, and that config object can contain stun servers
 * which will fetch us ICE candidates.
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
                socket.emit('sendIceCandidateToSignalingServer', {
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

function addNewIceCandidate(iceCandidate) {
    peerConnection.addIceCandidate(iceCandidate);
    console.log("======Added Ice Candidate======");
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
        socket.emit('newOffer', offer);             // Send offer to signalingServer
    } catch (error) {
        console.log(error);
    }
}