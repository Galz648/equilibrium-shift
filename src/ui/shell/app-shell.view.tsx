import { h } from "../core/jsx-dom";

/** Top-level two-column shell: no store, no behavior. */
export function createAppShellLayout(reactorColumn: HTMLElement, controlsColumn: HTMLElement): HTMLDivElement {
    return (
        <div className="layout">
            {reactorColumn}
            {controlsColumn}
        </div>
    ) as HTMLDivElement;
}
