// src/app.js
// La app de Express se exporta por separado de server.js para poder
// probarla con supertest sin necesidad de abrir un puerto real.
const express = require("express");

const healthRouter = require("./routes/health");
const usersRouter = require("./routes/users");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    service: "ci-cd-pipeline-api",
    status: "upi",
    version: "1.5.0",
    endpoints: [
      "GET    /api/health",
      "GET    /api/users",
      "GET    /api/users/:id",
      "POST   /api/users",
      "PUT    /api/users/:id",
      "DELETE /api/users/:id",
    ],
  });
});

app.use("/api/health", healthRouter);
app.use("/api/users", usersRouter);

// 404 generico
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejador de errores generico
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
