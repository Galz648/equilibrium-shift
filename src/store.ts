import { stepHaberBoschReaction } from "ammonia-reaction-simulation"
import { ActionType, type Action } from "./state"
import type { Conditions } from "ammonia-reaction-simulation"

type callback = (state: Conditions) => void
function appendHistory(simulation_history: Conditions[], state: Conditions): void {
    simulation_history.push({ ...state })
}

export interface Store {
    simulation_history: Conditions[]
    getState(): Conditions
    dispatch(action: Action): void
    subscribe(callback: callback): void
}
export function createStore(initialState: Conditions): Store {
    const state: Conditions = initialState
    const listeners: callback[] = []
    const simulation_history: Conditions[] = [initialState]

    function notify(): void {
        const snapshot = state
        listeners.forEach((l) => l(snapshot))
    }

    function dispatch(action: Action): void {
        reducer(action, state, simulation_history)
        notify()
    }

    return {
        simulation_history,
        getState: () => { return { ...state } },
        dispatch,
        subscribe: (callback: callback) => {
            listeners.push(callback)
        }

    }
}

function reducer(action: Action, state: Conditions, simulation_history: Conditions[]): Conditions {

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
        case ActionType.STEP: {
            const next = stepHaberBoschReaction({
                ...state,
                simulator_state: { ...state.simulator_state, dt: action.dt },
            })
            state.simulator_state = next.simulator_state
            state.reactor_state = next.reactor_state
            appendHistory(simulation_history, state)
            break
        }
        default:
            // TODO: consider using a more descriptive error message, handle the error gracefully using a rust like Result type
            throw new Error(`Unknown action : ${JSON.stringify(action)}`)
    }

    return state
}
