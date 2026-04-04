import UI from "./src/ui";
import { createStore } from "./src/store";
import { ActionType } from "./src/state";
import { createInitialConditions, type Conditions } from "./ammonia-reaction-simulation/src/simulate";



// Setup 

let last = performance.now();

// initial conditions
export const store = createStore(createInitialConditions({
    reactor_state: {
        H2: 1,
        N2: 3,
        NH3: 0,
        T: 700
    }
} as Partial<Conditions>))
new UI(store)



// update 
function loop(now: number) {
    const dt = (now - last) / 1000; // seconds
    last = now;

    store.dispatch({ type: ActionType.STEP, dt, name: "STEP" })
    requestAnimationFrame(loop);
}


// store.subscribe((state: Conditions) => {
//     console.log(`conditions not updated by store listener: ${JSON.stringify(state)}`)
//     // conditions = state // TODO: fix - directly mutating the conditions object is not a good idea
// })
requestAnimationFrame(loop);
