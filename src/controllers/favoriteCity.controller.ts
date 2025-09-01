import { Request, Response, NextFunction } from "express";
import { FavoriteCity, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getFavoriteCities = async (req: Request, res: Response) => {
  const favoriteCities = await prisma.favoriteCity.findMany({
    include: { user: true },
  });
  res.json(favoriteCities);
};

export const getFavoriteCitiesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const favoriteCities = await prisma.favoriteCity.findMany({
      where: { userId: Number(userId) },
      include: { user: true },
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
      include: { user: true },
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
      include: { user: true },
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

// Consultas avanzadas
// Filter
export const filter = async (req: Request, res: Response) => {
  const { nombre } = req.params;
  const listadoUser = await prisma.favoriteCity.findMany({
    where: {
      name: {
        contains: nombre,
        mode: "insensitive",
      },
    },
  });
  res.json(listadoUser);
};

// OrderBy
export const order = async (req: Request, res: Response) => {
  // Permitir elegir campo y dirección desde query params con validación básica
  const allowedFields = new Set<keyof FavoriteCity>([
    "id",
    "name",
    "countryCode",
    "lat",
    "lon",
    "notes",
    "userId",
    "createdAt",
    "updatedAt",
  ]);

  const fieldRaw = String(req.query.field ?? "name");
  const dirRaw = String(req.query.dir ?? "desc").toLowerCase();

  const field = allowedFields.has(fieldRaw as any)
    ? (fieldRaw as keyof FavoriteCity)
    : "name";
  const direction: "asc" | "desc" = dirRaw === "asc" ? "asc" : "desc";

  const orderBy: any = { [field]: direction };

  const listadoUserOrdenado = await prisma.favoriteCity.findMany({
    orderBy,
  });
  res.json(listadoUserOrdenado);
};

// List paginations
export const pagination = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let page = parseInt(String(req.query.page), 10);
    let pageSize = parseInt(String(req.query.pageSize), 10);

    if (!Number.isFinite(page) || page < 1) page = 1;
    if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;

    const skip = (page - 1) * pageSize;

    // Use a stable ordering for consistent pagination
    const [total, favoriteCities] = await prisma.$transaction([
      prisma.favoriteCity.count(),
      prisma.favoriteCity.findMany({
        skip,
        take: pageSize,
        orderBy: { id: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    res.json({
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      data: favoriteCities,
    });
  } catch (error) {
    next(error);
  }
};
