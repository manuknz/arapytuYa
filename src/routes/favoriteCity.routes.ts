import { Router } from "express";
import {
  createFavoriteCity,
  deleteFavoriteCity,
  getFavoriteCities,
  getFavoriteCitiesByUser,
  updateFavoriteCity,
} from "../controllers/favoriteCity.controller";

const router = Router();

router.get("/favorite-cities", getFavoriteCities);
router.get("/favorite-cities/user/:userId", getFavoriteCitiesByUser);
router.post("/favorite-city", createFavoriteCity);
router.put("/favorite-city/:id", updateFavoriteCity);
router.delete("/favorite-city/:id", deleteFavoriteCity);

export default router;