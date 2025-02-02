import { envConfig } from 'src/utils/envConfig';
import {
  FileType,
  Platform,
  fileExtensionPatterns,
  urlPatterns,
} from 'src/utils/patterns';

const verifySignature = (signature: string | null) => {
  if (!signature) {
    return false;
  }

  const webhookSecret = envConfig.webhookSignature;

  return signature === webhookSecret;
};

interface ValidateMediaURLResult {
  url: string;
  platform: Platform | null;
  fileType: FileType | null;
}

const validateMediaURL = (url: string): ValidateMediaURLResult => {
  // Check platform patterns
  for (const [platform, pattern] of Object.entries(urlPatterns)) {
    if (pattern.test(url)) {
      return {
        url,
        platform: platform as Platform,
        fileType: null,
      };
    }
  }

  // Check file extension patterns
  for (const [type, pattern] of Object.entries(fileExtensionPatterns)) {
    if (pattern.test(url)) {
      return {
        url,
        platform: null,
        fileType: type as FileType,
      };
    }
  }

  return {
    url,
    platform: null,
    fileType: null,
  };
};

export { verifySignature, validateMediaURL };
