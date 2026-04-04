import type { Conditions } from "../../../ammonia-reaction-simulation/src/simulate";
import type { Store } from "../../store";
import type { SimulationStateRefs } from "./reactor.types";
import { simulationPanelViewModel } from "./simulation-state.presenter";

/** Applies `simulationPanelViewModel` output to the reactor panel DOM. */
export class SimulationStatePanel {
    private firstEquilibriumTime: number | null = null;

    constructor(
        private readonly store: Store,
        private readonly refs: SimulationStateRefs,
    ) {}

    private apply(vm: ReturnType<typeof simulationPanelViewModel>): void {
        const { rows, banner } = vm;

        this.refs.elT.textContent = rows.t;
        this.refs.elDt.textContent = rows.dt;
        this.refs.elDg.textContent = rows.xi;
        this.refs.elK.textContent = rows.K;
        this.refs.elQ.textContent = rows.Q;
        this.refs.elDirection.textContent = rows.direction;
        this.refs.elMoles.textContent = rows.moles;
        this.refs.elAtoms.textContent = rows.atoms;

        this.refs.elEqCurrent.textContent = banner.currentLine;
        this.refs.elEqLatched.textContent = banner.latchedLine;
        this.refs.elEqStatus.classList.toggle("equilibrium-status--idle", !banner.showPanel);
        this.refs.elEqStatus.classList.toggle("equilibrium-status--at-eq", banner.highlightAtEq);
    }

    subscribe(): void {
        this.store.subscribe((state: Conditions) => {
            const vm = simulationPanelViewModel(state, this.firstEquilibriumTime);
            this.firstEquilibriumTime = vm.nextFirstEquilibriumTime;
            this.apply(vm);
        });
    }
}
