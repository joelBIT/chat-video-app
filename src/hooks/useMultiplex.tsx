import { useContext } from "react";
import { MultiplexContext, type MultiplexContextProvider } from "../contexts";

export function useMultiplex(): MultiplexContextProvider {
    const context = useContext<MultiplexContextProvider | undefined>(MultiplexContext);

    if (!context) {
        throw new Error("useMultiplex must be used within a MultiplexProvider");
    }

    return context;
}