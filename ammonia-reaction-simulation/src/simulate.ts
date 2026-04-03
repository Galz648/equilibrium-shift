import type { ReactorState, ReactorStateArray } from "./reactor"
import { activation_energy_KJ, frequency_factor, reaction_enthalpy, volume, heat_capacity, cooling_constant, T_env, R } from "./constants"
import { arrhenius_equation, getOrThrow, type derive } from "./utils"
import { type State } from "./utils"
import type { SimulatorState } from "./simulator"


type Controls = {
    heat_input: number,
}

type Conditions = {
    simulator_state: SimulatorState,
    reactor_state: ReactorState,
    controls: Controls
}
function arrayToState(arr: ReactorStateArray): ReactorState {
    const [N2, H2, NH3, T] = arr

    return { N2, H2, NH3, T }
}

function createInitialConditions(conditions_to_change: Partial<Conditions>): Conditions {
    const FRAME_RATE = 60; // frames per second
    const TIMESTEP = 1 / FRAME_RATE; // seconds
    const standard_conditions: Conditions = {
        simulator_state: {
            t: 0,
            // Default integration step for RK4; tests and callers that omit dt would otherwise integrate over zero time.
            dt: TIMESTEP, // NOTE: this is the default integration step for RK4
            dH2: 0,
            dNH3: 0,
            dN2: 0,
            dT: 0,
        },
        reactor_state: {
            N2: 0,
            H2: 0,
            NH3: 0,
            T: 298
        },
        controls: {
            heat_input: 0
        }
    }
    return {
        simulator_state: {
            ...standard_conditions.simulator_state,
            ...conditions_to_change.simulator_state,
        },
        reactor_state: {
            ...standard_conditions.reactor_state,
            ...conditions_to_change.reactor_state,
        },
        controls: {
            ...standard_conditions.controls,
            ...conditions_to_change.controls,
        }
    }
}
function updateSimulationTime(simulator_state: SimulatorState, t: number, dt: number): SimulatorState {
    return {
        ...simulator_state,
        dt,
        t
    }
}
function stateToArray(s: ReactorState): ReactorStateArray { // TODO: change name - name doesn't reflect he fact that it converts the reactor state to an array of numbers
    return [s.N2, s.H2, s.NH3, s.T]
}


function reactionRate(k_forward: number, N2_concentration: number, H2_concentration: number, NH3_concentration: number, k_reverse: number,): number {
    const r = k_forward * N2_concentration * Math.pow(H2_concentration, 3) - k_reverse * Math.pow(NH3_concentration, 2)
    return r
}
function equilibriumConstant(deltaG_kJ: number, T: number) {
    // a thermodynamical calculation
    const R = 0.008314 // kJ/(mol·K)
    return Math.exp(-deltaG_kJ / (R * T))
}

function reactionQuotient(N2: number, H2: number, NH3: number) {
    return (NH3 ** 2) / (N2 * (H2 ** 3))
}

/** Thermodynamic snapshot for UI/diagnostics; uses the same ΔG°, K, and Q definitions as the integration. */
type ReactorDiagnostics = {
    deltaG_kJ: number
    K_eq: number
    Q: number | null
    direction: "forward" | "reverse" | "equilibrium" | "n/a"
    totalMoles: number
}

function computeReactorDiagnostics(reactor: ReactorState): ReactorDiagnostics {
    const T = reactor.T
    const dG = deltaG(T)
    const K_eq = Math.exp(-dG / (R * T))
    const { N2, H2, NH3 } = reactor
    const canQuotient = N2 > 0 && H2 > 0
    const Q = canQuotient ? reactionQuotient(N2, H2, NH3) : null
    let direction: ReactorDiagnostics["direction"] = "n/a"
    if (Q !== null && Number.isFinite(Q)) {
        if (K_eq > Q) direction = "forward"
        else if (K_eq < Q) direction = "reverse"
        else direction = "equilibrium"
    }
    return {
        deltaG_kJ: dG,
        K_eq,
        Q,
        direction,
        totalMoles: N2 + H2 + NH3,
    }
}

function deltaG(T: number) {
    // TODO: move to constants file
    const deltaH = -92 // kJ/mol
    const deltaS = -0.198 // kJ/mol·K
    return deltaH - T * deltaS
}
// implement: wrapped derivatives is a closure that captures the controls, partially applied to the derivatives function

