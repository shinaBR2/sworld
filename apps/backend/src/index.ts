import "dotenv/config";

// import dotenv from "dotenv";
// dotenv.config(); // Load environment variables before anything else

console.log("fuahkhak", process.env.DATABASE_URL);

import express from "express";
import { initialize, listUsers } from "./database"; // Ensure this is correctly implemented

const app = express();
const port = process.env.PORT || 4000;

// Middleware to handle JSON body parsing
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Endpoint to list users
app.get("/videos/user-tests", async (req, res) => {
  // try {
  //   console.log(`testUsers called`, process.env.DATABASE_URL);
  //   await initialize(); // Ensure this properly initializes your DB connection
  //   const users = await listUsers(); // Fetch users

  //   // Loop through users and log their info
  //   for (let index = 0; index < users.length; index++) {
  //     const user = users[index];
  //     console.log(`user id`, user.id);
  //     console.log(`user email`, user.email);
  //     console.log(`user auth0_id`, user.auth0_id);
  //     console.log(`user auth0Id`, user.auth0Id); // Ensure correct field name if necessary
  //   }

  //   res.json({ status: "ok" });
  // } catch (error) {
  //   console.error("Error fetching users:", error);
  //   // @ts-ignore
  //   res.status(500).json({ status: "error", message: error.message });
  // }
  res.json({ message: "Test users endpoint" });
});

app.listen(port, () => {
  console.log("fuahkhak", process.env.DATABASE_URL);
  console.log(`Server is running on port ${port}`);
});
