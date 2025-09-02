import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./errors/httpErrors";
import { logger } from "./middlewares/logger";
import favoriteRoutes from "./routes/favoriteCity.routes";
import loginRoutes from "./routes/login.routes";
import userRoutes from "./routes/user.routes";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(logger);
app.use(cors());
app.use("/api", loginRoutes);
app.use("/api", userRoutes);
app.use("/api", favoriteRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
