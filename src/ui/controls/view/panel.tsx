import type { HeaterTargets } from "#ui/controls/logic/types.ts";
import { h } from "#ui/core/jsx-dom.ts";
import { chartsBlock } from "#ui/controls/view/charts.tsx";
import { heater } from "#ui/controls/view/heater.tsx";
import { metrics } from "#ui/controls/view/metrics.tsx";

export type ControlsColumnView = {
    root: HTMLElement;
    heater: HeaterTargets;
    simulationTime: HTMLElement;
    reactorTemp: HTMLElement;
    canvasReactants: HTMLCanvasElement;
    canvasNh3: HTMLCanvasElement;
};

export function createControlsView(): ControlsColumnView {
    const htr = heater();
    const met = metrics(htr.heatValue);
    const ch = chartsBlock();

    const root = (
        <aside className="panel panel--controls" id="controls" aria-labelledby="controls-heading">
            <h2 className="panel__title" id="controls-heading">
                Controls
            </h2>
            {htr.root}
            {met.node}
            {ch.node}
        </aside>
    ) as HTMLElement;

    return {
        root,
        heater: htr,
        simulationTime: met.simulationTime,
        reactorTemp: met.reactorTemp,
        canvasReactants: ch.canvasReactants,
        canvasNh3: ch.canvasNh3,
    };
}
