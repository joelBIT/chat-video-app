import { useContext } from "react";
import { RoomContext, type RoomContextProvider } from "../contexts";

export function useRoom(): RoomContextProvider {
    const context = useContext<RoomContextProvider | undefined>(RoomContext);

    if (!context) {
        throw new Error("useRoom must be used within a RoomProvider");
    }

    return context;
}