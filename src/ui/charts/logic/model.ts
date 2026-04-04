import type { Conditions } from "#simulation/src/simulate.ts";
import { historyLayout } from "#ui/charts/logic/layout.ts";

export const chartTooltipMolCallbacks = {
    label(ctx: { dataset: { label?: string }; parsed: { y: number | null } }) {
        const y = ctx.parsed.y;
        if (y === null || !Number.isFinite(y)) return `${ctx.dataset.label ?? ""}`;
        return `${ctx.dataset.label ?? ""}: ${y.toFixed(4)} mol`;
    },
};

export function computeSlidingTimeAxis(
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

export function downsampleSeries<T extends { x: number; y: number }>(points: T[], maxPoints: number): T[] {
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

export type Point = { x: number; y: number };

/** Downsampled series ready for Chart.js `data` arrays. */
export function moleHistorySeries(simulation_history: Conditions[]): {
    N2: Point[];
    H2: Point[];
    NH3: Point[];
} {
    const max = historyLayout.maxPoints;
    const N2 = downsampleSeries(
        simulation_history.map((p) => ({ x: p.simulator_state.t, y: p.reactor_state.N2 })),
        max,
    );
    const H2 = downsampleSeries(
        simulation_history.map((p) => ({ x: p.simulator_state.t, y: p.reactor_state.H2 })),
        max,
    );
    const NH3 = downsampleSeries(
        simulation_history.map((p) => ({ x: p.simulator_state.t, y: p.reactor_state.NH3 })),
        max,
    );
    return { N2, H2, NH3 };
}

export function nextNh3YAxisMax(prevMax: number, nh3Series: Point[]): number {
    const maxNH3 = nh3Series.length ? Math.max(...nh3Series.map((d) => d.y)) : 0;
    const { nh3Y } = historyLayout;
    return Math.min(
        nh3Y.capMol,
        Math.max(prevMax, maxNH3 * 1.12 + 1e-9, nh3Y.initialMax * 0.5),
    );
}

export function reactantChartDatasets(N2: Point[], H2: Point[]) {
    return [
        {
            label: "N₂",
            type: "line" as const,
            backgroundColor: "rgba(220, 38, 38, 0.15)",
            borderColor: "rgb(220, 38, 38)",
            data: N2,
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.1,
        },
        {
            label: "H₂",
            type: "line" as const,
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            borderColor: "rgb(59, 130, 246)",
            data: H2,
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.1,
        },
    ];
}

export function nh3ChartDataset(NH3: Point[]) {
    return [
        {
            label: "NH₃",
            type: "line" as const,
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderColor: "rgb(16, 185, 129)",
            data: NH3,
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.1,
        },
    ];
}
