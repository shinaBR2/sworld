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

// https://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidId = (id: string): boolean => {
  if (typeof id !== 'string') {
    return false;
  }

  const trimmedId = id.trim();

  if (trimmedId.length === 0) {
    return false;
  }

  return UUID_REGEX.test(trimmedId);
};

// https://github.com/manishsaraan/email-validator/blob/master/index.js
const isValidEmail = (email: string): boolean => {
  const emailRegex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  if (!email) return false;

  var emailParts = email.split('@');

  if (emailParts.length !== 2) return false;

  var account = emailParts[0];
  var address = emailParts[1];

  if (account.length > 64) return false;
  else if (address.length > 255) return false;

  var domainParts = address.split('.');

  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  )
    return false;

  return emailRegex.test(email);
};

export { compareString, slugify, isValidId, isValidEmail };
