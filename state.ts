

interface Action {
    type: ActionType;
    payload: Partial<State>;
}


type ActionType = "update_heater" | "increment_time" | "change_temperature" | "TICK"
interface Controls {
    heater: number;
}

interface State {
    time: number;
    temperature: number;
    controls: Controls;
}

export type { State, Controls, Action };




// map the controls to the UI 
export function reduceState(state: State, dt: number): State {


    return {
        ...state,
        temperature: state.temperature + dt * state.controls.heater,
        time: state.time + dt,
        controls: state.controls,
    };



}

export function reduceControls(controls: Controls, action: Action): Controls {
    switch (action.type) {
        case "update_heater":
            return {
                ...controls,
                heater: action.payload.heater,
            };
    }

    return controls;
}
// the controls variables that we want to change if changed by the user
// physics update
export function physicsUpdate(state: State, dt: number): State {
    // temperature loss
    const temperatureLoss = state.temperature * 0.01 * dt;
    // temperature gain
    return {
        ...state,
        temperature: Math.max(0, state.temperature - temperatureLoss),
    };
}



