import { h } from "#ui/core/jsx-dom.ts";

export type ChartsBlock = {
    node: HTMLElement;
    canvasReactants: HTMLCanvasElement;
    canvasNh3: HTMLCanvasElement;
};

/** Moles vs time section with two canvases (live handles, no querySelector). */
export function chartsBlock(): ChartsBlock {
    const canvasReactants = (
        <canvas aria-label="Nitrogen and hydrogen amounts over time" />
    ) as HTMLCanvasElement;
    const canvasNh3 = <canvas aria-label="Ammonia amount over time" /> as HTMLCanvasElement;

    const node = (
        <section className="ctrl-chartBlock" aria-labelledby="ctrl-chartHead">
            <h3 className="ctrl-chartHead" id="ctrl-chartHead">
                Moles vs time
            </h3>
            <details className="ctrl-chartHelp">
                <summary className="ctrl-chartHelpSummary">How to read these charts</summary>
                <p
                    className="ctrl-chartHelpBody"
                    dangerouslySetInnerHTML={{
                        __html:
                            "N<sub>2</sub> and H<sub>2</sub> share one plot and the same vertical scale (mol). NH<sub>3</sub> is separate so small amounts stay visible. Forward reaction consumes 1 mol N<sub>2</sub> and 3 mol H<sub>2</sub> per 2 mol NH<sub>3</sub>. The time axis shows about the last 90&nbsp;s.",
                    }}
                />
            </details>
            <div className="ctrl-chartStack">
                <figure className="ctrl-chartFig">{canvasReactants}</figure>
                <figure className="ctrl-chartFig">{canvasNh3}</figure>
            </div>
        </section>
    ) as HTMLElement;

    return { node, canvasReactants, canvasNh3 };
}
