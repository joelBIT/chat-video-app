import type { ReactElement } from "react";

import "./NotFoundPage.css";

export default function NotFoundPage(): ReactElement {
    return (
        <main id="notFoundPage">
            <h1 className="message-failure"> Page Not Found </h1>
        </main>
    )
}