import { type ReactElement, useEffect, useRef } from 'react';

import "./AnswerCallModal.css";

/**
 * Modal used to answer an incoming call.
 */
export function AnswerCallModal({ close }: { close: () => void }): ReactElement {
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
                <button onClick={close} className="app-button"> Hangup </button>
                <button className="app-button"> Answer </button>
            </section>
        </dialog>
    );
}