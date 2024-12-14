import { api } from 'encore.dev/api';

interface Response {
  status: string;
}

export const get = api(
  { expose: true, method: 'GET', path: '/' },
  async (): Promise<Response> => {
    return { status: 'ok' };
  }
);
