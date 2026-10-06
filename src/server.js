// src/server.js
const app = require("./app");

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`ci-cd-pipeline-api escuchando en el puerto ${PORT}`);
});
