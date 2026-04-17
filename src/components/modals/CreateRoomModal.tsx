import { type ReactElement, useEffect, useRef, useState } from 'react';
import { useRoom } from '../../hooks';

import "./CreateRoomModal.css";

/**
 * Modal used to create rooms. It is only possible to create new rooms in the "Games" namespace (id 2).
 */
export function CreateRoomModal({ close }: { close: () => void }): ReactElement {
    const [roomName, setRoomName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [privateRoom, setPrivateRoom] = useState<boolean>(true);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { createGameRoom } = useRoom();

    useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    function togglePrivate(isPrivate: boolean): void {
        if (!isPrivate) {
            setPassword(_oldPass => '');
        }
        setPrivateRoom(isPrivate);
    }

    /**
     * Rooms may only be created in the "Games" namespace (id 2). The ID of the new room is an empty string because the room will get a random ID
     * on the server when the room is persisted.
     */
    function createRoom(): void {
        createGameRoom(roomName, privateRoom, password);
        close();
    }

    return (
        <dialog id="createRoomModal" ref={dialogRef}>
            <section className='create-room__header'>
                <h1 className='createRoomModal__title'> Create Room </h1>

                <input 
                    type="checkbox" 
                    name="private-room" 
                    role="switch" 
                    className="lock" 
                    onChange={() => togglePrivate(!privateRoom)}
                    title='Private room?'
                />
            </section>

            <section id="room-input">
                <h2 className='roomName__input-label'> Between 3 - 20 characters </h2>
                <input 
                    placeholder="Room Name" 
                    maxLength={20} 
                    minLength={3}
                    onChange={event => setRoomName(event.target.value)} 
                    className='roomName__input' 
                />

                <input 
                    placeholder="Password" 
                    maxLength={20} 
                    minLength={1}
                    value={password}
                    disabled={!privateRoom}
                    onChange={event => setPassword(event.target.value)} 
                    className='password__input' 
                />
            </section>

            <section className='createRoomModal__buttons'>
                <button onClick={close} className="app-button"> Cancel </button>
                <button onClick={createRoom} className="app-button" disabled={roomName.length < 3 || (privateRoom && password.length < 1)}> Create </button>
            </section>
        </dialog>
    );
}