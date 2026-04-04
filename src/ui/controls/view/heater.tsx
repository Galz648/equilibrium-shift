import type { HeaterTargets } from "#ui/controls/logic/types.ts";
import { h } from "#ui/core/jsx-dom.ts";

/** Heat slider + span used as the “Heat input” readout in the metrics block. */
export function heater(): HeaterTargets {
    const heatValue = <span className="ctrl-rowValue ctrl-rowHeat" /> as HTMLSpanElement;

    let slider!: HTMLInputElement;
    const root = (
        <div className="ctrl-group">
            <label className="ctrl-label" htmlFor="ctrl-heater">
                Heat input
            </label>
            <input
                id="ctrl-heater"
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

    return { root, slider, heatValue };
}
