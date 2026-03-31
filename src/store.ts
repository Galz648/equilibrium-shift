import { ActionType, type Action } from "./state"
import type { Conditions, Controls } from "ammonia-reaction-simulation"

type callback = (state: Conditions) => void
export interface Store {
    tick(dt: number): void
    getState(): Conditions
    notify(state: Conditions): void
    subscribe(callback: callback): void
}
export function createStore(initialState: Conditions): Store {
    let state: Conditions = initialState
    const listeners: callback[] = []
    return {
        tick(dt: number) {

            dispatch({
                type: ActionType.INCREMENT_TIME,
                value: dt
            }, this)


        },

        getState: () => state,
        notify(state: Conditions): void {
            listeners.forEach((l) => l(state))
        },
        subscribe: (callback: callback) => {
            listeners.push(callback)
        }

    }
}
export function dispatch(action: Action, store: Store): void {
    const current_state = store.getState()
    // call the reducer function with the current state
    const new_state = reducer(action, current_state)
    // notify the listeners 
    store.notify(new_state)



}

function reducer(action: Action, state: Conditions): Conditions {
    console.log(action)

    switch (action.type) {
        // TODO: convert the action type string to an enum
        case (ActionType.SET_HEATER):
            // TODO: should actually be given a payload of how much to increase the heater value
            state.controls.heat_input = action.value
            break
        case ActionType.INCREMENT_TIME:
            state.simulator_state.t += action.value
            break


    }

    return state
}
// const state: Conditions = { // TODO: 
//     simulator_state: {
//         t: 0,
//         dt: 0,
//         dH2: 0,
//         dNH3: 0,
//         dN2: 0,
//         dT: 0,
//     },
//     reactor_state: {
//         N2: 0,
//         H2: 0,
//         NH3: 0,
//         T: 298,
//     },
//     controls: {
//         heat_input: 50,
//     },
// };


