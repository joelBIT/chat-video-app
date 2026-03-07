'use client';

import { createContext, type ReactElement, type ReactNode, useState } from "react";
import { getSignedOutUser } from "../clientApplication/services/userService";
import type { ChatUser } from "../types";

export interface UserContextProvider {
    user: ChatUser;
    setUserInformation: (user: ChatUser) => void;
}

export const UserContext = createContext<UserContextProvider>({} as UserContextProvider);

/**
 * The businessman-avatar.svg icon is the default avatar. A user that is not logged in has an empty username.
 */
export function UserProvider({ children }: { children: ReactNode }): ReactElement {
    const [user, setUser] = useState<ChatUser>(getSignedOutUser());

    function setUserInformation(user: ChatUser): void {
        setUser(user);
    }

    return (
        <UserContext.Provider value={{ user, setUserInformation }}>
            { children }
        </UserContext.Provider>
    );
}