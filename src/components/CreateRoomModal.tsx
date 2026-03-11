import { type ReactElement, useEffect, useRef, useState } from 'react';
import { useRoom } from '../hooks';

import "./CreateRoomModal.css";

/**
 * Modal used to create rooms. It is only possible to create new rooms in the "Games" namespace (id 2).
 */
export function CreateRoomModal({ close }: { close: () => void }): ReactElement {
    const [roomName, setRoomName] = useState<string>('');
    const [privateRoom, setPrivateRoom] = useState<boolean>(true);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { createGameRoom } = useRoom();

    useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    /**
     * Rooms may only be created in the "Games" namespace (id 2). The ID of the new room is an empty string because the room will get a random ID
     * on the server when the room is persisted.
     */
    function createRoom(): void {
        createGameRoom(roomName, privateRoom);
        close();
    }

    return (
        <dialog id="createRoomModal" ref={dialogRef}>
            <section className='create-room__header'>
                <h1 className='createRoomModal__title'> Create Room </h1>

                <input type="checkbox" name="private-room" role="switch" className="lock" onChange={() => setPrivateRoom(!privateRoom)} />
            </section>

            <input placeholder="Room Name" onChange={event => setRoomName(event.target.value)} className='roomName__input' />

            <section className='createRoomModal__buttons'>
                <button onClick={close} className="closeButton"> Cancel </button>
                <button onClick={createRoom} className="createButton" disabled={roomName.length === 0}> Create </button>
            </section>
        </dialog>
    );
}