import express from "express";
import { confirmUser, login, register } from "../controllers/authController";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/confirm/:token", confirmUser);

export default router;
