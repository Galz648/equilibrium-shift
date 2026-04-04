import type { ReactorState } from "./reactor"
import {
    cooling_constant,
    DERIVATIVE_MAX_HEAT_INPUT_KW,
    equilibrium_K_reference_T_K,
    equilibrium_K_temperature_sensitivity,
    equilibrium_Q_K_match_relative_tol,
    heat_capacity,
    reaction_enthalpy,
    reaction_extent_rate_k,
    reactor_T_min_K,
    species_floor_mol,
    T_env,
    volume,
} from "./constants"
import type { SimulatorState } from "./simulator"

type Controls = {
    heat_input: number,
}

type Conditions = {
    simulator_state: SimulatorState,
    reactor_state: ReactorState,
    controls: Controls
}

/** Stoichiometry: N₂ = n₂₀ − ξ, H₂ = h₂₀ − 3ξ, NH₃ = nh₃₀ + 2ξ. */
export function speciesFromXi(n2_0: number, h2_0: number, nh3_0: number, xi: number): Pick<ReactorState, "N2" | "H2" | "NH3"> {
    return {
        N2: n2_0 - xi,
        H2: h2_0 - 3 * xi,
        NH3: nh3_0 + 2 * xi,
    }
}

/**
 * Single source of truth for batch references and ξ: reconciles stored species with (n₂₀, h₂₀, nh₃₀, ξ).
 * If the four fields disagree with the displayed species, refs are re-derived from species at the given ξ (default 0).
 */
export function finalizeReactorState(r: ReactorState): ReactorState {
    let xi = Number.isFinite(r.xi) ? r.xi : 0
    let n2_0 = Number.isFinite(r.n2_0) ? r.n2_0 : r.N2 + xi
    let h2_0 = Number.isFinite(r.h2_0) ? r.h2_0 : r.H2 + 3 * xi
    let nh3_0 = Number.isFinite(r.nh3_0) ? r.nh3_0 : r.NH3 - 2 * xi

    const derived = speciesFromXi(n2_0, h2_0, nh3_0, xi)
    const tol = 1e-6
    if (
        Math.abs(r.N2 - derived.N2) > tol ||
        Math.abs(r.H2 - derived.H2) > tol ||
        Math.abs(r.NH3 - derived.NH3) > tol
    ) {
        xi = Number.isFinite(r.xi) ? r.xi : 0
        n2_0 = r.N2 + xi
        h2_0 = r.H2 + 3 * xi
        nh3_0 = r.NH3 - 2 * xi
    }

    return {
        xi,
        n2_0,
        h2_0,
        nh3_0,
        T: r.T,
        ...speciesFromXi(n2_0, h2_0, nh3_0, xi),
    }
}

function createInitialConditions(conditions_to_change: Partial<Conditions>): Conditions {
    const FRAME_RATE = 60; // frames per second
    const TIMESTEP = 1 / FRAME_RATE; // seconds
    const standard_conditions: Conditions = {
        simulator_state: {
            t: 0,
            dt: TIMESTEP,
            dH2: 0,
            dNH3: 0,
            dN2: 0,
            dT: 0,
        },
        reactor_state: finalizeReactorState({
            N2: 0,
            H2: 0,
            NH3: 0,
            T: 298,
            xi: 0,
            n2_0: 0,
            h2_0: 0,
            nh3_0: 0,
        }),
        controls: {
            heat_input: 0
        }
    }
    const merged_reactor: ReactorState = {
        ...standard_conditions.reactor_state,
        ...conditions_to_change.reactor_state,
    }
    return {
        simulator_state: {
            ...standard_conditions.simulator_state,
            ...conditions_to_change.simulator_state,
        },
        reactor_state: finalizeReactorState(merged_reactor),
        controls: {
            ...standard_conditions.controls,
            ...conditions_to_change.controls,
        }
    }
}

export function updateSimulationTime(simulator_state: SimulatorState, t: number, dt: number): SimulatorState {
    return {
        ...simulator_state,
        dt,
        t
    }
}

/** Game equilibrium constant K(T); smooth and bounded for typical T. */
export function computeEquilibriumConstant(T: number): number {
    return Math.exp(-equilibrium_K_temperature_sensitivity * (T - equilibrium_K_reference_T_K))
}

function clampHeatInput(q: number): number {
    if (!Number.isFinite(q)) return 0
    return Math.max(-DERIVATIVE_MAX_HEAT_INPUT_KW, Math.min(DERIVATIVE_MAX_HEAT_INPUT_KW, q))
}

/** Q = [NH₃]² / ([N₂][H₂]³); denominator species floored to avoid divide-by-zero. */
function reactionQuotientClamped(N2: number, H2: number, NH3: number): number {
    const e = species_floor_mol
    const n2 = Math.max(N2, e)
    const h2 = Math.max(H2, e)
    return (NH3 * NH3) / (n2 * h2 * h2 * h2)
}

/** True when Q and K agree within tolerance (net driving force for ξ ~ 0). */
export function isNearReactionQuotientEquilibrium(K: number, Q: number): boolean {
    if (!Number.isFinite(K) || !Number.isFinite(Q) || K <= 0 || Q < 0) return false
    const denom = K + Q
    if (!(denom > 0)) return false
    return Math.abs(K - Q) / denom < equilibrium_Q_K_match_relative_tol
}

