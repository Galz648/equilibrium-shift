import { h } from "#ui/core/jsx-dom.ts";

/**
 * Shared label/value rows for the reactor column (`#reactor`).
 * Markup must stay aligned with `styles.css` rules under `#reactor .reactor-row*`.
 */

export function reactorStatRow(label: string, value: HTMLElement): HTMLElement {
    return (
        <div className="reactor-row">
            <span className="reactor-rowLabel">{label}</span>
            {value}
        </div>
    ) as HTMLElement;
}

export function reactorStatGroup(title: string, rows: HTMLElement[]): HTMLElement {
    return (
        <div className="reactor-group">
            <h4 className="reactor-groupTitle">{title}</h4>
            {rows}
        </div>
    ) as HTMLElement;
}

export function reactorValuePlaceholder(): HTMLElement {
    return <span className="reactor-rowValue">—</span> as HTMLElement;
}
