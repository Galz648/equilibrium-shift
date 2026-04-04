import type { ReactorState } from "#simulation/src/reactor.ts";
import type { Store } from "#src/store.ts";
import { formatSpeciesMoles } from "#ui/core/formatting.ts";
import type { ReadoutTargets } from "#ui/reactor/logic/types.ts";

function snapshotLines(reactor: ReactorState): {
    temperatureKelvin: string;
    molesHydrogen: string;
    molesNitrogen: string;
    molesAmmonia: string;
} {
    return {
        temperatureKelvin: `${Number(reactor.T).toFixed(2)} K`,
        molesHydrogen: formatSpeciesMoles(reactor.H2),
        molesNitrogen: formatSpeciesMoles(reactor.N2),
        molesAmmonia: formatSpeciesMoles(reactor.NH3),
    };
}

/** Keeps the snapshot column in sync with store updates. */
export class SnapshotReadouts {
    constructor(
        private readonly store: Store,
        private readonly targets: ReadoutTargets,
    ) {}

    subscribe(): void {
        this.store.subscribe((state) => {
            const text = snapshotLines(state.reactor_state);
            this.targets.temperatureKelvin.textContent = text.temperatureKelvin;
            this.targets.molesHydrogen.textContent = text.molesHydrogen;
            this.targets.molesNitrogen.textContent = text.molesNitrogen;
            this.targets.molesAmmonia.textContent = text.molesAmmonia;
        });
    }
}
