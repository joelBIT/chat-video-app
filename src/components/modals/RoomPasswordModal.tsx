import { useEffect, useRef, useState, type ReactElement } from "react";
import { useRoom } from "../../hooks";
import type { ActionState, Room } from "../../types";

import "./RoomPasswordModal.css";

/**
 * Modal used to check if a password is correct for a private room. It is not possible to join a private room without entering the correct password.
 */
export function RoomPasswordModal({ room, close }: { room: Room, close: () => void }): ReactElement {
    const [password, setPassword] = useState<string>('');
    const [response, setResponse] = useState<ActionState>({message: '', success: false});
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { joinPrivateRoom } = useRoom();

     useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    async function joinRoom(): Promise<void> {
        const data: ActionState = await joinPrivateRoom(room, password);
        setResponse(data);
        if (data.success) {
            close();
        } else {
            setPassword('');
        }
    }
    
    return (
        <dialog id="roomPasswordModal" ref={dialogRef}>
            <section className='password-room__header'>
                <h1 className='roomPasswordModal__title'> Enter password for room <i className="room-name">{room.name}</i> </h1>

                <input 
                    placeholder="Password" 
                    maxLength={20} 
                    minLength={1}
                    value={password}
                    onChange={event => setPassword(event.target.value)} 
                    className='password__input' 
                />
            </section>

            {
                response.message.length > 0 && !response.success ?
                    <h2 className="error-message"> {response.message} </h2>
                    : <></>
            }

            <section className='roomPasswordModal__buttons'>
                <button onClick={close} className="app-button"> Close </button>
                <button onClick={joinRoom} className="app-button" disabled={password.length < 1}> Join </button>
            </section>
        </dialog>
    );
}