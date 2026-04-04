import type { ReactionStatTargets } from "#ui/reactor/logic/types.ts";
import { h } from "#ui/core/jsx-dom.ts";
import { reactorStatGroup, reactorStatRow, reactorValuePlaceholder } from "#ui/core/reactor-rows.tsx";

type StatKey = keyof ReactionStatTargets;

const GROUPS: { title: string; rows: { label: string; key: StatKey }[] }[] = [
    {
        title: "Extent",
        rows: [{ label: "Extent ξ", key: "reactionExtent" }],
    },
    {
        title: "Equilibrium",
        rows: [
            { label: "K", key: "equilibriumConstant" },
            { label: "Q", key: "reactionQuotient" },
            { label: "Net reaction", key: "netReactionDirection" },
        ],
    },
    {
        title: "Inventory",
        rows: [
            { label: "Gas molecules (N₂ + H₂ + NH₃)", key: "gasMoleculesTotal" },
            { label: "Atoms (N and H, conserved)", key: "atomInventorySummary" },
        ],
    },
];

export type ReactionSectionView = { node: HTMLElement; stats: ReactionStatTargets };

/** Reactor-side diagnostics (extent, Q/K, inventory). */
export function reactionSection(): ReactionSectionView {
    const stats = {} as ReactionStatTargets;

    const groups = GROUPS.map((g) => {
        const rows = g.rows.map(({ label, key }) => {
            const value = reactorValuePlaceholder();
            stats[key] = value;
            return reactorStatRow(label, value);
        });
        return reactorStatGroup(g.title, rows);
    });

    const node = (
        <section className="reactor-card" aria-labelledby="reactor-state-head">
            <h3 className="reactor-cardTitle" id="reactor-state-head">
                Reactor state
            </h3>
            {groups}
        </section>
    ) as HTMLElement;

    return { node, stats };
}
