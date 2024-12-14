const verifySignature = (signature: string) => {
  const webhookSecret = process.env.NOCODB_WEBHOOK_SIGNATURE;

  return signature == webhookSecret;
};

export { verifySignature };
