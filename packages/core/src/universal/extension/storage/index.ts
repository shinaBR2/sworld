const setItem = async (key: string, value: string) => {
  await chrome.storage.local.set({ [key]: value });
};

const getItems = async (keys: string[]) => {
  return await chrome.storage.local.get(keys);
};

const removeItems = async (keys: string[]) => {
  await chrome.storage.local.remove(keys);
};

export { setItem, getItems, removeItems };
