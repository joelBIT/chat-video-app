import { type ReactElement, useEffect, useRef } from 'react';

import "./AnswerCallModal.css";

/**
 * Modal used to answer an incoming call. A user can either hangup or take the call.
 */
export function AnswerCallModal({ answerCall, denyCall }: { answerCall: () => void, denyCall: () => void }): ReactElement {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    return (
        <dialog id="answerCallModal" ref={dialogRef}>
            <h1 className='answerCallModal__title'> Incoming Call </h1>

            <section className='answerCallModal__buttons'>
                <button onClick={denyCall} className="app-button"> Hangup </button>
                <button onClick={answerCall} className="app-button"> Answer </button>
            </section>
        </dialog>
    );
}