function wrappedDerivatives(controls: Controls): derive {
    return function derivatives(t: number, arr: State): ReactorStateArray {
        const s = arrayToState(arr as ReactorStateArray)  // TODO: "lift" transformation to the caller
        // const k_eq = Math.pow(s.NH3, 2) / (s.N2 * Math.pow(s.H2, 3))
        const dG = deltaG(s.T)
        const k_eq = Math.exp(-dG / (R * s.T))
        // const k_eq = equilibriumConstant
        const k_forward = arrhenius_equation(activation_energy_KJ, s.T, frequency_factor)
        const k_reverse = k_forward / k_eq
        const rate: number = reactionRate(k_forward, s.N2, s.H2, s.NH3, k_reverse)
        // change in concentrations
        const dN2 = -rate
        const dH2 = -3 * rate
        const dNH3 = 2 * rate
        // change in temperature
        const dH = reaction_enthalpy * rate * volume

        const dT = ((dH + controls.heat_input) / heat_capacity) - cooling_constant * (s.T - T_env)

        const results = [dN2, dH2, dNH3, dT] as ReactorStateArray

        if (results.some(x => !Number.isFinite(x))) {
            console.log("bad derivative", { t, s })
            throw new Error("NaN in derivative")
        }
        return results
    }
}

function clampReactorState(reactor_state: ReactorState): ReactorState {
    return {
        ...reactor_state,
        T: Math.max(reactor_state.T, 0),
        N2: Math.max(reactor_state.N2, 0),
        H2: Math.max(reactor_state.H2, 0),
        NH3: Math.max(reactor_state.NH3, 0),
    }
}
// simulation
export function updateReactorState(conditions: Conditions): ReactorState {
    const derivatives = wrappedDerivatives(conditions.controls)
    const state_arr = stateToArray(conditions.reactor_state)

    const reactor_state = rk4(derivatives, state_arr as State, conditions.simulator_state.t, conditions.simulator_state.dt)

    // clamping the reactor state to be positive (no negative concentrations, no negative temperature)
    const clamped_reactor_state = clampReactorState(arrayToState(reactor_state)) // this is the final reactor state to be returned


    return clamped_reactor_state
}


function assertValidReactorState(state: ReactorState): void {
    if (state.T < 0) {
        throw new Error("Temperature(Kelvin) cannot be smaller than zero");
    }

    if (state.N2 < 0 || state.H2 < 0 || state.NH3 < 0) throw new Error("negative concentration")
    if (![state.N2, state.H2, state.NH3, state.T].every(Number.isFinite)) throw new Error("NaN/Inf")
    // stoichiometry consistency

}
function stepHaberBoschReaction(conditions: Conditions): Conditions {
    // Copy so callers (e.g. the app store) are not mutated in place — avoids aliased history and stale UI reads.
    const next: Conditions = {
        controls: { ...conditions.controls },
        reactor_state: { ...conditions.reactor_state },
        simulator_state: { ...conditions.simulator_state },
    }
    next.reactor_state = clampReactorState(updateReactorState(next))
    next.simulator_state = updateSimulationState(next.simulator_state)

    assertValidReactorState(next.reactor_state)

    return next
}

enum reactionDirection {
    FORWARD,
    BACKWARD,
    EQULIBRIUM
}

function determineReactionDirection(k_c: number, Q: number): reactionDirection {
    if (k_c > Q) {
        console.log("reaction is forward")
        return reactionDirection.FORWARD
    } else if (k_c < Q) {
        console.log("reaction is reverse")
        return reactionDirection.BACKWARD
    } else {
        console.log("reaction is at equilibrium")
        return reactionDirection.EQULIBRIUM
    }
}

function updateSimulationState(sim: SimulatorState): SimulatorState {
    const new_sim_state: SimulatorState = {
        t: sim.t + sim.dt,
        dt: sim.dt,
        dH2: sim.dH2,
        dNH3: sim.dNH3,
        dN2: sim.dN2,
        dT: sim.dT,
    }
    return new_sim_state
}



export function rk4( // An implementation of the rk4 algorithm - 4th order ODE numerical
    derivative: derive,
    initial_simulation_state: State,
    t0: number,
    dt: number,
): ReactorStateArray {

    const t = t0;
    let state_arr = [...initial_simulation_state];

    const k1 = derivative(t, state_arr as State);
    const k2 = derivative(t + dt / 2, state_arr.map((yi, j) => yi + dt * getOrThrow(k1, j) / 2) as State);
    const k3 = derivative(t + dt / 2, state_arr.map((yi, j) => yi + dt * getOrThrow(k2, j) / 2) as State);
    const k4 = derivative(t + dt, state_arr.map((yi, j) => yi + dt * getOrThrow(k3, j)) as State);

    state_arr = state_arr.map(
        (yi, j) =>
            yi + (dt / 6) *
            (getOrThrow(k1, j) +
                2 * getOrThrow(k2, j) +
                2 * getOrThrow(k3, j) +
                getOrThrow(k4, j))
    );

    return [...state_arr] as ReactorStateArray;
}

export {
    computeReactorDiagnostics,
    stepHaberBoschReaction,
    updateSimulationTime,
    createInitialConditions,
    type Conditions,
    type Controls,
    type ReactorDiagnostics,
}
