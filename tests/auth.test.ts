import request from "supertest";
import app from "../src/app";

describe("Rutas de Auth", () => {
  // prueba exitosa para un login correcto
  it("Login correcto retorna token", async () => {
    const resp = await request(app).post("/api/login").send({
      email: "fernandolopez@cds.com.py",
      password: "lopez123",
    });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty("token");
  });

  // prueba existosa para un login incorrecto
  it("Login incorrecto retorna 401", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@example.com",
      password: "wrongpass",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});
