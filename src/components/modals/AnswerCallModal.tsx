import { type ReactElement, useEffect, useRef } from 'react';
import { useNavigate } from "react-router";
import { useMultiplex, useRoom } from '../../hooks';
import { NAMESPACE_ID_DM, ROOMS_URL } from '../../serverApplication/utils/constants';
import { setSelectedNamespaceId } from '../../clientApplication/services/namespaceService';
import { getSelectedNamespaceRooms } from '../../clientApplication/services/roomService';

import "./AnswerCallModal.css";

/**
 * Modal used to answer an incoming call. A user can either hangup or take the call.
 */
export function AnswerCallModal({ answerCall, denyCall }: { answerCall: () => void, denyCall: () => void }): ReactElement {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const navigate = useNavigate();
    const { changeRoom } = useRoom();
    const { remoteUsername } = useMultiplex();

    useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    /**
     * If the user accepts the invite; navigate to the room (conversation) of the caller and start streaming the call.
     */
    function acceptCall(): void {
        setSelectedNamespaceId(NAMESPACE_ID_DM);
        const conversations = getSelectedNamespaceRooms();
        for (let i = 0; i < conversations.length; i++) {
            if (conversations[i].name === remoteUsername) {
                changeRoom(conversations[i]);
                navigate(ROOMS_URL, { replace: true });
                answerCall();
            }
        }
    }

    return (
        <dialog id="answerCallModal" ref={dialogRef}>
            <h1 className='answerCallModal__title'> Incoming call from {remoteUsername} </h1>

            <section className='answerCallModal__buttons'>
                <button onClick={denyCall} className="app-button"> Hangup </button>
                <button onClick={acceptCall} className="app-button"> Answer </button>
            </section>
        </dialog>
    );
}