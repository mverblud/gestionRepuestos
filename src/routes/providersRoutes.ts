import express from "express";
import validateFields from "../middlewares/validateFields";
import { check } from "express-validator";
import {
  createProvider,
  deleteProvider,
  getProvider,
  getProviders,
  updateProvider,
} from "../controllers/providerController";
import { existsProvider } from "../helpers/db-validators";
import validateJWT from "../middlewares/validateJWT";
import isAdminRole from "../middlewares/isAdminRole";

const router = express.Router();

router.get("/", getProviders);
router.get("/:id", getProvider);

router.post("/", [validateJWT, isAdminRole], createProvider);

router.put(
  "/:id",
  [
    validateJWT,
    isAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsProvider),
    validateFields,
  ],
  updateProvider
);

router.delete(
  "/:id",
  [
    validateJWT,
    isAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsProvider),
    validateFields,
  ],
  deleteProvider
);

export default router;
