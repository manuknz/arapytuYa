export type ErrorDetails = Record<string, any> | undefined;

export class CustomHttpError extends Error {
  public status: number;
  public code: string;
  public details?: ErrorDetails;
  public expose: boolean;

  constructor(
    status: number,
    message: string,
    options?: { code?: string; details?: ErrorDetails; expose?: boolean }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = options?.code ?? httpStatusToCode(status);
    this.details = options?.details;
    this.expose = options?.expose ?? status < 500;
    // Maintains proper stack trace (only on V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends CustomHttpError {
  constructor(message = "Solicitud inválida", details?: ErrorDetails) {
    super(400, message, { details });
  }
}

export class UnauthorizedError extends CustomHttpError {
  constructor(message = "No autorizado", details?: ErrorDetails) {
    super(401, message, { details });
  }
}

export class ForbiddenError extends CustomHttpError {
  constructor(message = "Prohibido", details?: ErrorDetails) {
    super(403, message, { details });
  }
}

export class NotFoundError extends CustomHttpError {
  constructor(message = "Recurso no encontrado", details?: ErrorDetails) {
    super(404, message, { details });
  }
}

export class ConflictError extends CustomHttpError {
  constructor(message = "Conflicto", details?: ErrorDetails) {
    super(409, message, { details });
  }
}

export class UnprocessableEntityError extends CustomHttpError {
  constructor(message = "Entidad no procesable", details?: ErrorDetails) {
    super(422, message, { details });
  }
}

export class TooManyRequestsError extends CustomHttpError {
  constructor(message = "Demasiadas solicitudes", details?: ErrorDetails) {
    super(429, message, { details });
  }
}

export class InternalServerError extends CustomHttpError {
  constructor(message = "Error interno del servidor", details?: ErrorDetails) {
    super(500, message, { details, expose: false });
  }
}

export function httpStatusToCode(status: number): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "UNPROCESSABLE_ENTITY";
    case 429:
      return "TOO_MANY_REQUESTS";
    case 500:
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

export function notFoundHandler(_req: any, _res: any, next: any) {
  next(new NotFoundError());
}
