import express, { Router } from "express";
import { initializeApp } from "firebase-admin/app";
import { envConifg } from "src/utils/envConfig";
import { testUsers } from "./test-users";
import { AppError, AppResponse } from "src/utils/schema";
import { validateRequest } from "src/utils/validator";
import { convert, ConvertRequest, ConvertSchema } from "./convert";

initializeApp({
  storageBucket: envConifg.storageBucket,
});

const videosRouter: Router = express.Router();

videosRouter.get("/test-users", async (req, res) => {
  try {
    const users = await testUsers();

    res.json(AppResponse(true, "ok", users));
  } catch (error) {
    res.json(AppError("Error fetching users", error));
  }
});

videosRouter.post(
  "/convert",
  validateRequest<ConvertRequest>(ConvertSchema),
  async (req: any, res) => {
    try {
      const video = await convert(req);

      res.json(AppResponse(true, "ok", video));
    } catch (error) {
      console.log(`some thing wrong`, error);
      res.json(AppError("Error fetching users", error));
    }
  }
);

export { videosRouter };
