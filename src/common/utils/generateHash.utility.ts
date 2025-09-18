import { encodePacked, keccak256, Address } from 'viem';

/**
 * Genera un keccak256(abi.encodePacked(...)) en estilo Solidity.
 *
 * @param types Lista de tipos Solidity (ej: ["address", "uint256", "string"])
 * @param values Lista de valores correspondientes
 * @returns hash en formato 0x...
 */

export type HashValue = bigint | number | Address | (string & {});

export function generateHash(
  types: string[],
  values: HashValue[],
): `0x${string}` {
  if (types.length !== values.length) {
    throw new Error('El número de tipos y valores no coincide');
  }

  const packed = encodePacked(types as any, values);
  return keccak256(packed);
}
