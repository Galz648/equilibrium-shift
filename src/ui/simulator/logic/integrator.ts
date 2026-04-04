import type { Conditions } from "#simulation/src/simulate.ts";
import type { Store } from "#src/store.ts";
import type { IntegratorTargets } from "#ui/simulator/logic/types.ts";

/** Keeps simulation time and Δt in sync with the store. */
export class IntegratorPanel {
    constructor(
        private readonly store: Store,
        private readonly targets: IntegratorTargets,
    ) {}

    subscribe(): void {
        this.store.subscribe((state: Conditions) => {
            const { t, dt } = state.simulator_state;
            this.targets.simulationTime.textContent = `${Number(t).toFixed(2)} s`;
            this.targets.simulationStep.textContent = `${Number(dt).toFixed(4)} s`;
        });
    }
}
