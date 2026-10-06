const request = require("supertest");
const app = require("../src/app");
const Users = require("../src/models/users");

beforeEach(() => {
  Users.reset();
});

describe("GET /api/users", () => {
  it("responde 200 con lista vacia al inicio", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("responde 200 con los usuarios creados", async () => {
    await request(app).post("/api/users").send({ name: "Ana", email: "ana@test.com" });
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

describe("POST /api/users", () => {
  it("crea un usuario valido (201)", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Beto", email: "beto@test.com" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toMatchObject({ name: "Beto", email: "beto@test.com" });
    expect(res.body.data.id).toBeDefined();
  });

  it("rechaza sin name (400)", async () => {
    const res = await request(app).post("/api/users").send({ email: "sin-nombre@test.com" });
    expect(res.statusCode).toBe(400);
  });

  it("rechaza email invalido (400)", async () => {
    const res = await request(app).post("/api/users").send({ name: "Carla", email: "no-es-email" });
    expect(res.statusCode).toBe(400);
  });

  it("rechaza email duplicado (409)", async () => {
    await request(app).post("/api/users").send({ name: "Dario", email: "dup@test.com" });
    const res = await request(app).post("/api/users").send({ name: "Dario 2", email: "dup@test.com" });
    expect(res.statusCode).toBe(409);
  });
});

describe("GET /api/users/:id", () => {
  it("responde 200 con el usuario existente", async () => {
    const created = await request(app).post("/api/users").send({ name: "Eva", email: "eva@test.com" });
    const res = await request(app).get(`/api/users/${created.body.data.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Eva");
  });

  it("responde 404 si no existe", async () => {
    const res = await request(app).get("/api/users/9999");
    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/users/:id", () => {
  it("actualiza un usuario existente (200)", async () => {
    const created = await request(app).post("/api/users").send({ name: "Fer", email: "fer@test.com" });
    const res = await request(app)
      .put(`/api/users/${created.body.data.id}`)
      .send({ name: "Fernanda" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Fernanda");
  });

  it("responde 404 si no existe", async () => {
    const res = await request(app).put("/api/users/9999").send({ name: "X" });
    expect(res.statusCode).toBe(404);
  });

  it("rechaza email invalido al actualizar (400)", async () => {
    const created = await request(app).post("/api/users").send({ name: "Gus", email: "gus@test.com" });
    const res = await request(app)
      .put(`/api/users/${created.body.data.id}`)
      .send({ email: "invalido" });
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /api/users/:id", () => {
  it("elimina un usuario existente (204)", async () => {
    const created = await request(app).post("/api/users").send({ name: "Hugo", email: "hugo@test.com" });
    const res = await request(app).delete(`/api/users/${created.body.data.id}`);
    expect(res.statusCode).toBe(204);

    const check = await request(app).get(`/api/users/${created.body.data.id}`);
    expect(check.statusCode).toBe(404);
  });

  it("responde 404 si no existe", async () => {
    const res = await request(app).delete("/api/users/9999");
    expect(res.statusCode).toBe(404);
  });
});
