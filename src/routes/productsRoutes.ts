import express from "express";
import validateFields from "../middlewares/validateFields";
import { check } from "express-validator";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/productsController";
import upload from "../config/uploadConfig";
import { existsProduct } from "../helpers/db-validators";
import validateJWT from "../middlewares/validateJWT";
import isAdminRole from "../middlewares/isAdminRole";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post(
  "/",
  [validateJWT, isAdminRole, upload.single("image")],
  createProduct
);

router.put(
  "/:id",
  [validateJWT, isAdminRole, upload.single("image")],
  updateProduct
);

router.delete(
  "/:id",
  [
    validateJWT,
    isAdminRole,
    check("id", "The id is invalid").isMongoId(),
    check("id").custom(existsProduct),
    validateFields,
  ],
  deleteProduct
);

export default router;
