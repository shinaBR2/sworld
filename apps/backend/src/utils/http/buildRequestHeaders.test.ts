import { describe, it, expect } from 'vitest';
import { DEFAULT_USER_AGENT, buildRequestHeaders } from './buildRequestHeaders';

describe('buildRequestHeaders', () => {
  it('returns only the default Chrome User-Agent when called with no args', () => {
    const headers = buildRequestHeaders();

    expect(headers['User-Agent']).toBe(DEFAULT_USER_AGENT);
    expect(Object.keys(headers)).toEqual(['User-Agent']);
  });

  it('merges custom headers on top of the default UA', () => {
    const headers = buildRequestHeaders({ Referer: 'https://example.com/' });

    expect(headers['User-Agent']).toBe(DEFAULT_USER_AGENT);
    expect(headers.Referer).toBe('https://example.com/');
  });

  it('lets a caller-supplied User-Agent override the default', () => {
    const headers = buildRequestHeaders({ 'User-Agent': 'custom-agent' });

    expect(headers['User-Agent']).toBe('custom-agent');
  });

  it('is safe with undefined and empty inputs', () => {
    expect(buildRequestHeaders(undefined)['User-Agent']).toBe(
      DEFAULT_USER_AGENT,
    );
    expect(buildRequestHeaders({})['User-Agent']).toBe(DEFAULT_USER_AGENT);
  });
});
