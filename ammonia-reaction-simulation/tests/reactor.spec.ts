import {
    computeEquilibriumConstant,
    computeReactorDiagnostics,
    createInitialConditions,
    isNearReactionQuotientEquilibrium,
    stepHaberBoschReaction,
    updateReactorState,
    type Conditions,
} from "../src/simulate"

/** T where game K(T) equals Q for N₂=1, H₂=3, NH₃=2 (Q = 4/27). */
const T_GAME_EQ_1_3_2 = 500 - 100 * Math.log(4 / 27)

describe("K(T) sanity (game curve)", () => {
    test("equilibrium constant decreases as temperature increases", () => {
        expect(computeEquilibriumConstant(400)).toBeGreaterThan(computeEquilibriumConstant(550));
        expect(computeEquilibriumConstant(550)).toBeGreaterThan(computeEquilibriumConstant(700));
        expect(computeEquilibriumConstant(700)).toBeGreaterThan(computeEquilibriumConstant(900));
    })

    test("low T gives forward net direction for lean product (Q ≈ 0)", () => {
        const c = createInitialConditions({
            reactor_state: { N2: 1, H2: 3, NH3: 0, T: 400 },
        } as Partial<Conditions>);
        expect(computeReactorDiagnostics(c.reactor_state).direction).toBe("forward");
    })

    test("high T gives reverse net direction when Q exceeds K (1:3:2 mix)", () => {
        const c = createInitialConditions({
            reactor_state: { N2: 1, H2: 3, NH3: 2, T: 900 },
        } as Partial<Conditions>);
        expect(computeReactorDiagnostics(c.reactor_state).direction).toBe("reverse");
    })

    test("one integration step moves ξ in the direction predicted by K vs Q at low T", () => {
        const conditions = createInitialConditions({
            reactor_state: { N2: 1, H2: 3, NH3: 0, T: 450 },
            simulator_state: { dt: 0.05 },
        } as Partial<Conditions>);
        expect(computeReactorDiagnostics(conditions.reactor_state).direction).toBe("forward");
        const next = updateReactorState(conditions);
        expect(next.xi).toBeGreaterThan(conditions.reactor_state.xi);
        expect(next.NH3).toBeGreaterThan(conditions.reactor_state.NH3);
    })

    test("one integration step moves ξ backward at high T when product is rich", () => {
        const conditions = createInitialConditions({
            reactor_state: { N2: 1, H2: 3, NH3: 2, T: 850 },
            simulator_state: { dt: 0.05 },
        } as Partial<Conditions>);
        expect(computeReactorDiagnostics(conditions.reactor_state).direction).toBe("reverse");
        const next = updateReactorState(conditions);
        expect(next.xi).toBeLessThan(conditions.reactor_state.xi);
        expect(next.NH3).toBeLessThan(conditions.reactor_state.NH3);
    })

    test("diagnostics report reaction equilibrium when Q matches K at the game reference T", () => {
        const c = createInitialConditions({
            reactor_state: {
                N2: 1,
                H2: 3,
                NH3: 2,
                T: T_GAME_EQ_1_3_2,
            },
        } as Partial<Conditions>);
        const d = computeReactorDiagnostics(c.reactor_state);
        expect(d.atReactionEquilibrium).toBe(true);
        expect(d.direction).toBe("equilibrium");
        const K = computeEquilibriumConstant(T_GAME_EQ_1_3_2);
        const Q = 4 / 27;
        expect(isNearReactionQuotientEquilibrium(K, Q)).toBe(true);
    })

    test("gas molecule count can change but N and H atom inventories stay fixed", () => {
        let c = createInitialConditions({
            reactor_state: { N2: 3, H2: 1, NH3: 0, T: 700 },
            simulator_state: { dt: 0.02 },
        } as Partial<Conditions>);
        const d0 = computeReactorDiagnostics(c.reactor_state);
        for (let i = 0; i < 80; i++) {
            c = stepHaberBoschReaction(c);
        }
        const d1 = computeReactorDiagnostics(c.reactor_state);
        expect(d1.nAtomsMol).toBeCloseTo(d0.nAtomsMol, 7);
        expect(d1.hAtomsMol).toBeCloseTo(d0.hAtomsMol, 7);
        expect(d1.gasMoleculesMol).not.toBeCloseTo(d0.gasMoleculesMol, 5);
    })
})

