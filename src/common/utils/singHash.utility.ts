import { WalletClient, toBytes } from 'viem';
import { generateHash, HashValue } from './generateHash.utility';

export async function signHash(
  walletClient: WalletClient,
  types: string[],
  values: HashValue[],
): Promise<`0x${string}`> {
  if (!walletClient?.account) {
    throw new Error('Wallet not connected');
  }

  const messageHash = generateHash(types, values);

  return await walletClient.signMessage({
    account: walletClient.account,
    message: { raw: toBytes(messageHash) },
  });
}
