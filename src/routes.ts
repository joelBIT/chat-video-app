import { createBrowserRouter } from "react-router";
import { HOME_URL, ROOMS_URL } from "../socketApplication/utils";
import { App } from "./App";
import LandingPage from "./pages/LandingPage";
import RoomsPage from "./pages/RoomsPage";

export const routes = createBrowserRouter([
    {
        path: HOME_URL,
        Component: App,
        children: [
            {
                index: true,
                Component: LandingPage
            },
            {
                path: ROOMS_URL,
                Component: RoomsPage
            }
        ]
    }
]);