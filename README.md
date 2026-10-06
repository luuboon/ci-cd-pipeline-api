# ci-cd-pipeline-api

Proyecto Integrador de la materia **Gestion del proceso de desarrollo de software** (GPDS, UTEQ, grupo IDGS16). API REST de usuarios con un pipeline CI/CD completo: pruebas automaticas, construccion y publicacion de la imagen Docker, y despliegue continuo en una instancia AWS EC2, todo disparado por `git push`.

## Arquitectura

```
                 push a main
                      |
                      v
            +-------------------+
            |   GitHub Actions   |
            |  (.github/workflows/main.yml)
            +-------------------+
            |
   1) test  | npm ci + jest --coverage (umbral 70%)
            |
   2) build | docker build . -> tags :latest y :<sha>
      push  | docker push a Docker Hub (login con PAT via secret)
            |
   3) deploy| ssh a EC2 -> docker pull + stop + run (puerto 80)
            v
   +-------------------+        +------------------------+
   |     Docker Hub     | <----- |  Imagen publicada      |
   +-------------------+        +------------------------+
                                           |
                                           v
                              +--------------------------+
                              |  AWS EC2 (Ubuntu + Docker) |
                              |  Security Group: 22, 80    |
                              |  http://<IP_EC2>/api/...   |
                              +--------------------------+
```

La API (`src/`) usa un almacen de usuarios **en memoria** (`src/models/users.js`) en lugar de una base de datos externa o un modulo nativo (como `better-sqlite3`): evita problemas de compilacion cruzada entre arquitecturas (Mac arm64 vs EC2 x86_64) y mantiene el pipeline simple y rapido.

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/health` | Estado del servicio (uptime, timestamp) |
| GET | `/api/users` | Lista todos los usuarios |
| GET | `/api/users/:id` | Obtiene un usuario por id |
| POST | `/api/users` | Crea un usuario `{ "name", "email" }` |
| PUT | `/api/users/:id` | Actualiza un usuario existente |
| DELETE | `/api/users/:id` | Elimina un usuario |

Todas las respuestas son JSON con codigos de estado HTTP estandar (200, 201, 204, 400, 404, 409).

## Correr localmente

```bash
npm install
npm start
# La API queda en http://localhost:80 (o el puerto que indique PORT en .env)
```

### Pruebas y cobertura

```bash
npm test               # corre la bateria de pruebas (Jest + Supertest)
npm run test:coverage  # corre las pruebas y genera el reporte de cobertura
```

El umbral minimo configurado en `package.json` (`jest.coverageThreshold`) es **70%** en statements, branches, functions y lines.

### Con Docker

```bash
docker build --platform linux/amd64 -t ci-cd-pipeline-api:latest .
docker run -d -p 8080:80 --name ci-cd-pipeline-api ci-cd-pipeline-api:latest
curl http://localhost:8080/api/health
```

> Nota sobre arquitectura: se usa `--platform linux/amd64` al construir en una Mac Apple Silicon para que la misma imagen corra tanto en local (via emulacion) como en la instancia EC2 (x86_64) sin reconstruir.

## Pipeline CI/CD (GitHub Actions)

El workflow vive en `.github/workflows/main.yml` y se dispara en `push` y `pull_request` hacia `main`. Tiene 3 jobs encadenados:

1. **test** - instala dependencias y corre `npm run test:coverage`. Corre siempre (push y pull request).
2. **build-and-push** - solo en push a `main` y si `test` paso. Compila la imagen Docker y la publica en Docker Hub con dos tags: `:latest` y `:<hash del commit>`.
3. **deploy** - solo en push a `main` y si `build-and-push` paso. Se conecta por SSH a la instancia EC2, descarga la imagen mas reciente, detiene el contenedor anterior y levanta el nuevo en el puerto 80.

### Configuracion requerida (GitHub Secrets)

En el repositorio: **Settings -> Secrets and variables -> Actions -> New repository secret**. Ninguno de estos valores debe aparecer en el codigo fuente.

| Secret | Valor |
|--------|-------|
| `DOCKERHUB_USERNAME` | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Personal Access Token de Docker Hub (Account Settings -> Security -> New Access Token), nunca la contrasena |
| `EC2_HOST` | IP publica de la instancia EC2 |
| `EC2_USER` | Usuario SSH de la instancia (`ubuntu`) |
| `EC2_SSH_KEY` | Contenido completo del archivo `.pem` de la instancia (clave privada) |

### Seguridad

Ningun password, IP, token o llave SSH esta escrito en el codigo o en el workflow: todos los valores sensibles se leen desde GitHub Secrets (`${{ secrets.NOMBRE }}`) en tiempo de ejecucion.

## Demo en vivo

Para evidenciar el pipeline completo: hacer un cambio pequeno (por ejemplo el texto de `service` en `src/app.js`), hacer commit y `git push` a `main`, y seguir la corrida en la pestana **Actions** del repositorio: pruebas -> build/push a Docker Hub -> despliegue automatico en EC2. Al terminar, `curl http://<IP_EC2>/api/health` (o refrescar el navegador) debe reflejar el cambio sin haber tocado el servidor manualmente.
