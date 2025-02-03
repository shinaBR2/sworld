import { vi } from 'vitest';

vi.mock('sequelize', async importOriginal => {
  const actual = await importOriginal();
  const mockTransaction = {
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
  };

  const mockSequelize = vi.fn().mockImplementation(() => ({
    define: vi.fn().mockImplementation((modelName, attributes, options) => {
      return {
        name: modelName,
        rawAttributes: attributes,
        options,
        build: (data: any) => {
          // Create a new object with all defaults from the attributes
          const defaults = Object.entries(attributes).reduce(
            (acc, [key, value]: [string, any]) => {
              if (value.defaultValue !== undefined) {
                acc[key] = value.defaultValue;
              }
              return acc;
            },
            {} as Record<string, any>
          );

          // Return the merged object with defaults and provided data
          return {
            ...defaults,
            ...data,
          };
        },
      };
    }),
    transaction: vi.fn().mockResolvedValue(mockTransaction),
  }));

  return {
    ...(typeof actual === 'object' ? actual : {}),
    Sequelize: mockSequelize,
    DataTypes: (actual as any).DataTypes,
    mockTransaction,
  };
});
