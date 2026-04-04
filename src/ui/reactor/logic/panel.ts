import type { Store } from "#src/store.ts";
import { IntegratorPanel } from "#ui/simulator/logic/integrator.ts";
import { createReactorPanelView } from "#ui/reactor/view/panel.tsx";
import { ReactionPanel } from "#ui/reactor/logic/reaction-panel.ts";
import { SnapshotReadouts } from "#ui/reactor/logic/readouts.ts";

export type ReactorPanel = {
    root: HTMLElement;
    readouts: SnapshotReadouts;
    integrator: IntegratorPanel;
    reaction: ReactionPanel;
};

export function createReactorPanel(store: Store): ReactorPanel {
    const view = createReactorPanelView();
    return {
        root: view.root,
        readouts: new SnapshotReadouts(store, view.readouts),
        integrator: new IntegratorPanel(store, view.integrator),
        reaction: new ReactionPanel(store, view.reaction),
    };
}

/** Start all store listeners for the reactor column (call once after the root is in the document). */
export function bindReactorPanel(panel: ReactorPanel): void {
    panel.readouts.subscribe();
    panel.integrator.subscribe();
    panel.reaction.subscribe();
}
