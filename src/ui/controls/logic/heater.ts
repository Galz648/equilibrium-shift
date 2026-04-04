import { ActionType } from "#src/state.ts";
import type { Store } from "#src/store.ts";
import type { HeaterTargets } from "#ui/controls/logic/types.ts";

/** Wires the heater slider to the store and mirrors heat input into the value node. */
export class HeaterControl {
    constructor(
        private readonly store: Store,
        private readonly targets: HeaterTargets,
    ) {
        this.targets.slider.value = "0";
        this.targets.slider.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            const newValue = Number(target.value);
            this.store.dispatch({
                type: ActionType.SET_HEATER,
                value: newValue,
                name: "SET_HEATER",
            });
        });
    }

    subscribe(): void {
        this.store.subscribe((state) => {
            this.targets.heatValue.textContent = `${state.controls.heat_input} W`;
        });
    }
}
