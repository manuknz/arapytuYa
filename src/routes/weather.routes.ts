import { Router } from "express";
import { obtenerClima } from "../controllers/weather.controller";
import { verifyToken } from "../middlewares/auth";

const route = Router();

route.post("/clima", verifyToken, obtenerClima);

export default route;
