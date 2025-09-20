import express from "express";
import cors from "cors";
import path from "path";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./errors/httpErrors";
import { logger } from "./middlewares/logger";
import favoriteRoutes from "./routes/favoriteCity.routes";
import loginRoutes from "./routes/login.routes";
import userRoutes from "./routes/user.routes";
import weatherRoutes from "./routes/weather.routes";

const app = express();

app.use(express.json());
app.use(logger);

// CORS con Authorization y preflight
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

// Servir frontend estático (mismo origen http://localhost:3000)
const staticDir = path.resolve(__dirname, "../frontend");
app.use(express.static(staticDir));

// Accesos directos útiles
app.get(["/", "/my_favorite_cities"], (_req, res) =>
  res.sendFile(path.join(staticDir, "my_favorite_cities.html"))
);

app.use("/api", loginRoutes);
app.use("/api", userRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", weatherRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
