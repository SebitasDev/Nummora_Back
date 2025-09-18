import { type PublicClient, parseAbiItem, Address, decodeEventLog } from 'viem';

type DecodedEvent<T extends string> = {
  eventName: T;
  args: Record<string, any>;
};

/**
 * Decodifica los logs de un evento específico de una transacción
 * @param publicClient Cliente de viem
 * @param txHash Hash de la transacción
 * @param eventSignature
 * @param strict Si debe ser estricto al decodificar
 * @returns Array de eventos decodificados
 */
export async function decodeTransactionEvent<T extends string>(
  publicClient: PublicClient,
  txHash: Address,
  eventSignature: string,
  strict = true,
): Promise<DecodedEvent<T>[]> {
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });

  const eventAbi = parseAbiItem(eventSignature);

  return receipt.logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi: [eventAbi],
          ...log,
          strict,
        }) as DecodedEvent<T>;
      } catch {
        return null;
      }
    })
    .filter((l): l is DecodedEvent<T> => l !== null);
}
