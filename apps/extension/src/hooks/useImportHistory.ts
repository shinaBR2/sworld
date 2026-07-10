import { useCallback, useEffect, useState } from 'react';
import type { ImportStatus } from 'core/universal/extension/communication/types';
import { getItems, setItem } from 'core/universal/extension/storage';

const IMPORTS_STORAGE_KEY = 'importHistory';

const useImportHistory = () => {
  const [imports, setImports] = useState<ImportStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImports = async () => {
      try {
        const result = await getItems([IMPORTS_STORAGE_KEY]);
        const stored = result[IMPORTS_STORAGE_KEY];
        if (stored) {
          setImports(JSON.parse(stored));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    loadImports();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setItem(IMPORTS_STORAGE_KEY, JSON.stringify(imports));
    }
  }, [imports, isLoading]);

  const saveImports = useCallback(
    (value: ImportStatus[] | ((prev: ImportStatus[]) => ImportStatus[])) => {
      setImports(value);
    },
    [],
  );

  const clearHistory = useCallback(() => {
    setImports([]);
  }, []);

  return { imports, isLoading, saveImports, clearHistory };
};

export { useImportHistory };
