import type { Conditions } from "../../../ammonia-reaction-simulation/src/simulate";

export function controlsSidebarTexts(state: Conditions): { time: string; reactorTemp: string } {
    return {
        time: `${Number(state.simulator_state.t).toFixed(2)} s`,
        reactorTemp: `${Number(state.reactor_state.T).toFixed(2)} K`,
    };
}
