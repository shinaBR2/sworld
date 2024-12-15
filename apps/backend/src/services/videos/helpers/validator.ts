const verifySignature = (signature: string | null) => {
  if (!signature) {
    return false;
  }

  const webhookSecret = process.env.NOCODB_WEBHOOK_SIGNATURE;

  return signature == webhookSecret;
};

export { verifySignature };
