import { keccak256, encodePacked } from 'viem';

/**
 * Valida que los datos correspondan al hash enviado
 *
 * @param solidityTypes - Tipos como en Solidity (ej: ['address', 'uint256', 'string'])
 * @param values - Valores en el mismo orden que los tipos
 * @param expectedHash - Hash que debe coincidir
 */
export function validateHash(
  solidityTypes: string[],
  values: unknown[],
  expectedHash: `0x${string}`,
): boolean {
  const recalculatedHash = keccak256(
    encodePacked(solidityTypes as any, values as any),
  );

  return recalculatedHash.toLowerCase() === expectedHash.toLowerCase();
}
