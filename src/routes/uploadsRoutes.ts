import express from "express";
import upload from "../config/uploadConfig";
import { updatePrice, uploadCSV } from "../controllers/uploadsController";
import validateJWT from "../middlewares/validateJWT";
import isAdminRole from "../middlewares/isAdminRole";

const router = express.Router();

router.post("/", [validateJWT, isAdminRole, upload.single("file")], uploadCSV);

router.post(
  "/update-prices/:id",
  [validateJWT, isAdminRole, upload.single("file")],
  updatePrice
);

export default router;
