/** DOM handles for the controls column (heater, metrics, chart canvases). */

export type HeaterControlElements = {
    root: HTMLElement;
    slider: HTMLInputElement;
    valueDisplay: HTMLElement;
};

export type ControlsPanelElements = {
    root: HTMLElement;
    heater: HeaterControlElements;
    canvasReactants: HTMLCanvasElement;
    canvasNh3: HTMLCanvasElement;
    clockEl: HTMLElement;
    reactorTempEl: HTMLElement;
};
