/** DOM handles for the reactor column (snapshot + simulation readouts). */

export type ReactorReadoutElements = {
    temperatureGauge: HTMLElement;
    h2: HTMLElement;
    n2: HTMLElement;
    nh3: HTMLElement;
};

export type SimulationStateRefs = {
    elT: HTMLElement;
    elDt: HTMLElement;
    elDg: HTMLElement;
    elK: HTMLElement;
    elQ: HTMLElement;
    elDirection: HTMLElement;
    elMoles: HTMLElement;
    elAtoms: HTMLElement;
    elEqStatus: HTMLElement;
    elEqCurrent: HTMLElement;
    elEqLatched: HTMLElement;
};
