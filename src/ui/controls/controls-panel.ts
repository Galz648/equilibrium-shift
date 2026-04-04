import type { Store } from "../../store";
import { ReactorHistoryCharts } from "../charts/reactor-history-charts";
import { createControlsPanelView } from "./controls-panel.view";
import { createHeaterControlView } from "./heater-control.view";
import { HeaterControl } from "./heater-control";
import { SidebarReadouts } from "./sidebar-readouts";

export type ControlsPanelBundle = {
    root: HTMLElement;
    heater: HeaterControl;
    sidebarReadouts: SidebarReadouts;
    charts: ReactorHistoryCharts;
};

export function createControlsPanel(store: Store): ControlsPanelBundle {
    const heaterView = createHeaterControlView();
    const view = createControlsPanelView(heaterView);

    return {
        root: view.root,
        heater: new HeaterControl(store, view.heater),
        sidebarReadouts: new SidebarReadouts(store, view.clockEl, view.reactorTempEl),
        charts: new ReactorHistoryCharts(store, view.canvasReactants, view.canvasNh3),
    };
}
