import { useContext } from "react";
import { SocketContext, SocketContextProvider } from "../_contexts";

export function useSocket(): SocketContextProvider {
    const context: SocketContextProvider = useContext<SocketContextProvider>(SocketContext);

    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }

    return context;
}