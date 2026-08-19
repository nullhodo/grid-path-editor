/**
 * Deterministic pseudo-random number generator for static texture rendering.
 * Returns a float between 0.0 and 1.0 based on seed or spatial coordinate.
 */
export function getStaticNoise(
  x: number,
  y: number,
  seed = 12345,
): number {
  const n =
    Math.sin(x * 12.9898 + y * 78.233 + seed * 0.001) * 43758.5453123;
  return n - Math.floor(n);
}

/**
 * Deterministic PRNG with integer index.
 */
export function getIndexedNoise(index: number, seed = 6789): number {
  const n = Math.sin(index * 12.9898 + seed * 0.001) * 43758.5453123;
  return n - Math.floor(n);
}
