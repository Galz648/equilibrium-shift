import type { ReadoutTargets, ReactionPanelTargets } from "#ui/reactor/logic/types.ts";
import { h } from "#ui/core/jsx-dom.ts";
import { integratorSection, type IntegratorSectionView } from "#ui/simulator/view/integrator.tsx";
import { eqBanner } from "#ui/reactor/view/equilibrium.tsx";
import { introBlock } from "#ui/reactor/view/intro.tsx";
import { reactionSection } from "#ui/reactor/view/reaction.tsx";
import { snapshot } from "#ui/reactor/view/snapshot.tsx";

export type ReactorPanelView = {
    root: HTMLElement;
    readouts: ReadoutTargets;
    integrator: IntegratorSectionView;
    reaction: ReactionPanelTargets;
};

export function createReactorPanelView(): ReactorPanelView {
    const intro = introBlock();
    const eq = eqBanner();
    const snap = snapshot();
    const integ = integratorSection();
    const react = reactionSection();

    const root = (
        <main className="panel panel--reactor" id="reactor" aria-labelledby="reactor-heading">
            {intro}
            {eq.node}
            {snap.node}
            {integ.node}
            {react.node}
        </main>
    ) as HTMLElement;

    return {
        root,
        readouts: snap.readouts,
        integrator: integ,
        reaction: {
            ...react.stats,
            banner: eq.banner,
            currentLine: eq.currentLine,
            firstReachedLine: eq.firstReachedLine,
        },
    };
}
