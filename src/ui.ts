import { type Conditions, computeReactorDiagnostics } from "../ammonia-reaction-simulation/src/simulate";
import { Chart, LinearScale, Title, PointElement, LineController, Legend, LineElement, Tooltip } from "chart.js";
import { ActionType } from "./state";
import type { Store } from "./store";

/** Visible time span (s); x-axis slides so recent history stays in view. */
const CHART_TIME_WINDOW_S = 90;
/** Small padding past the latest time so the trace is not flush against the right edge. */
const CHART_TIME_RIGHT_PAD_S = 0.8;
/** Reactants (N₂, H₂): one shared vertical scale (mol), fixed so curves do not “bounce” when the axis rescales. */
const CHART_REACTANTS_Y_MIN = 0;
const CHART_REACTANTS_Y_MAX = 4.25;
/** NH₃ axis starts with this span; only grows when product exceeds it (never shrinks → less visual jitter). */
const CHART_NH3_Y_MIN = 0;
const CHART_NH3_Y_INITIAL_MAX = 0.15;
const CHART_NH3_Y_CAP_MOL = 2.5;
/** Cap points per series so long runs stay responsive. */
const CHART_MAX_POINTS = 1200;

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

/** Mole readout: fixed decimals when readable, scientific when very small (e.g. early NH₃ build-up). */
function formatSpeciesMoles(mol: number): string {
    if (!Number.isFinite(mol)) return "—";
    const a = Math.abs(mol);
    if (a === 0) return "0";
    if (a < 0.01) return mol.toExponential(2);
    return mol.toFixed(5);
}

