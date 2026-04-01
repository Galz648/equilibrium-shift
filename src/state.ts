import type { SimulatorState, ReactorState } from "ammonia-reaction-simulation";

export enum ActionType {
    SET_HEATER,
    INCREMENT_TIME,
    CHANGE_TEMPERATURE,
    UPDATE_SIMULATOR,
    UPDATE_REACTOR,
}
type Action =
    | { type: ActionType.CHANGE_TEMPERATURE, value: number , name: "CHANGE_TEMPERATURE"}
    | { type: ActionType.INCREMENT_TIME, value: number, name: "INCREMENT_TIME" }
    | { type: ActionType.SET_HEATER, value: number, name: "SET_HEATER" }
    | { type: ActionType.UPDATE_SIMULATOR, value: SimulatorState, name: "UPDATE_SIMULATOR" }
    | { type: ActionType.UPDATE_REACTOR, value: ReactorState, name: "UPDATE_REACTOR" }


export type { Action };







