import { AUTH_ERROR_CODES, AUTH_ERRORS } from './auth';
import { BUSINESS_ERRORS } from './business';
import { DATABASE_ERROR_CODES, DATABASE_ERRORS } from './database';
import { EXTERNAL_ERROR_CODES, EXTERNAL_ERRORS } from './external';
import {
  HASURA_NATIVE_ERROR_CODES,
  HASURA_NATIVE_ERRORS,
} from './hasuraNative';
import { NETWORK_ERRORS } from './network';
import { SYSTEM_ERROR_CODES, SYSTEM_ERRORS } from './system';
import { VALIDATION_ERRORS } from './validation';

const ERROR_CODES = {
  ...SYSTEM_ERROR_CODES,
  ...AUTH_ERROR_CODES,
  ...DATABASE_ERROR_CODES,
  ...EXTERNAL_ERROR_CODES,
  ...BUSINESS_ERRORS,
  ...NETWORK_ERRORS,
  ...VALIDATION_ERRORS,
  ...HASURA_NATIVE_ERROR_CODES,
};

const ERROR_CONFIG = {
  ...SYSTEM_ERRORS,
  ...AUTH_ERRORS,
  ...DATABASE_ERRORS,
  ...EXTERNAL_ERRORS,
  ...BUSINESS_ERRORS,
  ...NETWORK_ERRORS,
  ...VALIDATION_ERRORS,
  ...HASURA_NATIVE_ERRORS,
};

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export { ERROR_CODES, ERROR_CONFIG, type ErrorCode };
