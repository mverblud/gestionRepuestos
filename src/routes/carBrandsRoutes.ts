import express from "express";
import {
  createCarBrand,
  deleteCarBrand,
  getCarBrand,
  getCarBrands,
  updateCarBrand,
} from "../controllers/carBrandController";
import upload from "../config/uploadConfig";
import { check } from "express-validator";
import validateFields from "../middlewares/validateFields";
import { existsCarBrand } from "../helpers/db-validators";

const router = express.Router();

router.get("/", getCarBrands);
router.get("/:id", getCarBrand);

router.post(
  "/",
  [
    //validarJWT,
    //esAdminRole,
    upload.single("image"),
  ],
  createCarBrand
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
  updateCarBrand
);

router.delete(
  "/:id",
  [
    //  validarJWT,
    //  esAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsCarBrand),
    validateFields,
  ],
  deleteCarBrand
);

export default router;
