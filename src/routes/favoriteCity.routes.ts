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

router.get("/favorite-cities", getFavoriteCities, verifyToken);
router.get(
  "/favorite-cities/user/:userId",
  getFavoriteCitiesByUser,
  verifyToken
);
router.post("/favorite-city", createFavoriteCity, verifyToken);
router.put("/favorite-city/:id", updateFavoriteCity, verifyToken);
router.delete("/favorite-city/:id", deleteFavoriteCity, verifyToken);

// Consultas avanzadas
router.get("/favorite-cities/filter/:nombre", filter, verifyToken);
router.get("/favorite-cities/order", order, verifyToken);
router.get("/favorite-cities/page", pagination, verifyToken);

export default router;
