import express from "express";
import { check } from "express-validator";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/categoryController";
import validateFields from "../middlewares/validateFields";
import upload from "../config/uploadConfig";
import { existsCategory } from "../helpers/db-validators";
import validateJWT from "../middlewares/validateJWT";
import isAdminRole from "../middlewares/isAdminRole";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);

router.post(
  "/",
  [validateJWT, isAdminRole, upload.single("image")],
  createCategory
);

router.put(
  "/:id",
  [validateJWT, isAdminRole, upload.single("image")],
  updateCategory
);

router.delete(
  "/:id",
  [
    validateJWT,
    isAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsCategory),
    validateFields,
  ],
  deleteCategory
);

export default router;
