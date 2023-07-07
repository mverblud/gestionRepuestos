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

const router = express.Router();

router.get("/", getCategories);

router.get("/:id", getCategory);

router.post(
  "/",
  [
    //validarJWT,
    //esAdminRole,
    upload.single("image"),
  ],
  createCategory
);

router.put(
  "/:id",
  [
    //validarJWT,
    //esAdminRole,
    //check("name", "El nombre es obligatorio").not().isEmpty(),
    check("id", "No es un un ID válido").isMongoId(),
    //check("id").custom(existsCategory),
    upload.single("image"),
    validateFields,
  ],
  updateCategory
);

router.delete(
  "/:id",
  [
    //  validarJWT,
    //  esAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsCategory),
    validateFields,
  ],
  deleteCategory
);

export default router;
