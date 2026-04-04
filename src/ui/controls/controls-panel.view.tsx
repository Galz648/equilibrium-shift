import type { ControlsPanelElements, HeaterControlElements } from "./controls.types";
import { h } from "../core/jsx-dom";

/**
 * Controls column markup: heater slot, metrics, chart help, canvases.
 * Caller supplies `heater` nodes so the heat value can sit in the metrics block.
 */
export function createControlsPanelView(heater: HeaterControlElements): ControlsPanelElements {
    heater.valueDisplay.id = "heater-value";
    heater.valueDisplay.className = "metric-line__value metric-line__value--heat";

    const root = (
        <aside className="panel panel--controls" id="controls" aria-labelledby="controls-heading">
            <h2 className="panel__title" id="controls-heading">
                Controls
            </h2>
            {heater.root}
            <div className="controls-metrics" aria-label="Simulation and heater readouts">
                <div className="metric-line">
                    <span className="metric-line__label">Simulation time</span>
                    <span className="metric-line__value metric-line__value--time" id="clock" />
                </div>
                <div className="metric-line">
                    <span className="metric-line__label">Heat input</span>
                    {heater.valueDisplay}
                </div>
                <div className="metric-line">
                    <span className="metric-line__label">Reactor temperature</span>
                    <span className="metric-line__value metric-line__value--temp" id="value" />
                </div>
            </div>
            <section className="chart-section" aria-labelledby="chart-heading">
                <h3 className="chart-section__title" id="chart-heading">
                    Moles vs time
                </h3>
                <details className="chart-help">
                    <summary className="chart-help__summary">How to read these charts</summary>
                    <p
                        className="chart-help__body"
                        dangerouslySetInnerHTML={{
                            __html:
                                "N<sub>2</sub> and H<sub>2</sub> share one plot and the same vertical scale (mol). NH<sub>3</sub> is separate so small amounts stay visible. Forward reaction consumes 1 mol N<sub>2</sub> and 3 mol H<sub>2</sub> per 2 mol NH<sub>3</sub>. The time axis shows about the last 90&nbsp;s.",
                        }}
                    />
                </details>
                <div className="chart-stack">
                    <figure className="chart-fig">
                        <canvas
                            id="reactor-chart-reactants"
                            aria-label="Nitrogen and hydrogen amounts over time"
                        />
                    </figure>
                    <figure className="chart-fig">
                        <canvas id="reactor-chart-nh3" aria-label="Ammonia amount over time" />
                    </figure>
                </div>
            </section>
        </aside>
    ) as HTMLElement;

    return {
        root,
        heater,
        canvasReactants: root.querySelector("#reactor-chart-reactants") as HTMLCanvasElement,
        canvasNh3: root.querySelector("#reactor-chart-nh3") as HTMLCanvasElement,
        clockEl: root.querySelector("#clock") as HTMLElement,
        reactorTempEl: root.querySelector("#value") as HTMLElement,
    };
}
