# 🚚 Frontend MIDES

Esta es la aplicación frontend para MIDES, construida con React y Vite. La aplicación incluye funcionalidades para la gestión de vehículos, choferes, lugares comunes, usuarios y planificación de rutas.

## 🛠️ Tecnologías

- ⚛️ React
- ⚡ Vite
- 🗺️ ArcGIS para funcionalidad de mapas
- 🖖 Vue.js (para componentes específicos)
- 🌐 Nginx para despliegue en producción

## 📁 Estructura del Proyecto

- 🔐 `/src/account` - Autenticación y gestión de usuarios
- 👨‍💼 `/src/administracion` - Funciones administrativas (vehículos, choferes, lugares comunes)
- 🗺️ `/src/arcgis` - Componentes de integración de mapas
- 👥 `/src/Clientes` - Gestión de clientes
- 📦 `/src/Pedidos` - Gestión de pedidos
- 🛣️ `/src/planificaciones` - Planificación de rutas
- ⚡ `/src/vue` - Componentes específicos de Vue.js

## 🚀 Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Copiar el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
4. Configurar las variables de entorno en el archivo `.env`

## 💻 Desarrollo

Para ejecutar el servidor de desarrollo:

```bash
npm run dev
```

## 🏭 Producción

⚠️ Antes de construir la imagen para producción, asegúrate de que el archivo `.env` contenga las variables de entorno correctas para el ambiente de producción.

El flujo de despliegue completo es el siguiente:

1. Construir la imagen y subirla al registry:
```bash
docker build -t [REGISTRY_URL]/mides-frontend:[TAG] . --push
```

2. En el ambiente de producción, descargar y ejecutar la imagen:
```bash
docker pull [REGISTRY_URL]/mides-frontend:[TAG]
docker run --name frontend -p [HOST_PORT]:80 -d mides-frontend:[TAG]
```

La aplicación será servida usando Nginx según la configuración en `nginx.conf`.

## 📜 Scripts Disponibles

- 🔧 `npm run dev` - Iniciar servidor de desarrollo
- 📦 `npm run build` - Construir para producción
- 👀 `npm run preview` - Vista previa de la construcción de producción localmente

## ⚙️ Variables de Entorno

Las variables de entorno necesarias son:

```bash
# URL de la API del backend
VITE_BACKEND_API_URL=http://localhost:8000

# URL de la API del motor de planificación
VITE_ENGINE_API_URL=http://localhost:4210
```

> **📝 Nota**: Los valores mostrados arriba son para desarrollo local. En un entorno de producción, estas URLs deberán ajustarse según la ubicación donde estén desplegadas las aplicaciones del backend y el motor de planificación.

Por favor, copia el archivo `.env.example` a `.env` y ajusta los valores según tu entorno:
```bash
cp .env.example .env
```
