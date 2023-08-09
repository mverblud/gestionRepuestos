import express from "express";
import {
  getAllUpdateInfo,
  getUpdateInfo,
  getUpdateInfoDetail,
} from "../controllers/updateInfoController";
import validateJWT from "../middlewares/validateJWT";
import isAdminRole from "../middlewares/isAdminRole";

const router = express.Router();

router.get("/", [validateJWT, isAdminRole], getAllUpdateInfo);
router.get("/:id", [validateJWT, isAdminRole], getUpdateInfo);
router.get("/detail/:id", [validateJWT, isAdminRole], getUpdateInfoDetail);

export default router;
