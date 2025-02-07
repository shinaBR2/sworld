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
  // Other special characters
  À: 'a',
  Á: 'a',
  Ạ: 'a',
  Ả: 'a',
  Ã: 'a',
  Â: 'a',
  Ầ: 'a',
  Ấ: 'a',
  Ậ: 'a',
  Ẩ: 'a',
  Ẫ: 'a',
  Ă: 'a',
  Ằ: 'a',
  Ắ: 'a',
  Ặ: 'a',
  Ẳ: 'a',
  Ẵ: 'a',
  È: 'e',
  É: 'e',
  Ẹ: 'e',
  Ẻ: 'e',
  Ẽ: 'e',
  Ê: 'e',
  Ề: 'e',
  Ế: 'e',
  Ệ: 'e',
  Ể: 'e',
  Ễ: 'e',
  Ì: 'i',
  Í: 'i',
  Ị: 'i',
  Ỉ: 'i',
  Ĩ: 'i',
  Ò: 'o',
  Ó: 'o',
  Ọ: 'o',
  Ỏ: 'o',
  Õ: 'o',
  Ô: 'o',
  Ồ: 'o',
  Ố: 'o',
  Ộ: 'o',
  Ổ: 'o',
  Ỗ: 'o',
  Ơ: 'o',
  Ờ: 'o',
  Ớ: 'o',
  Ợ: 'o',
  Ở: 'o',
  Ỡ: 'o',
  Ù: 'u',
  Ú: 'u',
  Ụ: 'u',
  Ủ: 'u',
  Ũ: 'u',
  Ư: 'u',
  Ừ: 'u',
  Ứ: 'u',
  Ự: 'u',
  Ử: 'u',
  Ữ: 'u',
  Ỳ: 'y',
  Ý: 'y',
  Ỵ: 'y',
  Ỷ: 'y',
  Ỹ: 'y',
  Đ: 'd',
};

// https://gist.github.com/codeguy/6684588
const slugify = (str: string): string => {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
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

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  str = str.replace(new RegExp(`^-+|-+$`, 'g'), '');
  return str;
};

export { compareString, slugify };
