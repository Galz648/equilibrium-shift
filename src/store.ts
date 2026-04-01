import { ActionType, type Action } from "./state"
import type { Conditions } from "ammonia-reaction-simulation"

type callback = (state: Conditions) => void
export interface Store {
    tick(dt: number, conditions: Conditions): void
    getState(): Conditions
    notify(state: Conditions): void
    subscribe(callback: callback): void
}
export function createStore(initialState: Conditions): Store {
    let state: Conditions = initialState
    const listeners: callback[] = []
    return {
        tick(dt: number, conditions: Conditions) {

            dispatch({
                type: ActionType.UPDATE_SIMULATOR,
                value: conditions.simulator_state,
                name: "UPDATE_SIMULATOR"
            }, this)
            dispatch({
                type: ActionType.UPDATE_REACTOR,
                value: conditions.reactor_state,
                name: "UPDATE_REACTOR"
            }, this)

            // // NOTE: The increment time action is the last action to be dispatched,
            // // because it updates the internal time of the simulator state
            // // 
            dispatch({
                type: ActionType.INCREMENT_TIME,
                value: dt,
                name: "INCREMENT_TIME"
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
    console.log(action.name)

    switch (action.type) {
        case (ActionType.SET_HEATER):
            state.controls.heat_input = action.value
            break
        case ActionType.INCREMENT_TIME:
            state.simulator_state.t += action.value
            state.simulator_state.dt = action.value
            break
        case ActionType.UPDATE_SIMULATOR:
            state.simulator_state = action.value
            break
        case ActionType.UPDATE_REACTOR:
            state.reactor_state = action.value
            break
        default:
            // TODO: consider using a more descriptive error message, handle the error gracefully using a rust like Result type
            throw new Error(`Unknown action : ${JSON.stringify(action)}`)
    }

    return state
}

