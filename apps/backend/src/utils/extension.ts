const CHROME_EXTENSION_ID_REGEX = /^[a-p]{32}$/;

const isValidExtensionId = (id: string): boolean => {
  return CHROME_EXTENSION_ID_REGEX.test(id);
};

export { isValidExtensionId };
