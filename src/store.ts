import {
    finalizeReactorState,
    stepHaberBoschReaction,
    type Conditions,
} from "../ammonia-reaction-simulation/src/simulate";
import { ActionType, type Action } from "./state";

type Listener = (state: Conditions) => void;


/** Deep copy for history and public reads — avoids shared nested references. */
function cloneConditions(c: Conditions): Conditions {
    return structuredClone(c); // TODO: determine if this is neccesary or only sufficient for copying the conditions object
}

function applySimulationStep(state: Conditions, dtSec: number): void {
    const stepped = stepHaberBoschReaction({
        ...state,
        simulator_state: { ...state.simulator_state, dt: dtSec },
    });
    state.simulator_state = stepped.simulator_state;
    state.reactor_state = stepped.reactor_state;
}

export interface Store {
    simulation_history: Conditions[];
    getState(): Conditions;
    dispatch(action: Action): void;
    subscribe(listener: Listener): void;
}

export function createStore(initialState: Conditions): Store {
    const state: Conditions = initialState;
    const listeners: Listener[] = [];
    const simulation_history: Conditions[] = [cloneConditions(initialState)];

    function notify(): void {
        const snapshot = cloneConditions(state);
        for (const listener of listeners) {
            listener(snapshot);
        }
    }

    function dispatch(action: Action): void {
        switch (action.type) {
            case ActionType.SET_HEATER:
                state.controls.heat_input = action.value;
                break;
            case ActionType.INCREMENT_TIME:
                state.simulator_state.t += action.value;
                state.simulator_state.dt = action.value;
                break;
            case ActionType.UPDATE_SIMULATOR:
                state.simulator_state = action.value;
                break;
            case ActionType.UPDATE_REACTOR:
                state.reactor_state = finalizeReactorState({
                    ...state.reactor_state,
                    ...action.value,
                });
                break;
            case ActionType.STEP:
                applySimulationStep(state, action.dt);
                simulation_history.push(cloneConditions(state));
                break;
            case ActionType.CHANGE_TEMPERATURE:
                throw new Error("CHANGE_TEMPERATURE is not wired up yet");
            default:
                throw new Error(`Unknown action : ${JSON.stringify(action)}`);
        }
        notify();
    }

    return {
        simulation_history,
        getState: () => cloneConditions(state),
        dispatch,
        subscribe(listener: Listener): void {
            listeners.push(listener);
        },
    };
}
