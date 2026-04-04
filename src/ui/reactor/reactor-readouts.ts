import type { Store } from "../../store";
import type { ReactorReadoutElements } from "./reactor.types";
import { reactorSnapshotTexts } from "./reactor-readouts.presenter";

/** Subscribes to the store and pushes presenter output into snapshot nodes. */
export class ReactorReadouts {
    constructor(
        private readonly store: Store,
        private readonly els: ReactorReadoutElements,
    ) {}

    subscribe(): void {
        this.store.subscribe((state) => {
            const t = reactorSnapshotTexts(state.reactor_state);
            this.els.temperatureGauge.textContent = t.temperature;
            this.els.h2.textContent = t.H2;
            this.els.n2.textContent = t.N2;
            this.els.nh3.textContent = t.NH3;
        });
    }
}
