import { type ReactNode } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";

import "./ErrorPage.css";

export function ErrorPage(): ReactNode {
    const error = useRouteError();
    console.log(error);

    if (isRouteErrorResponse(error)) {
        return (
            <main id="errorPage">
                <h1 className="message-failure"> {error.data} </h1>
            </main>
        );
    } else if (error instanceof Error) {
        return (
            <main id="errorPage">
                <h1 className="message-failure"> {error.message} </h1>
            </main>
        );
    } else {
        return (
            <main id="errorPage">
                <h1 className="message-failure"> Unknown Error </h1>
            </main>
        );
    }
}