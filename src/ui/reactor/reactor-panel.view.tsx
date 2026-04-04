import type { ReactorReadoutElements, SimulationStateRefs } from "./reactor.types";
import { h } from "../core/jsx-dom";

export type ReactorPanelView = {
    root: HTMLElement;
    readouts: ReactorReadoutElements;
    simulation: SimulationStateRefs;
};

/**
 * Reactor column markup only: equation, status region, snapshot, simulation rows.
 * Controllers receive `readouts` / `simulation` handles; they never build DOM.
 */
export function createReactorPanelView(): ReactorPanelView {
    const root = (
        <main className="panel panel--reactor" id="reactor" aria-labelledby="reactor-heading">
            <h2 className="panel__title" id="reactor-heading">
                Reactor
            </h2>
            <p className="equation">
                N<sub>2</sub>(g) + 3 H<sub>2</sub>(g) ⇌ 2 NH<sub>3</sub>(g)
            </p>
            <p className="tagline">
                Exothermic, reversible synthesis. The status line below appears when Q ≈ K at the current
                temperature.
            </p>
            <div
                className="equilibrium-status equilibrium-status--idle"
                id="equilibrium-status"
                role="status"
                aria-live="polite"
            >
                <p className="equilibrium-status__current" id="equilibrium-status-current" />
                <p className="equilibrium-status__latched" id="equilibrium-status-latched" />
            </div>
            <section className="readout-card" aria-labelledby="snapshot-heading">
                <h3 className="readout-card__title" id="snapshot-heading">
                    Snapshot
                </h3>
                <div className="hero-readout">
                    <span className="hero-readout__label">Temperature</span>
                    <p
                        className="hero-readout__value"
                        id="temperature-gauge"
                        aria-label="Temperature in kelvin"
                    >
                        0
                    </p>
                </div>
                <div className="species-grid" aria-label="Species mole amounts">
                    <div className="species-tile species-tile--h2">
                        <span className="species-tile__sym">H₂</span>
                        <span className="species-tile__val" id="H2">
                            —
                        </span>
                        <span className="species-tile__unit">mol</span>
                    </div>
                    <div className="species-tile species-tile--n2">
                        <span className="species-tile__sym">N₂</span>
                        <span className="species-tile__val" id="N2">
                            —
                        </span>
                        <span className="species-tile__unit">mol</span>
                    </div>
                    <div className="species-tile species-tile--nh3">
                        <span className="species-tile__sym">NH₃</span>
                        <span className="species-tile__val" id="NH3">
                            —
                        </span>
                        <span className="species-tile__unit">mol</span>
                    </div>
                </div>
            </section>
            <section className="readout-card" aria-labelledby="sim-state-heading">
                <h3 className="readout-card__title" id="sim-state-heading">
                    Simulation
                </h3>
                <div className="data-rows">
                    <h4 className="readout-group__title">Time & extent</h4>
                    <div className="data-row">
                        <span className="data-row__label">Time</span>
                        <span className="data-row__value" id="sim-state-t">
                            —
                        </span>
                    </div>
                    <div className="data-row">
                        <span className="data-row__label">Step Δt</span>
                        <span className="data-row__value" id="sim-state-dt">
                            —
                        </span>
                    </div>
                    <div className="data-row">
                        <span className="data-row__label">Extent ξ</span>
                        <span className="data-row__value" id="sim-state-dg">
                            —
                        </span>
                    </div>
                </div>
                <div className="data-rows">
                    <h4 className="readout-group__title">Equilibrium</h4>
                    <div className="data-row">
                        <span className="data-row__label">K</span>
                        <span className="data-row__value" id="sim-state-k">
                            —
                        </span>
                    </div>
                    <div className="data-row">
                        <span className="data-row__label">Q</span>
                        <span className="data-row__value" id="sim-state-q">
                            —
                        </span>
                    </div>
                    <div className="data-row">
                        <span className="data-row__label">Net reaction</span>
                        <span className="data-row__value" id="sim-state-direction">
                            —
                        </span>
                    </div>
                </div>
                <div className="data-rows">
                    <h4 className="readout-group__title">Inventory</h4>
                    <div className="data-row">
                        <span className="data-row__label">Gas molecules (N₂ + H₂ + NH₃)</span>
                        <span className="data-row__value" id="sim-state-moles">
                            —
                        </span>
                    </div>
                    <div className="data-row">
                        <span className="data-row__label">Atoms (N and H, conserved)</span>
                        <span className="data-row__value" id="sim-state-atoms">
                            —
                        </span>
                    </div>
                </div>
            </section>
        </main>
    ) as HTMLElement;

    const readouts: ReactorReadoutElements = {
        temperatureGauge: root.querySelector("#temperature-gauge") as HTMLElement,
        h2: root.querySelector("#H2") as HTMLElement,
        n2: root.querySelector("#N2") as HTMLElement,
        nh3: root.querySelector("#NH3") as HTMLElement,
    };

    const simulation: SimulationStateRefs = {
        elT: root.querySelector("#sim-state-t") as HTMLElement,
        elDt: root.querySelector("#sim-state-dt") as HTMLElement,
        elDg: root.querySelector("#sim-state-dg") as HTMLElement,
        elK: root.querySelector("#sim-state-k") as HTMLElement,
        elQ: root.querySelector("#sim-state-q") as HTMLElement,
        elDirection: root.querySelector("#sim-state-direction") as HTMLElement,
        elMoles: root.querySelector("#sim-state-moles") as HTMLElement,
        elAtoms: root.querySelector("#sim-state-atoms") as HTMLElement,
        elEqStatus: root.querySelector("#equilibrium-status") as HTMLElement,
        elEqCurrent: root.querySelector("#equilibrium-status-current") as HTMLElement,
        elEqLatched: root.querySelector("#equilibrium-status-latched") as HTMLElement,
    };

    return { root, readouts, simulation };
}
