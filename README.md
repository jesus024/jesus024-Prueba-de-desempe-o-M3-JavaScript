# Gestión de Eventos - SPA

Aplicación web de página única (SPA) para la gestión integral de eventos. Permite a administradores crear, editar y eliminar eventos, y a los visitantes registrarse, ver detalles y gestionar su asistencia. El sistema incluye autenticación de usuarios, persistencia de sesión y una interfaz moderna y responsiva.

## ✨ Características

- **Autenticación y roles:** Registro e inicio de sesión con distinción entre administradores y visitantes.
- **Gestión de eventos:** Los administradores pueden crear, editar y eliminar eventos, así como gestionar la capacidad y los asistentes.
- **Inscripción a eventos:** Los visitantes pueden registrarse y cancelar su asistencia a eventos disponibles.
- **Persistencia de sesión:** Mantiene la sesión activa usando Local Storage.
- **Interfaz intuitiva:** Navegación sencilla, diseño responsivo y notificaciones visuales.
- **Simulación de backend:** Utiliza json-server para simular una API REST y operaciones CRUD en tiempo real.

## 🛠️ Tecnologías utilizadas

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Backend simulado:** json-server
- **Herramientas:** Vite, Font Awesome, Google Fonts

## 🚀 Instalación y ejecución

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor simulado:
   ```bash
   npm run server
   ```
3. Abre `index.html` con Live Server en tu navegador para comenzar a usar la aplicación.

## 👤 Usuarios de prueba

- **Administrador:**  
  Email: `admin@eventos.com`  
  Contraseña: `admin123`

- **Visitante:**  
  Email: `visitante1@email.com`  
  Contraseña: `visitante123`

## 📂 Estructura del proyecto

- `index.html` — Página principal de la aplicación
- `src/` — Archivos JavaScript y CSS
- `database.json` — Base de datos simulada para json-server

---

**Autor:** Jesús Alberto Ariza Alvarez  
**Cc:** 1129583704
**Clan:** Ciénaga
[GitHub: @jesus024](https://github.com/jesus024)