import type { State, Controls, Action } from "./state";
import UI from "./ui";

let last = performance.now();
let state: State = {
    time: 0,
    temperature: 298,
    controls: {
        heater: 0,
    },
};

const ui = new UI();

// the controls variables that we want to change if changed by the user
// update 
function loop(now: number) {
    const dt = (now - last) / 1000; // seconds
    last = now;

    // get UI actions

    // UI actions -> Control change
    const controlChanges = ui.get_actions();
    for (const controlChange of controlChanges) {
        switch (controlChange.type) {
            case "update_heater":
                state.controls.heater = controlChange.payload.heater;
                break;
        }
    }
    ui.clear_actions();
    // Control change -> state change
    state = reducer(state, dt);
    // state change -> UI update
    ui.update(state);

    console.log("state", state);
    // render();

    // console.log(state.controls);
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// map the controls to the UI 
function reducer(state: State, dt: number): State {


    // update the state with the new controls


    return {
        ...state,
        temperature: state.temperature + dt * state.controls.heater,
        time: state.time + dt,
        controls: state.controls,
    };



}

function render() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
}

