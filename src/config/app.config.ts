import { Address } from 'viem';

export default () => {
  const ENVIRONMENT = process.env.ENVIRONMENT ?? 'dev';

  return {
    environment: ENVIRONMENT,

    port:
      ENVIRONMENT === 'dev'
        ? Number(process.env.DEV_PORT ?? '3001')
        : Number(process.env.PROD_PORT ?? '3001'),

    gasSupplierPrivateKey: (ENVIRONMENT === 'dev'
      ? (process.env.DEV_GAS_RELAYER_PRIVATE_KEY ??
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')
      : (process.env.PROD_GAS_RELAYER_PRIVATE_KEY ??
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')) as `0x${string}`,

    nummoraCoreAddress: (ENVIRONMENT === 'dev'
      ? (process.env.DEV_NUMMORA_CORE_ADDRESS ?? '0xNUMMORA_CORE_ADDRESS')
      : (process.env.PROD_NUMMORA_CORE_ADDRESS ??
        '0xNUMMORA_CORE_ADDRESS')) as Address,

    jwtSecretKey: process.env.JWT_SECRET ?? 'jwt_secret_key',

    divviConsumer: (process.env.DIVVI_CONSUMER ??
      '0xDIVVI_CONSUMER') as Address,
  };
};
