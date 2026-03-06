'use client';

import { createContext, type ReactElement, type ReactNode, useState } from "react";
import { getSignedOutUser } from "../clientApplication/services/userService";
import type { TriviaUser } from "../types";

export interface UserContextProvider {
    user: TriviaUser;
    setUserInformation: (user: TriviaUser) => void;
}

export const UserContext = createContext<UserContextProvider>({} as UserContextProvider);

/**
 * The businessman-avatar.svg icon is the default avatar. A user that is not logged in has an empty username.
 */
export function UserProvider({ children }: { children: ReactNode }): ReactElement {
    const [user, setUser] = useState<TriviaUser>(getSignedOutUser());

    function setUserInformation(user: TriviaUser): void {
        setUser(user);
    }

    return (
        <UserContext.Provider value={{ user, setUserInformation }}>
            { children }
        </UserContext.Provider>
    );
}