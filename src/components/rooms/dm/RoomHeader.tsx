import type { ReactElement } from "react";
import { useMultiplex, useRoom, useUser } from "../../../hooks";
import { getSelectedRoom } from "../../../clientApplication/services/roomService";
import { getUserByUsername } from "../../../clientApplication/services/userService";

import "./RoomHeader.css";

/**
 * Header in DM rooms that is used for Web RTC calls (call, hangup) and showing user status (in a call, offline).
 */
export function RoomHeader(): ReactElement {
    const { user } = useUser();
    const { selectedRoom } = useRoom();
    const { activeCall, isCalling, remoteUsername, initiateCall, hangup } = useMultiplex();

    /**
     * Parameter 'video' is true if it is a video call, otherwise false (only audio).
     */
    function callUser(video: boolean): void {
        const remoteUsername: string | undefined = getSelectedRoom()?.name;
        if (remoteUsername) {
            initiateCall(user.username, remoteUsername, video);
        }
    }

    /**
     * It should not be possible to call users that are offline.
     */
    function isOnline(): boolean {
        const username: string | undefined = getSelectedRoom()?.name;
        if (username) {
            try {
                return getUserByUsername(username).online;
            } catch (error) { }
        }
        
        return false;
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

    return (
        <>
            {
                isInACall() ? 
                    <section id="dmRoom-header">
                        <p className="dmRoom-header__text"> {selectedRoom?.name} is in a call </p>
                    </section>
                    :
                isOnline() ?
                    <section id="dmRoom-header">
                        {
                            activeCall || isCalling ? <button className="app-button" onClick={() => hangup(user.username)}> Hangup </button> 
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
                    <section id="dmRoom-header">
                        <p className="dmRoom-header__text"> {selectedRoom?.name} is not online </p>
                    </section>
            }
        </>
    );
}