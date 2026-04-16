import { useState, type ReactElement } from "react";
import { Tabs } from "..";

import "./MobileHeader.css";

/**
 * The options in the MobileHeader varies depending on if the DM namespace (private conversations) is selected or not.
 */
export function MobileHeader({isDmNamespace}: {isDmNamespace: boolean}): ReactElement {
    const commonTabTitles = ["Menu", "Rooms", "Members"];
    const conversationTabTitles = ["Menu", "Conversations"];
    const [active, setActive] = useState<string>("");

    /**
     * Set class on mobileHeader that corresponds to the selected menu option.
     */
    function selectedMenuOptions(activeTab: string): string {
        switch(activeTab) {
            case "Menu":
                return "show-menu";
            case "Rooms":
                return "show-rooms";
            case "Conversations":
                return "show-conversations";
            case "Members":
                return "show-members"
            default:
                return "";
        }
    }

    return (
        <section id="mobileHeader" className={selectedMenuOptions(active)}>
            {
                isDmNamespace ?
                    <Tabs titles={conversationTabTitles} active={active} setActive={setActive} />
                    :
                    <Tabs titles={commonTabTitles} active={active} setActive={setActive} />
            }
        </section>
    )
}