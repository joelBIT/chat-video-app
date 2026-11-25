import { useContext } from "react";
import { UserContext, type UserContextProvider } from "../contexts";

export function useUser(): UserContextProvider {
    const context = useContext<UserContextProvider | undefined>(UserContext);

    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }

    return context;
}