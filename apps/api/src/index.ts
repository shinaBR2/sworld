require('dotenv').config();

import healthCheck from './healthCheck';
import admin from './admin';
import auth from './auth';

// trigger deploy 10

export { healthCheck, admin, auth };
