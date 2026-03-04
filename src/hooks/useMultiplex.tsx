import { useContext } from "react";
import { MultiplexContext, MultiplexContextProvider } from "../_contexts";

export function useMultiplex(): MultiplexContextProvider {
    const context: MultiplexContextProvider = useContext<MultiplexContextProvider>(MultiplexContext);

    if (!context) {
        throw new Error("useMultiplex must be used within a MultiplexProvider");
    }

    return context;
}