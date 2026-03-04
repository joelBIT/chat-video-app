import { type ReactElement } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { MultiplexProvider, RoomProvider, SocketProvider, UserProvider } from "./contexts";
import { Header } from "./components";

export function App(): ReactElement {
    return (
        <UserProvider>
            <RoomProvider>
                <MultiplexProvider>
                    <SocketProvider>
                        <Header />
                        <Outlet />
                        <ScrollRestoration />
                    </SocketProvider>
                </MultiplexProvider>
            </RoomProvider>
        </UserProvider>
    )
}