/** Thermodynamic snapshot for UI; K and Q match the extent integrator. */
type ReactorDiagnostics = {
    K_eq: number
    Q: number | null
    direction: "forward" | "reverse" | "equilibrium" | "n/a"
    /** Q ≈ K at this T (reaction quotient matches equilibrium constant). */
    atReactionEquilibrium: boolean
    /** Mol of gas molecules N₂ + H₂ + NH₃; changes with ξ (4 mol reactants → 2 mol NH₃ per turnover). */
    gasMoleculesMol: number
    /** Mol of N atoms (2 per N₂, 1 per NH₃); invariant for a closed batch. */
    nAtomsMol: number
    /** Mol of H atoms (2 per H₂, 3 per NH₃); invariant for a closed batch. */
    hAtomsMol: number
    extentXi: number
}

function computeReactorDiagnostics(reactor: ReactorState): ReactorDiagnostics {
    const r = finalizeReactorState(reactor)
    const { N2, H2, NH3 } = speciesFromXi(r.n2_0, r.h2_0, r.nh3_0, r.xi)
    const T = r.T
    const K_eq = computeEquilibriumConstant(T)
    const canQuotient = Number.isFinite(N2) && Number.isFinite(H2) && Number.isFinite(NH3)
    const Q = canQuotient ? reactionQuotientClamped(N2, H2, NH3) : null
    const atReactionEquilibrium =
        Q !== null && isNearReactionQuotientEquilibrium(K_eq, Q)
    let direction: ReactorDiagnostics["direction"] = "n/a"
    if (Q !== null && Number.isFinite(Q) && Number.isFinite(K_eq)) {
        if (atReactionEquilibrium) direction = "equilibrium"
        else if (K_eq > Q) direction = "forward"
        else direction = "reverse"
    }
    const gasMoleculesMol = N2 + H2 + NH3
    const nAtomsMol = 2 * N2 + NH3
    const hAtomsMol = 2 * H2 + 3 * NH3
    return {
        K_eq,
        Q,
        direction,
        atReactionEquilibrium,
        gasMoleculesMol,
        nAtomsMol,
        hAtomsMol,
        extentXi: r.xi,
    }
}

function clampReactorState(reactor_state: ReactorState): ReactorState {
    const r = finalizeReactorState(reactor_state)
    return {
        ...r,
        T: Math.max(r.T, reactor_T_min_K),
    }
}

export function updateReactorState(conditions: Conditions): ReactorState {
    const dt = conditions.simulator_state.dt
    let r = finalizeReactorState(conditions.reactor_state)
    let { xi, T, n2_0, h2_0, nh3_0 } = r
    const { N2, H2, NH3 } = speciesFromXi(n2_0, h2_0, nh3_0, xi)

    const xiMin = -nh3_0 / 2
    const xiMax = Math.min(n2_0, h2_0 / 3)

    const heat = clampHeatInput(conditions.controls.heat_input)

    if (!(xiMax - xiMin > 1e-15)) {
        const dT = (heat / heat_capacity) - cooling_constant * (T - T_env)
        T = Math.max(T + dT * dt, reactor_T_min_K)
        return clampReactorState({
            ...r,
            xi,
            T,
            n2_0,
            h2_0,
            nh3_0,
            ...speciesFromXi(n2_0, h2_0, nh3_0, xi),
        })
    }

    const Q = reactionQuotientClamped(N2, H2, NH3)
    const K = computeEquilibriumConstant(T)
    let rate = reaction_extent_rate_k * (K - Q) / (K + Q)
    if (!Number.isFinite(rate)) rate = 0

    const xiTentative = xi + rate * dt
    const xiNext = Math.min(Math.max(xiTentative, xiMin), xiMax)
    const actualDxi = xiNext - xi
    const effectiveRate = dt !== 0 ? actualDxi / dt : 0

    const dH = reaction_enthalpy * effectiveRate * volume
    const dT = ((dH + heat) / heat_capacity) - cooling_constant * (T - T_env)
    T = Math.max(T + dT * dt, reactor_T_min_K)

    return clampReactorState({
        ...r,
        xi: xiNext,
        T,
        n2_0,
        h2_0,
        nh3_0,
        ...speciesFromXi(n2_0, h2_0, nh3_0, xiNext),
    })
}

function assertValidReactorState(state: ReactorState): void {
    if (state.T < 0) {
        throw new Error("Temperature(Kelvin) cannot be smaller than zero");
    }

    if (state.N2 < 0 || state.H2 < 0 || state.NH3 < 0) throw new Error("negative concentration")
    if (![state.N2, state.H2, state.NH3, state.T, state.xi].every(Number.isFinite)) throw new Error("NaN/Inf")
}

function stepHaberBoschReaction(conditions: Conditions): Conditions {
    conditions.reactor_state = clampReactorState(updateReactorState(conditions))
    conditions.simulator_state = updateSimulationState(conditions.simulator_state)

    assertValidReactorState(conditions.reactor_state)

    return conditions
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

export {
    computeReactorDiagnostics,
    stepHaberBoschReaction,
    createInitialConditions,
    type Conditions,
    type Controls,
    type ReactorDiagnostics,
}
