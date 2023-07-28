import express from "express";
import upload from "../config/uploadConfig";
import { updatePrice, uploadCSV } from "../controllers/uploadsController";

const router = express.Router();

router.post(
  "/",
  [
    //validarJWT,
    //esAdminRole,
    upload.single("file"),
  ],
  uploadCSV
);

router.post("/update-prices/:id", [upload.single("file")], updatePrice);

export default router;
