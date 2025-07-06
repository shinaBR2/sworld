import { describe, it, expect } from 'vitest';
import { getClientIP } from './ip';

// Helper to build headers with correct types
const buildHeaders = (headers: Record<string, string | undefined>) => {
  return Object.fromEntries(Object.entries(headers).filter(([_, v]) => v !== undefined)) as Record<string, string>;
};

describe('getClientIP', () => {
  it('returns first valid IP from x-forwarded-for', () => {
    const headers = buildHeaders({
      'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
    });
    expect(getClientIP(headers)).toBe('203.0.113.195');
  });

  it('returns valid IP from x-real-ip', () => {
    const headers = buildHeaders({
      'x-real-ip': '192.168.1.1',
    });
    expect(getClientIP(headers)).toBe('192.168.1.1');
  });

  it('returns valid IP from cf-connecting-ip', () => {
    const headers = buildHeaders({
      'cf-connecting-ip': '10.0.0.1',
    });
    expect(getClientIP(headers)).toBe('10.0.0.1');
  });

  it('returns valid IP from x-client-ip', () => {
    const headers = buildHeaders({
      'x-client-ip': '172.16.0.5',
    });
    expect(getClientIP(headers)).toBe('172.16.0.5');
  });

  it('returns valid IP from x-forwarded', () => {
    const headers = buildHeaders({
      'x-forwarded': '203.0.113.1',
    });
    expect(getClientIP(headers)).toBe('203.0.113.1');
  });

  it('returns valid IP from forwarded header', () => {
    const headers = buildHeaders({
      forwarded: 'for=203.0.113.2;proto=http;by=203.0.113.43',
    });
    expect(getClientIP(headers)).toBe('203.0.113.2');
  });

  it('returns unknown when the first x-forwarded-for IP is invalid', () => {
    const headers = buildHeaders({
      'x-forwarded-for': 'invalid, 203.0.113.195',
    });
    expect(getClientIP(headers)).toBe('unknown');
  });

  it('returns "unknown" if no valid IP found', () => {
    const headers = buildHeaders({});
    expect(getClientIP(headers)).toBe('unknown');
  });

  it('returns valid IPv6 address', () => {
    const headers = buildHeaders({
      'x-real-ip': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    });
    expect(getClientIP(headers)).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });

  it('returns "unknown" for invalid IPs in all headers', () => {
    const headers = buildHeaders({
      'x-forwarded-for': 'invalid',
      'x-real-ip': 'not_an_ip',
      'cf-connecting-ip': 'bad_ip',
      'x-client-ip': 'foo',
      'x-forwarded': 'bar',
      forwarded: 'for=not_an_ip',
    });
    expect(getClientIP(headers)).toBe('unknown');
  });
});
