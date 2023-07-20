import express from "express";
import upload from "../config/uploadConfig";
import { uploadCSV } from "../controllers/uploadsController";

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

export default router;
