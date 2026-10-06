// src/models/users.js
// Almacen en memoria para los usuarios. Se usa memoria (no una base de datos
// externa ni un modulo nativo como better-sqlite3) a proposito: evita
// problemas de compilacion cruzada entre arquitecturas (Mac arm64 vs EC2
// x86_64) que ya causaron fallas en una practica anterior, y mantiene el
// pipeline de CI simple y rapido, sin necesitar un contenedor de base de
// datos adicional en las pruebas.

let users = [];
let nextId = 1;

function reset() {
  users = [];
  nextId = 1;
}

function findAll() {
  return users;
}

function findById(id) {
  return users.find((u) => u.id === Number(id));
}

function findByEmail(email) {
  return users.find((u) => u.email === email);
}

function create({ name, email }) {
  const user = { id: nextId++, name, email, created_at: new Date().toISOString() };
  users.push(user);
  return user;
}

function update(id, { name, email }) {
  const user = findById(id);
  if (!user) return null;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  return user;
}

function remove(id) {
  const index = users.findIndex((u) => u.id === Number(id));
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

module.exports = { reset, findAll, findById, findByEmail, create, update, remove };
