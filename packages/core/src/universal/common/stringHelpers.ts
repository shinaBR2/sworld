const compareString = (str1: string, str2: string) => {
  if (!str1 || !str2) {
    return false;
  }

  return str1.toLowerCase() === str2.toLowerCase();
};

const charMap: Record<string, string> = {
  // Vietnamese vowels
  à: 'a',
  á: 'a',
  ạ: 'a',
  ả: 'a',
  ã: 'a',
  â: 'a',
  ầ: 'a',
  ấ: 'a',
  ậ: 'a',
  ẩ: 'a',
  ẫ: 'a',
  ă: 'a',
  ằ: 'a',
  ắ: 'a',
  ặ: 'a',
  ẳ: 'a',
  ẵ: 'a',
  è: 'e',
  é: 'e',
  ẹ: 'e',
  ẻ: 'e',
  ẽ: 'e',
  ê: 'e',
  ề: 'e',
  ế: 'e',
  ệ: 'e',
  ể: 'e',
  ễ: 'e',
  ì: 'i',
  í: 'i',
  ị: 'i',
  ỉ: 'i',
  ĩ: 'i',
  ò: 'o',
  ó: 'o',
  ọ: 'o',
  ỏ: 'o',
  õ: 'o',
  ô: 'o',
  ồ: 'o',
  ố: 'o',
  ộ: 'o',
  ổ: 'o',
  ỗ: 'o',
  ơ: 'o',
  ờ: 'o',
  ớ: 'o',
  ợ: 'o',
  ở: 'o',
  ỡ: 'o',
  ù: 'u',
  ú: 'u',
  ụ: 'u',
  ủ: 'u',
  ũ: 'u',
  ư: 'u',
  ừ: 'u',
  ứ: 'u',
  ự: 'u',
  ử: 'u',
  ữ: 'u',
  ỳ: 'y',
  ý: 'y',
  ỵ: 'y',
  ỷ: 'y',
  ỹ: 'y',
  đ: 'd',
};

// https://gist.github.com/codeguy/6684588
const slugify = (str: string): string => {
  const TRIM_REGEX = /^\s+|\s+$/g;
  const INVALID_CHARS_REGEX = /[^a-z0-9 -]/g;
  const WHITESPACE_REGEX = /\s+/g;
  const DASHES_REGEX = /-+/g;
  const TRIM_DASHES_REGEX = /^-+|-+$/g;

  str = str.replace(TRIM_REGEX, ''); // trim
  str = str.toLowerCase();

  for (const [key, value] of Object.entries(charMap)) {
    str = str.replace(new RegExp(key, 'g'), value);
  }

  // remove accents, swap ñ for n, etc
  const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaeeeeiiiioooouuuunc------';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(INVALID_CHARS_REGEX, '').replace(WHITESPACE_REGEX, '-').replace(DASHES_REGEX, '-');

  str = str.replace(TRIM_DASHES_REGEX, '');
  return str;
};

export { compareString, slugify };
