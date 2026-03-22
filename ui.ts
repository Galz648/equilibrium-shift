import { type State, type Controls, type Action } from "./state";

class UI {
    heater_slider = document.getElementById("heater-slider") as HTMLInputElement;
    heater_value = document.getElementById("heater-value") as HTMLElement;
    temperature_gauge = document.getElementById("temperature-gauge") as HTMLElement;
    actions: Action[] = [];
    updateHeaterDisplay(newValue: number) {
        this.heater_value!.textContent = `${newValue} W`;
    }
    private push_action(action: Action) {
        console.log("pushing action", action);
        this.actions.push(action);
    }
    updateTemperature(newValue: number) {
        this.temperature_gauge!.textContent = `${newValue} K`;
    }
    update(state: State) {
        this.updateHeaterDisplay(state.controls.heater);
        this.updateTemperature(state.temperature);
    }

    get_actions() {
        return this.actions;
    }
    clear_actions() {
        this.actions = [];
    }
    constructor() {
        this.heater_slider.value = "0".toString();
        this.heater_slider.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            const newValue = Number(target.value);
            this.push_action({ type: "update_heater", payload: { heater: newValue } });
        });
    }
}

export default UI;
