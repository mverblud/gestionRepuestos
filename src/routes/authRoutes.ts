import express from "express";
import { confirmUser, login, register } from "../controllers/authController";

const router = express.Router();

router.get("/login", login);
router.post("/register", register);
router.post("/confirm/:token", confirmUser);

export default router;
