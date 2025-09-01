import express from "express";
import userRoutes from "./routes/user.routes";
import favoriteRoutes from "./routes/favoriteCity.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./errors/httpErrors";
import { logger } from "./middlewares/logger";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(logger);
app.use("/api", userRoutes);
app.use("/api", favoriteRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
