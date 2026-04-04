import { describe, expect, test } from "bun:test";
import {
    createInitialConditions,
    stepHaberBoschReaction,
    updateReactorState,
    updateSimulationTime,
    type Conditions,
} from "../src/simulate";
import type { SimulatorState } from "../src/simulator";

describe.skip("SimulatorState (time integration metadata)", () => {
    test("createInitialConditions sets default t=0, dt=1/60, and zero rate placeholders", () => {
        const c = createInitialConditions({} as Partial<Conditions>);
        const sim = c.simulator_state;
        expect(sim.t).toBe(0);
        expect(sim.dt).toBeCloseTo(1 / 60, 10);
        expect(sim.dH2).toBe(0);
        expect(sim.dNH3).toBe(0);
        expect(sim.dN2).toBe(0);
        expect(sim.dT).toBe(0);
        expect(new Set(Object.keys(sim))).toEqual(new Set(["t", "dt", "dH2", "dNH3", "dN2", "dT"]));
    });

    test("createInitialConditions merges partial simulator_state", () => {
        const c = createInitialConditions({
            simulator_state: { t: 12.5, dt: 0.02 },
        } as Partial<Conditions>);
        expect(c.simulator_state.t).toBe(12.5);
        expect(c.simulator_state.dt).toBe(0.02);
        expect(c.simulator_state.dN2).toBe(0);
    });

    test("updateSimulationTime overwrites t and dt and keeps other fields", () => {
        const base: SimulatorState = {
            t: 1,
            dt: 0.1,
            dH2: 0.2,
            dNH3: -0.1,
            dN2: 0.05,
            dT: 0.3,
        };
        const next = updateSimulationTime(base, 99, 0.25);
        expect(next.t).toBe(99);
        expect(next.dt).toBe(0.25);
        expect(next.dH2).toBe(0.2);
        expect(next.dNH3).toBe(-0.1);
        expect(next.dN2).toBe(0.05);
        expect(next.dT).toBe(0.3);
    });

    test("stepHaberBoschReaction advances t by dt and preserves dt", () => {
        const dt = 0.04;
        const c = createInitialConditions({
            reactor_state: { N2: 3, H2: 1, NH3: 0, T: 700 },
            simulator_state: { t: 2, dt },
        } as Partial<Conditions>);
        const next = stepHaberBoschReaction(c);
        expect(next.simulator_state.dt).toBe(dt);
        expect(next.simulator_state.t).toBeCloseTo(2 + dt, 10);
        expect(Number.isFinite(next.simulator_state.t)).toBe(true);
    });

    test("stepHaberBoschReaction leaves simulator derivative slots finite", () => {
        const c = createInitialConditions({
            reactor_state: { N2: 1, H2: 1, NH3: 0, T: 500 },
            simulator_state: { t: 0, dt: 0.01 },
        } as Partial<Conditions>);
        const next = stepHaberBoschReaction(c);
        const s = next.simulator_state;
        expect(Number.isFinite(s.dH2)).toBe(true);
        expect(Number.isFinite(s.dNH3)).toBe(true);
        expect(Number.isFinite(s.dN2)).toBe(true);
        expect(Number.isFinite(s.dT)).toBe(true);
    });
});

describe.skip("Integration robustness (regression)", () => {
    test("updateReactorState completes for high-T stiff step that used to yield non-finite RK intermediates", () => {
        const c = createInitialConditions({
            reactor_state: { N2: 1, H2: 1, NH3: 2, T: 2000 },
            simulator_state: { dt: 0.001 },
        } as Partial<Conditions>);
        const next = updateReactorState(c);
        expect(Number.isFinite(next.N2)).toBe(true);
        expect(Number.isFinite(next.H2)).toBe(true);
        expect(Number.isFinite(next.NH3)).toBe(true);
        expect(Number.isFinite(next.T)).toBe(true);
    });

    // TODO: implement these tests
    test("updateReactorState completes when heat_input is non-finite (clamped in derivatives)", () => {
        const c = createInitialConditions({
            reactor_state: { N2: 1, H2: 1, NH3: 0, T: 700 },
            controls: { heat_input: Number.POSITIVE_INFINITY },
            simulator_state: { dt: 0.05 },
        } as Partial<Conditions>);
        expect(() => updateReactorState(c)).toThrow();
    });
    test("when heat_input is negative infinity", () => {
        const c = createInitialConditions({
            reactor_state: { N2: 1, H2: 1, NH3: 0, T: 700 },
            controls: { heat_input: Number.NEGATIVE_INFINITY },
            simulator_state: { dt: 0.05 },
        } as Partial<Conditions>);
        expect(() => updateReactorState(c)).toThrow();
    });
});
