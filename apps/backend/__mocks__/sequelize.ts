import { vi } from 'vitest';

const parseDbUrl = (url: string) => {
  if (!url) throw new Error('Database URL is required');
  const match = url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) throw new Error('Invalid database URL format');
  const [, username, password, host, port, database] = match;
  return { username, password, host, port, database };
};

vi.mock('sequelize', async importOriginal => {
  const actual = await importOriginal();
  const mockTransaction = {
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
  };

  const mockSequelize = vi.fn().mockImplementation((connectionString: string, options = {}) => {
    const config = {
      ...parseDbUrl(connectionString),
      ...options,
    };

    return {
      config,
      define: vi.fn().mockImplementation((modelName, attributes, options) => {
        return {
          name: modelName,
          rawAttributes: attributes,
          options,
          build: (data: any) => {
            const defaults = Object.entries(attributes).reduce(
              (acc, [key, value]: [string, any]) => {
                if (value.defaultValue !== undefined) {
                  acc[key] = value.defaultValue;
                }
                return acc;
              },
              {} as Record<string, any>
            );
            return {
              ...defaults,
              ...data,
            };
          },
        };
      }),
      authenticate: vi.fn().mockResolvedValue(undefined),
      sync: vi.fn().mockResolvedValue(undefined),
      transaction: vi.fn().mockResolvedValue(mockTransaction),
    };
  });

  return {
    ...(typeof actual === 'object' ? actual : {}),
    Sequelize: mockSequelize,
    DataTypes: (actual as any).DataTypes,
    mockTransaction,
  };
});

vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    databaseUrl: 'postgres://test-user:test-password@localhost:5432/test-db',
    computeServiceUrl: 'http://test-compute-service',
    ioServiceUrl: 'http://test-io-service',
  },
}));
