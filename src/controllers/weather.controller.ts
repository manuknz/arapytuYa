import { Request, Response, NextFunction } from "express";
import { getCoordinatesFor, getWeatherFor } from "../services/weather.service";

export const obtenerClima = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { ciudad } = req.body ?? {};

  if (!ciudad) {
    return res
      .status(400)
      .json({ status: "error", message: "La ciudad es requerida" });
  }

  try {
    const resultado = await getWeatherFor(ciudad);

    if (!resultado.found) {
      return res
        .status(404)
        .json({ status: "error", message: resultado.message });
    }

    return res.status(200).json({ status: "success", data: resultado });
  } catch (error) {
    next(error);
  }
};

export const obtenerCoordenadas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { ciudad } = req.body ?? {};

  if (!ciudad) {
    return res
      .status(400)
      .json({ status: "error", message: "La ciudad es requerida" });
  }

  try {
    const resultado = await getCoordinatesFor(ciudad);

    if (!resultado.found) {
      return res
        .status(404)
        .json({ status: "error", message: resultado.message });
    }

    return res.status(200).json({ status: "success", data: resultado });
  } catch (error) {
    next(error);
  }
};
