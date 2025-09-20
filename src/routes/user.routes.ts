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

// Listado básico
router.get("/users", verifyToken, getUsers);

// Consultas avanzadas (deben ir antes de rutas dinámicas :id)
router.get("/users/filter/:nombre", verifyToken, filterUser);
router.get("/users/order", verifyToken, ordenUser);
router.get("/users/page", verifyToken, paginacionUser);

// CRUD
router.post("/users", createUser);

// Restringimos :id a numérico para evitar capturar /users/order, etc.
router.get("/users/:id", verifyToken, getUserById);
router.put("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, deleteUser);

export default router;
