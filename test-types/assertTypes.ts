/**
 * Compile-time assertion helpers for consumer type contract tests.
 * These types produce a TS error when the contract is broken.
 */
export type Expect<T extends true> = T;

export type Equal<A, B> = (<G>() => G extends A ? 1 : 2) extends <
  G,
>() => G extends B ? 1 : 2
  ? true
  : false;

export type Extends<A, B> = A extends B ? true : false;
