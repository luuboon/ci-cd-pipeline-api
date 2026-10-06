// src/routes/health.js
const express = require("express");
const router = express.Router();

// GET /api/health - usado por despliegues/monitoreo para saber si la app esta viva
router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
