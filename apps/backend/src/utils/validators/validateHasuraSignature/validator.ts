import { envConfig } from 'src/utils/envConfig';

const validateSignature = (signature: string | null) => {
  if (!signature) {
    return false;
  }

  const webhookSecret = envConfig.webhookSignature;

  return signature === webhookSecret;
};

export { validateSignature };
