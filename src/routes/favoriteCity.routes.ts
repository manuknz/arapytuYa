import { Router } from "express";
import {
  createFavoriteCity,
  deleteFavoriteCity,
  filter,
  getFavoriteCities,
  getFavoriteCitiesByUser,
  order,
  pagination,
  updateFavoriteCity,
} from "../controllers/favoriteCity.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get("/favorite-cities", verifyToken, getFavoriteCities);
router.get(
  "/favorite-cities/user/:userId",
  verifyToken,
  getFavoriteCitiesByUser
);
router.post("/favorite-city", verifyToken, createFavoriteCity);
router.put("/favorite-city/:id", verifyToken, updateFavoriteCity);
router.delete("/favorite-city/:id", verifyToken, deleteFavoriteCity);

// Consultas avanzadas
router.get("/favorite-cities/filter/:nombre", verifyToken, filter);
router.get("/favorite-cities/order", verifyToken, order);
router.get("/favorite-cities/page", verifyToken, pagination);

export default router;
