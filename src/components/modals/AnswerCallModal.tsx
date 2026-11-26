import { type ReactElement, useEffect, useRef } from 'react';
import { useNavigate } from "react-router";
import { useMultiplex, useRoom } from '../../hooks';
import { NAMESPACE_ID_DM, ROOMS_URL } from '../../serverApplication/utils/constants';
import { getSelectedNamespaceRooms } from '../../clientApplication/services/roomService';
import { getUserByUsername } from '../../clientApplication/services/userService';
import type { Room } from '../../types';

import "./AnswerCallModal.css";

/**
 * Modal used to answer an incoming call. A user can either hangup or take the call.
 */
export function AnswerCallModal({ answerCall, denyCall }: { answerCall: () => void, denyCall: () => void }): ReactElement {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const navigate = useNavigate();
    const { changeRoom, changeNamespace, createPrivateRoom } = useRoom();
    const { remoteUsername } = useMultiplex();

    useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    /**
     * Go to the conversation with the caller (creating it if this is the first contact) and answer the call.
     */
    async function acceptCall(): Promise<void> {
        changeNamespace(NAMESPACE_ID_DM);

        try {
            const conversation: Room | undefined = getSelectedNamespaceRooms().find((room: Room) => room.name === remoteUsername);
            if (conversation) {
                changeRoom(conversation);
            } else {
                await createPrivateRoom(getUserByUsername(remoteUsername));
            }
        } catch (error) {
            console.log(error);
            return;
        }

        navigate(ROOMS_URL, { replace: true });
        answerCall();
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