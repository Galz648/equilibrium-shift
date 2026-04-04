import type { EqBannerTargets } from "#ui/reactor/logic/types.ts";
import { h } from "#ui/core/jsx-dom.ts";

export type EqBannerView = EqBannerTargets & { node: HTMLElement };

/** Shown when Q≈K (current) or when equilibrium was first seen this run (latched line). */
export function eqBanner(): EqBannerView {
    const currentLine = <p className="reactor-eqNow" /> as HTMLElement;
    const firstReachedLine = <p className="reactor-eqFirst" /> as HTMLElement;
    const banner = (
        <div className="reactor-eq reactor-eqHidden" role="status" aria-live="polite">
            {currentLine}
            {firstReachedLine}
        </div>
    ) as HTMLElement;
    return { node: banner, banner, currentLine, firstReachedLine };
}
