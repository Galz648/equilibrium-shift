import type { Store } from "#src/store.ts";
import { bindControlsPanel, createControlsPanel } from "#ui/controls/index.ts";
import { bindReactorPanel, createReactorPanel } from "#ui/reactor/index.ts";
import { shellLayout } from "#ui/shell/index.ts";

/**
 * Mount orchestration: `shell` + `reactor/`, `simulator/`, `controls/`, `charts/`, …
 * Import feature panels only from each folder’s `index.ts` (not deep paths).
 */
export function mountAmmoniaEquilibriumApp(root: HTMLElement, store: Store): void {
    root.className = "app";
    root.replaceChildren();

    const reactor = createReactorPanel(store);
    const controls = createControlsPanel(store);

    root.append(shellLayout(reactor.root, controls.root));

    bindReactorPanel(reactor);
    bindControlsPanel(controls);
}
