import request from "supertest";
import app from "../src/app";

// Helper para crear un usuario y loguearse obteniendo token
async function createUserAndLogin(email: string, password: string) {
  // Intentar login primero (por si el usuario ya existe)
  let loginResp = await request(app)
    .post("/api/login")
    .send({ email, password });

  if (loginResp.status !== 200) {
    // Crear usuario (POST /api/users no requiere token)
    await request(app).post("/api/users").send({
      name: "Test User",
      email,
      password,
    });
    // Reintentar login
    loginResp = await request(app).post("/api/login").send({ email, password });
  }

  expect(loginResp.status).toBe(200);
  expect(loginResp.body).toHaveProperty("token");
  return loginResp.body.token as string;
}

describe("Rutas de Usuario", () => {
  // Caso de prueba para crear un nuevo usuario
  it("Caso de prueba, crear un nuevo usuario", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        name: "Juan",
        email: `juan_${Date.now()}@example.com`,
        password: "123456",
      });
    // El controlador actual responde 200 al crear
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  // Caso de prueba para crear un usuario con datos incompletos
  it("Caso de prueba, crear usuario con datos incompletos", async () => {
    const response = await request(app).post("/api/users").send({
      name: "",
      email: "",
      // password faltante
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringContaining("requerido")
    );
  });

  // Caso de prueba para crear un usuario con email ya existente
  it("Caso de prueba, crear usuario con email ya existente", async () => {
    const email = `existente_${Date.now()}@example.com`;
    const password = "123456";

    // Crear el usuario inicialmente
    await request(app).post("/api/users").send({
      name: "Usuario Existente",
      email,
      password,
    });

    // Intentar crear el mismo usuario nuevamente
    const response = await request(app).post("/api/users").send({
      name: "Usuario Existente",
      email,
      password,
    });
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("code", "CONFLICT");
  });

  // Caso de prueba para obtener todos los usuarios
  it("Caso de prueba, obtener todos los usuarios", async () => {
    const email = `listar_${Date.now()}@example.com`;
    const password = "123456";
    const token = await createUserAndLogin(email, password);

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Caso de prueba para obtener un usuario por ID
  it("Caso de prueba, obtener un usuario por ID", async () => {
    const email = `maria_${Date.now()}@example.com`;
    const password = "123456";

    // Crear el usuario y recuperar su id
    const newUserResponse = await request(app).post("/api/users").send({
      name: "Maria",
      email,
      password,
    });
    expect(newUserResponse.status).toBe(200);
    const userId = newUserResponse.body.id;

    // Login para obtener token y poder consultar por ID
    const token = await createUserAndLogin(email, password);

    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", userId);
  });

  // Caso de prueba para obtener un usuario por ID inexistente
  it("Caso de prueba, obtener un usuario por ID inexistente", async () => {
    const email = `inexistente_${Date.now()}@example.com`;
    const password = "123456";

    // Login para obtener token
    const token = await createUserAndLogin(email, password);

    const response = await request(app)
      .get(`/api/users/999999`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Usuario no encontrado");
  });

  // Caso de prueba para actualizar un usuario
  it("Caso de prueba, actualizar un usuario", async () => {
    const email = `actualizar_${Date.now()}@example.com`;
    const password = "123456";

    // Crear el usuario y recuperar su id
    const newUserResponse = await request(app).post("/api/users").send({
      name: "Carlos",
      email,
      password,
    });
    expect(newUserResponse.status).toBe(200);
    const userId = newUserResponse.body.id;
    // Login para obtener token y poder actualizar
    const token = await createUserAndLogin(email, password);

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Carlos Actualizado" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "Carlos Actualizado");
  });

  // Caso de prueba para actualizar un usuario inexistente
  it("Caso de prueba, actualizar un usuario inexistente", async () => {
    const email = `noexiste_${Date.now()}@example.com`;
    const password = "123456";

    // Login para obtener token
    const token = await createUserAndLogin(email, password);

    const response = await request(app)
      .put(`/api/users/999999`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Usuario Inexistente" });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Registro no encontrado");
  });

  // Caso de prueba para eliminar un usuario
  it("Caso de prueba, eliminar un usuario", async () => {
    const email = `eliminar_${Date.now()}@example.com`;
    const password = "123456";
    // Crear el usuario y recuperar su id
    const newUserResponse = await request(app).post("/api/users").send({
      name: "Ana",
      email,
      password,
    });
    expect(newUserResponse.status).toBe(200);
    const userId = newUserResponse.body.id;
    // Login para obtener token y poder eliminar
    const token = await createUserAndLogin(email, password);

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  // Caso de prueba para eliminar un usuario inexistente
  it("Caso de prueba, eliminar un usuario inexistente", async () => {
    const email = `noeliminar_${Date.now()}@example.com`;
    const password = "123456";

    // Login para obtener token
    const token = await createUserAndLogin(email, password);

    const response = await request(app)
      .delete(`/api/users/999999`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Registro no encontrado");
  });

  // Caso de prueba para acceder a una ruta protegida sin token
  it("Caso de prueba, acceder a ruta protegida sin token", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error", "Token requerido");
  });

  // Caso de prueba para acceder a una ruta protegida con token inválido
  it("Caso de prueba, acceder a ruta protegida con token inválido", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer token_invalido`);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Token inválido o expirado");
  });

  // Caso de prueba para filtrar usuarios por nombre
  it("Caso de prueba, filtrar usuarios por nombre", async () => {
    const email = `filtro_${Date.now()}@example.com`;
    const password = "123456";
    const token = await createUserAndLogin(email, password);

    // Crear usuarios con nombres específicos
    await request(app)
      .post("/api/users")
      .send({
        name: "Ana María",
        email: `ana_${Date.now()}@example.com`,
        password,
      });
    await request(app)
      .post("/api/users")
      .send({
        name: "Mariano",
        email: `mariano_${Date.now()}@example.com`,
        password,
      });
    await request(app)
      .post("/api/users")
      .send({
        name: "Carlos",
        email: `carlos_${Date.now()}@example.com`,
        password,
      });

    const response = await request(app)
      .get("/api/users/filter/mar")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Debería retornar Ana María y Mariano
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    const nombres = response.body.map((u: any) => u.name);
    expect(nombres).toEqual(expect.arrayContaining(["Ana María", "Mariano"]));
  });

  // Caso de prueba para ordenar usuarios por nombre ascendente
  //   it("Caso de prueba, ordenar usuarios por nombre ascendente", async () => {
  //     const email = `ordenar_${Date.now()}@example.com`;
  //     const password = "123456";
  //     const token = await createUserAndLogin(email, password);

  //     // Prefijo único para identificar solo los creados en este test
  //     const prefix = `Sort_${Date.now()}_`;

  //     // Crear usuarios con nombres específicos y prefijo
  //     await request(app)
  //       .post("/api/users")
  //       .send({
  //         name: `${prefix}Ana`,
  //         email: `ana_${Date.now()}@example.com`,
  //         password,
  //       });
  //     await request(app)
  //       .post("/api/users")
  //       .send({
  //         name: `${prefix}Mariano`,
  //         email: `mariano_${Date.now()}@example.com`,
  //         password,
  //       });
  //     await request(app)
  //       .post("/api/users")
  //       .send({
  //         name: `${prefix}Carlos`,
  //         email: `carlos_${Date.now()}@example.com`,
  //         password,
  //       });

  //     const response = await request(app)
  //       .get(`/api/users/order?field=name&dir=asc`)
  //       .set("Authorization", `Bearer ${token}`);
  //     expect(response.status).toBe(200);
  //     expect(Array.isArray(response.body)).toBe(true);

  //     // Filtrar por los creados en este test y validar orden ascendente
  //     const nombresFiltrados = response.body
  //       .map((u: any) => u.name as string)
  //       .filter((n: string) => n.startsWith(prefix));
  //     expect(nombresFiltrados).toEqual([
  //       `${prefix}Ana`,
  //       `${prefix}Carlos`,
  //       `${prefix}Mariano`,
  //     ]);
  //   });

  // Caso de prueba para paginar usuarios
  //   it("Caso de prueba, paginar usuarios", async () => {
  //     const email = `paginacion_${Date.now()}@example.com`;
  //     const password = "123456";
  //     const token = await createUserAndLogin(email, password);

  //     // Crear usuarios adicionales para la paginación
  //     const baseTs = Date.now();
  //     for (let i = 1; i <= 15; i++) {
  //       await request(app)
  //         .post("/api/users")
  //         .send({
  //           name: `Usuario ${i}`,
  //           email: `usuario_${i}_${baseTs}@example.com`,
  //           password,
  //         });
  //     }

  //     const page = 1;
  //     const pageSize = 10;
  //     const response = await request(app)
  //       .get(`/api/users/page?page=${page}&pageSize=${pageSize}`)
  //       .set("Authorization", `Bearer ${token}`);
  //     expect(response.status).toBe(200);

  //     // Respuesta estructurada: { page, pageSize, total, totalPages, hasNext, hasPrev, data }
  //     expect(response.body).toHaveProperty("page", page);
  //     expect(response.body).toHaveProperty("pageSize", pageSize);
  //     expect(response.body).toHaveProperty("data");
  //     expect(Array.isArray(response.body.data)).toBe(true);
  //     expect(response.body.data.length).toBeLessThanOrEqual(pageSize);
  //   });
});
