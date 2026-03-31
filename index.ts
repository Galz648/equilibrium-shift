
import { updateSimulationTime, stepHaberBoschReaction } from "ammonia-reaction-simulation";
import type { ReactorState, SimulatorState, Conditions } from "ammonia-reaction-simulation";
import UI from "./src/ui";
import { createStore } from "./src/store";



// Setup 

let last = performance.now();

// initial conditions
const reactor_state: ReactorState = {
    N2: 0,
    H2: 0,
    NH3: 0,
    T: 297
}
const simulator_state: SimulatorState = {
    t: 0,
    dt: 0,
    dH2: 0,
    dNH3: 0,
    dN2: 0,
    dT: 0
}
let conditions: Conditions = {
    simulator_state,
    reactor_state,
    controls: {
        heat_input: 50
    }
}
export const store = createStore(conditions)
const ui = new UI(store); // TODO: replicate store initialization logic here - move UI() instantiation to ui.ts file



// update 
function loop(now: number) {
    const dt = (now - last) / 1000; // seconds
    last = now;


    // TODO: check if the sequence of actions makes sense
    conditions.simulator_state = conditions.simulator_state = updateSimulationTime(conditions.simulator_state, now, dt)
    conditions = stepHaberBoschReaction(conditions)
    store.tick(dt) // TODO: consider placing this call after the step simulation function
    console.log(`time: ${conditions.simulator_state.t}`)
    // console.log("state", store.getState());
    requestAnimationFrame(loop);
}


// TODO: get the new ui controls state from the store and update the simulation `Conditions`
store.subscribe((state: Conditions) => {
    console.log(`conditions updated by store: ${JSON.stringify(state)}`)
    conditions = state
})
requestAnimationFrame(loop);
