import type { HeaterControlElements } from "./controls.types";
import { h } from "../core/jsx-dom";

/** Slider + detached heat readout node (inserted into the metrics block by the controls view). */
export function createHeaterControlView(): HeaterControlElements {
    let slider!: HTMLInputElement;
    const valueDisplay = (
        <span className="metric-line__value metric-line__value--heat" />
    ) as HTMLSpanElement;

    const root = (
        <div className="control-group">
            <label htmlFor="heater-slider">Heat input</label>
            <input
                id="heater-slider"
                type="range"
                min="0"
                max="100"
                value="0"
                ref={(el) => {
                    slider = el as HTMLInputElement;
                }}
            />
        </div>
    ) as HTMLDivElement;

    return { root, slider, valueDisplay };
}
