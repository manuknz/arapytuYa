import request from "supertest";
import app from "../src/app";

// Helper para crear un usuario y loguearse obteniendo token y userId
async function createUserAndLogin(email: string, password: string) {
  let loginResp = await request(app)
    .post("/api/login")
    .send({ email, password });

  if (loginResp.status !== 200) {
    await request(app).post("/api/users").send({
      name: "FavCity Tester",
      email,
      password,
    });
    loginResp = await request(app).post("/api/login").send({ email, password });
  }

  expect(loginResp.status).toBe(200);
  expect(loginResp.body).toHaveProperty("token");
  expect(loginResp.body).toHaveProperty("userId");
  return {
    token: loginResp.body.token as string,
    userId: loginResp.body.userId as number,
  };
}

describe("Rutas de FavoriteCity", () => {
  it("Caso de prueba, debe requerir token", async () => {
    const resp = await request(app).get("/api/favorite-cities");
    expect(resp.status).toBe(403);
    expect(resp.body).toHaveProperty("error", "Token requerido");
  });

  it("Caso de prueba, debe rechazar token inválido", async () => {
    const resp = await request(app)
      .get("/api/favorite-cities")
      .set("Authorization", "Bearer invalido");
    expect(resp.status).toBe(401);
    expect(resp.body).toHaveProperty("error", "Token inválido o expirado");
  });

  it("Caso de prueba, crear una ciudad favorita para el usuario autenticado", async () => {
    const { token, userId } = await createUserAndLogin(
      `fav_${Date.now()}@example.com`,
      "123456"
    );

    const cityName = `Asuncion_${Date.now()}`;
    const response = await request(app)
      .post("/api/favorite-city")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: cityName,
        countryCode: "PY",
        lat: -25.3,
        lon: -57.63,
        notes: "Capital",
        userId,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", cityName);
    expect(response.body).toHaveProperty("userId", userId);
  });

  it("Caso de prueba, listar ciudades favoritas por usuario", async () => {
    const { token, userId } = await createUserAndLogin(
      `fav_list_${Date.now()}@example.com`,
      "123456"
    );

    // Crear dos ciudades para este usuario
    const baseTs = Date.now();
    const payloads = [
      {
        name: `CiudadA_${baseTs}`,
        countryCode: "PY",
        lat: -25.3,
        lon: -57.63,
        notes: "A",
        userId,
      },
      {
        name: `CiudadB_${baseTs}`,
        countryCode: "AR",
        lat: -34.6,
        lon: -58.38,
        notes: "B",
        userId,
      },
    ];
    for (const data of payloads) {
      const r = await request(app)
        .post("/api/favorite-city")
        .set("Authorization", `Bearer ${token}`)
        .send(data);
      expect(r.status).toBe(200);
    }

    const resp = await request(app)
      .get(`/api/favorite-cities/user/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(resp.status).toBe(200);
    expect(Array.isArray(resp.body)).toBe(true);
    // Todas las ciudades retornadas son del mismo usuario
    for (const c of resp.body) {
      expect(c.userId).toBe(userId);
    }
  });

  it("Caso de prueba, actualizar una ciudad favorita existente", async () => {
    const { token, userId } = await createUserAndLogin(
      `fav_up_${Date.now()}@example.com`,
      "123456"
    );
    const createResp = await request(app)
      .post("/api/favorite-city")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: `MiCiudad_${Date.now()}`, countryCode: "PY", userId });
    expect(createResp.status).toBe(200);
    const id = createResp.body.id as number;

    const newNotes = "Actualizado";
    const updateResp = await request(app)
      .put(`/api/favorite-city/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ notes: newNotes });
    expect(updateResp.status).toBe(200);
    expect(updateResp.body).toHaveProperty("notes", newNotes);
    expect(updateResp.body).toHaveProperty("userId", userId);
  });

  it("Caso de prueba, actualizar ciudad favorita inexistente", async () => {
    const { token } = await createUserAndLogin(
      `fav_up_nf_${Date.now()}@example.com`,
      "123456"
    );
    const resp = await request(app)
      .put(`/api/favorite-city/999999`)
      .set("Authorization", `Bearer ${token}`)
      .send({ notes: "No existe" });
    expect(resp.status).toBe(404);
    expect(resp.body).toHaveProperty("message", "Registro no encontrado");
  });

  it("Caso de prueba, eliminar una ciudad favorita existente", async () => {
    const { token, userId } = await createUserAndLogin(
      `fav_del_${Date.now()}@example.com`,
      "123456"
    );
    const createResp = await request(app)
      .post("/api/favorite-city")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: `Borrar_${Date.now()}`, countryCode: "PY", userId });
    expect(createResp.status).toBe(200);
    const id = createResp.body.id as number;

    const delResp = await request(app)
      .delete(`/api/favorite-city/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delResp.status).toBe(200);
    expect(delResp.body).toHaveProperty(
      "message",
      "Ciudad favorita eliminada correctamente"
    );
  });

  it("Caso de prueba, eliminar ciudad favorita inexistente", async () => {
    const { token } = await createUserAndLogin(
      `fav_del_nf_${Date.now()}@example.com`,
      "123456"
    );
    const resp = await request(app)
      .delete(`/api/favorite-city/999999`)
      .set("Authorization", `Bearer ${token}`);
    expect(resp.status).toBe(404);
    expect(resp.body).toHaveProperty("message", "Registro no encontrado");
  });

  it("Caso de prueba, filtrar ciudades favoritas por nombre (case-insensitive)", async () => {
    const { token, userId } = await createUserAndLogin(
      `fav_filter_${Date.now()}@example.com`,
      "123456"
    );
    const ts = Date.now();
    const toCreate = [
      { name: `Mar Azul ${ts}`, countryCode: "PY", userId },
      { name: `Mar Rojo ${ts}`, countryCode: "PY", userId },
      { name: `Montaña ${ts}`, countryCode: "PY", userId },
    ];
    for (const data of toCreate) {
      const r = await request(app)
        .post("/api/favorite-city")
        .set("Authorization", `Bearer ${token}`)
        .send(data);
      expect(r.status).toBe(200);
    }

    const resp = await request(app)
      .get(`/api/favorite-cities/filter/Mar`)
      .set("Authorization", `Bearer ${token}`);
    expect(resp.status).toBe(200);
    expect(Array.isArray(resp.body)).toBe(true);
    const names = resp.body.map((c: any) => c.name as string);
    // Debe contener al menos los dos que empiezan con "Mar"
    expect(names.some((n: string) => n.includes(`Mar Azul ${ts}`))).toBe(true);
    expect(names.some((n: string) => n.includes(`Mar Rojo ${ts}`))).toBe(true);
  });

  it("Caso de prueba, ordenar ciudades favoritas por nombre asc", async () => {
    const { token, userId } = await createUserAndLogin(
      `fav_order_${Date.now()}@example.com`,
      "123456"
    );
    const prefix = `Sort_${Date.now()}_`;
    const names = ["Ana", "Carlos", "Mariano"]; // orden esperado asc: Ana, Carlos, Mariano
    for (const n of names) {
      const r = await request(app)
        .post("/api/favorite-city")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: `${prefix}${n}`, countryCode: "PY", userId });
      expect(r.status).toBe(200);
    }

    const resp = await request(app)
      .get(`/api/favorite-cities/order?field=name&dir=asc`)
      .set("Authorization", `Bearer ${token}`);
    expect(resp.status).toBe(200);
    expect(Array.isArray(resp.body)).toBe(true);

    const filtered = (resp.body as any[])
      .map((c: any) => c.name as string)
      .filter((n: string) => n.startsWith(prefix));
    expect(filtered).toEqual([
      `${prefix}Ana`,
      `${prefix}Carlos`,
      `${prefix}Mariano`,
    ]);
  });

  it("Caso de prueba, paginar ciudades favoritas (estructura y tamaño)", async () => {
    const { token, userId } = await createUserAndLogin(
      `fav_page_${Date.now()}@example.com`,
      "123456"
    );
    // Crear varias ciudades para asegurar data suficiente
    const baseTs = Date.now();
    for (let i = 1; i <= 5; i++) {
      const r = await request(app)
        .post("/api/favorite-city")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: `Page_${baseTs}_${i}`, countryCode: "PY", userId });
      expect(r.status).toBe(200);
    }

    const page = 1;
    const pageSize = 2;
    const resp = await request(app)
      .get(`/api/favorite-cities/page?page=${page}&pageSize=${pageSize}`)
      .set("Authorization", `Bearer ${token}`);
    expect(resp.status).toBe(200);
    expect(resp.body).toHaveProperty("page", page);
    expect(resp.body).toHaveProperty("pageSize", pageSize);
    expect(resp.body).toHaveProperty("data");
    expect(Array.isArray(resp.body.data)).toBe(true);
    expect(resp.body.data.length).toBeLessThanOrEqual(pageSize);
  });

  it("Caso de prueba, crear ciudad favorita con datos incompletos", async () => {
    const { token } = await createUserAndLogin(
      `fav_bad_${Date.now()}@example.com`,
      "123456"
    );

    // Falta 'name' y 'userId'
    const resp = await request(app)
      .post("/api/favorite-city")
      .set("Authorization", `Bearer ${token}`)
      .send({ countryCode: "PY" });

    // El errorHandler mapea PrismaClientValidationError a 400
    expect(resp.status).toBe(400);
    expect(resp.body).toHaveProperty("code", "BAD_REQUEST");
  });
});
