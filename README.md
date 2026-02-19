# 🚀 Simulation NC Backend (MVP)

Backend core para la plataforma "Simulation NC", encargado de la gestión de Leads, Pagos con Stripe, Órdenes y Webhooks.

## 🛠️ Tecnologías
- **NestJS** (Framework)
- **TypeORM** (ORM)
- **PostgreSQL** (Base de Datos)
- **Stripe API** (Pasarela de Pagos)

---

## ⚡ Quick Start (Cómo Correr el Proyecto)

### 1. Prerrequisitos
- Node.js (v18+)
- Docker (opcional, para levantar Postgres)
- Ngrok (para probar Webhooks localmente)

### 2. Instalación
```bash
# Dentro de la carpeta backend/
npm install
```

### 3. Configuración de Entorno (.env) ⚠️ IMPORTANTE
El servidor **no funcionará** sin este archivo. Debes crear un archivo llamado `.env` en la raíz de `backend/`.

Puedes copiar el ejemplo incluido para empezar:
```bash
cp .env.example .env
```
Luego, **edita el archivo `.env`** y añade tus claves reales:
- `DATABASE_URL`: Conexión a tu Postgres.
- `STRIPE_SECRET_KEY`: Tu clave privada de Stripe (`sk_test_...`).
- `STRIPE_WEBHOOK_SECRET`: El secreto del webhook de Stripe (`whsec_...`).

### 4. Ejecutar el Servidor
```bash
# Modo Desarrollo (con Hot Reload)
npm run start:dev
```
El servidor correrá en: `http://localhost:3000`

### 5. Configurar Ngrok (Para Webhooks)
En otra terminal, corre:
```bash
ngrok http 3000
```
Copia la URL HTTPS que te da (ej. `https://tu-ngrok.ngrok-free.app`) y úsala en:
1.  Tu Frontend (para hacer fetch a la API).
2.  Tu Dashboard de Stripe (como endpoint de Webhook).

---

## 🧩 Módulos Implementados (Status Actual)

### 1. 🏭 Leads (`/leads`)
- **Objetivo**: Capturar datos de clientes potenciales antes del pago.
- **Funcionalidad**: Guarda nombre, email, y timestamps básicos.

### 2. 💳 Payments (`/payments`)
- **Endpoint**: `POST /api/v1/payments/create-intent`
- **Funcionalidad**:
    - Recibe el plan deseado (`starter`, `business_in_a_box`) y datos de la empresa.
    - Calcula el precio total en el backend (Precio Plan + State Fee) para evitar fraudes.
    - Crea un `PaymentIntent` en Stripe con metadata (Lead ID, Company Name, Entity Type).
    - Retorna `clientSecret` para el frontend.

### 3. 📦 Orders (`/orders`)
- **Objetivo**: Registrar la venta final confirmada.
- **Funcionalidad**:
    - Entidad `Order` con relación a `Lead`.
    - Guarda status (`PENDING`, `PAID`, `FAILED`), monto, y número de orden único.
    - Se crea **automáticamente** cuando el Webhook confirma el pago.

### 4. 🔔 Webhooks (`/webhooks/stripe`)
- **Seguridad**: Valida la firma criptográfica de Stripe.
- **Idempotencia**: Evita procesar el mismo evento dos veces.
- **Lógica**: Escucha el evento `payment_intent.succeeded` y dispara la creación de la Orden en la Base de Datos.

---

## 🧪 Guía de Pruebas (Flow de Pago)

1.  Asegúrate que el Backend y Ngrok estén corriendo.
2.  Abre tu Frontend (Webflow o local).
3.  Llena el formulario con datos de prueba.
4.  Usa la **Tarjeta de Test** de Stripe:
    - **Número**: `4242 4242 4242 4242`
    - **Fecha**: Cualquier futuro (12/30)
    - **CVC**: 123
    - **Zip**: 12345
5.  Al pagar:
    - **Frontend**: Te redirigirá a la página de "Gracias".
    - **Backend (Consola)**: Verás logs de "Pago exitoso detectado" y "Orden creada".
    - **Base de Datos**: Se insertará una nueva fila en la tabla `orders` con status `PAID`.

---

## 📝 Comandos Útiles
```bash
# Crear nueva migración
npm run migration:generate src/migrations/NombreCambio

# Correr migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert
```
