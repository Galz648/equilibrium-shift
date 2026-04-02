
import { updateSimulationTime, stepHaberBoschReaction } from "ammonia-reaction-simulation";
import type { ReactorState, SimulatorState, Conditions, Controls } from "ammonia-reaction-simulation";
import UI from "./src/ui";
import { createStore } from "./src/store";
import { createInitialConditions } from "./ammonia-reaction-simulation/src/simulate";



// Setup 

let last = performance.now();

// initial conditions
export const store = createStore(createInitialConditions({
    reactor_state: {
        T: 400
    }
} as Partial<Conditions>))
const ui = new UI(store); // TODO: replicate store initialization logic here - move UI() instantiation to ui.ts file



// update 
function loop(now: number) {
    const dt = (now - last) / 1000; // seconds
    last = now;

    const state = store.getState()
    console.log(`state: ${JSON.stringify(state)}`)
    // TODO: check if the sequence of actions makes sense
    const new_conditions = stepHaberBoschReaction(state)
    // TOOD: pass the store the new conditions object, update using dispatch
    store.tick(dt, new_conditions) // TODO: consider placing this call after the step simulation function
    console.log(`time: ${state.simulator_state.t}`)
    // console.log("state", store.getState());
    requestAnimationFrame(loop);
}


// store.subscribe((state: Conditions) => {
//     console.log(`conditions not updated by store listener: ${JSON.stringify(state)}`)
//     // conditions = state // TODO: fix - directly mutating the conditions object is not a good idea
// })
requestAnimationFrame(loop);
