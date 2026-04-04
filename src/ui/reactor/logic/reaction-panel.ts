import {
    computeReactorDiagnostics,
    type Conditions,
} from "#simulation/src/simulate.ts";
import type { Store } from "#src/store.ts";
import { formatSci } from "#ui/core/formatting.ts";
import { directionLabel } from "#ui/reactor/logic/direction.ts";
import type { ReactionPanelTargets } from "#ui/reactor/logic/types.ts";

type ReactionStatTexts = {
    reactionExtent: string;
    equilibriumConstant: string;
    reactionQuotient: string;
    netReactionDirection: string;
    gasMoleculesTotal: string;
    atomInventorySummary: string;
};

type BannerTexts = {
    showPanel: boolean;
    highlightAtEquilibrium: boolean;
    currentMessage: string;
    firstReachedMessage: string;
};

function bannerLines(atEquilibrium: boolean, firstEquilibriumTimeSeconds: number | null): BannerTexts {
    const currentMessage = atEquilibrium
        ? "At reaction equilibrium — Q matches K at this temperature (net rate ~ 0)."
        : "";
    const firstReachedMessage =
        firstEquilibriumTimeSeconds !== null
            ? `Reaction equilibrium was first reached at t = ${firstEquilibriumTimeSeconds.toFixed(2)} s.`
            : "";
    const showPanel = atEquilibrium || firstEquilibriumTimeSeconds !== null;
    return {
        showPanel,
        highlightAtEquilibrium: atEquilibrium,
        currentMessage,
        firstReachedMessage,
    };
}

function reactionStatLines(
    diagnostics: ReturnType<typeof computeReactorDiagnostics>,
): ReactionStatTexts {
    return {
        reactionExtent: `${diagnostics.extentXi.toFixed(4)} mol`,
        equilibriumConstant: formatSci(diagnostics.K_eq),
        reactionQuotient:
            diagnostics.Q !== null && Number.isFinite(diagnostics.Q) ? formatSci(diagnostics.Q) : "—",
        netReactionDirection: directionLabel(diagnostics.direction),
        gasMoleculesTotal: `${diagnostics.gasMoleculesMol.toFixed(3)} mol`,
        atomInventorySummary: `N ${diagnostics.nAtomsMol.toFixed(3)} mol · H ${diagnostics.hAtomsMol.toFixed(3)} mol`,
    };
}

function reactionTickModel(
    state: Conditions,
    firstEquilibriumTimeSeconds: number | null,
): {
    stats: ReactionStatTexts;
    banner: BannerTexts;
    nextFirstEquilibriumTimeSeconds: number | null;
} {
    const diagnostics = computeReactorDiagnostics(state.reactor_state);
    const { t } = state.simulator_state;

    let nextFirst = firstEquilibriumTimeSeconds;
    if (diagnostics.atReactionEquilibrium && nextFirst === null) {
        nextFirst = t;
    }

    const stats = reactionStatLines(diagnostics);
    const banner = bannerLines(diagnostics.atReactionEquilibrium, nextFirst);

    return {
        stats,
        banner,
        nextFirstEquilibriumTimeSeconds: nextFirst,
    };
}

/** Extent, Q/K, inventory, and the Q≈K banner — all reactor-side. */
export class ReactionPanel {
    private firstEquilibriumTimeSeconds: number | null = null;

    constructor(
        private readonly store: Store,
        private readonly targets: ReactionPanelTargets,
    ) {}

    private paint(model: ReturnType<typeof reactionTickModel>): void {
        const { stats, banner } = model;

        this.targets.reactionExtent.textContent = stats.reactionExtent;
        this.targets.equilibriumConstant.textContent = stats.equilibriumConstant;
        this.targets.reactionQuotient.textContent = stats.reactionQuotient;
        this.targets.netReactionDirection.textContent = stats.netReactionDirection;
        this.targets.gasMoleculesTotal.textContent = stats.gasMoleculesTotal;
        this.targets.atomInventorySummary.textContent = stats.atomInventorySummary;

        this.targets.currentLine.textContent = banner.currentMessage;
        this.targets.firstReachedLine.textContent = banner.firstReachedMessage;
        this.targets.banner.classList.toggle("reactor-eqHidden", !banner.showPanel);
        this.targets.banner.classList.toggle("reactor-eqAtEq", banner.highlightAtEquilibrium);
    }

    subscribe(): void {
        this.store.subscribe((state: Conditions) => {
            const model = reactionTickModel(state, this.firstEquilibriumTimeSeconds);
            this.firstEquilibriumTimeSeconds = model.nextFirstEquilibriumTimeSeconds;
            this.paint(model);
        });
    }
}
