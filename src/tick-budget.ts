const MAX_TICK_CANDIDATES = 10_000;

/** Validates public tick inputs, including domains changed after construction. */
export function validateTickRequest(count: number, start: number, stop: number): void {
  if (!Number.isFinite(count) || count <= 0 || count > MAX_TICK_CANDIDATES) {
    throw new RangeError("Tick count must be finite, positive, and at most 10000");
  }
  if (!Number.isFinite(start) || !Number.isFinite(stop)) {
    throw new RangeError("Tick domain endpoints must be finite");
  }
}

/** Bounds work even when duplicate or out-of-domain candidates are skipped. */
export function assertTickBudget(candidateIndex: number): void {
  if (candidateIndex >= MAX_TICK_CANDIDATES) {
    throw new RangeError("Tick generation exceeded the 10000-candidate budget");
  }
}
