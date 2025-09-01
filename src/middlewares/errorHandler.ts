import { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  CustomHttpError,
  InternalServerError,
  NotFoundError,
  UnprocessableEntityError,
} from "../errors/httpErrors";

type AnyError = any;

// Map common ORM/body-parser errors to typed HttpErrors
function normalizeError(err: AnyError): CustomHttpError {
  // Already an HttpError
  if (err instanceof CustomHttpError) return err;

  // Prisma initialization / connectivity errors -> 503
  if (
    err?.name === "PrismaClientInitializationError" ||
    (typeof err?.message === "string" &&
      err.message.includes("Can't reach database server"))
  ) {
    let details: Record<string, any> | undefined;
    try {
      const urlStr = process.env.DATABASE_URL;
      if (urlStr) {
        const u = new URL(urlStr);
        details = {
          host: u.hostname,
          port: u.port,
          database: u.pathname.replace(/^\//, ""),
        };
      }
    } catch {}
    return new CustomHttpError(503, "Base de datos no disponible", {
      code: "SERVICE_UNAVAILABLE",
      details: {
        reason: "No se puede conectar al servidor de base de datos",
        ...(details ?? {}),
      },
      expose: false,
    });
  }

  // Prisma validation errors -> 400
  if (err?.name === "PrismaClientValidationError") {
    return new BadRequestError("Validación de consulta inválida", {
      message: err?.message,
    });
  }

  // Prisma unknown/panic -> 500
  if (
    err?.name === "PrismaClientUnknownRequestError" ||
    err?.name === "PrismaClientRustPanicError"
  ) {
    return new InternalServerError("Error en el cliente de base de datos");
  }

  // Body parser JSON error
  if (err?.type === "entity.parse.failed") {
    return new BadRequestError("JSON inválido", { body: err.body });
  }

  // Prisma errors — use code prefixes
  const code = err?.code as string | undefined;
  if (code) {
    // Unique constraint violation
    if (code.startsWith("P2002")) {
      return new ConflictError("Valor duplicado", {
        target: err?.meta?.target,
      });
    }
    // Record not found
    if (code.startsWith("P2025")) {
      return new NotFoundError("Registro no encontrado", { cause: err?.meta });
    }
    // Foreign key fail or invalid input
    if (code.startsWith("P2003") || code.startsWith("P2001")) {
      return new UnprocessableEntityError("Dato de referencia inválido", {
        cause: err?.meta,
      });
    }
    // Database unreachable/timeouts (sometimes surfaced with P100x)
    if (code.startsWith("P1001") || code.startsWith("P1002")) {
      return new CustomHttpError(503, "Base de datos no disponible");
    }
    // error -> 400
    if (code.startsWith("P20")) {
      return new BadRequestError("Error en la solicitud", {
        code,
        meta: err?.meta,
      });
    }
  }

  // Validation errors
  if (err?.name === "ValidationError") {
    return new UnprocessableEntityError("Validación fallida", {
      issues: err.errors ?? err.details ?? err?.issues,
    });
  }

  // Default to 500
  return new InternalServerError(err?.message ?? "Error interno del servidor");
}

export const errorHandler = (
  err: AnyError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isProd = process.env.NODE_ENV === "production";
  const normalized = normalizeError(err);

  // Log detailed error on server
  if (!isProd) {
    // prettier-ignore
    console.error("[Error]", {
      name: err?.name,
      message: err?.message,
      code: (err as any)?.code,
      stack: err?.stack,
    });
  }

  const status = normalized.status ?? 500;
  const payload: any = {
    status,
    code: normalized.code,
    message:
      normalized.expose || !isProd
        ? normalized.message
        : "Error interno del servidor",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  if (!isProd && normalized.details) {
    payload.details = normalized.details;
  }

  res.status(status).json(payload);
};
