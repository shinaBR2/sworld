const compareString = (str1: string, str2: string) => {
  if (!str1 || !str2) {
    return false;
  }

  return str1.toLowerCase() === str2.toLowerCase();
};

export { compareString };
