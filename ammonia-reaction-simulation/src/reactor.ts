type ReactorStateArray = [number, number, number, number]


type ReactorState = {
    N2: number
    H2: number
    NH3: number
    T: number
    /** Extent of N₂ + 3H₂ ⇌ 2NH₃ (mol); single integrated variable. */
    xi: number
    /** Reference batch (mol); species follow N₂ = n₂₀ − ξ, etc. */
    n2_0: number
    h2_0: number
    nh3_0: number
}


export type { ReactorStateArray, ReactorState }
