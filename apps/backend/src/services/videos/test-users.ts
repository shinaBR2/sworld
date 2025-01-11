import { initialize, listUsers } from 'src/database';
import { logger } from 'src/utils/logger';
import { AppError } from 'src/utils/schema';

const testUsers = async () => {
  try {
    await initialize(); // Ensure this properly initializes your DB connection
    const users = await listUsers(); // Fetch users

    // Loop through users and log their info
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
    }

    return users;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Error fetching users:', error.message);
      throw AppError(error.message);
    } else {
      logger.error('Unexpected error:', error);
      throw AppError('An unknown error occurred.');
    }
  }
};

export { testUsers };
