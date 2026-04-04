import type { ReadoutTargets } from "#ui/reactor/logic/types.ts";
import { h } from "#ui/core/jsx-dom.ts";

type Species = "H2" | "N2" | "NH3";

function speciesRow(species: Species, formula: string): { row: HTMLElement; amount: HTMLElement } {
    const amount = <span className="reactor-specAmt">—</span> as HTMLElement;
    const row = (
        <li className={`reactor-spec reactor-spec${species}`}>
            <span className="reactor-specFormula">{formula}</span>
            {amount}
            <small className="reactor-specUnit">mol</small>
        </li>
    ) as HTMLElement;
    return { row, amount };
}

export type SnapshotView = { node: HTMLElement; readouts: ReadoutTargets };

/** Temperature plus species mole readouts; returns live element handles (no querySelector). */
export function snapshot(): SnapshotView {
    const temperatureKelvin = (
        <p className="reactor-tempValue" aria-label="Temperature in kelvin">
            0
        </p>
    ) as HTMLElement;

    const h2 = speciesRow("H2", "H₂");
    const n2 = speciesRow("N2", "N₂");
    const nh3 = speciesRow("NH3", "NH₃");

    const node = (
        <section className="reactor-card" aria-labelledby="reactor-snapHead">
            <h3 className="reactor-cardTitle" id="reactor-snapHead">
                Snapshot
            </h3>
            <div className="reactor-temp">
                <span className="reactor-tempLabel">Temperature</span>
                {temperatureKelvin}
            </div>
            <ul className="reactor-specs" aria-label="Species mole amounts">
                {h2.row}
                {n2.row}
                {nh3.row}
            </ul>
        </section>
    ) as HTMLElement;

    return {
        node,
        readouts: {
            temperatureKelvin,
            molesHydrogen: h2.amount,
            molesNitrogen: n2.amount,
            molesAmmonia: nh3.amount,
        },
    };
}
