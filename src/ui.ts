import type { Conditions } from "ammonia-reaction-simulation";
import { ActionType } from "./state";
import { dispatch, type Store } from "./store";

class UI {
    // TODO: find a way to encapsulate the instantiation of the dom elements, the callbacks, into a react like declarative element
    heater_slider = document.getElementById("heater-slider") as HTMLInputElement;
    heater_value = document.getElementById("heater-value") as HTMLElement;
    temperature_gauge = document.getElementById("temperature-gauge") as HTMLElement;
    clock = document.getElementById("clock") as HTMLElement
    // reaction concentrations display elements
    H2 = document.getElementById("H2") as HTMLElement
    N2 = document.getElementById("N2") as HTMLElement
    NH3 = document.getElementById("NH3") as HTMLElement

    updateHeaterDisplay(newValue: number) {
        this.heater_value!.textContent = `${newValue} W`;
    }

    // updateReactions(state: State) { // TODO:  todo!
    //     this.H2.textContent = `${} n(moles)`
    // }
    updateTemperatureGauge(newValue: number) {
        this.temperature_gauge!.textContent = `${newValue} K`;
    }
    // update(state: State) {
    //     this.updateHeaterDisplay(state.controls.heater);
    //     this.updateTemperatureGauge(state.temperature);
    // }

    updateClock(time: number) {
        this.clock.textContent = `t(s): ${time}`
    }

    updateConcentrations(state: Conditions) {
        this.H2.textContent = `${state.reactor_state.H2} n(moles)`
        this.N2.textContent = `${state.reactor_state.N2} n(moles)`
        this.NH3.textContent = `${state.reactor_state.NH3} n(moles)`
    }
    constructor(store: Store) {
        this.clock.textContent = "0"
        this.heater_slider.value = "0"

        store.subscribe((state: Conditions) => {
            this.updateClock(state.simulator_state.t)
        })
        store.subscribe((state: Conditions) => {
            this.updateHeaterDisplay(state.controls.heat_input)
        })

        store.subscribe((state: Conditions) => {
            this.updateTemperatureGauge(state.reactor_state.T)
        })
        this.heater_slider.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            const newValue = Number(target.value);
            dispatch({
                type: ActionType.SET_HEATER, value: newValue
            }, store);
        });
    }
}

export default UI;
