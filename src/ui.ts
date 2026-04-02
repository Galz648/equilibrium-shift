import { type Conditions, computeReactorDiagnostics } from "../ammonia-reaction-simulation/src/simulate";
import { ActionType } from "./state";
import { dispatch, type Store } from "./store";

function formatSci(n: number): string {
    if (!Number.isFinite(n)) return "—";
    const a = Math.abs(n);
    if (a === 0) return "0";
    if (a >= 1e4 || a < 1e-2) return n.toExponential(3);
    return n.toPrecision(4);
}

function directionLabel(direction: ReturnType<typeof computeReactorDiagnostics>["direction"]): string { // TODO: change this AI slop
    switch (direction) {
        case "forward":
            return "Toward NH₃";
        case "equilibrium":
            return "At equilibrium";
        case "reverse":
            return "Toward N₂ + H₂";
        default:
            return "—";
    }
}

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
        this.H2.textContent = Number(state.reactor_state.H2).toFixed(2);
        this.N2.textContent = Number(state.reactor_state.N2).toFixed(2);
        this.NH3.textContent = Number(state.reactor_state.NH3).toFixed(2);
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

/** Simulation / equilibrium readout (integrator step, K, Q, net direction). */
class SimulationStateUI implements UIComponent {
    store: Store;
    elT = document.getElementById("sim-state-t") as HTMLElement;
    elDt = document.getElementById("sim-state-dt") as HTMLElement;
    elDg = document.getElementById("sim-state-dg") as HTMLElement;
    elK = document.getElementById("sim-state-k") as HTMLElement;
    elQ = document.getElementById("sim-state-q") as HTMLElement;
    elDirection = document.getElementById("sim-state-direction") as HTMLElement;
    elMoles = document.getElementById("sim-state-moles") as HTMLElement;

    constructor(store: Store) {
        this.store = store;
        this.subscribe(this.store);
    }

    update(state: Conditions): void {
        const { t, dt } = state.simulator_state;
        this.elT.textContent = `${Number(t).toFixed(2)} s`;
        this.elDt.textContent = `${Number(dt).toFixed(4)} s`;

        const d = computeReactorDiagnostics(state.reactor_state);
        this.elDg.textContent = `${d.deltaG_kJ.toFixed(1)} kJ/mol`;
        this.elK.textContent = formatSci(d.K_eq);
        this.elQ.textContent = d.Q !== null && Number.isFinite(d.Q) ? formatSci(d.Q) : "—";
        this.elDirection.textContent = directionLabel(d.direction);
        this.elMoles.textContent = `${d.totalMoles.toFixed(3)} mol`;
    }

    subscribe(store: Store): void {
        store.subscribe((state: Conditions) => {
            this.update(state);
        });
    }
}

// Optionally, you can create a UI class that instantiates all components for convenience
class UI {
    heaterUI: HeaterUI;
    reactorUI: ReactorUI;
    simulationStateUI: SimulationStateUI;
    constructor(store: Store) {
        this.heaterUI = new HeaterUI(store);
        this.reactorUI = new ReactorUI(store);
        this.simulationStateUI = new SimulationStateUI(store);
    }
}

export default UI;
