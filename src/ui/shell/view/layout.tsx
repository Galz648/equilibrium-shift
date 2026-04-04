import { h } from "#ui/core/jsx-dom.ts";

/** Two-column shell: reactor | controls. */
export function shellLayout(reactorColumn: HTMLElement, controlsColumn: HTMLElement): HTMLDivElement {
    return (
        <div className="appShell">
            {reactorColumn}
            {controlsColumn}
        </div>
    ) as HTMLDivElement;
}
