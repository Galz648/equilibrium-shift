
import { stepHaberBoschReaction } from "ammonia-reaction-simulation";
import type { ReactorState, SimulatorState, Conditions } from "ammonia-reaction-simulation";
import { store } from "./store";
import UI from "./ui";





// Setup 
const ui = new UI();
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
    reactor_state
}
// update 
function loop(now: number) {
    const dt = (now - last) / 1000; // seconds
    last = now;
    // physics update
    store.tick(dt)
    conditions.simulator_state = { // have the timing and tick time cotrolled by the application rather than by the simulation
        ...simulator_state,
        t: now,
        dt,
    }
    conditions = stepHaberBoschReaction(conditions)
    console.log(`time: ${conditions.simulator_state.t}`)
    // console.log("state", store.getState());
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
