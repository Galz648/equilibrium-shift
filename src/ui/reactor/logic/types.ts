/** DOM targets the snapshot column binds to. */
export type ReadoutTargets = {
    temperatureKelvin: HTMLElement;
    molesHydrogen: HTMLElement;
    molesNitrogen: HTMLElement;
    molesAmmonia: HTMLElement;
};

/** Reaction / inventory diagnostics (reactor_state + Q, K, …), excluding integrator clock. */
export type ReactionStatTargets = {
    reactionExtent: HTMLElement;
    equilibriumConstant: HTMLElement;
    reactionQuotient: HTMLElement;
    netReactionDirection: HTMLElement;
    gasMoleculesTotal: HTMLElement;
    atomInventorySummary: HTMLElement;
};

/** Equilibrium status banner nodes. */
export type EqBannerTargets = {
    banner: HTMLElement;
    currentLine: HTMLElement;
    firstReachedLine: HTMLElement;
};

export type ReactionPanelTargets = ReactionStatTargets & EqBannerTargets;
