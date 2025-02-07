const compareString = (str1: string, str2: string) => {
  if (!str1 || !str2) {
    return false;
  }

  return str1.toLowerCase() === str2.toLowerCase();
};

// https://gist.github.com/codeguy/6684588
const slugify = (str: string): string => {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaeeeeiiiioooouuuunc------';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  str = str.replace(new RegExp(`^-+|-+$`, 'g'), '');
  return str;
};

export { compareString, slugify };
