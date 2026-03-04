import { useContext } from "react";
import { UserContext, UserContextProvider } from "../_contexts";

export function useUser(): UserContextProvider {
    const context: UserContextProvider = useContext<UserContextProvider>(UserContext);

    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }

    return context;
}