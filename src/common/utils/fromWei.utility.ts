import { formatEther } from 'viem';

/**
 * Convierte un valor en wei a su representación decimal en ETH
 * @param value valor en wei (bigint o string)
 * @returns número decimal en ETH
 *
 * @example
 * ```ts
 * const eth = fromWei(1000000000000000000n);
 * console.log(eth); // 1
 * ```
 */
export const fromWei = (value: bigint | string): number => {
  return parseFloat(formatEther(BigInt(value)));
};
