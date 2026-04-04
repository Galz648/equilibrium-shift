export function formatSci(n: number): string {
    if (!Number.isFinite(n)) return "—";
    const a = Math.abs(n);
    if (a === 0) return "0";
    if (a >= 1e4 || a < 1e-2) return n.toExponential(3);
    return n.toPrecision(4);
}

/** Mole readout: fixed decimals when readable, scientific when very small (e.g. early NH₃ build-up). */
export function formatSpeciesMoles(mol: number): string {
    if (!Number.isFinite(mol)) return "—";
    const a = Math.abs(mol);
    if (a === 0) return "0";
    if (a < 0.01) return mol.toExponential(2);
    return mol.toFixed(5);
}
