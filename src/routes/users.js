// src/routes/users.js
const express = require("express");
const Users = require("../models/users");

const router = express.Router();

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET /api/users - lista todos los usuarios
router.get("/", (req, res) => {
  res.status(200).json({ data: Users.findAll() });
});

// GET /api/users/:id - obtiene un usuario por id
router.get("/:id", (req, res) => {
  const user = Users.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.status(200).json({ data: user });
});

// POST /api/users - crea un usuario { name, email }
router.post("/", (req, res) => {
  const { name, email } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "'name' es requerido y debe ser texto" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "'email' es requerido y debe ser valido" });
  }
  if (Users.findByEmail(email)) {
    return res.status(409).json({ error: "Ya existe un usuario con ese email" });
  }
  const user = Users.create({ name, email });
  res.status(201).json({ data: user });
});

// PUT /api/users/:id - actualiza un usuario existente
router.put("/:id", (req, res) => {
  const existing = Users.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  const { name, email } = req.body || {};
  if (email !== undefined && !isValidEmail(email)) {
    return res.status(400).json({ error: "'email' debe ser valido" });
  }
  const updated = Users.update(req.params.id, { name, email });
  res.status(200).json({ data: updated });
});

// DELETE /api/users/:id - elimina un usuario
router.delete("/:id", (req, res) => {
  const deleted = Users.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.status(204).send();
});

module.exports = router;
