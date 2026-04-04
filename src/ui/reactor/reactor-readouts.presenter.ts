import type { ReactorState } from "../../../ammonia-reaction-simulation/src/reactor";
import { formatSpeciesMoles } from "../core/formatting";

/** Pure strings for the reactor snapshot column (easy to scan / test). */
export function reactorSnapshotTexts(r: ReactorState): {
    temperature: string;
    H2: string;
    N2: string;
    NH3: string;
} {
    return {
        temperature: `${Number(r.T).toFixed(2)} K`,
        H2: formatSpeciesMoles(r.H2),
        N2: formatSpeciesMoles(r.N2),
        NH3: formatSpeciesMoles(r.NH3),
    };
}
