const getHeader = (
  headers: Record<string, string>,
  header: string,
): string | undefined => {
  const headerKey = Object.keys(headers).find(
    (key) => key.toLowerCase() === header.toLowerCase(),
  );
  return headerKey ? headers[headerKey] : undefined;
};

const getClientIP = (headers: Record<string, string>) => {
  // Try multiple headers in order of reliability
  const candidates = [
    getHeader(headers, 'x-real-ip'),
    getHeader(headers, 'true-client-ip'),
    getHeader(headers, 'x-forwarded-for')?.split(',')[0]?.trim(),
    getHeader(headers, 'cf-connecting-ip'), // Cloudflare
    getHeader(headers, 'x-client-ip'),
    getHeader(headers, 'x-forwarded'),
    getHeader(headers, 'forwarded')?.match(/for=([^;,]+)/i)?.[1],
  ];

  return candidates.find((ip) => ip && isValidIP(ip)) || 'unknown';
};

const isValidIP = (ip: string): boolean => {
  const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    return parts.every((part) => part >= 0 && part <= 255);
  } else if (ipv6Regex.test(ip)) {
    return true;
  }

  return false;
};

export { getClientIP };
