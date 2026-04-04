import type { Store } from "#src/store.ts";
import { HistoryCharts } from "#ui/charts/index.ts";
import { createControlsView } from "#ui/controls/view/panel.tsx";
import { HeaterControl } from "#ui/controls/logic/heater.ts";
import { MetricsReadouts } from "#ui/controls/logic/metrics-readouts.ts";

export type ControlsPanel = {
    root: HTMLElement;
    heater: HeaterControl;
    metrics: MetricsReadouts;
    charts: HistoryCharts;
};

export function createControlsPanel(store: Store): ControlsPanel {
    const view = createControlsView();
    return {
        root: view.root,
        heater: new HeaterControl(store, view.heater),
        metrics: new MetricsReadouts(store, view.simulationTime, view.reactorTemp),
        charts: new HistoryCharts(store, view.canvasReactants, view.canvasNh3),
    };
}

/** Start all store listeners for the controls column (call once after the root is in the document). */
export function bindControlsPanel(panel: ControlsPanel): void {
    panel.heater.subscribe();
    panel.metrics.subscribe();
    panel.charts.subscribe();
}
