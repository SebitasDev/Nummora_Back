import { parseEther } from 'viem';

/**
 * Convierte un número (decimal o entero) a wei (BigInt) usando parseEther
 * @param value número en formato decimal (ej: 0.5, 100, 75.25)
 * @returns BigInt en wei
 */
export const toWei = (value: number): bigint => {
  return parseEther(value.toString());
};
