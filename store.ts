import type { Action, State } from "./state"

export function getStore() {
    return store
}
type callback = (state: State) => void
function createStore(initialState: State) {
    const state = initialState
    const listeners: callback[] = []
    return {
        tick(dt: number) {
            const temperatureLoss = state.temperature * 0.01 * dt;

            // state.temperature = Math.max(0, state.temperature - temperatureLoss)
            // state.time += dt
            dispatch({
                type: "increment_time", // TODO: refactor into an enum
                payload: {
                    time: dt,
                }
            })

            dispatch({
                type: "change_temperature", // TODO: refactor into an enum
                payload: {
                    temperature: -temperatureLoss,
                }


            })
            dispatch({
                type: "change_temperature", payload: {
                    temperature: state.controls.heater
                }
            })
            // TODO: determine if this will create recursion, a form of overflow

        },
        getState: () => state,
        notify(state: State): void {
            listeners.forEach((l) => l(state))
        },
        subscribe: (callback: callback) => {
            listeners.push(callback)
        }

    }
}
// TODO: type the action
export function dispatch(action: Action) {
    const current_state = getStore().getState()
    // call the reducer function with the current state
    const new_state = reducer(action, state)
    // notify the listeners 
    getStore().notify(new_state)
}

function reducer(action: Action, state: State): State {
    console.log(action)
    switch (action.type) {
        // TODO: convert the action type string to an enum
        case ("update_heater"):
            // TODO: should actually be given a payload of how much to increase the heater value
            state.controls.heater = action.payload.controls?.heater // TODO: add a check that this exists
            console.log("Should update the heater value (controls)")
            break
        case "increment_time":
            state.time += action.payload.time // TODO: make sure this exists
            break

        case "change_temperature":
            state.temperature += action.payload.temperature

    }

    return state
}
const state: State = {
    time: 0,
    temperature: 298,
    controls: {
        heater: 0,
    },
};

export const store = createStore(state)
