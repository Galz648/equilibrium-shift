import { ActionType, type State } from "./state";
import { dispatch, getStore } from "./store";

class UI {
    heater_slider = document.getElementById("heater-slider") as HTMLInputElement;
    heater_value = document.getElementById("heater-value") as HTMLElement;
    temperature_gauge = document.getElementById("temperature-gauge") as HTMLElement;
    clock = document.getElementById("clock") as HTMLElement
    updateHeaterDisplay(newValue: number) {
        this.heater_value!.textContent = `${newValue} W`;
    }
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

    constructor() {
        this.clock.textContent = "0"
        this.heater_slider.value = "0"

        getStore().subscribe((state: State) => {
            this.updateClock(state.time)
        })
        getStore().subscribe((state: State) => {
            this.updateHeaterDisplay(state.controls.heater)
        })

        getStore().subscribe((state: State) => {
            this.updateTemperatureGauge(state.temperature)
        })
        this.heater_slider.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            const newValue = Number(target.value);
            dispatch({
                type: ActionType.SET_HEATER, value: newValue
            });
        });
    }
}

export default UI;
