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

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);

router.delete(
  "/:id",
  [
    check("id", "The id is invalid").isMongoId(),
    check("id").custom(existsProduct),
    validateFields,
  ],
  deleteProduct
);

export default router;
