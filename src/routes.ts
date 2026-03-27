import { createBrowserRouter } from "react-router";
import { HOME_URL, NOT_FOUND_URL, PROFILE_URL, ROOMS_URL } from "../serverApplication/utils";
import { App } from "./App";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import RoomsPage from "./pages/RoomsPage";
import ProfilePage from "./pages/ProfilePage";
import { ErrorPage } from "./pages/ErrorPage";

export const routes = createBrowserRouter([
    {
        path: HOME_URL,
        Component: App,
        ErrorBoundary: ErrorPage,
        children: [
            {
                index: true,
                Component: LandingPage
            },
            {
                path: NOT_FOUND_URL,
                Component: NotFoundPage
            },
            {
                path: ROOMS_URL,
                Component: RoomsPage
            },
            {
                path: PROFILE_URL,
                Component: ProfilePage
            }
        ]
    }
]);