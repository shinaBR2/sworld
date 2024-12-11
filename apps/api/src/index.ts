require('dotenv').config();

import healthCheck from './healthCheck';
import admin from './admin';
import auth from './auth';

export { healthCheck, admin, auth };
