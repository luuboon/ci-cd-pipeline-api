const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
  it("responde 200 con status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
  });
});

describe("GET / (raiz)", () => {
  it("responde 200 con informacion del servicio", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.service).toBe("ci-cd-pipeline-api");
  });
});

describe("Ruta inexistente", () => {
  it("responde 404", async () => {
    const res = await request(app).get("/no/existe");
    expect(res.statusCode).toBe(404);
  });
});
