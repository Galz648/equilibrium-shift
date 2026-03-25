import { reduceState, reduceControls, physicsUpdate } from "./state";
import { store } from "./store";
import UI from "./ui";



// Setup 
const ui = new UI();
let last = performance.now();

// the controls variables that we want to change if changed by the user

// update 
function loop(now: number) {
    const dt = (now - last) / 1000; // seconds
    last = now;
    // physics update
    store.tick(dt)

    console.log("state", store.getState());
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
