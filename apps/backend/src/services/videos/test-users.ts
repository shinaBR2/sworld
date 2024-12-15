import { initialize, listUsers } from "src/database";
import { envConifg } from "src/utils/envConfig";
import { AppError } from "src/utils/schema";

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
      console.error("Error fetching users:", error.message);
      throw AppError(error.message);
    } else {
      console.error("Unexpected error:", error);
      throw AppError("An unknown error occurred.");
    }
  }
};

export { testUsers };
