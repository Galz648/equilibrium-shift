import { type Conditions, computeReactorDiagnostics } from "../ammonia-reaction-simulation/src/simulate";
import { Chart, LinearScale, Title, PointElement, LineController, Legend, LineElement, Tooltip } from "chart.js";
import { ActionType } from "./state";
import type { Store } from "./store";

/** Fixed axis bounds so the chart does not rescale as the series updates. */
const CHART_X_MIN = 0;
const CHART_X_MAX = 120; // simulation time (s)
const CHART_Y_MIN = 0;
const CHART_Y_MAX = 6; // N₂ amount (mol); adjust if your initial conditions exceed this

Chart.register(
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    LinearScale,
);

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


        this.heater_slider.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            const newValue = Number(target.value);
            this.store.dispatch({
                type: ActionType.SET_HEATER, value: newValue, name: "SET_HEATER"
            });
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


interface Dataset {
    label: string;
    type: "line";
    backgroundColor: string;
    borderColor: string;
    data: { x: number, y: number }[];
    borderWidth: number;
}

class ChartPlotterUI implements UIComponent {
    store: Store;
    chart: Chart;
    ctx: HTMLCanvasElement;

    constructor(ctx: HTMLCanvasElement, store: Store) {
        this.store = store;

        this.ctx = ctx;
        this.chart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: []
            },
            options: {
                parsing: false,
                animation: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                },
                scales: {
                    x: {
                        type: "linear",
                        min: CHART_X_MIN,
                        max: CHART_X_MAX,
                        title: {
                            display: true,
                            text: "Time (s)",
                        },
                    },
                    y: {
                        type: "linear",
                        min: CHART_Y_MIN,
                        max: CHART_Y_MAX,
                        title: {
                            display: true,
                            text: "Moles",
                        },
                    },
                },
            },
        });


    }
    subscribe(store: Store): void {
        store.subscribe(() => {
            this.plot(store.simulation_history);
        });
    }
    setChartData(datasets: Dataset[]): void {
        this.chart.data.datasets = datasets;
    }
    plot(simulation_history: Conditions[]): void {
        const N2_data = simulation_history.map((p) => ({
            x: p.simulator_state.t,
            y: p.reactor_state.N2,
        }));
        const H2_data = simulation_history.map((p) => ({
            x: p.simulator_state.t,
            y: p.reactor_state.H2,
        }));
        const NH3_data = simulation_history.map((p) => ({
            x: p.simulator_state.t,
            y: p.reactor_state.NH3,
        }));
        this.setChartData([
            {
                label: "N₂",
                type: "line",
                backgroundColor: "rgba(220, 38, 38, 0.2)",
                borderColor: "rgb(220, 38, 38)",
                data: N2_data,
                borderWidth: 1,
            },
            {
                label: "H₂",
                type: "line",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                borderColor: "rgb(59, 130, 246)",
                data: H2_data,
                borderWidth: 1,
            },
            {
                label: "NH₃",
                type: "line",
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                borderColor: "rgb(16, 185, 129)",
                data: NH3_data,
                borderWidth: 1,
            },
        ]);
        this.chart.update("none");
    }
}
// Optionally, you can create a UI class that instantiates all components for convenience
class UI {
    heaterUI: HeaterUI;
    reactorUI: ReactorUI;
    simulationStateUI: SimulationStateUI;
    chartPlotterUI: ChartPlotterUI;
    constructor(store: Store) {
        this.heaterUI = new HeaterUI(store);
        this.reactorUI = new ReactorUI(store);
        this.simulationStateUI = new SimulationStateUI(store);
        this.chartPlotterUI = new ChartPlotterUI(document.getElementById("reactor-chart") as HTMLCanvasElement, store);
        this.subscribe(store);
    }
    subscribe(store: Store): void {
        this.heaterUI.subscribe(store);
        this.reactorUI.subscribe(store);
        this.simulationStateUI.subscribe(store);
        this.chartPlotterUI.subscribe(store);
    }
}

export default UI;
