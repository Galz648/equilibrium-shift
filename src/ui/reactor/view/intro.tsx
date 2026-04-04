import { h } from "#ui/core/jsx-dom.ts";

/** Title, stoichiometry, and one-line context for the reactor column. */
export function introBlock(): HTMLElement[] {
    return [
        (
            <h2 className="panel__title" id="reactor-heading">
                Reactor
            </h2>
        ) as HTMLElement,
        (
            <p className="equation">
                N<sub>2</sub>(g) + 3 H<sub>2</sub>(g) ⇌ 2 NH<sub>3</sub>(g)
            </p>
        ) as HTMLElement,
        (
            <p className="tagline">
                Exothermic, reversible synthesis. When Q matches K at this temperature, the banner below shows
                it.
            </p>
        ) as HTMLElement,
    ];
}
