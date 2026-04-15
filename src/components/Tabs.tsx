import { useEffect, useState, type ReactElement } from "react";

import "./Tabs.css";

/**
 * 
 * Takes a number of tab titles and creates corresponding tabs.
 * 
 * @param titles        List of titles where each title is shown on a tab.
 * @param defaultTab    The tab (title) set as active when the component is rendered.
 * @param setActive     Function that informs the parent component when a tab has been activated.
 */
export function Tabs({titles, defaultTab, active, setActive}: {titles: string[], defaultTab?: string, active: string, setActive: (tab: string) => void}): ReactElement {
    const [activeTab, setActiveTab] = useState<string>(defaultTab ? defaultTab : titles[0]);

    useEffect( () => {
        setActiveTab(active);
    }, [active])

    function changeActiveTab(tab: string) {
        setActive(tab);         // Inform parent which tab has been clicked
        setActiveTab(tab);      // Switch tab
    }
    
    return (
        <section className="tabs">
            {
                titles.map((title: string) => (
                    <section
                        key={title}
                        className={activeTab === title ? "tab selected" : "tab"}
                        onClick={() => changeActiveTab(title)}
                    >
                        {title}
                    </section>
                ))
            }
        </section>
    );
}