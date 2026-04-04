/**
 * Game-oriented extent model (not full kinetics): approach to equilibrium uses ξ and K(T).
 * Legacy Arrhenius constants are kept for reference / tooling but are not used in the main integrator.
 */
export const delta_entropy = -0.198;
export const frequency_factor = Math.pow(10, 10);
/** Apparent activation energy (kJ/mol). Unused by the ξ-based integrator. */
export const activation_energy_KJ = 175;

/** dξ/dt scale in rate = k * (K − Q) / (K + Q). */
export const reaction_extent_rate_k = 0.02;
/** Game K(T): K = exp(−α (T − T_ref)); higher T → smaller K → less NH₃ favored. */
export const equilibrium_K_temperature_sensitivity = 0.01;
export const equilibrium_K_reference_T_K = 500;
/** |K − Q| / (K + Q) below this ⇒ treat as reaction equilibrium for UI (same factor as rate numerator). */
export const equilibrium_Q_K_match_relative_tol = 0.025;
/** Floor (mol) on N₂/H₂ in Q so denominators stay finite. */
export const species_floor_mol = 1e-12;
/** Minimum reactor temperature (K) after a step. */
export const reactor_T_min_K = 200;
export const T_env = 298; // assumes that the environment temperature is 298 K, and that it is not affected by the reaction heat (exothermic reaction), or heating.
export const heat_capacity = 1.0;   // kJ/K
export const cooling_constant = 0.05;  //  kJ/(K s)
export const volume = 1; // L
export const reaction_enthalpy = -46; // KJ/mol
export const R = 0.008314 // kJ/(mol·K)

/** Bounds for evaluating rates inside RK4 substeps (intermediates can be unphysical without clamping). */
export const DERIVATIVE_T_MIN_K = 200
export const DERIVATIVE_T_MAX_K = 6000
export const DERIVATIVE_MOLE_CAP_MOL = 1e12
/** Prevents d(n)/dt and dT from overflowing double when moles sit at the cap (r can still be ~1e56). */
export const DERIVATIVE_MAX_RATE_MAG = 1e200
/** Bounds heat-input term in dT so bogus UI/store values cannot blow up the thermal ODE. */
export const DERIVATIVE_MAX_HEAT_INPUT_KW = 1e9

