
import type { Conditions } from "../src/simulate";
import { Chart } from "chart.js";
import { LineController, LineElement, PointElement, Title, Tooltip, Legend, LinearScale } from "chart.js";

interface Dataset {
    label: string;
    type: "line";
    backgroundColor: string;
    data: { x: number, y: number }[];
    borderWidth: number;
}

interface ChartData {
    datasets: Dataset[];
}

class ChartPlotter {
    chart: Chart;
    ctx: HTMLCanvasElement;
    constructor(ctx: HTMLCanvasElement) {
        Chart.register(
            LineController,
            LineElement,
            PointElement,
            Title,
            Tooltip,
            Legend, LinearScale,
        );

        this.ctx = ctx;
        this.chart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: []
            }
        });


    }
    setChartData(datasets: Dataset[]): void {
        this.chart.data.datasets = datasets;
    }
    plot(simulation_history: Conditions[]): void {
        this.setChartData(simulation_history.map(p => ({
            label: "N2",
            type: "line",
            backgroundColor: "red",
            data: simulation_history.map(p => ({
                x: p.simulator_state.t,
                y: p.reactor_state.N2
            })),
            borderWidth: 1,
        })));
        this.chart.update();
    }
}

export {
    ChartPlotter,
}
