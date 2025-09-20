import request from "supertest";
import app from "../src/app";

// Mockear el servicio para no llamar APIs externas
jest.mock("../src/services/weather.service", () => ({
  getWeatherFor: jest.fn(),
  getCoordinatesFor: jest.fn(),
}));

import { getWeatherFor } from "../src/services/weather.service";

// Helper para crear un usuario y obtener token
async function createUserAndLogin(email: string, password: string) {
  let loginResp = await request(app)
    .post("/api/login")
    .send({ email, password });

  if (loginResp.status !== 200) {
    await request(app).post("/api/users").send({
      name: "Test Weather",
      email,
      password,
    });
    loginResp = await request(app).post("/api/login").send({ email, password });
  }

  expect(loginResp.status).toBe(200);
  expect(loginResp.body).toHaveProperty("token");
  return loginResp.body.token as string;
}

const asMock = (fn: unknown) => fn as jest.Mock;

describe("Rutas de Clima", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Caso de prueba, debe requerir token", async () => {
    const resp = await request(app)
      .post("/api/clima")
      .send({ ciudad: "Asunción" });
    expect(resp.status).toBe(403);
    expect(resp.body).toHaveProperty("error", "Token requerido");
  });

  it("Caso de prueba, debe rechazar token inválido", async () => {
    const resp = await request(app)
      .post("/api/clima")
      .set("Authorization", "Bearer invalid")
      .send({ ciudad: "Asunción" });
    expect(resp.status).toBe(401);
    expect(resp.body).toHaveProperty("error", "Token inválido o expirado");
  });

  it("Caso de prueba, debe validar ciudad requerida", async () => {
    const token = await createUserAndLogin(
      `weather_${Date.now()}@example.com`,
      "123456"
    );

    const resp = await request(app)
      .post("/api/clima")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(resp.status).toBe(400);
    expect(resp.body).toHaveProperty("message", "La ciudad es requerida");
  });

  it("Caso de prueba, retorna 404 cuando la ubicación no es encontrada", async () => {
    const token = await createUserAndLogin(
      `weather_nf_${Date.now()}@example.com`,
      "123456"
    );

    asMock(getWeatherFor).mockResolvedValueOnce({
      found: false,
      message: "Ubicación no encontrada",
    });

    const resp = await request(app)
      .post("/api/clima")
      .set("Authorization", `Bearer ${token}`)
      .send({ ciudad: "CiudadInventada123" });

    expect(getWeatherFor).toHaveBeenCalledWith("CiudadInventada123");
    expect(resp.status).toBe(404);
    expect(resp.body).toHaveProperty("status", "error");
    expect(resp.body).toHaveProperty("message", "Ubicación no encontrada");
  });

  it("Caso de prueba, retorna 200 con datos de clima cuando found=true", async () => {
    const token = await createUserAndLogin(
      `weather_ok_${Date.now()}@example.com`,
      "123456"
    );

    const fakeWeather = {
      coord: { lon: -57.63, lat: -25.3 },
      weather: [
        { id: 800, main: "Clear", description: "cielo despejado", icon: "01d" },
      ],
      base: "stations",
      main: {
        temp: 29.5,
        feels_like: 31.0,
        temp_min: 28.0,
        temp_max: 31.0,
        pressure: 1012,
        humidity: 45,
      },
      visibility: 10000,
      wind: { speed: 3.6, deg: 140 },
      clouds: { all: 0 },
      dt: 1694880000,
      sys: { country: "PY", sunrise: 1694850000, sunset: 1694893200 },
      timezone: -14400,
      id: 3439389,
      name: "Asunción",
      cod: 200,
    };

    asMock(getWeatherFor).mockResolvedValueOnce({
      found: true,
      location: "Asunción, PY",
      weather: fakeWeather,
    });

    const resp = await request(app)
      .post("/api/clima")
      .set("Authorization", `Bearer ${token}`)
      .send({ ciudad: "Asunción" });

    expect(getWeatherFor).toHaveBeenCalledWith("Asunción");
    expect(resp.status).toBe(200);
    expect(resp.body).toHaveProperty("status", "success");
    expect(resp.body).toHaveProperty("data");
    expect(resp.body.data).toHaveProperty("found", true);
    expect(resp.body.data).toHaveProperty("location", "Asunción, PY");
    expect(resp.body.data).toHaveProperty("weather");
  });

  it("Caso de prueba, maneja errores del servicio con 500", async () => {
    const token = await createUserAndLogin(
      `weather_err_${Date.now()}@example.com`,
      "123456"
    );

    asMock(getWeatherFor).mockRejectedValueOnce(new Error("boom"));

    const resp = await request(app)
      .post("/api/clima")
      .set("Authorization", `Bearer ${token}`)
      .send({ ciudad: "Asunción" });

    expect(resp.status).toBe(500);
    expect(resp.body).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
  });
});
