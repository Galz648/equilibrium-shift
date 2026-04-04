/**
 * Net driving direction from reactor diagnostics (matches strings produced by the simulation).
 */
export enum ReactionNetDirection {
    Forward = "forward",
    Reverse = "reverse",
    Equilibrium = "equilibrium",
    NotApplicable = "n/a",
}

const LABELS: Record<ReactionNetDirection, string> = {
    [ReactionNetDirection.Forward]: "Toward NH₃",
    [ReactionNetDirection.Reverse]: "Toward N₂ + H₂",
    [ReactionNetDirection.Equilibrium]: "At equilibrium",
    [ReactionNetDirection.NotApplicable]: "—",
};

function isReactionNetDirection(value: string): value is ReactionNetDirection {
    return (Object.values(ReactionNetDirection) as string[]).includes(value);
}

/** Human-readable label for the net reaction direction shown in the simulation panel. */
export function directionLabel(direction: ReactionNetDirection | string): string {
    if (isReactionNetDirection(direction)) {
        return LABELS[direction];
    }
    return "—";
}
