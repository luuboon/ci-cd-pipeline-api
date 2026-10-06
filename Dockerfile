# =============================================================================
# Dockerfile - ci-cd-pipeline-api
# Proyecto Integrador: Pipeline CI/CD para API REST (GPDS - UTEQ)
# =============================================================================
FROM node:20-alpine

WORKDIR /app

# Instalar solo dependencias de produccion primero (aprovecha cache de capas)
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el codigo fuente (lo que NO se necesita se excluye via .dockerignore)
COPY src ./src

ENV PORT=80
EXPOSE 80

CMD ["node", "src/server.js"]
