import { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BadRequestError } from "../errors/httpErrors";

const prisma = new PrismaClient();

// CRUD Básico

// Listar Users
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({ where: { isActive: true } });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Obtener user por ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const numId = Number(id);
    if (!Number.isFinite(numId) || numId <= 0) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const user = await prisma.user.findUnique({ where: { id: numId } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

// Crear user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body ?? {};

    // Validación de campos requeridos
    const missing: string[] = [];
    if (!name || String(name).trim() === "") missing.push("name");
    if (!email || String(email).trim() === "") missing.push("email");
    if (!password || String(password).trim() === "") missing.push("password");
    if (missing.length > 0) {
      const msg =
        missing.length === 1
          ? `El campo '${missing[0]}' es requerido`
          : `Los campos siguientes son requeridos: ${missing.join(", ")}`;
      throw new BadRequestError(msg);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Actualizar user
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, email, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email, isActive },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Eliminar user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
    res.json({ message: "Usuario marcado como inactivo", user });
  } catch (error) {
    next(error);
  }
};

// Consultas avanzadas
// Filter
export const filterUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nombre } = req.params;
    const listadoUser = await prisma.user.findMany({
      where: {
        isActive: true,
        name: {
          contains: nombre,
          mode: "insensitive",
        },
      },
    });
    res.json(listadoUser);
  } catch (error) {
    next(error);
  }
};

// OrderBy
export const ordenUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const listadoUserOrdenado = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: getOrderBy(req),
    });
    res.json(listadoUserOrdenado);
  } catch (error) {
    next(error);
  }
};

// List paginations
export const paginacionUser = async (
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
    const where = { isActive: true } as const;
    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: getOrderBy(req),
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
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

function getOrderBy(req: Request): any {
  const allowedFields = new Set<keyof User>([
    "id",
    "email",
    "name",
    "isActive",
    "createdAt",
    "updatedAt",
  ]);

  const fieldRaw = String(req.query.field ?? "name");
  const dirRaw = String(req.query.dir ?? "desc").toLowerCase();

  const field = allowedFields.has(fieldRaw as any)
    ? (fieldRaw as keyof User)
    : "name";
  const direction: "asc" | "desc" = dirRaw === "asc" ? "asc" : "desc";

  return { [field]: direction };
}
