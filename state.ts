

export enum ActionType {
    SET_HEATER,
    INCREMENT_TIME,
    CHANGE_TEMPERATURE,
}
type Action =
    | { type: ActionType.CHANGE_TEMPERATURE, value: number }
    | { type: ActionType.INCREMENT_TIME, value: number }
    | { type: ActionType.SET_HEATER, value: number }
interface Controls {
    heater: number;
}

interface State {
    time: number;
    temperature: number;
    controls: Controls;
}

export type { State, Controls, Action };







