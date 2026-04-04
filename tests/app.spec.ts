import { describe, expect, test } from "bun:test";
import { createInitialConditions, type Conditions } from "../ammonia-reaction-simulation/src/simulate";
import { ActionType } from "../src/state";
import { createStore } from "../src/store";

describe.skip("Equilibrium app wiring", () => {
    test("store STEP dispatch uses the simulation and returns sane reactor state", () => {
        const store = createStore(
            createInitialConditions({
                reactor_state: { N2: 3, H2: 1, NH3: 0, T: 700 },
            } as Partial<Conditions>),
        );
        store.dispatch({ type: ActionType.STEP, dt: 0.02, name: "STEP" });
        const s = store.getState();
        expect(Number.isFinite(s.reactor_state.T)).toBe(true);
        expect(Number.isFinite(s.reactor_state.N2)).toBe(true);
        expect(Number.isFinite(s.reactor_state.H2)).toBe(true);
        expect(Number.isFinite(s.reactor_state.NH3)).toBe(true);
    });

    test.skip("run the simulation for a few steps and check the state", () => {
        const store = createStore(
            createInitialConditions({
                reactor_state: { N2: 3, H2: 1, NH3: 0, T: 700 },
            } as Partial<Conditions>),
        );

        const TEN_SECONDS_IN_MILLISECONDS = 10000;
        const dt = 1 / 60;
        for (let i = 0; i < TEN_SECONDS_IN_MILLISECONDS; i += dt * 1000) {
            store.dispatch({ type: ActionType.STEP, dt: dt, name: "STEP" });
        }
        const s = store.getState();
        // expect(s.reactor_state.T).toBeCloseTo(700, 2);
        // expect(s.reactor_state.N2).toBeCloseTo(3, 2);
        // expect(s.reactor_state.H2).toBeCloseTo(1, 2);
        // expect(s.reactor_state.NH3).toBeCloseTo(0, 2);
        // expect(s.simulator_state.t).toBeCloseTo(10, 5);
    });
});
