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

const router = Router();

router.get("/favorite-cities", getFavoriteCities);
router.get("/favorite-cities/user/:userId", getFavoriteCitiesByUser);
router.post("/favorite-city", createFavoriteCity);
router.put("/favorite-city/:id", updateFavoriteCity);
router.delete("/favorite-city/:id", deleteFavoriteCity);

// Consultas avanzadas
router.get("/favorite-cities/filter/:nombre", filter);
router.get("/favorite-cities/order", order);
router.get("/favorite-cities/page", pagination);

export default router;
