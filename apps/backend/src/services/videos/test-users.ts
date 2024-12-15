import { initialize, listUsers } from "src/database";
import { envConifg } from "src/utils/envConfig";
import { AppError } from "src/utils/schema";

const testUsers = async () => {
  try {
    console.log(`testUsers called`, envConifg.databaseUrl);
    await initialize(); // Ensure this properly initializes your DB connection
    const users = await listUsers(); // Fetch users

    // Loop through users and log their info
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      console.log(`user id`, user.id);
      console.log(`user email`, user.email);
      console.log(`user auth0_id`, user.auth0_id);
      console.log(`user auth0Id`, user.auth0Id); // Ensure correct field name if necessary
    }

    return users;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error.message);
      throw AppError(error.message);
    } else {
      console.error("Unexpected error:", error);
      throw AppError("An unknown error occurred.");
    }
  }
};

export { testUsers };
