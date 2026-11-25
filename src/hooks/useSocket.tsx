import { useContext } from "react";
import { SocketContext, type SocketContextProvider } from "../contexts";

export function useSocket(): SocketContextProvider {
    const context = useContext<SocketContextProvider | undefined>(SocketContext);

    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }

    return context;
}