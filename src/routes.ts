import { createBrowserRouter } from "react-router";
import { HOME_URL } from "../socketApplication/utils";
import { App } from "./App";

export const  routes = createBrowserRouter([
    {
        path: HOME_URL,
        index: true,
        Component: App
    },
]);