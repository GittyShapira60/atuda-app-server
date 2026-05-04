import * as env from 'env-var';

export const ENV = env
  .get('ENV')
  .required()
  .asEnum(['LOCAL', 'DEV', 'PREPROD', 'PROD', 'TEST']);

export const PORT = env.get('PORT').default('3000').asPortNumber();
export const LOG_PATH = env.get('LOG_PATH').default('/var/log/').asString();

export const CLIENT_ID = env.get('CLIENT_ID').required().asString();
export const CLIENT_SECRET_VALUE = env
  .get('CLIENT_SECRET_VALUE')
  .required()
  .asString();
export const TENANT_ID = env.get('TENANT_ID').required().asString();

export const COOKIE_SCOPE = env.get('COOKIE_SCOPE').required().asString();
export const COOKIE_API = env.get('COOKIE_API').required().asUrlString();
export const COOKIE_SUBSCRIPTION_KEY = env
  .get('COOKIE_SUBSCRIPTION_KEY')
  .required()
  .asString();

export const JWT_SECRET = env.get('JWT_SECRET').required().asString();

export const SESSION_SECRET = env.get('SESSION_SECRET').required().asString();

export const ALLOWED_TO_BACKDOOR = env
  .get('ALLOWED_TO_BACKDOOR')
  .default('')
  .asArray(',');

export const FILE_ARCHIVE_SUBSCRIPTION_KEY = env
  .get('FILE_ARCHIVE_SUBSCRIPTION_KEY')
  .required()
  .asString();

export const FILE_ARCHIVE_API = env
  .get('FILE_ARCHIVE_API')
  .required()
  .asUrlString();
