const getClientIP = (headers: Record<string, string>) => {
  // Try multiple headers in order of reliability
  const candidates = [
    headers['x-forwarded-for']?.split(',')[0]?.trim(),
    headers['x-real-ip'],
    headers['cf-connecting-ip'], // Cloudflare
    headers['x-client-ip'],
    headers['x-forwarded'],
    headers['forwarded']?.match(/for=([^;,]+)/)?.[1],
  ];

  return candidates.find(ip => ip && isValidIP(ip)) || 'unknown';
};

const isValidIP = (ip: string): boolean => {
  const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
  } else if (ipv6Regex.test(ip)) {
    return true;
  }

  return false;
};

export { getClientIP };
