import { Router } from "express";
import {
  createUser,
  deleteUser,
  filterUser,
  getUsers,
  ordenUser,
  paginacionUser,
  updateUser,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get("/users", getUsers, verifyToken);
router.post("/users", createUser, verifyToken);
router.put("/users/:id", updateUser, verifyToken);
router.delete("/users/:id", deleteUser, verifyToken);

// Consultas avanzadas
router.get("/users/filter/:nombre", filterUser, verifyToken);
router.get("/users/order", ordenUser, verifyToken);
router.get("/users/page", paginacionUser, verifyToken);

export default router;
