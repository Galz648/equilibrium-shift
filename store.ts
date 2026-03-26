import { ActionType, type Action, type State } from "./state"
import { isDefined } from "./utils"

export function getStore() {
    return store
}
type callback = (state: State) => void
function createStore(initialState: State) {
    const state = initialState
    const listeners: callback[] = []
    return {
        tick(dt: number) {

            dispatch({
                type: ActionType.INCREMENT_TIME,
                value: dt
            })


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
export function dispatch(action: Action): void {
    const current_state = getStore().getState()
    // call the reducer function with the current state
    const new_state = reducer(action, current_state)
    // notify the listeners 
    getStore().notify(new_state)



}

function reducer(action: Action, state: State): State {
    console.log(action)

    switch (action.type) {
        // TODO: convert the action type string to an enum
        case (ActionType.SET_HEATER):
            // TODO: should actually be given a payload of how much to increase the heater value
            state.controls.heater = action.value
            break
        case ActionType.INCREMENT_TIME:
            state.time += action.value
            break

        case ActionType.CHANGE_TEMPERATURE:
            state.temperature += action.value

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
