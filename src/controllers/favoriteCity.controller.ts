import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getFavoriteCities = async (req: Request, res: Response) => {
  const favoriteCities = await prisma.favoriteCity.findMany({
    include: { user: true }
  });
  res.json(favoriteCities);
};

export const getFavoriteCitiesByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const favoriteCities = await prisma.favoriteCity.findMany({
      where: { userId: Number(userId) },
      include: { user: true }
    });
    res.json(favoriteCities);
  } catch (error) {
    next(error);
  }
};

export const createFavoriteCity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, countryCode, lat, lon, notes, userId } = req.body;
    const favoriteCity = await prisma.favoriteCity.create({
      data: { name, countryCode, lat, lon, notes, userId },
      include: { user: true }
    });
    res.json(favoriteCity);
  } catch (error) {
    next(error);
  }
};

export const updateFavoriteCity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, countryCode, lat, lon, notes } = req.body;
    const favoriteCity = await prisma.favoriteCity.update({
      where: { id: Number(id) },
      data: { name, countryCode, lat, lon, notes },
      include: { user: true }
    });
    res.json(favoriteCity);
  } catch (error) {
    next(error);
  }
};

export const deleteFavoriteCity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.favoriteCity.delete({ where: { id: Number(id) } });
    res.json({ message: "Ciudad favorita eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};