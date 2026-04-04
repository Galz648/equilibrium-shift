import { Chart, LinearScale, Title, PointElement, LineController, Legend, LineElement, Tooltip } from "chart.js";
import type { Conditions } from "../../../ammonia-reaction-simulation/src/simulate";
import type { Store } from "../../store";
import {
    CHART_NH3_Y_INITIAL_MAX,
    CHART_NH3_Y_MIN,
    CHART_REACTANTS_Y_MAX,
    CHART_REACTANTS_Y_MIN,
    CHART_TIME_RIGHT_PAD_S,
    CHART_TIME_WINDOW_S,
    chartTooltipMolCallbacks,
    computeSlidingTimeAxis,
    moleHistorySeries,
    nh3ChartDataset,
    nextNh3YAxisMax,
    reactantChartDatasets,
} from "./reactor-history-charts.model";

Chart.register(LineController, LineElement, PointElement, Title, Tooltip, Legend, LinearScale);

const chartTooltipMol = { callbacks: chartTooltipMolCallbacks };

/**
 * Owns Chart.js instances and the store subscription; series math lives in
 * `reactor-history-charts.model.ts`.
 */
export class ReactorHistoryCharts {
    private readonly chartReactants: Chart;
    private readonly chartNh3: Chart;
    private nh3YMax = CHART_NH3_Y_INITIAL_MAX;

    constructor(
        private readonly store: Store,
        canvasReactants: HTMLCanvasElement,
        canvasNh3: HTMLCanvasElement,
    ) {
        const commonOptions = {
            parsing: false as const,
            animation: false as const,
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index" as const, intersect: false },
            plugins: {
                legend: { display: true, position: "top" as const },
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

    subscribe(): void {
        this.store.subscribe(() => {
            this.plot(this.store.simulation_history);
        });
    }

    private plot(simulation_history: Conditions[]): void {
        const { N2, H2, NH3 } = moleHistorySeries(simulation_history);
        this.nh3YMax = nextNh3YAxisMax(this.nh3YMax, NH3);
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

        this.chartReactants.data.datasets = reactantChartDatasets(N2, H2);
        this.chartNh3.data.datasets = nh3ChartDataset(NH3);

        this.chartReactants.update("none");
        this.chartNh3.update("none");
    }
}
