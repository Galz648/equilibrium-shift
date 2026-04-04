import type { IntegratorTargets } from "#ui/simulator/logic/types.ts";
import { h } from "#ui/core/jsx-dom.ts";
import { reactorStatGroup, reactorStatRow, reactorValuePlaceholder } from "#ui/core/reactor-rows.tsx";

export type IntegratorSectionView = { node: HTMLElement } & IntegratorTargets;

/** Clock and timestep; lives in the reactor column but represents the simulator, not the vessel. */
export function integratorSection(): IntegratorSectionView {
    const simulationTime = reactorValuePlaceholder();
    const simulationStep = reactorValuePlaceholder();

    const node = (
        <section className="reactor-card" id="simulator" aria-labelledby="simulator-head">
            <h3 className="reactor-cardTitle" id="simulator-head">
                Simulator
            </h3>
            {reactorStatGroup("Time integration", [
                reactorStatRow("Time", simulationTime),
                reactorStatRow("Step Δt", simulationStep),
            ])}
        </section>
    ) as HTMLElement;

    return { node, simulationTime, simulationStep };
}
