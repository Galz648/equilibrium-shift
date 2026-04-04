import { h } from "#ui/core/jsx-dom.ts";

export type MetricsBlock = {
    node: HTMLElement;
    simulationTime: HTMLElement;
    reactorTemp: HTMLElement;
};

/** Time, heat (shared span), and reactor temperature readouts. */
export function metrics(heatValue: HTMLElement): MetricsBlock {
    const simulationTime = <span className="ctrl-rowValue ctrl-rowTime" /> as HTMLSpanElement;
    const reactorTemp = <span className="ctrl-rowValue ctrl-rowTemp" /> as HTMLSpanElement;

    const node = (
        <div className="ctrl-metrics" aria-label="Simulation and heater readouts">
            <div className="ctrl-row">
                <span className="ctrl-rowLabel">Simulation time</span>
                {simulationTime}
            </div>
            <div className="ctrl-row">
                <span className="ctrl-rowLabel">Heat input</span>
                {heatValue}
            </div>
            <div className="ctrl-row">
                <span className="ctrl-rowLabel">Reactor temperature</span>
                {reactorTemp}
            </div>
        </div>
    ) as HTMLElement;

    return { node, simulationTime, reactorTemp };
}