function directionLabel(direction: ReturnType<typeof computeReactorDiagnostics>["direction"]): string {
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
        const r = state.reactor_state;
        this.H2.textContent = formatSpeciesMoles(r.H2);
        this.N2.textContent = formatSpeciesMoles(r.N2);
        this.NH3.textContent = formatSpeciesMoles(r.NH3);
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
    elAtoms = document.getElementById("sim-state-atoms") as HTMLElement;
    elEqStatus = document.getElementById("equilibrium-status") as HTMLElement;
    elEqCurrent = document.getElementById("equilibrium-status-current") as HTMLElement;
    elEqLatched = document.getElementById("equilibrium-status-latched") as HTMLElement;
    /** Simulation time (s) when Q ≈ K was first detected; stays set for the run. */
    private firstEquilibriumTime: number | null = null;

    constructor(store: Store) {
        this.store = store;
    }

    update(state: Conditions): void {
        const { t, dt } = state.simulator_state;
        this.elT.textContent = `${Number(t).toFixed(2)} s`;
        this.elDt.textContent = `${Number(dt).toFixed(4)} s`;

        const d = computeReactorDiagnostics(state.reactor_state);
        if (d.atReactionEquilibrium && this.firstEquilibriumTime === null) {
            this.firstEquilibriumTime = t;
        }

        if (d.atReactionEquilibrium) {
            this.elEqCurrent.textContent =
                "At reaction equilibrium — Q matches K at this temperature (net rate ~ 0).";
            this.elEqStatus.classList.add("equilibrium-status--at-eq");
        } else {
            this.elEqCurrent.textContent = "";
            this.elEqStatus.classList.remove("equilibrium-status--at-eq");
        }

        if (this.firstEquilibriumTime !== null) {
            this.elEqLatched.textContent = `Reaction equilibrium was first reached at t = ${this.firstEquilibriumTime.toFixed(2)} s.`;
        } else {
            this.elEqLatched.textContent = "";
        }

        const showEqPanel = d.atReactionEquilibrium || this.firstEquilibriumTime !== null;
        this.elEqStatus.classList.toggle("equilibrium-status--idle", !showEqPanel);

        this.elDg.textContent = `${d.extentXi.toFixed(4)} mol`;
        this.elK.textContent = formatSci(d.K_eq);
        this.elQ.textContent = d.Q !== null && Number.isFinite(d.Q) ? formatSci(d.Q) : "—";
        this.elDirection.textContent = directionLabel(d.direction);
        this.elMoles.textContent = `${d.gasMoleculesMol.toFixed(3)} mol`;
        this.elAtoms.textContent = `N ${d.nAtomsMol.toFixed(3)} mol · H ${d.hAtomsMol.toFixed(3)} mol`;
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

function computeSlidingTimeAxis(
    simulation_history: Conditions[],
    windowSpanS: number,
    rightPadS: number,
): { xMin: number; xMax: number } {
    const tEnd =
        simulation_history.length > 0
            ? simulation_history[simulation_history.length - 1]!.simulator_state.t
            : 0;
    if (tEnd <= windowSpanS) {
        return { xMin: 0, xMax: windowSpanS + rightPadS };
    }
    return {
        xMin: tEnd - windowSpanS,
        xMax: tEnd + rightPadS,
    };
}

function downsampleSeries<T extends { x: number; y: number }>(points: T[], maxPoints: number): T[] {
    if (points.length <= maxPoints) return points;
    const step = Math.ceil(points.length / maxPoints);
    const out: T[] = [];
    for (let i = 0; i < points.length; i += step) {
        out.push(points[i]!);
    }
    const last = points[points.length - 1]!;
    if (out.length === 0 || out[out.length - 1]!.x !== last.x) {
        out.push(last);
    }
    return out;
}

const chartTooltipMol = {
    callbacks: {
        label(ctx: { dataset: { label?: string }; parsed: { y: number | null } }) {
            const y = ctx.parsed.y;
            if (y === null || !Number.isFinite(y)) return `${ctx.dataset.label ?? ""}`;
            return `${ctx.dataset.label ?? ""}: ${y.toFixed(4)} mol`;
        },
    },
};

/**
 * Two separate charts: reactants share one y-scale (easy to compare N₂ vs H₂);
 * NH₃ has its own plot so small values are readable. Avoids dual-axis confusion.
 */
class ReactorHistoryChartsUI implements UIComponent {
    store: Store;
    chartReactants: Chart;
    chartNh3: Chart;
    /** NH₃ y-max only increases so the axis does not “breathe” each frame. */
    private nh3YMax = CHART_NH3_Y_INITIAL_MAX;

    constructor(canvasReactants: HTMLCanvasElement, canvasNh3: HTMLCanvasElement, store: Store) {
        this.store = store;

        const commonOptions = {
            parsing: false as const,
            animation: false as const,
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index" as const, intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: "top" as const,
                },
                tooltip: chartTooltipMol,
            },
        };

        this.chartReactants = new Chart(canvasReactants, {
            type: "line",
            data: { datasets: [] },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: "Reactants (same scale, mol)",
                        color: "#8b949e",
                        font: { size: 12, weight: "bold" },
                    },
                },
                scales: {
                    x: {
                        type: "linear",
                        min: 0,
                        max: CHART_TIME_WINDOW_S + CHART_TIME_RIGHT_PAD_S,
                        title: { display: true, text: "Time (s)", color: "#8b949e" },
                        ticks: { color: "#8b949e" },
                        grid: { color: "rgba(255,255,255,0.06)" },
                    },
                    y: {
                        type: "linear",
                        min: CHART_REACTANTS_Y_MIN,
                        max: CHART_REACTANTS_Y_MAX,
                        title: { display: true, text: "mol", color: "#8b949e" },
                        ticks: { color: "#8b949e", maxTicksLimit: 8 },
                        grid: { color: "rgba(255,255,255,0.06)" },
                    },
                },
            },
        });

        this.chartNh3 = new Chart(canvasNh3, {
            type: "line",
            data: { datasets: [] },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: "NH₃ product (mol)",
                        color: "#8b949e",
                        font: { size: 12, weight: "bold" },
                    },
                },
                scales: {
                    x: {
                        type: "linear",
                        min: 0,
                        max: CHART_TIME_WINDOW_S + CHART_TIME_RIGHT_PAD_S,
                        title: { display: true, text: "Time (s)", color: "#8b949e" },
                        ticks: { color: "#8b949e" },
                        grid: { color: "rgba(255,255,255,0.06)" },
                    },
                    y: {
                        type: "linear",
                        min: CHART_NH3_Y_MIN,
                        max: this.nh3YMax,
                        title: { display: true, text: "mol", color: "#8b949e" },
                        ticks: { color: "#8b949e", maxTicksLimit: 7 },
                        grid: { color: "rgba(255,255,255,0.06)" },
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

    plot(simulation_history: Conditions[]): void {
        const N2_data = downsampleSeries(
            simulation_history.map((p) => ({
                x: p.simulator_state.t,
                y: p.reactor_state.N2,
            })),
            CHART_MAX_POINTS,
        );
        const H2_data = downsampleSeries(
            simulation_history.map((p) => ({
                x: p.simulator_state.t,
                y: p.reactor_state.H2,
            })),
            CHART_MAX_POINTS,
        );
        const NH3_data = downsampleSeries(
            simulation_history.map((p) => ({
                x: p.simulator_state.t,
                y: p.reactor_state.NH3,
            })),
            CHART_MAX_POINTS,
        );

        const maxNH3 = NH3_data.length ? Math.max(...NH3_data.map((d) => d.y)) : 0;
        this.nh3YMax = Math.min(
            CHART_NH3_Y_CAP_MOL,
            Math.max(this.nh3YMax, maxNH3 * 1.12 + 1e-9, CHART_NH3_Y_INITIAL_MAX * 0.5),
        );
        const nh3Scales = this.chartNh3.options.scales as { y: { min?: number; max?: number } };
        nh3Scales.y.max = this.nh3YMax;

        const { xMin, xMax } = computeSlidingTimeAxis(
            simulation_history,
            CHART_TIME_WINDOW_S,
            CHART_TIME_RIGHT_PAD_S,
        );
        const reactantX = this.chartReactants.options.scales as { x: { min?: number; max?: number } };
        const nh3X = this.chartNh3.options.scales as { x: { min?: number; max?: number } };
        reactantX.x.min = xMin;
        reactantX.x.max = xMax;
        nh3X.x.min = xMin;
        nh3X.x.max = xMax;

        this.chartReactants.data.datasets = [
            {
                label: "N₂",
                type: "line",
                backgroundColor: "rgba(220, 38, 38, 0.15)",
                borderColor: "rgb(220, 38, 38)",
                data: N2_data,
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.1,
            },
            {
                label: "H₂",
                type: "line",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                borderColor: "rgb(59, 130, 246)",
                data: H2_data,
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.1,
            },
        ];

        this.chartNh3.data.datasets = [
            {
                label: "NH₃",
                type: "line",
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                borderColor: "rgb(16, 185, 129)",
                data: NH3_data,
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.1,
            },
        ];

        this.chartReactants.update("none");
        this.chartNh3.update("none");
    }
}
// Optionally, you can create a UI class that instantiates all components for convenience
class UI {
    heaterUI: HeaterUI;
    reactorUI: ReactorUI;
    simulationStateUI: SimulationStateUI;
    reactorHistoryCharts: ReactorHistoryChartsUI;
    constructor(store: Store) {
        this.heaterUI = new HeaterUI(store);
        this.reactorUI = new ReactorUI(store);
        this.simulationStateUI = new SimulationStateUI(store);
        this.reactorHistoryCharts = new ReactorHistoryChartsUI(
            document.getElementById("reactor-chart-reactants") as HTMLCanvasElement,
            document.getElementById("reactor-chart-nh3") as HTMLCanvasElement,
            store,
        );
        this.subscribe(store);
    }
    subscribe(store: Store): void {
        this.heaterUI.subscribe(store);
        this.reactorUI.subscribe(store);
        this.simulationStateUI.subscribe(store);
        this.reactorHistoryCharts.subscribe(store);
    }
}

export default UI;
