# 🚀 All-in-One Solution: Backend (NestJS API)

¡Bienvenidos al repositorio oficial del Backend! Nuestra arquitectura está configurada para despliegues continuos, separación de entornos y alta disponibilidad.

## 🌐 Entornos y Enlaces Rápidos

- **Repo GitHub:** [s02-26-equipo-05-web-app-development](https://github.com/No-Country-simulation/s02-26-equipo-05-web-app-development)
- **API en Producción:** [https://s02-26-equipo-05-web-app-developmen.vercel.app/](https://s02-26-equipo-05-web-app-developmen.vercel.app/)

## 🚀 Infraestructura CI/CD (Despliegues Automáticos)

Hemos implementado **Despliegues Continuos con Vercel**. Esto significa que Vercel detecta automáticamente nuevos cambios en la rama `main`. 

Cada vez que aprobemos una Pull Request (PR) y esta se fusione al `main`, Vercel interceptará el cambio y hará un redeploy automático de la API. Tendremos entornos 100% en vivo con la última versión del código en un par de minutos, de forma completamente invisible.

## 💻 Desarrollo Local (Safe Mode)

Para probar cosas libremente sin riesgo de tumbar o ensuciar el entorno de producción de Vercel/Supabase, debes correr este proyecto en local.

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (Crear archivo .env usando la plantilla)
cp .env.example .env
```

### Ejecución

```bash
# Iniciar el servidor de desarrollo (Hot-Reload)
npm run start:dev

# El servidor escuchará en:
# http://localhost:3000
```

> **Nota para el equipo de Frontend**: Mientras usen `npm run start` (o `ng serve`) en su aplicación Angular, el frontend usará automáticamente su archivo `environment.development.ts`, el cual ya está configurado para apuntar a esta API local (`http://localhost:3000`).

## 📊 Accesos a Paneles de Control (Admin)

Todo el equipo tiene acceso maestro para ver logs del servidor, el historial de despliegues en Vercel y leer la información cruda de los leads en la base de datos PostgreSQL.

### 1. Panel de Servidores (Vercel)
Para monitorear los despliegues de **Producción** (Tanto de la API como del Frontend):
1. Entra a [Vercel.com](https://vercel.com/)
2. Loguéate usando el botón "Continue with Google".
3. Usa la cuenta oficial del proyecto
4. En el Dashboard ("Projects") verás los dos despliegues activos.

### 2. Base de Datos PostgreSQL (Supabase)
Para ver los registros en vivo del backend (Leads, Órdenes, Webhooks):
1. Entra a [Supabase.com](https://supabase.com/) y presiona Log In.
2. Utiliza las credenciales que el equipo te dio
---
*¡Asegúrense de hacer un `git pull` de la rama principal antes de empezar a programar y sigamos construyendo!*
