import type { Store } from "../../store";
import { createReactorPanelView } from "./reactor-panel.view";
import { ReactorReadouts } from "./reactor-readouts";
import { SimulationStatePanel } from "./simulation-state-panel";

export type ReactorPanelBundle = {
    root: HTMLElement;
    reactorReadouts: ReactorReadouts;
    simulationState: SimulationStatePanel;
};

export function createReactorPanel(store: Store): ReactorPanelBundle {
    const view = createReactorPanelView();
    return {
        root: view.root,
        reactorReadouts: new ReactorReadouts(store, view.readouts),
        simulationState: new SimulationStatePanel(store, view.simulation),
    };
}
