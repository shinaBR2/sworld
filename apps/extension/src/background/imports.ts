import {
  getItems,
  setItem,
  removeItems,
} from 'core/universal/extension/storage';
import type { ImportStatus } from 'core/universal/extension/communication/types';

const STORAGE_KEY = 'importHistory';

const imports = new Map<string, ImportStatus>();

const createImportRecord = (
  targetApp: 'library' | 'watch',
  title?: string,
): ImportStatus => {
  const record: ImportStatus = {
    importId: crypto.randomUUID(),
    status: 'pending',
    targetApp,
    title,
  };

  imports.set(record.importId, record);
  persistHistory();

  return record;
};

const updateImportStatus = (
  importId: string,
  status: ImportStatus['status'],
  error?: string,
): void => {
  const record = imports.get(importId);
  if (!record) return;

  record.status = status;
  if (error) {
    record.error = error;
  }

  imports.set(importId, record);
  persistHistory();

  chrome.runtime.sendMessage({
    source: 'background',
    target: 'popup',
    type: 'IMPORT_STATUS',
    payload: { ...record },
  });
};

const getImportHistory = async (): Promise<ImportStatus[]> => {
  const result = await getItems([STORAGE_KEY]);
  try {
    return JSON.parse(result[STORAGE_KEY] ?? '[]');
  } catch {
    return [];
  }
};

const clearImportHistory = async (): Promise<void> => {
  imports.clear();
  await removeItems([STORAGE_KEY]);
};

const persistHistory = async (): Promise<void> => {
  const records = Array.from(imports.values());
  await setItem(STORAGE_KEY, JSON.stringify(records));
};

export {
  createImportRecord,
  updateImportStatus,
  getImportHistory,
  clearImportHistory,
};
