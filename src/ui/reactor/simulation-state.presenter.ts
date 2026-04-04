import { computeReactorDiagnostics, type Conditions } from "../../../ammonia-reaction-simulation/src/simulate";
import { formatSci } from "../core/formatting";
import { directionLabel } from "./reaction-net-direction.enum";

export type SimulationRowTexts = {
    t: string;
    dt: string;
    xi: string;
    K: string;
    Q: string;
    direction: string;
    moles: string;
    atoms: string;
};

export type EquilibriumBannerTexts = {
    showPanel: boolean;
    highlightAtEq: boolean;
    currentLine: string;
    latchedLine: string;
};

export function equilibriumBannerTexts(
    atEq: boolean,
    firstEquilibriumTime: number | null,
): EquilibriumBannerTexts {
    const currentLine = atEq
        ? "At reaction equilibrium — Q matches K at this temperature (net rate ~ 0)."
        : "";
    const latchedLine =
        firstEquilibriumTime !== null
            ? `Reaction equilibrium was first reached at t = ${firstEquilibriumTime.toFixed(2)} s.`
            : "";
    const showPanel = atEq || firstEquilibriumTime !== null;
    return { showPanel, highlightAtEq: atEq, currentLine, latchedLine };
}

function rowTextsFromDiagnostics(
    state: Conditions,
    d: ReturnType<typeof computeReactorDiagnostics>,
): SimulationRowTexts {
    const { t, dt } = state.simulator_state;
    return {
        t: `${Number(t).toFixed(2)} s`,
        dt: `${Number(dt).toFixed(4)} s`,
        xi: `${d.extentXi.toFixed(4)} mol`,
        K: formatSci(d.K_eq),
        Q: d.Q !== null && Number.isFinite(d.Q) ? formatSci(d.Q) : "—",
        direction: directionLabel(d.direction),
        moles: `${d.gasMoleculesMol.toFixed(3)} mol`,
        atoms: `N ${d.nAtomsMol.toFixed(3)} mol · H ${d.hAtomsMol.toFixed(3)} mol`,
    };
}

/**
 * One diagnostics pass per tick: integrator rows + how the equilibrium banner should look.
 * `nextFirstEquilibriumTime` updates when Q≈K is seen for the first time in the run.
 */
export function simulationPanelViewModel(
    state: Conditions,
    firstEquilibriumTime: number | null,
): {
    rows: SimulationRowTexts;
    banner: EquilibriumBannerTexts;
    nextFirstEquilibriumTime: number | null;
} {
    const d = computeReactorDiagnostics(state.reactor_state);
    const { t } = state.simulator_state;

    let nextFirst = firstEquilibriumTime;
    if (d.atReactionEquilibrium && nextFirst === null) {
        nextFirst = t;
    }

    const rows = rowTextsFromDiagnostics(state, d);
    const banner = equilibriumBannerTexts(d.atReactionEquilibrium, nextFirst);

    return {
        rows,
        banner,
        nextFirstEquilibriumTime: nextFirst,
    };
}
