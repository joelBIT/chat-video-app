import { createBrowserRouter } from "react-router";
import { App } from "./components";
import { HOME_URL } from "../socketApplication/utils";

export const  routes = createBrowserRouter([
    {
        path: HOME_URL,
        Component: App
    },
]);