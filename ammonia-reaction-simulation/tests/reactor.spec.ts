import type { ReactorState } from "../src/reactor"
import { updateReactorState, type Conditions, type Controls, createInitialConditions } from "../src/simulate"
import type { SimulatorState } from "../src/simulator"


describe("Reactor", () => {
    // TODO: create a test for the edge cases

    describe("Steady states", () => {
        describe("Trivial Steady States", () => {

            test("temperature remains unchanged at equilibrium without heat input", () => {
                const conditions = createInitialConditions({
                    T: 298
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
            test("temperature remains unchanged at reaction equilibrium without heat input", () => {
                const conditions = createInitialConditions({
                    reactor_state: {
                        N2: 1,
                        H2: 3,
                        NH3: 2,
                    }
                } as Partial<Conditions>)

                const state = updateReactorState(conditions)

                expect(state.T).toBe(conditions.reactor_state.T)
                expect(state.N2).toBe(conditions.reactor_state.N2)
                expect(state.H2).toBe(conditions.reactor_state.H2)

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
                            NH3: 1,
                            T: 700
                        }
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
