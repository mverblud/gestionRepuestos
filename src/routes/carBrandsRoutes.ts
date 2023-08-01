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
import validateJWT from "../middlewares/validateJWT";
import isAdminRole from "../middlewares/isAdminRole";

const router = express.Router();

router.get("/", getCarBrands);
router.get("/:id", getCarBrand);

router.post(
  "/",
  [validateJWT, isAdminRole, upload.single("image")],
  createCarBrand
);

router.put(
  "/:id",
  [validateJWT, isAdminRole, upload.single("image")],
  updateCarBrand
);

router.delete(
  "/:id",
  [
    validateJWT,
    isAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsCarBrand),
    validateFields,
  ],
  deleteCarBrand
);

export default router;
