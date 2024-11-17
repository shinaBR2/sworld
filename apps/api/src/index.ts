require('dotenv').config();

import healthCheck from './healthCheck';
import admin from './admin';
import auth from './auth';

// trigger deploy 8 FUCK

// console.log(healthCheck);

export { healthCheck, admin, auth };
