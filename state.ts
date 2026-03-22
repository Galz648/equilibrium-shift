

interface Action {
    type: ActionType;
    payload: Controls;
}


type ActionType = "update_heater";
interface Controls {
    heater: number;
}

interface State {
    time: number;
    temperature: number;
    controls: Controls;
}

export type { State, Controls, Action };
