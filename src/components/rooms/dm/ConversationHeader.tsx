import { useState, type ReactElement } from "react";
import { useMultiplex, useUser } from "../../../hooks";
import { getSelectedRoom } from "../../../clientApplication/services/roomService";
import { getUserByUsername } from "../../../clientApplication/services/userService";
import type { ChatUser } from "../../../types";

import "./ConversationHeader.css";

/**
 * Header in DM rooms that is used for Web RTC calls (audio, video) and showing user status (in a call, offline).
 * It should not be possible to call users that are offline. It should not be possible to call users that are already in a call.
 */
export function ConversationHeader(): ReactElement {
    const [remoteUser] = useState<ChatUser>(getUserByUsername(getSelectedRoom()?.name as string));
    const { user } = useUser();
    const { activeCall, isCalling, remoteUsername, initiateCall } = useMultiplex();

    /**
     * Parameter 'video' is true if it is a video call, otherwise false (only audio).
     */
    function callUser(video: boolean): void {
        initiateCall(user.username, remoteUser.username, video);
    }

    /**
     * It should not be possible to call users that are already in a call.
     */
    function isInACall(): boolean {
        const username: string | undefined = getSelectedRoom()?.name;
        if (username && (username !== remoteUsername)) {            // Only a user who is a participant in the call may hangup. Other users are shown text.
            try {
                return getUserByUsername(username).inCall;
            } catch (error) { }
        }
        
        return false;
    }

    /**
     * It should not be possible to call users that are offline.
     */
    function isOnline(): boolean {
        return getUserByUsername(getSelectedRoom()?.name as string).online;
    }

    if (isInACall()) {
        return (
            <section id="conversationHeader">
                <p className="conversationHeader__text"> {remoteUser.username} is in a call </p>
            </section>
        )
    }

    return (
        <>
            {
                isOnline() ?
                    <section id="conversationHeader">
                        {
                            activeCall || isCalling ? <p className="conversationHeader__text"> In a call with {remoteUser.username} </p>
                            :
                            <section className="chat-buttons">
                                <article className="communication-button" onClick={() => callUser(false)}>
                                    <img 
                                        src="/audio.svg" 
                                        alt="Audio chat icon" 
                                        title="Call User" 
                                        className="button__icon" 
                                    />

                                    <h2 className="button__label"> Audio </h2>
                                </article>

                                <article className="communication-button" onClick={() => callUser(true)}>
                                    <img 
                                        src="/video.svg" 
                                        alt="Video chat icon" 
                                        title="Video conference" 
                                        className="button__icon" 
                                    />

                                    <h2 className="button__label"> Video </h2>
                                </article>
                            </section>
                        }
                    </section>
                :
                    <section id="conversationHeader">
                        <p className="conversationHeader__text"> {remoteUser.username} is not online </p>
                    </section>
            }
        </>
    );
}