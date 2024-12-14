import express, { Router } from "express";
import { initializeApp } from "firebase-admin/app";
import { initialize, listUsers } from "src/database";
import { envConifg } from "src/utils/envConfig";

initializeApp({
  storageBucket: envConifg.storageBucket,
});

const videosRouter: Router = express.Router();

videosRouter.get("/test-users", async (req, res) => {
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

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error fetching users:", error);
    // @ts-ignore
    res.status(500).json({ status: "error", message: error.message });
  }
});

export { videosRouter };
