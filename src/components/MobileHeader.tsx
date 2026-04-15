import { useState, type ReactElement } from "react";
import { Tabs } from ".";

import "./MobileHeader.css";

/**
 * The options in the MobileHeader varies depending on if the DM namespace (private conversations) is selected or not.
 */
export function MobileHeader({isDmNamespace}: {isDmNamespace: boolean}): ReactElement {
    const commonTabTitles = ["Menu", "Rooms", "Members"];
    const conversationTabTitles = ["Menu", "Conversations"];
    const [active, setActive] = useState<string>(isDmNamespace ? conversationTabTitles[1] : commonTabTitles[1]);

    return (
        <section id="mobileHeader">
            {
                isDmNamespace ?
                    <Tabs titles={conversationTabTitles} active={active} setActive={setActive} />
                    :
                    <Tabs titles={commonTabTitles} active={active} setActive={setActive} />
            }
        </section>
    )
}