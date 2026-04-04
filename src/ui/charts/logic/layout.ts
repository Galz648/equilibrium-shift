/**
 * Tunables for history chart axes, sliding time window, and downsampling.
 * Kept in one place; not imported outside `charts/logic`.
 */
export const historyLayout = {
    timeWindowS: 90,
    timeRightPadS: 0.8,
    reactantsY: { min: 0, max: 4.25 },
    nh3Y: { min: 0, initialMax: 0.15, capMol: 2.5 },
    maxPoints: 1200,
} as const;
