import type { Store } from "../../store";
import { controlsSidebarTexts } from "./sidebar-readouts.presenter";

export class SidebarReadouts {
    constructor(
        private readonly store: Store,
        private readonly clockEl: HTMLElement,
        private readonly reactorTempEl: HTMLElement,
    ) {}

    subscribe(): void {
        this.store.subscribe((state) => {
            const t = controlsSidebarTexts(state);
            this.clockEl.textContent = t.time;
            this.reactorTempEl.textContent = t.reactorTemp;
        });
    }
}
