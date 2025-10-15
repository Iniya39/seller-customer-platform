import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";

const router = express.Router();

// Register new user
router.post("/", registerUser);       // POST /api/users

// Login user
router.post("/login", loginUser);     // POST /api/users/login

export default router;
