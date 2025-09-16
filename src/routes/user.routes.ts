import { Router } from "express";
import {
  createUser,
  deleteUser,
  filterUser,
  getUserById,
  getUsers,
  ordenUser,
  paginacionUser,
  updateUser,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get("/users", verifyToken, getUsers);
router.get("/users/:id", verifyToken, getUserById);
router.post("/users", createUser);
router.put("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, deleteUser);

// Consultas avanzadas
router.get("/users/filter/:nombre", verifyToken, filterUser);
router.get("/users/order", verifyToken, ordenUser);
router.get("/users/page", verifyToken, paginacionUser);

export default router;
