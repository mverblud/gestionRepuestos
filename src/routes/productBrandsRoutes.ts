import express from "express";
import upload from "../config/uploadConfig";
import { check } from "express-validator";
import validateFields from "../middlewares/validateFields";
import {
  createProductBrand,
  deleteProductBrand,
  getProductBrand,
  getProductBrands,
  updateProductBrand,
} from "../controllers/productBrandsController";
import { existsProductBrand } from "../helpers/db-validators";
import validateJWT from "../middlewares/validateJWT";
import isAdminRole from "../middlewares/isAdminRole";

const router = express.Router();

router.get("/", getProductBrands);
router.get("/:id", getProductBrand);

router.post(
  "/",
  [validateJWT, isAdminRole, upload.single("image")],
  createProductBrand
);

router.put(
  "/:id",
  [validateJWT, isAdminRole, upload.single("image")],
  updateProductBrand
);

router.delete(
  "/:id",
  [
    validateJWT,
    isAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsProductBrand),
    validateFields,
  ],
  deleteProductBrand
);

export default router;