describe("Reactor", () => {
    // TODO: create a test for the edge cases

    describe("Steady states", () => {
        describe("Trivial Steady States", () => {

            test("temperature remains unchanged at equilibrium without heat input", () => {
                const conditions = createInitialConditions({
                    reactor_state: {
                        N2: 0,
                        H2: 0,
                        NH3: 0,
                        T: 298,
                    },
                } as Partial<Conditions>)

                const state = updateReactorState(conditions)

                expect(state.T).toBe(conditions.reactor_state.T)
            })

            test("concentrations remain unchanged with no reactants or products", () => {
                const conditions = createInitialConditions({
                } as Partial<Conditions>)


                const state = updateReactorState(conditions)

                expect(state.N2).toBe(conditions.reactor_state.N2)
                expect(state.H2).toBe(conditions.reactor_state.H2)
                expect(state.NH3).toBe(conditions.reactor_state.NH3)
                expect(state.T).toBe(conditions.reactor_state.T)
            })


            test("temperature remains unchanged at equilibrium without heat input", () => {
                const conditions = createInitialConditions({
                } as Partial<Conditions>)

                const state = updateReactorState(conditions)

                expect(state.T).toBe(conditions.reactor_state.T)
            })

        })


        describe("Non-Trivial Steady States", () => {
            test("compositions stay fixed at K=Q while cooling still pulls T toward the environment", () => {
                const conditions = createInitialConditions({
                    reactor_state: {
                        N2: 1,
                        H2: 3,
                        NH3: 2,
                        T: T_GAME_EQ_1_3_2,
                    },
                } as Partial<Conditions>)

                const state = updateReactorState(conditions)

                expect(state.xi).toBeCloseTo(conditions.reactor_state.xi, 5)
                expect(state.N2).toBeCloseTo(conditions.reactor_state.N2, 5)
                expect(state.H2).toBeCloseTo(conditions.reactor_state.H2, 5)
                expect(state.NH3).toBeCloseTo(conditions.reactor_state.NH3, 5)
                expect(state.T).toBeLessThan(conditions.reactor_state.T)
            })
        })

        describe("Reaction Dynamics", () => {
            describe("Forward Reaction", () => {
                test("increases product concentration in forward reaction", () => { // TODO: problematic assumption that the forward rate occurs
                    const conditions = createInitialConditions({
                        reactor_state: {
                            N2: 1,
                            H2: 3,
                            NH3: 0,
                            T: 700
                        }

                    } as Partial<Conditions>)

                    const state = updateReactorState(conditions)

                    expect(state.NH3).toBeGreaterThan(conditions.reactor_state.NH3)
                    expect(state.H2).toBeLessThan(conditions.reactor_state.H2)
                    expect(state.N2).toBeLessThan(conditions.reactor_state.N2)
                })
            })
            describe("Backward Reaction", () => {
                test("decreases product concentration in backward reaction", () => {
                    const conditions = createInitialConditions({
                        reactor_state: {
                            N2: 0,
                            H2: 0,
                            NH3: 1,
                            T: 700,
                        },
                    } as Partial<Conditions>)
                    const state = updateReactorState(conditions)

                    expect(state.N2).toBeGreaterThan(conditions.reactor_state.N2)
                    expect(state.H2).toBeGreaterThan(conditions.reactor_state.H2)
                    expect(state.NH3).toBeLessThan(conditions.reactor_state.NH3)
                })
                // placeholder for symmetry
                // test("increases reactant concentration in reverse reaction", ...)
            })
        })


        describe("Control Effects", () => {
            describe("Heat Input", () => {
                test("temperature increases with heat input", () => {
                    const conditions = createInitialConditions({
                        reactor_state: {
                            T: 700
                        },
                        controls: {
                            heat_input: 100 // TODO: create a heater object, to define the heat input (max, min, default)
                        }
                    } as Partial<Conditions>)


                    const state = updateReactorState(conditions)

                    expect(state.T).toBeGreaterThan(conditions.reactor_state.T)
                })
            })
            test("temperature decreases without heat input, when temperature is above equilibrium, and no reaction occurs", () => {
                const conditions = createInitialConditions({
                    reactor_state: {
                        T: 400
                    }
                } as Partial<Conditions>)

                const state = updateReactorState(conditions)

                expect(state.T).toBeLessThan(conditions.reactor_state.T)
            })
        })

    })
})
