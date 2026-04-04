import type { Store } from "../store";
import { createControlsPanel } from "./controls/controls-panel";
import { createReactorPanel } from "./reactor/reactor-panel";
import { createAppShellLayout } from "./shell/app-shell.view";

/**
 * Mount orchestration: shell view + feature folders (`reactor/`, `controls/`, `charts/`, `core/`, `shell/`).
 */
export function mountAmmoniaEquilibriumApp(root: HTMLElement, store: Store): void {
    root.className = "app";
    root.replaceChildren();

    const reactor = createReactorPanel(store);
    const controls = createControlsPanel(store);

    root.append(createAppShellLayout(reactor.root, controls.root));

    reactor.reactorReadouts.subscribe();
    reactor.simulationState.subscribe();
    controls.heater.subscribe();
    controls.sidebarReadouts.subscribe();
    controls.charts.subscribe();
}
