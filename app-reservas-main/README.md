# 📆 ReservasEC

**ReservasEC** es una plataforma fullstack de gestión de reservas desarrollada con una arquitectura de microservicios. Permite a los usuarios registrarse, iniciar sesión, gestionar su perfil, crear y cancelar reservas, y recibir notificaciones. El sistema está dockerizado para facilitar el despliegue local.

## 🚀 Tecnologías principales

- **Frontend:** Next.js + Tailwind CSS
- **Backend (Microservicios):**
  - Auth Service (Node.js + Express)
  - Booking Service (Node.js + Apollo Server/GraphQL + PostgreSQL)
  - User Service (Node.js + Express)
  - Notification Service (Node.js + Express + Nodemailer via Mailhog)
- **Base de datos:** MongoDB (auth/user) y PostgreSQL (booking)
- **Autenticación:** JSON Web Tokens (JWT)
- **Contenedores:** Docker + Docker Compose

---

## 📁 Estructura de carpetas

```plaintext
/reservas-ec
├── frontend/             # Next.js App
├── auth-service/         # Servicio de autenticación
├── user-service/         # Servicio de usuarios
├── booking-service/      # Servicio de reservas
├── notification-service/ # Servicio de notificaciones por email
└── docker-compose.yml    # Orquestación de todos los servicios
```

---

## ⚙️ Configuración del entorno

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/reservas-ec.git
cd reservas-ec
```

### 2. Variables de entorno

🔐 Frontend (frontend/.env.production.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_BOOKING_URL=http://localhost:5001/graphql
NEXT_PUBLIC_USER_URL=http://localhost:5003
```

🔐 Backend .env (cada microservicio)
Ejemplo para auth-service:

```bash
PORT=4000
MONGO_URI=mongodb://mongo:27017/auth-db
JWT_SECRET=supersecretkey
```

Repite para los demás servicios cambiando PORT, MONGO_URI y usando el mismo JWT_SECRET.

### 3. 🐳 Uso con Docker

Opción completa (todos los microservicios + DBs + Mailhog para correo de pruebas):

```bash
docker-compose build
docker-compose up
```

Opción mínima solo para booking-service + PostgreSQL (recomendado para pruebas locales rápidas):

```bash
docker-compose up booking-service postgres
```

La app completa sigue en http://localhost:3000 y GraphQL de booking en http://localhost:5000/graphql

Correo de prueba: Mailhog UI en http://localhost:8025 (SMTP en 1025). Las notificaciones se entregan ahí en local.

### 📡 Endpoint GraphQL (booking-service)

- URL interna (docker): http://booking-service:5000/graphql
- URL host (local): http://localhost:5000/graphql
- Autorización: header `Authorization: Bearer <JWT>`

Ejemplos rápidos con `curl`:

```bash
# Listar reservas del usuario autenticado
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"query":"{ bookings { id servicio fecha estado fechaFormateada } }"}'

# Crear una reserva
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"query":"mutation { createBooking(fecha:\"2025-12-01T15:00:00-05:00\", servicio:\"Spa\") { id servicio estado fecha } }"}'

# Cancelar una reserva
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"query":"mutation { cancelBooking(id:\"<ID>\") { id estado canceladaEn } }"}'

# Eliminar una reserva
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"query":"mutation { deleteBooking(id:\"<ID>\") }"}'
```

### ☸️ Despliegue en Kubernetes (Minikube)

Archivos en `k8s/booking-service`:
- `namespace.yml`: crea el namespace `reservas`.
- `configmap.yml` y `secret.yml`: config y credenciales (JWT, password DB).
- `postgres.yml`: StatefulSet + PVC para PostgreSQL.
- `deployment.yml`: deployment + service del booking-service con probes `/health`.
- `ingress.yml`: expone `/graphql` y `/health` en `reservas.local` (requiere Ingress NGINX).

Pasos:
```bash
minikube start
kubectl apply -f k8s/booking-service/namespace.yml
kubectl apply -f k8s/booking-service/configmap.yml -f k8s/booking-service/secret.yml
kubectl apply -f k8s/booking-service/postgres.yml
# construye e importa imagen local
eval $(minikube docker-env)
docker build -t booking-service:latest booking-service
kubectl apply -f k8s/booking-service/deployment.yml
kubectl apply -f k8s/booking-service/ingress.yml
minikube tunnel # o minikube ingress addon
```

Agregar host local:
```bash
echo "$(minikube ip) reservas.local" | sudo tee -a /etc/hosts
```

Probar:
```bash
curl -k -X POST http://reservas.local/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"query":"{ bookings { id servicio fecha estado } }"}'
```

### 🗄️ Migraciones

- Archivo SQL: `booking-service/migrations/001_init.sql` (crea tabla `bookings`, índices y `pgcrypto`).
- Ejecutar local: `npm run db:migrate` dentro de `booking-service` (usa variables POSTGRES_* o POSTGRES_URL).

### 🔒 Validación de usuario

Cada operación GraphQL llama a `user-service` (`/users/me`) con el mismo header `Authorization: Bearer <JWT>`. Si el user-service responde 401/403 o no retorna `_id`, se rechaza la operación con `UNAUTHENTICATED`.

## ✅ Funcionalidades principales

- Registro e inicio de sesión de usuarios

- Perfil editable

- Creación y cancelación de reservas

- Historial de reservas activas y canceladas

- Límite de 5 reservas canceladas visibles

- Notificaciones por email (reserva y cancelación)

- Gestión de microservicios independientes
