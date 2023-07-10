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

const router = express.Router();

router.get("/", getProviders);
router.get("/:id", getProvider);

router.post(
  "/",
  [
    //validarJWT,
    //esAdminRole,
  ],
  createProvider
);

router.put(
  "/:id",
  [
    //validarJWT,
    //esAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsProvider),
    validateFields,
  ],
  updateProvider
);

router.delete(
  "/:id",
  [
    //  validarJWT,
    //  esAdminRole,
    check("id", "No es un un ID válido").isMongoId(),
    check("id").custom(existsProvider),
    validateFields,
  ],
  deleteProvider
);

export default router;
