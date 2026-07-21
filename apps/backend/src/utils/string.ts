import { randomBytes } from 'crypto';

const generateSecureCode = (length: number) => {
  return randomBytes(length).toString('base64url');
};

const generateHumanCode = () => {
  const words = ['BIRD', 'TREE', 'BLUE', 'MOON', 'STAR', 'WIND'];
  const numbers = Math.floor((randomBytes(2).readUInt16BE(0) / 65535) * 999)
    .toString()
    .padStart(3, '0');
  return `${words[Math.floor((randomBytes(1).readUInt8(0) / 255) * words.length)]}-${numbers}`;
};

export { generateSecureCode, generateHumanCode };
