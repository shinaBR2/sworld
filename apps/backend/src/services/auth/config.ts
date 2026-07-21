const isDev = process.env.NODE_ENV == 'development';
/**
 * Human-readable title for your website
 */
const RP_NAME = 'SWorld';
/**
 * A unique identifier for your website. 'localhost' is okay for
 * local dev
 */
const RP_ID = isDev ? 'localhost' : (process.env.VITE_PROJECT_ID as string);
/**
 * The URL at which registrations and authentications should occur.
 * 'http://localhost' and 'http://localhost:PORT' are also valid.
 * Do NOT include any trailing /
 */
const ORIGIN = isDev ? `http://${RP_ID}` : `https://${RP_ID}`;
const EXPECTED_ORIGINS = isDev ? [ORIGIN, `${ORIGIN}:3003`] : ORIGIN;
const EXPECTED_RP_IDS = isDev ? [RP_ID, `${RP_ID}:3003`] : RP_ID;

export { RP_ID, RP_NAME, EXPECTED_ORIGINS, EXPECTED_RP_IDS };
