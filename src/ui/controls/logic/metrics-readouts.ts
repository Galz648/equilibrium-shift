import type { Conditions } from "#simulation/src/simulate.ts";
import type { Store } from "#src/store.ts";

function metricLines(state: Conditions): { time: string; reactorTemp: string } {
    return {
        time: `${Number(state.simulator_state.t).toFixed(2)} s`,
        reactorTemp: `${Number(state.reactor_state.T).toFixed(2)} K`,
    };
}

/** Sidebar time + reactor temperature (heat is handled by HeaterControl). */
export class MetricsReadouts {
    constructor(
        private readonly store: Store,
        private readonly simulationTime: HTMLElement,
        private readonly reactorTemp: HTMLElement,
    ) {}

    subscribe(): void {
        this.store.subscribe((state) => {
            const t = metricLines(state);
            this.simulationTime.textContent = t.time;
            this.reactorTemp.textContent = t.reactorTemp;
        });
    }
}
