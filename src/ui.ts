import type { Conditions } from "ammonia-reaction-simulation";
import { ActionType } from "./state";
import { dispatch, type Store } from "./store";

interface UIComponent {
    store: Store
    subscribe(store: Store): void
}

// Heater UI: handles the heater slider+value
class HeaterUI implements UIComponent {
    store: Store;
    heater_slider = document.getElementById("heater-slider") as HTMLInputElement;
    heater_value = document.getElementById("heater-value") as HTMLElement;

    constructor(store: Store) {
        this.store = store;
        this.heater_slider.value = "0";
        this.subscribe(this.store);

        this.heater_slider.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            const newValue = Number(target.value);
            dispatch({
                type: ActionType.SET_HEATER, value: newValue, name: "SET_HEATER"
            }, this.store);
        });
    }

    updateHeaterDisplay(newValue: number) {
        this.heater_value!.textContent = `${newValue} W`;
    }

    subscribe(store: Store): void {
        store.subscribe((state: Conditions) => {
            this.updateHeaterDisplay(state.controls.heat_input);
        });
    }
}

// Clock UI: handles time display
class ClockUI implements UIComponent {
    store: Store;
    clock = document.getElementById("clock") as HTMLElement;

    constructor(store: Store) {
        this.store = store;
        this.clock.textContent = "0";
        this.subscribe(this.store);
    }

    updateClock(time: number) {
        this.clock.textContent = `t(s): ${Number(time).toFixed(2)}`;
    }

    subscribe(store: Store): void {
        store.subscribe((state: Conditions) => {
            this.updateClock(state.simulator_state.t);
        });
    }
}

// Reactor UI: handles temp gauge and concentration displays
class ReactorUI implements UIComponent {
    store: Store;
    temperature_gauge = document.getElementById("temperature-gauge") as HTMLElement;
    H2 = document.getElementById("H2") as HTMLElement;
    N2 = document.getElementById("N2") as HTMLElement;
    NH3 = document.getElementById("NH3") as HTMLElement;

    constructor(store: Store) {
        this.store = store;
        this.subscribe(this.store);
    }

    updateTemperatureGauge(newValue: number) {
        this.temperature_gauge!.textContent = `${Number(newValue).toFixed(2)} K`;
    }

    updateConcentrations(state: Conditions) {
        this.H2.textContent = `H_2: ${Number(state.reactor_state.H2).toFixed(2)} n(moles)`;
        this.N2.textContent = `N_2: ${Number(state.reactor_state.N2).toFixed(2)} n(moles)`;
        this.NH3.textContent = `NH_3: ${Number(state.reactor_state.NH3).toFixed(2)} n(moles)`;
    }

    subscribe(store: Store): void {
        store.subscribe((state: Conditions) => {
            this.updateTemperatureGauge(state.reactor_state.T);
        });
        store.subscribe((state: Conditions) => {
            this.updateConcentrations(state);
        });
    }
}

// Optionally, you can create a UI class that instantiates all components for convenience
class UI {
    heaterUI: HeaterUI;
    clockUI: ClockUI;
    reactorUI: ReactorUI;
    constructor(store: Store) {
        this.heaterUI = new HeaterUI(store);
        this.clockUI = new ClockUI(store);
        this.reactorUI = new ReactorUI(store);
    }
}

export default UI;
