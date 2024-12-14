import "dotenv/config";

console.log("fuahkhak", process.env.DATABASE_URL);

import { initialize, listUsers } from "./database"; // Ensure this is correctly implemented
import { app } from "./server";

// const app = express();
const port = process.env.PORT || 4000;

// Endpoint to list users
app.get("/videos/test-users", async (req, res) => {
  try {
    console.log(`testUsers called`, process.env.DATABASE_URL);
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

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error fetching users:", error);
    // @ts-ignore
    res.status(500).json({ status: "error", message: error.message });
  }
  // res.json({ message: "Test users endpoint" });
});

const server = app.listen(port, () => {
  // TODO
  // const { NODE_ENV, HOST, PORT } = env;
  // logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
  console.log(`Server is running on port ${port}`);
});

const onCloseSignal = () => {
  // logger.info("sigint received, shutting down");
  server.close(() => {
    // logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
