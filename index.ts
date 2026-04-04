import { mountAmmoniaEquilibriumApp } from "#ui/app.ts";
import { createStore } from "#src/store.ts";
import { ActionType } from "#src/state.ts";
import { createInitialConditions, type Conditions } from "#simulation/src/simulate.ts";

// Setup

let last = performance.now();

// initial conditions
export const store = createStore(
    createInitialConditions({
        reactor_state: {
            H2: 1,
            N2: 3,
            NH3: 0,
            T: 700,
        },
    } as Partial<Conditions>),
);

const root = document.getElementById("root");
if (!root) {
    throw new Error("Missing #root — the app expects a single mount point in index.html");
}
mountAmmoniaEquilibriumApp(root, store);



// update 
function loop(now: number) {
    const dt = (now - last) / 1000; // seconds
    last = now;

    store.dispatch({ type: ActionType.STEP, dt, name: "STEP" })
    requestAnimationFrame(loop);
}


requestAnimationFrame(loop);
