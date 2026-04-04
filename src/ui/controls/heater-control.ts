import { ActionType } from "../../state";
import type { Store } from "../../store";
import type { HeaterControlElements } from "./controls.types";

/** Wires the heater slider to the store and mirrors heat input into the value node. */
export class HeaterControl {
    constructor(
        private readonly store: Store,
        private readonly els: HeaterControlElements,
    ) {
        this.els.slider.value = "0";
        this.els.slider.addEventListener("change", (event) => {
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
            this.els.valueDisplay.textContent = `${state.controls.heat_input} W`;
        });
    }
}
