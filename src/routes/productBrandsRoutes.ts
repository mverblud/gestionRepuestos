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

const router = express.Router();

router.get("/", getProductBrands);
router.get("/:id", getProductBrand);

router.post(
  "/",
  [
    //validarJWT,
    //esAdminRole,
    upload.single("image"),
  ],
  createProductBrand
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
  updateProductBrand
);

router.delete(
  "/:id",
  [
    //  validarJWT,
    //  esAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsProductBrand),
    validateFields,
  ],
  deleteProductBrand
);

export default router;
